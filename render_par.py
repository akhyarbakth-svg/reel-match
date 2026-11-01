# parallel render: N Chromium workers each take a contiguous chunk, write JPEGs, then one ffmpeg encode at 30 fps
# usage: python render_par.py <framedir> <workers> <out.mp4>   (frame count is read from the page's TOTAL)
import sys,os,time,subprocess,multiprocessing as mp
import os as _o,sys as _s; _s.path.insert(0,_o.path.dirname(_o.path.abspath(__file__))) # python -I drops the script dir
from _common import URL,launch,ffmpeg,ENC
def work(args):
    wid,lo,hi,fdir=args
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=launch(p)
        pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('pageerror',lambda e:print('ERR',wid,e,flush=True))
        pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=30000); pg.wait_for_timeout(800)
        t0=time.time()
        for f in range(lo,hi):
            pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{fdir}/f_{f:05d}.jpg',type='jpeg',quality=95)
            if (f-lo)%50==0: print(f'w{wid} {f-lo}/{hi-lo} {round(time.time()-t0)}s',flush=True)
        b.close()
    return wid
def total_frames():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=launch(p); pg=b.new_page(viewport={'width':1080,'height':1920}); pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=30000)
        n=pg.evaluate('TOTAL'); b.close(); return n
if __name__=='__main__':
    fdir=sys.argv[1]; N=int(sys.argv[2]); OUT=sys.argv[3]; os.makedirs(fdir,exist_ok=True)
    total=total_frames(); print('frames',total,'=',round(total/30,2),'s',flush=True)
    step=(total+N-1)//N; jobs=[(i,i*step,min(total,(i+1)*step),fdir) for i in range(N)]
    t0=time.time()
    with mp.Pool(N) as pool:
        for w in pool.imap_unordered(work,jobs): print('worker done',w,round(time.time()-t0),'s',flush=True)
    miss=[f for f in range(total) if not os.path.exists(f'{fdir}/f_{f:05d}.jpg')]
    if miss: print('MISSING',miss[:20]); sys.exit(1)
    subprocess.run([ffmpeg(),'-y','-framerate','30','-i',f'{fdir}/f_%05d.jpg',*ENC,OUT],check=True,stderr=subprocess.DEVNULL)
    print('encoded',OUT,round(time.time()-t0),'s',flush=True)
