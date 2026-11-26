// Optional zero-dependency sync server. Stores an opaque blob per random key.
// The client should encrypt before upload; the server never sees receipts in plain text.
const http=require("http"),fs=require("fs"),path=require("path");
const DIR=path.join(__dirname,"..","docs"),DATA=path.join(__dirname,"data");fs.mkdirSync(DATA,{recursive:true});
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml"};
const KEY=/^[a-f0-9]{32,64}$/;
http.createServer((q,r)=>{const u=new URL(q.url,"http://x");
 if(u.pathname.startsWith("/api/sync/")){const k=u.pathname.slice(10);if(!KEY.test(k)){r.writeHead(400);return r.end()}
  const f=path.join(DATA,k);
  if(q.method=="GET"){if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":"application/octet-stream"});return fs.createReadStream(f).pipe(r)}
  if(q.method=="PUT"){let n=0;const c=[];q.on("data",d=>{n+=d.length;if(n>1e6){r.writeHead(413);r.end();q.destroy()}else c.push(d)});q.on("end",()=>{if(n<=1e6){fs.writeFileSync(f,Buffer.concat(c));r.writeHead(204);r.end()}});return}
  r.writeHead(405);return r.end()}
 let p=path.normalize(u.pathname=="/"?"/index.html":u.pathname).replace(/^(\.\.[\/\\])+/,"");const f=path.join(DIR,p);
 if(!f.startsWith(DIR)||!fs.existsSync(f)){r.writeHead(404);return r.end("not found")}
 r.writeHead(200,{"content-type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)}).listen(process.env.PORT||8080,()=>console.log("Rag3ha on",process.env.PORT||8080));
