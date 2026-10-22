#!/usr/bin/env node

async function main(){
  if(process.argv[2]==='doctor'){
    const args=process.argv.slice(3);
    if(args.length===1&&args[0]==='--help'){console.log('用法：openrouter-analytics-mcp doctor [--offline] [--json]\n默认仅向 OpenRouter 发送只读账户请求；--offline 不联网。Key 仅从秘密环境变量读取。退出码：0 基础检查通过，1 发现错误，2 未完整验证。');return;}
    if(args.some(a=>!['--offline','--json'].includes(a))){console.error('用法：openrouter-analytics-mcp doctor [--offline] [--json]。Key 仅从秘密环境变量读取，不接受命令参数。');process.exitCode=1;return;}
    const {runDoctor,formatDoctor}=await import('./doctor.js');
    const result=await runDoctor({offline:args.includes('--offline')});
    console.log(args.includes('--json')?JSON.stringify(result,null,2):formatDoctor(result));process.exitCode=result.exit_code;return;
  }
  if(process.argv.length>2)throw new Error('NO_CLI_ARGUMENTS');
  const {createLocalServer}=await import('./index.js');
  const {StdioServerTransport}=await import('@modelcontextprotocol/sdk/server/stdio.js');
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
