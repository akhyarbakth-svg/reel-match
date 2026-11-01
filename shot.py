# preview single frames: python shot.py <outdir> <frame> [<frame> ...]
import os,sys,time
from playwright.sync_api import sync_playwright
import os as _o,sys as _s; _s.path.insert(0,_o.path.dirname(_o.path.abspath(__file__))) # python -I drops the script dir
from _common import URL,launch
out=sys.argv[1]; frames=[int(x) for x in sys.argv[2:]]; os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
    b=launch(p)
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('console',lambda m:print('C:',m.text)); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=30000); pg.wait_for_timeout(800)
    print(pg.evaluate("({FT:FT_FRAME,TOTAL,secs:TOTAL/FPS,trig:trig.map(x=>Math.round(x*FPS))})"))
    for f in frames:
        t0=time.time(); pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{out}/f_{f}.png'); print(f, round(time.time()-t0,2),'s')
    b.close()
