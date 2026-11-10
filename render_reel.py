# portable reel renderer: any reel folder (index.html + data.js) -> 1080x1920 MP4 at 30 fps
# usage:
#   python -I render_reel.py <reel dir> prev <frame> [<frame> ...]       # single PNG previews to <reel dir>/prev/
#   python -I render_reel.py <reel dir> mp4 <out.mp4> [workers=4]        # frames to <reel dir>/frames/, then one ffmpeg encode
# set CHROMIUM=/path/to/chrome to use a specific browser build (e.g. a Linux container's pre-installed Chromium)
import os,sys,time,shutil,subprocess,multiprocessing as mp
from pathlib import Path
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
def launch(p):
    exe=os.environ.get('CHROMIUM'); return p.chromium.launch(args=ARGS,**({'executable_path':exe} if exe else {}))
def page(b,url,tag):
    pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('pageerror',lambda e:print('ERR',tag,e,flush=True))
    pg.goto(url); pg.wait_for_function('window.READY===true',timeout=60000); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(800); return pg
def work(a):
    wid,url,lo,hi,fdir=a
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=launch(p); pg=page(b,url,wid); t0=time.time()
        for f in range(lo,hi):
            pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{fdir}/f_{f:05d}.jpg',type='jpeg',quality=95)
            if (f-lo)%100==0: print(f'w{wid} {f-lo}/{hi-lo} {round(time.time()-t0)}s',flush=True)
        b.close()
    return wid
def ffmpeg():
    try: import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError: return shutil.which('ffmpeg') or sys.exit('needs ffmpeg (pip install imageio-ffmpeg)')
if __name__=='__main__':
    d=Path(sys.argv[1]).resolve(); mode=sys.argv[2]; url=(d/'index.html').as_uri()
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=launch(p); pg=page(b,url,'main'); info=pg.evaluate("({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})"); print(info,flush=True)
        if mode=='prev':
            out=d/'prev'; out.mkdir(exist_ok=True)
            for f in [int(x) for x in sys.argv[3:]]: pg.evaluate(f"frame({f})"); pg.screenshot(path=str(out/f'f_{f}.png')); print('wrote',out/f'f_{f}.png')
        b.close()
    if mode!='mp4': sys.exit()
    OUT=sys.argv[3]; N=int(sys.argv[4]) if len(sys.argv)>4 else 4; total=info['TOTAL']
    fdir=d/'frames'; fdir.mkdir(exist_ok=True)
    step=(total+N-1)//N; jobs=[(i,url,i*step,min(total,(i+1)*step),str(fdir)) for i in range(N)]
    t0=time.time()
    with mp.Pool(N) as pool:
        for w in pool.imap_unordered(work,jobs): print('worker done',w,round(time.time()-t0),'s',flush=True)
    miss=[f for f in range(total) if not (fdir/f'f_{f:05d}.jpg').exists()]
    if miss: sys.exit(f'MISSING {miss[:20]}')
    subprocess.run([ffmpeg(),'-y','-framerate','30','-i',str(fdir/'f_%05d.jpg'),'-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
        '-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
        '-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',OUT],check=True,stderr=subprocess.DEVNULL)
    print('encoded',OUT,total,'frames',round(time.time()-t0),'s',flush=True)
