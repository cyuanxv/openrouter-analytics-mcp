import {build} from 'esbuild';
import {mkdir,copyFile,chmod,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await mkdir('drizzle',{recursive:true});
await build({entryPoints:['src/index.ts','src/stdio.ts'],outdir:'dist',bundle:true,platform:'node',format:'esm',target:'node22',external:['node:*','@modelcontextprotocol/sdk/*','zod'],sourcemap:false});
for(const name of ['0000_personal_ops.sql','0001_routing_presets.sql'])await copyFile('../../services/routerlens/drizzle/'+name,'drizzle/'+name);
await copyFile('../../LICENSE','LICENSE');await chmod('dist/stdio.js',0o755);
