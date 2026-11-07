import sys,os,time,pathlib
URL=pathlib.Path(__file__).resolve().with_name('index.html').as_uri()
from playwright.sync_api import sync_playwright
out=sys.argv[1]; frames=[int(x) for x in sys.argv[2:]]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH'),args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('console',lambda m:print('C:',m.text)); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto(URL); pg.wait_for_timeout(1500)
    print(pg.evaluate("({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})"))
    for f in frames:
        t0=time.time(); pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{out}/f_{f}.png'); print(f, round(time.time()-t0,2),'s')
    b.close()
