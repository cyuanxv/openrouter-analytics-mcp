import {accessSync, constants, lstatSync, existsSync} from 'node:fs';
import {dirname, isAbsolute, join, parse, resolve} from 'node:path';
import {homedir} from 'node:os';

export type Check = {id:string; name:string; status:'pass'|'fail'|'warn'|'skip'; code:string; message:string; remedy?:string};
type Options = {env?:Record<string,string|undefined>; nodeVersion?:string; offline?:boolean; transport?:typeof fetch; timeoutMs?:number; platform?:string};
const names = {node:'Node.js 版本',key:'Key 配置与权限',account:'账户连接',directory:'数据目录'};
const check=(id:keyof typeof names,status:Check['status'],code:string,message:string,remedy?:string):Check=>({id,name:names[id],status,code,message,...(remedy?{remedy}:{})});

export function supportedNode(version:string) {
  const match=/^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if(!match)return false;
  const [,major,minor]=match.map(Number);
  return major>=24 || (major===22 && minor>=22);
}

function directoryCheck(directory:string|undefined,platform:string):Check {
  const fix='将 OPENROUTER_WORKBENCH_DATA_DIR 设为本工具专用目录的绝对路径；不要使用根目录、家目录或源码目录。';
  if(!directory)return check('directory','fail','DATA_DIR_MISSING','尚未配置数据目录。',fix);
  if(!isAbsolute(directory))return check('directory','fail','DATA_DIR_RELATIVE','数据目录不是绝对路径。',fix);
  const dir=resolve(directory);
  if([parse(dir).root,resolve(homedir())].includes(dir))return check('directory','fail','DATA_DIR_NOT_DEDICATED','数据目录必须是专用目录。',fix);
  const mode=constants.R_OK|constants.W_OK|(platform==='win32'?0:constants.X_OK);
  try {
    let info;
    try {info=lstatSync(dir);} catch(error:any) {if(error.code!=='ENOENT')throw error;}
    if(!info){
      let parent=dirname(dir);
      while(!existsSync(parent)&&parent!==dirname(parent))parent=dirname(parent);
      if(!lstatSync(parent).isDirectory())return check('directory','fail','DATA_PARENT_NOT_DIRECTORY','数据目录的父路径不是目录。',fix);
      accessSync(parent,mode);
      return check('directory','warn','DATA_DIR_NOT_CREATED','目录尚未创建；父目录权限检查通过。','首次正常启动会创建专用目录。自检未创建目录，也未试写文件；创建成功后重新自检。');
    }
    if(info.isSymbolicLink()||!info.isDirectory())return check('directory','fail','DATA_DIR_UNSAFE','数据目录是符号链接或普通文件，不能安全使用。',fix);
    if(existsSync(join(dir,'package.json'))||existsSync(join(dir,'.git')))return check('directory','fail','DATA_DIR_SOURCE','数据目录指向源码或安装目录。',fix);
    accessSync(dir,mode);
    let db;
    try {db=lstatSync(join(dir,'workbench.sqlite'));}catch(error:any){if(error.code!=='ENOENT')throw error;}
    if(db){
      if(!db.isFile()||db.isSymbolicLink()||db.nlink!==1)return check('directory','fail','DATABASE_UNSAFE','数据库是链接或不是普通文件，不能安全使用。','保留原文件与备份，选择新的专用数据目录；不要删除或覆盖现有数据库。');
      accessSync(join(dir,'workbench.sqlite'),constants.R_OK|constants.W_OK);
    }
    if(platform==='win32')return check('directory','warn','DATA_ACL_UNVERIFIED','目录读写权限检查通过；尚未验证 Windows 私有访问控制。','在目录安全设置中确认仅当前用户可访问。自检不会修改 ACL。');
    if((info.mode&0o077)||(db&&(db.mode&0o077)))return check('directory','warn','DATA_PERMISSIONS_BROAD','目录或数据库允许其他用户访问。','停止本工具的所有实例，确认目录专用并备份后，将目录权限设为 0700、数据库设为 0600。自检不会修改权限。');
    return check('directory','pass','DATA_DIR_ACCESS_OK','目录及现有数据库的权限检查通过；未试写、未打开数据库，未验证迁移或剩余磁盘空间。');
  }catch{return check('directory','fail','DATA_DIR_INACCESSIBLE','数据目录、父目录或数据库无法访问，或没有所需读写权限。','检查目录是否存在、当前用户权限和只读磁盘状态；选择可访问的专用目录，不要以管理员权限运行来绕过问题。');}
}

class ProbeError extends Error {constructor(public code:string){super(code);}}
async function readData(path:'/key'|'/credits',key:string,transport:typeof fetch,timeoutMs:number) {
  const controller=new AbortController();
  let timer:ReturnType<typeof setTimeout>;
  const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new ProbeError('TIMEOUT'));},timeoutMs);});
  const request=(async()=>{
    const response=await transport('https://openrouter.ai/api/v1'+path,{method:'GET',headers:{Accept:'application/json',Authorization:'Bearer '+key},redirect:'manual',cache:'no-store',credentials:'omit',signal:controller.signal});
    if(!response.ok){void response.body?.cancel().catch(()=>{});throw new ProbeError('HTTP_'+response.status);}
    if(!response.body)throw new ProbeError('INVALID_RESPONSE');
    const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
    try {
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>64*1024)throw new ProbeError('INVALID_RESPONSE');chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
      if(!body||typeof body.data!=='object'||body.data===null||Array.isArray(body.data))throw new ProbeError('INVALID_RESPONSE');
      return body.data;
    }catch(error){if(error instanceof ProbeError)throw error;throw new ProbeError('INVALID_RESPONSE');}
    finally{void reader.cancel().catch(()=>{});}
  })();
  try{return await Promise.race([request,deadline]);}finally{clearTimeout(timer!);controller.abort();}
}
function upstreamProblem(id:'key'|'account',error:unknown):Check {
  const code=error instanceof ProbeError?error.code:'NETWORK_ERROR';
  if(code==='HTTP_401')return check(id,'fail','AUTH_REJECTED','OpenRouter 拒绝了此 Key，可能已失效或配置错误。','检查当前客户端的秘密环境配置和 OpenRouter Key 状态；不要把 Key 发到聊天或作为命令行参数。');
  if(code==='HTTP_403')return check(id,'fail','PERMISSION_DENIED','OpenRouter 拒绝此项读取权限。','确认使用 Management Key，并检查账户或组织访问限制；普通模型调用 Key 不足以读取账户余额。');
  if(code==='HTTP_429')return check(id,'warn','RATE_LIMITED','OpenRouter 暂时限流，尚未完成验证。','稍后重新自检；不要连续重试或据此更换 Key。');
  if(code==='TIMEOUT')return check(id,'warn',code,'连接或读取 OpenRouter 超时，无法确认结果。','检查网络、代理与防火墙后重试；这不表示 Key 无效。');
  if(/^HTTP_3\d\d$/.test(code))return check(id,'fail','REDIRECT_BLOCKED','OpenRouter 返回重定向，已停止以避免向其他地址传送 Key。','检查网络代理或门户登录状态；自检只允许固定的 OpenRouter HTTPS 地址，不跟随重定向。');
  if(/^HTTP_5\d\d$/.test(code))return check(id,'warn','UPSTREAM_UNAVAILABLE','OpenRouter 服务暂时不可用，尚未完成验证。','稍后重试；无需修改 Key 或本地数据库。');
  if(code==='INVALID_RESPONSE')return check(id,'warn',code,'OpenRouter 返回的数据格式不符合预期，尚未完成验证。','检查网络代理或服务状态后重试；原始响应不会显示，也不会把未知结果当作通过。');
  return check(id,'warn','NETWORK_ERROR','未能连接 OpenRouter，无法确认结果。','检查网络、DNS、HTTPS 证书和代理设置；不要关闭证书验证，也不要据此认定 Key 无效。');
}

export async function runDoctor(options:Options={}) {
  const {env=process.env,nodeVersion=process.versions.node,offline=false,transport=globalThis.fetch,timeoutMs=5000,platform=process.platform}=options;
  const node=supportedNode(nodeVersion)?check('node','pass','NODE_SUPPORTED','Node.js 版本符合要求。'):check('node','fail','NODE_UNSUPPORTED','当前 Node.js 版本不在支持范围内。','请使用 Node.js 22.22+（22 系列）或 24+；Node.js 23 不受支持。检查 MCP 客户端实际使用的 Node 路径。');
  const dir=directoryCheck(env.OPENROUTER_WORKBENCH_DATA_DIR,platform);
  const key=env.OPENROUTER_MANAGEMENT_KEY;
  let permission:Check;let account:Check;
  const skipped=(message:string)=>check('account','skip','ACCOUNT_NOT_CHECKED',message);
  if(!key) {permission=check('key','fail','KEY_MISSING','尚未配置 OPENROUTER_MANAGEMENT_KEY。','通过当前终端或 MCP 客户端的秘密环境设置提供 Management Key；终端不会自动继承客户端的配置。不要把 Key 写进命令参数或提交到 Git。');account=skipped('缺少 Key，未发送账户请求。');}
  else if(key.length>4096||/[^\x21-\x7e]/.test(key)||/REPLACE_|YOUR_|[<>]/i.test(key)){permission=check('key','fail','KEY_FORMAT_INVALID','Key 含空白、占位文本或不支持的字符。','在秘密环境设置中检查复制内容；不要包含 Bearer 前缀、引号或换行。自检未发送此 Key。');account=skipped('Key 格式不正确，未发送账户请求。');}
  else if(node.status==='fail'){permission=check('key','skip','NODE_BLOCKED','已设置 Key；Node.js 不受支持，未联网验证权限。');account=skipped('请先处理 Node.js 版本问题。');}
  else if(offline){permission=check('key','skip','OFFLINE','Key 格式检查通过；离线模式未验证有效性或权限。');account=skipped('离线模式未发送任何网络请求。');}
  else {
    try {
      const current=await readData('/key',key,transport,timeoutMs);
      if(typeof current.is_management_key!=='boolean')throw new ProbeError('INVALID_RESPONSE');
      if(!current.is_management_key){permission=check('key','fail','NOT_MANAGEMENT_KEY','Key 有效，但不是 Management Key。','在 OpenRouter 的 Management Keys 页面创建或选用管理密钥，再安全配置到客户端；自检不会创建、更换或撤销任何 Key。');account=skipped('普通 Key 不足以完成工作台的账户读取，已停止后续请求。');}
      else {
        permission=check('key','pass','MANAGEMENT_KEY_VERIFIED','OpenRouter 已确认这是 Management Key。');
        try {
          const credits=await readData('/credits',key,transport,timeoutMs);
          if(![credits.total_credits,credits.total_usage].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0))throw new ProbeError('INVALID_RESPONSE');
          account=check('account','pass','ACCOUNT_READ_OK','账户余额接口读取成功；不显示余额或账户标识。仅验证基础账户读取，不保证所有分析接口均可用。');
        }catch(error){account=upstreamProblem('account',error);}
      }
    }catch(error){permission=upstreamProblem('key',error);account=skipped('Key 权限尚未确认，未请求账户余额。');}
  }
  const checks=[node,permission,account,dir];const status=checks.some(c=>c.status==='fail')?'failed':checks.some(c=>c.status!=='pass')?'incomplete':'ready';
  return {schema_version:1,status,exit_code:status==='failed'?1:status==='incomplete'?2:0,checks};
}
export function formatDoctor(report:Awaited<ReturnType<typeof runDoctor>>) {
  const labels={pass:'通过',fail:'需处理',warn:'待确认',skip:'未检查'};
  return ['OpenRouter 工作台 · 安装与配置自检',...report.checks.map(c=>`[${labels[c.status]}] ${c.name}：${c.message}${c.remedy?'\n  解决办法：'+c.remedy:''}`),`结论：${report.status==='ready'?'基础自检通过，可继续启动本地 MCP。':report.status==='failed'?'请先处理以上问题，再重新自检。':'尚未完整验证，请按提示处理后重新自检。'}`,'自检仅调用只读账户接口；不执行模型调用、不输出 Key、不更改密钥、目录权限或数据库。'].join('\n');
}
