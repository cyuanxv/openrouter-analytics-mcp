#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createLocalServer } from './index';

async function main(){
  if(process.argv.length>2)throw new Error('NO_CLI_ARGUMENTS');
  const app=createLocalServer({dataDir:process.env.OPENROUTER_WORKBENCH_DATA_DIR??'',key:process.env.OPENROUTER_MANAGEMENT_KEY});
  const stop=async()=>{try{await app.close();}catch{process.exitCode=1;}};
  const transport=new StdioServerTransport();
  app.server.onclose=()=>{void stop();};
  process.once('SIGINT',()=>{void stop();});process.once('SIGTERM',()=>{void stop();});
  process.once('uncaughtException',()=>{console.error('OpenRouter 工作台: unexpected failure; process stopped.');void stop();process.exitCode=1;});
  process.once('unhandledRejection',()=>{console.error('OpenRouter 工作台: unexpected failure; process stopped.');void stop();process.exitCode=1;});
  try{await app.server.connect(transport);}catch{await stop();throw new Error('CONNECT_FAILED');}
}
main().catch(()=>{console.error('OpenRouter 工作台 failed to start. Check Node.js version, absolute OPENROUTER_WORKBENCH_DATA_DIR, directory permissions and key format. No secret is printed.');process.exitCode=1;});
