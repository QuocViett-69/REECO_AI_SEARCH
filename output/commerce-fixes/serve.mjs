import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const types = { '.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json' };
for (const [directory,port] of [['apps/client/build',4391],['apps/admin/build',4392]]) {
 const root=resolve(directory);
 createServer(async(req,res)=>{
  const path=resolve(root,'.'+new URL(req.url,'http://127.0.0.1').pathname);
  if(path!==root&&!path.startsWith(root+sep)) {res.writeHead(403).end();return;}
  try {const file=extname(path)?path:resolve(root,'index.html'); res.setHeader('Content-Type',types[extname(file)]||'text/html');res.end(await readFile(file));}
  catch {res.writeHead(404).end();}
 }).listen(port,'127.0.0.1',()=>console.log('Static UI',port));
}
