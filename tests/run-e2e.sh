#!/bin/bash
# Real-browser click-through: desktop+mobile, en+ar. Needs google-chrome. Usage: bash tests/run-e2e.sh
cd "$(dirname "$0")/.."; fail=0
for combo in "en 1200 900" "ar 1200 900" "en 390 900" "ar 390 900"; do set -- $combo
 python3 - "$1" <<'PY'
import re,sys
h=open('docs/index.html').read()
h=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',h)
h=h.replace('</body>','<script>window.__LANG="%s"</script><script>%s</script></body>'%(sys.argv[1],open('tests/e2e-inpage.js').read()))
open('docs/_e2e.html','w').write(h)
PY
 out=$(google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=5000 --window-size=$2,$3 --dump-dom file://$PWD/docs/_e2e.html 2>/dev/null | grep -o '<pre id="e2e-result">.*</pre>' | sed 's/<[^>]*>//g;s/&quot;/"/g')
 bad=$(echo "$out" | python3 -c "import sys,json;d=json.loads(sys.stdin.read() or '[]');print(len(d)==0 and 'NO RESULT' or ', '.join(x['n']+' '+str(x.get('x','')) for x in d if not x['ok']) )")
 echo "[$1 ${2}px] ${bad:-all pass}"; [ -n "$bad" ] && fail=1
done; rm -f docs/_e2e.html; exit $fail
