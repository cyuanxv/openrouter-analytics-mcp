import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync, lstatSync, openSync, closeSync, readFileSync } from 'node:fs';
import { resolve, isAbsolute, join } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';

export function openDatabase(directory:string) {
  if(!directory || !isAbsolute(directory)) throw new Error('DATA_DIR_MUST_BE_ABSOLUTE');
  const dir=resolve(directory);
  if(dir===resolve('/')||dir===resolve(homedir()))throw new Error('DATA_DIR_MUST_BE_DEDICATED');
  mkdirSync(dir,{recursive:true,mode:0o700});
  const info=lstatSync(dir);
  if(!info.isDirectory()||info.isSymbolicLink())throw new Error('UNSAFE_DATA_DIRECTORY');
  if(process.platform!=='win32')chmodSync(dir,0o700);
  const filename=join(dir,'workbench.sqlite');
  try {const file=lstatSync(filename);if(!file.isFile()||file.isSymbolicLink()||file.nlink!==1)throw new Error('UNSAFE_DATABASE_FILE');}
  catch(error:any){if(error.code!=='ENOENT')throw error;}
  // Exclusive creation ensures private permissions from the first byte.
  try {const fd=openSync(filename,'wx',0o600);closeSync(fd);}catch(error:any){if(error.code!=='EEXIST')throw error;}
  if(process.platform!=='win32')chmodSync(filename,0o600);
  const sqlite=new DatabaseSync(filename);
  try {
    sqlite.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE;');
    sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY NOT NULL, sha256 TEXT NOT NULL)');
    for(const name of ['0000_personal_ops.sql','0001_routing_presets.sql']) {
      const sql=readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8');
      const digest=createHash('sha256').update(sql).digest('hex');
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const prior=sqlite.prepare('SELECT sha256 FROM local_migrations WHERE name=?').get(name);
        if(prior&&prior.sha256!==digest)throw new Error('MIGRATION_CHECKSUM_MISMATCH');
        if(!prior){sqlite.exec(sql);sqlite.prepare('INSERT INTO local_migrations(name,sha256) VALUES(?,?)').run(name,digest);}
        sqlite.exec('COMMIT');
      }catch(error){sqlite.exec('ROLLBACK');throw error;}
    }
  }catch(error){sqlite.close();throw error;}
  function prepared(sql:string,values:any[]=[]):any {
    return {
      bind(...args:any[]){return prepared(sql,args);},
      async first(){return sqlite.prepare(sql).get(...values)??null;},
      async all(){return {results:sqlite.prepare(sql).all(...values)};},
      async run(){const r=sqlite.prepare(sql).run(...values);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};},
      execute(){const s=sqlite.prepare(sql);if(s.columns().length)return {results:s.all(...values),success:true,meta:{changes:0}};const r=s.run(...values);return {success:true,meta:{changes:Number(r.changes)}};}
    };
  }
  return {
    filename,
    prepare(sql:string){return prepared(sql);},
    async batch(statements:any[]){sqlite.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}},
    close(){sqlite.close();}
  };
}
