# England v Croatia reel renderer (paths relative to this folder; needs Playwright Chromium + imageio_ffmpeg)
#   python -I render.py prev <outdir> <frame> [<frame> ...]   -> PNG previews (prints FT frame / TOTAL)
#   python -I render.py mp4 <framesdir> <workers> <out.mp4>    -> parallel JPEG frames, one ffmpeg encode at 30 fps
import os,sys,time,subprocess,pathlib,multiprocessing as mp
H=pathlib.Path(__file__).resolve().parent
URL=(H/'index.html').as_uri()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
EXE=os.environ.get('CHROMIUM')  # optional: a Chromium binary other than Playwright's own
def page(p):
    b=p.chromium.launch(args=ARGS,**({'executable_path':EXE} if EXE else {})); pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('pageerror',lambda e:print('ERR',e,flush=True)); pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=60000); pg.wait_for_timeout(800)
    return b,pg
def work(a):
    wid,lo,hi,fdir=a
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b,pg=page(p); t0=time.time()
        for f in range(lo,hi):
            pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{fdir}/f_{f:05d}.jpg',type='jpeg',quality=95)
            if (f-lo)%100==0: print(f'w{wid} {f-lo}/{hi-lo} {round(time.time()-t0)}s',flush=True)
        b.close()
    return wid
if __name__=='__main__':
    from playwright.sync_api import sync_playwright
    mode=sys.argv[1]
    if mode=='prev':
        out=sys.argv[2]; os.makedirs(out,exist_ok=True)
        with sync_playwright() as p:
            b,pg=page(p); print(pg.evaluate("({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})"))
            for f in map(int,sys.argv[3:]): pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{out}/f_{f}.png')
            b.close()
    else:
        fdir,N,out=sys.argv[2],int(sys.argv[3]),sys.argv[4]; os.makedirs(fdir,exist_ok=True)
        with sync_playwright() as p:
            b,pg=page(p); total=pg.evaluate('TOTAL'); b.close()
        step=(total+N-1)//N; jobs=[(i,i*step,min(total,(i+1)*step),fdir) for i in range(N)]; t0=time.time()
        with mp.Pool(N) as pool:
            for w in pool.imap_unordered(work,jobs): print('worker done',w,round(time.time()-t0),'s',flush=True)
        miss=[f for f in range(total) if not os.path.exists(f'{fdir}/f_{f:05d}.jpg')]
        if miss: print('MISSING',miss[:20]); sys.exit(1)
        import imageio_ffmpeg
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-framerate','30','-i',f'{fdir}/f_%05d.jpg','-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
            '-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
            '-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',out],check=True,stderr=subprocess.DEVNULL)
        print('encoded',out,total,'frames',round(time.time()-t0),'s',flush=True)
