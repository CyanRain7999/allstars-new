'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname,port=4173;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8'};
const server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}if(name.startsWith('/pages-test/'))name=name.slice('/pages-test'.length);const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(error,content)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(content);});});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'端口 4173 已被占用。可直接打开 index.html 游玩。':error.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log('全明星归来：http://127.0.0.1:'+port));
