# single-worker render straight into ffmpeg: python render.py <out.mp4>
import subprocess,time,sys
from playwright.sync_api import sync_playwright
import os as _o,sys as _s; _s.path.insert(0,_o.path.dirname(_o.path.abspath(__file__))) # python -I drops the script dir
from _common import URL,launch,ffmpeg,ENC
out=sys.argv[1]
pr=subprocess.Popen([ffmpeg(),'-y','-f','image2pipe','-framerate','30','-i','-',*ENC,out],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
with sync_playwright() as p:
    b=launch(p)
    pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('pageerror',lambda e:print('ERR',e,flush=True))
    pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=30000); pg.wait_for_timeout(800)
    total=pg.evaluate('TOTAL'); t0=time.time()
    for f in range(total):
        pg.evaluate(f"frame({f})"); pr.stdin.write(pg.screenshot(type='jpeg',quality=95))
        if f%100==0: print(f,'/',total,round(time.time()-t0),'s',flush=True)
    b.close()
pr.stdin.close(); pr.wait(); print('done',round(time.time()-t0),'s',flush=True)
