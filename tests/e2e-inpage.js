// Runs inside the page (injected by tests/run-e2e.sh). Writes JSON to #e2e-result.
(async()=>{
const R=[],ok=(n,c,x)=>R.push({n,ok:!!c,x:c?undefined:x});
const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const want=window.__LANG||"en";
try{
localStorage.clear();
for(let i=0;i<2&&document.documentElement.lang!==want;i++){$("lang").click();await sleep(20)}
ok("viewport "+innerWidth,true);ok("lang "+want,document.documentElement.lang===want,document.documentElement.lang);
ok("dir",document.documentElement.dir===(want=="ar"?"rtl":"ltr"));
$("sample").click();$("parse").click();await sleep(50);
ok("review shown",!$("review").classList.contains("hide"));
ok("fields filled",$("f-store").value==="amazon"&&$("f-win").value==="30"&&$("f-date").value);
$("save").click();await sleep(50);
let it=document.querySelectorAll("#items .item");ok("item added",it.length===1,it.length);
ok("stats text",$("stats").textContent.length>3);
ok("no horizontal overflow",document.documentElement.scrollWidth<=window.innerWidth+1,document.documentElement.scrollWidth+">"+window.innerWidth);
document.querySelector('[data-a=e]').click();await sleep(20);ok("edit opens",!$("review").classList.contains("hide")&&$("f-store").value==="amazon");
$("f-win").value="10";$("save").click();await sleep(20);it=document.querySelectorAll("#items .item");ok("edit keeps one",it.length===1,it.length);
document.querySelector('[data-a=t]').click();await sleep(20);ok("returned leaves open list",document.querySelectorAll("#items .item").length===0);
document.querySelector('[data-f=done]').click();await sleep(20);ok("closed list has it",document.querySelectorAll("#items .item").length===1);
document.querySelector('[data-a=x]').click();await sleep(20);ok("deleted",document.querySelectorAll("#items .item").length===0);
ok("toast shown",!$("toast").classList.contains("hide"));
$("toast").querySelector("button").click();await sleep(20);ok("undo restores",document.querySelectorAll("#items .item").length===1);
ok("persisted",JSON.parse(localStorage.rg_items).length===1);
$("txt").value="Order #A1B2C3\nOrder date: 2026-11-01\nTotal: 10\n---\nOrder #D4E5F6\nOrder date: 2026-11-02\nTotal: 20 zara";$("parse").click();await sleep(30);
document.querySelector('[data-f=all]').click();await sleep(20);ok("multi paste adds 2",JSON.parse(localStorage.rg_items).length===3,JSON.parse(localStorage.rg_items).length);
ok("ics has events",Rag.ics(JSON.parse(localStorage.rg_items)).split("BEGIN:VEVENT").length>=2);
}catch(e){ok("exception",false,String(e&&e.stack||e))}
const pre=document.createElement("pre");pre.id="e2e-result";pre.textContent=JSON.stringify(R);document.body.appendChild(pre);
})();
