# usage: python -I shot.py [page.html] <out dir> <frame> [frame ...]
import sys,time,pathlib
from playwright.sync_api import sync_playwright
A=sys.argv[1:]; URL='file:///E:/Page%20Content/reel_che_mun/index.html'
if A[0].endswith('.html'): URL=pathlib.Path(A.pop(0)).resolve().as_uri()
out=A[0]; frames=[int(x) for x in A[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('console',lambda m:print('C:',m.text)); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto(URL); pg.wait_for_timeout(1500)
    print(pg.evaluate("({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})"))
    for f in frames:
        t0=time.time(); pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{out}/f_{f}.png'); print(f, round(time.time()-t0,2),'s')
    b.close()
