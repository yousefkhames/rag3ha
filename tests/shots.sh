#!/bin/bash
# Regenerates README screenshots from the local build (seeded demo data, headless Chrome).
cd "$(dirname "$0")/.."
shot(){ # name lang width height theme
python3 - "$2" "$3" "$5" <<'PY'
import re,sys,html,json,datetime as D
lang,w,theme=sys.argv[1:4]
app=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',open('docs/index.html').read())
t=D.date.today()
def it(i,store,item,amt,order,left,done=False):
    d=t+D.timedelta(days=left);p=d-D.timedelta(days=30)
    return dict(id=i,store=store,item=item,purchased=str(p),windowDays=30,deadline=str(d),amount=amt,order=order,done=done)
items=[it("a","noon","Sony WH-1000XM5 headphones","EGP 11,499","N2291",2),it("b","amazon","Mechanical keyboard","$89.99","114-5557781",8),it("c","zara","Linen jacket","EGP 2,450","Z88213",24),it("d","ikea","Desk lamp","EGP 650","I5521",-3,True)]
items[0]["deadline"]=str(t+D.timedelta(days=2))
seed="localStorage.rg_items=%s;localStorage.rg_lang='%s';localStorage.rg_theme='%s';"%(json.dumps(json.dumps(items)),lang,theme)
open('docs/_s.html','w').write('<!doctype html><meta charset=utf-8><body style="margin:0;background:#888"><script>%s</script><iframe width=%s height=1400 style="border:0" srcdoc="%s"></iframe>'%(seed,w,html.escape(app,quote=True)))
PY
google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=4000 --hide-scrollbars --window-size=$3,$4 --screenshot=/tmp/_s.png file://$PWD/docs/_s.html >/dev/null 2>&1
convert /tmp/_s.png -crop ${3}x${4}+0+0 +repage docs/screenshots/$1.png
}
shot desktop-en en 1000 1100 dark
shot mobile-en en 390 1100 dark
shot mobile-ar ar 390 1100 dark
shot desktop-light-ar ar 1000 1100 light
rm -f docs/_s.html
