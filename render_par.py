# parallel render: N Chromium workers each take an interleaved-free contiguous chunk, write JPEGs, then one ffmpeg encode at 30 fps
# usage: python -I render_par.py <frames dir> <workers> <total frames> [page.html] [out.mp4]
import sys,os,time,subprocess,multiprocessing as mp,pathlib,imageio_ffmpeg
URL=pathlib.Path(sys.argv[4]).resolve().as_uri() if len(sys.argv)>4 else 'file:///E:/Page%20Content/reel_che_mun/index.html'
OUT=sys.argv[5] if len(sys.argv)>5 else 'E:/Page Content/Videos/Game State-V15/Chelsea_vs_Man_United_PL_Reel.mp4'
def work(args):
    wid,lo,hi,fdir=args
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('pageerror',lambda e:print('ERR',wid,e,flush=True))
        pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=30000); pg.wait_for_timeout(800)
        t0=time.time()
        for f in range(lo,hi):
            pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{fdir}/f_{f:05d}.jpg',type='jpeg',quality=95)
            if (f-lo)%50==0: print(f'w{wid} {f-lo}/{hi-lo} {round(time.time()-t0)}s',flush=True)
        b.close()
    return wid
if __name__=='__main__':
    fdir=sys.argv[1]; N=int(sys.argv[2]); total=int(sys.argv[3]); os.makedirs(fdir,exist_ok=True)
    step=(total+N-1)//N; jobs=[(i,i*step,min(total,(i+1)*step),fdir) for i in range(N)]
    t0=time.time()
    with mp.Pool(N) as pool:
        for w in pool.imap_unordered(work,jobs): print('worker done',w,round(time.time()-t0),'s',flush=True)
    miss=[f for f in range(total) if not os.path.exists(f'{fdir}/f_{f:05d}.jpg')]
    if miss: print('MISSING',miss[:20]); sys.exit(1)
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff,'-y','-framerate','30','-i',f'{fdir}/f_%05d.jpg','-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',OUT],check=True,stderr=subprocess.DEVNULL)
    print('encoded',OUT,round(time.time()-t0),'s',flush=True)
