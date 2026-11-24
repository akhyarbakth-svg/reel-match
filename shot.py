# preview single frames: python -I shot.py <page.html> <out dir> <frame> [frame ...]
# set CHROMIUM_PATH to launch a preinstalled Chromium instead of the one Playwright downloads
import sys,os,time,pathlib
from playwright.sync_api import sync_playwright
url=pathlib.Path(sys.argv[1]).resolve().as_uri(); out=sys.argv[2]; frames=[int(x) for x in sys.argv[3:]]; os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH'),args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('console',lambda m:print('C:',m.text)); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto(url); pg.wait_for_function('window.READY===true',timeout=30000); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(800)
    print(pg.evaluate("({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})"))
    for f in frames:
        t0=time.time(); pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{out}/f_{f}.png'); print(f, round(time.time()-t0,2),'s')
    b.close()
