# preview single frames: python -I shot.py <out dir> <frame> [<frame> ...]
import sys,os,time
from playwright.sync_api import sync_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))) # -I drops the script dir
from reel_browser import launch,open_reel
out=sys.argv[1]; frames=[int(x) for x in sys.argv[2:]]; os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
    b=launch(p); pg=open_reel(b,lambda e:print('ERR',e))
    pg.on('console',lambda m:print('C:',m.text))
    print(pg.evaluate("({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})"))
    for f in frames:
        t0=time.time(); pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{out}/f_{f}.png'); print(f, round(time.time()-t0,2),'s')
    b.close()
