# parallel render: python -I render_par.py <frames dir> <workers> [<out.mp4>]
# N Chromium workers each take a contiguous chunk of frames and write JPEGs, then one ffmpeg encode at 30 fps.
import sys,os,time,shutil,pathlib,subprocess,multiprocessing as mp
H=pathlib.Path(__file__).resolve().parent
URL=(H/'index.html').as_uri()
def ffmpeg():
    try:
        import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return shutil.which('ffmpeg') or sys.exit('needs ffmpeg on PATH or the imageio_ffmpeg package')
def launch(p):
    return p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
def total_frames():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=launch(p); pg=b.new_page(viewport={'width':1080,'height':1920}); pg.goto(URL); n=pg.evaluate('TOTAL'); b.close(); return n
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
if __name__=='__main__':
    fdir=sys.argv[1]; N=int(sys.argv[2]); out=sys.argv[3] if len(sys.argv)>3 else str(H/'Valencia_vs_Real_Madrid_LaLiga_MD12_Reel.mp4')
    os.makedirs(fdir,exist_ok=True); total=total_frames(); print('frames:',total,flush=True)
    step=(total+N-1)//N; jobs=[(i,i*step,min(total,(i+1)*step),fdir) for i in range(N)]
    t0=time.time()
    with mp.Pool(N) as pool:
        for w in pool.imap_unordered(work,jobs): print('worker done',w,round(time.time()-t0),'s',flush=True)
    miss=[f for f in range(total) if not os.path.exists(f'{fdir}/f_{f:05d}.jpg')]
    if miss: print('MISSING',miss[:20]); sys.exit(1)
    subprocess.run([ffmpeg(),'-y','-framerate','30','-i',f'{fdir}/f_%05d.jpg','-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',out],check=True,stderr=subprocess.DEVNULL)
    print('encoded',out,round(time.time()-t0),'s',flush=True)
