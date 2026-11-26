// Real-browser data-flow test: paste -> parse -> review -> save -> export/import round trip, bad dates, multi-receipt split.
// Usage: node tests/flow.mjs [url]   (serves ./docs itself when no url). Needs puppeteer-core + Chrome.
import puppeteer from 'puppeteer-core';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','docs');let url=process.argv[2],server;
if(!url){server=http.createServer((q,r)=>{let f=path.join(root,q.url.split('?')[0].replace(/\/$/,'/index.html'));if(!f.startsWith(root)||!fs.existsSync(f)){r.statusCode=404;return r.end()}
const t={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/json'}[path.extname(f)]||'application/octet-stream';r.setHeader('content-type',t);r.end(fs.readFileSync(f))}).listen(0);url=`http://127.0.0.1:${server.address().port}/`}
const b=await puppeteer.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});
const pg=await b.newPage();await pg.setViewport({width:390,height:800});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;console.log('ok',m)};const sl=ms=>new Promise(r=>setTimeout(r,ms));
await pg.goto(url,{waitUntil:'networkidle0'});await pg.evaluate(()=>{localStorage.clear();localStorage.rg_lang='en'});await pg.reload({waitUntil:'networkidle0'});
const setv=(s,v)=>pg.$eval(s,(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},v);
const rows=()=>pg.$$eval('#items .item',e=>e.map(x=>x.innerText.replace(/\s+/g,' ')));
const d0=new Date(Date.now()-5*864e5).toISOString().slice(0,10);
await setv('#txt',`Order #A1234-77\nOrder date: ${d0}\nItem: Blue kettle\nSubtotal: $10\nTotal: $12.50\nReturn within 14 days`);await setv('#from','orders@noon.com');await pg.click('#parse');await pg.waitForSelector('#review:not(.hide)');
ok(await pg.$eval('#f-win',e=>e.value)==='14','window parsed from receipt');ok(await pg.$eval('#f-amt',e=>e.value)==='$12.50','amount is the total, not the subtotal');ok(await pg.$eval('#f-date',e=>e.value)===d0,'date parsed');
await pg.click('#save');await sl(300);ok((await rows()).length===1&&(await rows())[0].includes('Blue kettle'),'item saved');ok((await rows())[0].includes('9'),'days left shown (14-5=9)');
// impossible date must ask the user, not guess
await setv('#txt',`Order #Z9999-11\nOrder date: 2026-13-45\nItem: Mystery box`);await setv('#from','');await pg.click('#parse');await pg.waitForSelector('#review:not(.hide)');
ok(await pg.$eval('#f-date',e=>e.value)==='','impossible date left empty for the user');await pg.click('#save');ok((await pg.$eval('#err',e=>e.textContent)).length>0,'save blocked with an error message');
await pg.click('#cancel');
// multiple receipts split by ---
await setv('#txt',`Order #B1111-22\nOrder date: ${d0}\nItem: Lamp\nTotal: $5\n---\nOrder #B2222-33\nOrder date: ${d0}\nItem: Mug\nTotal: $6\n---\nOrder #B1111-22\nOrder date: ${d0}\nItem: Lamp\nTotal: $5`);await pg.click('#parse');await sl(400);
ok((await rows()).length===3,'two new receipts added, duplicate order skipped');
// export JSON, wipe, re-import
const exported=await pg.evaluate(async()=>{let blob;const o=URL.createObjectURL;URL.createObjectURL=b=>{blob=b;return o.call(URL,b)};HTMLAnchorElement.prototype.click=function(){};document.getElementById('exp').click();URL.createObjectURL=o;return await blob.text()});
const arr=JSON.parse(exported);ok(arr.length===3,'JSON export has 3 items');
fs.writeFileSync('/tmp/rag-back.json',exported);fs.writeFileSync('/tmp/rag-bad.json',JSON.stringify([{deadline:'nope'},{id:'x',deadline:'2030-01-01',store:'<img src=x onerror=window.__pwn=1>',item:'<b>x</b>'}]));
await pg.evaluate(()=>{localStorage.rg_items='[]'});await pg.reload({waitUntil:'networkidle0'});ok((await rows()).length===0,'empty after wipe');
await (await pg.$('#imp')).uploadFile('/tmp/rag-back.json');await sl(400);ok((await rows()).length===3,'import restores 3 items');
await (await pg.$('#imp')).uploadFile('/tmp/rag-back.json');await sl(400);ok((await rows()).length===3,'re-import does not duplicate');
await pg.evaluate(()=>{document.querySelector('[data-f=all]').click()});await (await pg.$('#imp')).uploadFile('/tmp/rag-bad.json');await sl(400);
ok(!(await pg.evaluate(()=>window.__pwn)),'imported text is escaped (no HTML injection)');ok((await rows()).length===4,'invalid rows dropped, valid row kept');
// mark returned + filters + search
await pg.evaluate(()=>{document.querySelector('[data-f=all]').click()});await pg.click('#items .item [data-a=t]');await sl(200);
await pg.evaluate(()=>{document.querySelector('[data-f=active]').click()});const act=(await rows()).length;await pg.evaluate(()=>{document.querySelector('[data-f=all]').click()});ok(act===(await rows()).length-1,'returned item leaves the active filter');
await setv('#q','mug');ok((await rows()).length===1,'search by item');await setv('#q','');
// ICS + CSV contents
const ics=await pg.evaluate(async()=>{let blob;const o=URL.createObjectURL;URL.createObjectURL=b=>{blob=b;return o.call(URL,b)};document.getElementById('ics').click();URL.createObjectURL=o;return await blob.text()});
ok(ics.startsWith('BEGIN:VCALENDAR')&&ics.includes('BEGIN:VALARM')&&!ics.split('\r\n').some(l=>l.length>75),'ICS valid, lines folded');
// Arabic RTL
await pg.click('#lang');ok(await pg.$eval('html',e=>e.dir)==='rtl','Arabic RTL');ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow in Arabic');
ok(errs.length===0,'no page errors '+errs.join('|'));console.log(`${n} checks passed`);await b.close();server?.close();
