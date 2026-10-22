import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const expected = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const scratch = mkdtempSync(join(tmpdir(), 'openrouter-packed-install-'));
let client;
const env = {
  PATH: process.env.PATH,
  HOME: join(scratch, 'home'),
  TMPDIR: scratch,
  npm_config_userconfig: join(scratch, 'npmrc'),
  npm_config_cache: join(scratch, 'npm-cache'),
  CI: 'true',
};
mkdirSync(env.HOME);
writeFileSync(env.npm_config_userconfig, 'registry=https://registry.npmjs.org/\n');

function npm(args, cwd) {
  const result = spawnSync('npm', args, {cwd, env, encoding: 'utf8', timeout: 120_000});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `npm ${args[0]} failed: ${result.stderr}`);
  return result.stdout;
}

async function connect() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(scratch, 'node_modules', ...expected.name.split('/'), 'dist', 'stdio.js')],
    env: {PATH: env.PATH, HOME: env.HOME, OPENROUTER_WORKBENCH_DATA_DIR: join(scratch, 'data')},
    stderr: 'pipe',
  });
  const next = new Client({name: 'packed-install-check', version: '1.0.0'});
  await next.connect(transport);
  return next;
}

async function call(name, args = {}) {
  const result = await client.callTool({name, arguments: args});
  assert.notEqual(result.isError, true, `${name} failed`);
  return result.structuredContent;
}

try {
  const [packed] = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', scratch], packageRoot));
  assert.equal(packed.name, expected.name);
  const actualFiles = packed.files.map(file => file.path).sort();
  assert.deepEqual(actualFiles, [
    'LICENSE', 'README.md', 'dist/index.js', 'dist/stdio.js',
    'drizzle/0000_personal_ops.sql', 'drizzle/0001_routing_presets.sql', 'package.json',
  ].sort());
  writeFileSync(join(scratch, 'package.json'), '{"private":true,"type":"module"}\n');
  npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', join(scratch, packed.filename)], scratch);
  const installed = JSON.parse(readFileSync(join(scratch, 'node_modules', ...expected.name.split('/'), 'package.json'), 'utf8'));
  assert.equal(installed.name, expected.name);
  assert.equal(installed.version, expected.version);
  assert.equal(installed.mcpName, expected.mcpName);

  client = await connect();
  assert.equal((await client.listTools()).tools.length, 28);
  assert.equal((await call('routerlens_status')).mode, 'local-stdio');
  await call('save_model_preset', {preset_id: 'ci-preset', expected_revision: 0, config: {name: 'Synthetic CI preset', model: 'test/main'}});
  await call('create_cost_experiment', {experiment_id: 'ci-experiment', baseline_model: 'test/main', candidate_models: ['test/backup'], budget_usd: 1, quality_criteria: 'Synthetic matched cases'});
  const report = await call('generate_cost_report', {kind: 'weekly', timezone: 'UTC', end_date: '2026-10-01'});
  assert.equal(report.payload.assessment, 'unknown');
  await client.close();
  client = await connect();
  assert.equal((await call('get_model_preset', {preset_id: 'ci-preset'})).revision, 1);
  assert.equal((await call('get_cost_experiment', {experiment_id: 'ci-experiment'})).id, 'ci-experiment');
  assert.equal((await call('get_cost_report', {report_id: report.id})).payload.assessment, 'unknown');
  assert.equal((await client.callTool({name: 'get_account_summary', arguments: {include_spend_windows: false}})).isError, true);
  console.log('Packed installation passed: 28 tools, local status, restart persistence, missing-key failure. No real account key supplied.');
} finally {
  if (client) await client.close();
  rmSync(scratch, {recursive: true, force: true});
}
