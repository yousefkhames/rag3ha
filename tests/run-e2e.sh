#!/bin/bash
# Real-browser click-through at true widths (app runs in an iframe of that width), en+ar. Needs google-chrome.
cd "$(dirname "$0")/.."; fail=0
for combo in "en 1200" "ar 1200" "en 390" "ar 390" "en 320"; do set -- $combo
 python3 - "$1" "$2" <<'PY'
import re,sys,html
lang,w=sys.argv[1],sys.argv[2]
app=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',open('docs/index.html').read())
src=open('tests/e2e-inpage.js').read()
page='''<!doctype html><meta charset=utf-8><body style="margin:0"><iframe id=f width=%s height=900 style="border:0" srcdoc="%s"></iframe>
<script id=src type="text/plain">%s</script>
<script>const f=document.getElementById("f");f.onload=()=>{f.contentWindow.__LANG="%s";f.contentWindow.eval(document.getElementById("src").textContent);
setTimeout(()=>{const r=f.contentDocument.getElementById("e2e-result");const p=document.createElement("pre");p.id="e2e-result";p.textContent=r?r.textContent:"";document.body.appendChild(p)},3000)}</script>'''%(w,html.escape(app,quote=True),src.replace('</script','<\\/script'),lang)
open('docs/_e2e.html','w').write(page)
PY
 out=$(google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=8000 --window-size=1300,950 --dump-dom file://$PWD/docs/_e2e.html 2>/dev/null | grep -o '<pre id="e2e-result">.*</pre>' | sed 's/<[^>]*>//g;s/&quot;/"/g;s/&amp;/\&/g')
 bad=$(echo "$out" | python3 -c "import sys,json;d=json.loads(sys.stdin.read() or '[]');print('NO RESULT' if not d else ', '.join(x['n']+' '+str(x.get('x','')) for x in d if not x['ok']))")
 vw=$(echo "$out" | grep -o 'viewport [0-9]*' | head -1)
 echo "[$1 ${2}px] ${vw} ${bad:-all pass}"; [ -n "$bad" ] && fail=1
done; rm -f docs/_e2e.html; exit $fail
