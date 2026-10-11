import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url));
const host=process.env.HOST||"127.0.0.1";
const port=Number(process.env.PORT||4173);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml"};

const server=http.createServer((request,response)=>{
  if(request.method!=="GET"&&request.method!=="HEAD"){response.writeHead(405,{"Allow":"GET, HEAD"});response.end();return}
  let pathname;
  try{pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname)}catch{response.writeHead(400);response.end("Bad request");return}
  let target=path.resolve(root,"."+pathname);
  if(target!==root&&!target.startsWith(root+path.sep)){response.writeHead(403);response.end("Forbidden");return}
  try{
    if(fs.statSync(target).isDirectory())target=path.join(target,"index.html");
    const body=fs.readFileSync(target);
    response.writeHead(200,{"Content-Type":types[path.extname(target)]||"application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    if(request.method==="HEAD")response.end();else response.end(body);
  }catch{response.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});response.end("Not found")}
});
server.listen(port,host,()=>console.log("Career Explorer is ready at http://"+host+":"+port));

