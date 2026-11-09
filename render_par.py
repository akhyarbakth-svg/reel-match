# parallel render: N Chromium workers each take a contiguous chunk, write JPEGs, then one ffmpeg encode at 30 fps
# usage: python -I render_par.py <frames dir> <workers> <total frames> [out.mp4]
import sys,os,time,subprocess,multiprocessing as mp,imageio_ffmpeg
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))) # -I drops the script dir
from reel_browser import launch,open_reel,H
OUT=str(H/'Man_United_vs_Aston_Villa_PL_Reel.mp4')
def work(args):
    wid,lo,hi,fdir=args
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=launch(p); pg=open_reel(b,lambda e:print('ERR',wid,e,flush=True))
        t0=time.time()
        for f in range(lo,hi):
            pg.evaluate(f"frame({f})"); pg.screenshot(path=f'{fdir}/f_{f:05d}.jpg',type='jpeg',quality=95)
            if (f-lo)%50==0: print(f'w{wid} {f-lo}/{hi-lo} {round(time.time()-t0)}s',flush=True)
        b.close()
    return wid
if __name__=='__main__':
    fdir=sys.argv[1]; N=int(sys.argv[2]); total=int(sys.argv[3]); out=sys.argv[4] if len(sys.argv)>4 else OUT; os.makedirs(fdir,exist_ok=True)
    step=(total+N-1)//N; jobs=[(i,i*step,min(total,(i+1)*step),fdir) for i in range(N)]
    t0=time.time()
    with mp.Pool(N) as pool:
        for w in pool.imap_unordered(work,jobs): print('worker done',w,round(time.time()-t0),'s',flush=True)
    miss=[f for f in range(total) if not os.path.exists(f'{fdir}/f_{f:05d}.jpg')]
    if miss: print('MISSING',miss[:20]); sys.exit(1)
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff,'-y','-framerate','30','-i',f'{fdir}/f_%05d.jpg','-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',out],check=True,stderr=subprocess.DEVNULL)
    print('encoded',out,round(time.time()-t0),'s',flush=True)
