# Publication and verification / 发布与验收记录

Version: **0.6.0-alpha.2**. Updated 2026-10-22 (Asia/Shanghai).

| Channel | Status |
| --- | --- |
| [GitHub source](https://github.com/cyuanxv/openrouter-analytics-mcp) | Public independent repository; release preparation PR #3 merged |
| [GitHub Release](https://github.com/cyuanxv/openrouter-analytics-mcp/releases/tag/v0.6.0-alpha.2) | Alpha prerelease with installable tarball |
| [npm](https://www.npmjs.com/package/@cyuanxv/openrouter-analytics-mcp) | 0.6.0-alpha.2 published with the alpha tag |
| [MCP Registry version](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.cyuanxv%2Fopenrouter-analytics-mcp/versions/0.6.0-alpha.2) | Active; expected npm package, version and stdio transport verified |

Registry registration is a metadata listing, not an OpenRouter endorsement or ChatGPT app review. This remains an alpha prerelease; use the pinned version or `@alpha`, rather than assuming the npm `latest` tag points to this prerelease.

## Install / 安装

Use an empty directory:

```bash
npm install --ignore-scripts @cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.2
./node_modules/.bin/openrouter-analytics-mcp doctor --offline
```

Then follow [MCP client configuration](../packages/local-mcp/README.md) and [Chinese diagnostics](DOCTOR.md). The offline command does not verify Key validity or connectivity. Set the dedicated absolute private data directory and supply your own Management Key through secret environment settings, then run `doctor` for the two read-only account probes. Do not put secrets in chat, Git or command arguments.

## Public-entry acceptance / 公开入口验收

- Exact npm version metadata and tarball downloaded without authentication. Published bytes match the local verified release, including SHA-1 and SHA-512 integrity checks.
- SHA-256: `984941c5ce8452fc0cafca6ccf345efa3d0ba40bf584f82722b5181eff3ae73f`.
- Fresh anonymous npm installations used separate HOME, empty npm credentials and fresh caches on macOS / Node 22.22.2 and 24.16.0.
- Both installations passed the Chinese offline JSON doctor check, 28-tool discovery, expected local adapter version, missing-Key account failure, and report/preset/experiment record persistence after process restart.
- No real account Key or paid inference was used for the public installation acceptance. The unchanged doctor implementation had separately passed owner-authorized real-account read-only acceptance before this version bump.
- Anonymous MCP Registry readback confirmed active status, `io.github.cyuanxv/openrouter-analytics-mcp`, npm `@cyuanxv/openrouter-analytics-mcp@0.6.0-alpha.2`, and stdio transport. Registry metadata names the same package installed above; it does not host a separate runtime.

## Automated checks / 自动测试

[Release CI](https://github.com/cyuanxv/openrouter-analytics-mcp/actions/runs/39802359165) passed both Ubuntu 24.04 / Node 22 and 24 jobs for the exact release preparation commit: each ran 33 local tests, 192 Sites synthetic tests, builds and packed-install acceptance. Earlier doctor feature CI and real-account acceptance remain separate evidence.

Windows native installation, desktop UI on Linux, existing database integrity, disk-space checks and full Analytics permissions are outside this acceptance. The local edition has no dashboard, HTTP service or built-in scheduler; Sites deployment and notification setup are separate.

Existing private repository, production Sites service and OpenRouter Keys were not changed. Initial npm 2FA waiting and npm-to-Registry propagation delays were resolved; they are not the final publication state. The original 0.6.0-alpha.1 remains published as historical release.
