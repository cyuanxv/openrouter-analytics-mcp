import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerRouterLensTools } from '../../../services/routerlens/lib/tools';
import { createOperations, registerOperations } from '../../../services/routerlens/lib/operations';
import { makeReadClient } from '../../../services/routerlens/worker/upstream';
import { openDatabase } from './database';

export {openDatabase};
export function createLocalServer({dataDir,key,transport=fetch}:{dataDir:string;key?:string;transport?:typeof fetch}) {
  if(key && /\s/.test(key))throw new Error('INVALID_KEY_FORMAT');
  const db=openDatabase(dataDir);
  const read=makeReadClient(key,transport);
  const client={...read,status:()=>({management_key_configured:Boolean(key),mode:'local-stdio',adapter_version:'0.6.0-alpha.3',authentication_verified:false})};
  const server=new McpServer({name:'OpenRouter 工作台',version:'0.6.0-alpha.3'});
  try {
    registerRouterLensTools(server,client);
    registerOperations(server,createOperations(client,db));
  }catch(error){db.close();throw error;}
  let closed=false;
  const close=async()=>{if(closed)return;closed=true;try{await server.close();}finally{db.close();}};
  return {server,close,db};
}
