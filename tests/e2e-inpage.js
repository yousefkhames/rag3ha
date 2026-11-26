// Runs inside the page (injected by tests/run-e2e.sh). Writes JSON to #e2e-result.
(async()=>{
const R=[],ok=(n,c,x)=>R.push({n,ok:!!c,x:c?undefined:x});
const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const want=window.__LANG||"en";if(window.__CORRUPT){localStorage.rg_items="{not json";}
try{
if(!window.__CORRUPT)localStorage.clear();
for(let i=0;i<2&&document.documentElement.lang!==want;i++){$("lang").click();await sleep(20)}
ok("viewport "+innerWidth,true);ok("lang "+want,document.documentElement.lang===want,document.documentElement.lang);
ok("dir",document.documentElement.dir===(want=="ar"?"rtl":"ltr"));
if(window.__CORRUPT){ok("corrupt storage: app still renders",$("empty")&&!$("empty").classList.contains("hide")&&document.querySelectorAll("#items .item").length===0);throw "done"}
$("sample").click();$("parse").click();await sleep(50);
ok("review shown",!$("review").classList.contains("hide"));
ok("fields filled",$("f-store").value==="amazon"&&$("f-win").value==="30"&&$("f-date").value);
$("save").click();await sleep(50);
let it=document.querySelectorAll("#items .item");ok("item added",it.length===1,it.length);
ok("date localized",/\d/.test(document.querySelector("#items .m small").textContent)&&!/\d{4}-\d{2}-\d{2}/.test(document.querySelector("#items .m small").textContent));ok("day label grammar",(()=>{const d=document.querySelector("#items .d small");return !d||(want==="en"?/days? left/.test(d.textContent):/متبق/.test(d.textContent))})());ok("stats text",$("stats").textContent.length>3);
ok("no horizontal overflow",document.documentElement.scrollWidth<=window.innerWidth+1,document.documentElement.scrollWidth+">"+window.innerWidth+" "+[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.offsetParent).slice(0,4).map(e=>e.tagName+"#"+e.id+"."+e.className).join(","));
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
$("q").value="zara";$("q").dispatchEvent(new Event("input"));await sleep(20);ok("search filters",document.querySelectorAll("#items .item").length===1,document.querySelectorAll("#items .item").length);$("q").value="";$("q").dispatchEvent(new Event("input"));
$("sample").click();$("parse").click();await sleep(30);$("save").click();await sleep(30);ok("duplicate blocked",JSON.parse(localStorage.rg_items).length===3,JSON.parse(localStorage.rg_items).length);
$("txt").value="Order #ZZ1\nOrder date: 2026-11-10\nTotal: 5 zara";$("parse").click();await sleep(30);ok("default zara window is 30",$("f-win").value==="30",$("f-win").value);$("f-win").value="7";$("save").click();await sleep(30);
$("txt").value="Order #ZZ2\nOrder date: 2026-11-11\nTotal: 5 zara";$("parse").click();await sleep(30);ok("zara window remembered (7)",$("f-win").value==="7",$("f-win").value);ok("source note mentions memory",$("src").textContent.length>5);
$("review").classList.add("hide");
$("txt").value="Order #XSS1\nItem: <img src=x onerror=window.__x=1>\nOrder date: 2026-11-12\nTotal: 5";$("parse").click();await sleep(30);$("f-date").value="";$("save").click();await sleep(20);ok("validation error shown",$("err").textContent.length>3&&JSON.parse(localStorage.rg_items).length===4);
$("f-date").value="2026-11-12";$("save").click();await sleep(60);ok("html is escaped",!window.__x&&!document.querySelector("#items img")&&JSON.parse(localStorage.rg_items).length===5,String(window.__x));
$("txt").value="Order #KB1\nOrder date: 2026-11-13\nTotal: 5";$("txt").dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",ctrlKey:true,bubbles:true}));await sleep(30);ok("Ctrl+Enter parses",!$("review").classList.contains("hide"));
$("review").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));await sleep(10);ok("Esc closes review",$("review").classList.contains("hide"));
ok("hint visible",document.querySelector('[data-i=hint]').textContent.length>5);ok("install hidden by default",$("install").classList.contains("hide"));
}catch(e){if(e!=="done")ok("exception",false,String(e&&e.stack||e))}
const pre=document.createElement("pre");pre.id="e2e-result";pre.textContent=JSON.stringify(R);document.body.appendChild(pre);
})();
