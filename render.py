# single-process render straight into ffmpeg: python -I render.py [out.mp4]
import subprocess,time,sys,os,pathlib,imageio_ffmpeg
from playwright.sync_api import sync_playwright
ff=imageio_ffmpeg.get_ffmpeg_exe()
H=os.path.dirname(os.path.abspath(__file__))
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(H,'Liverpool_vs_Arsenal_PL_Reel.mp4')
pr=subprocess.Popen([ff,'-y','-f','image2pipe','-framerate','30','-i','-','-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart','-an',out],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={'width':1080,'height':1920}); pg.on('pageerror',lambda e:print('ERR',e,flush=True))
    pg.goto(pathlib.Path(H,'index.html').as_uri()); pg.wait_for_function('window.READY===true',timeout=30000)
    total=pg.evaluate('TOTAL'); t0=time.time()
    for f in range(total):
        pg.evaluate(f"frame({f})"); pr.stdin.write(pg.screenshot(type='jpeg',quality=95))
        if f%100==0: print(f,'/',total,round(time.time()-t0),'s',flush=True)
    b.close()
pr.stdin.close(); pr.wait(); print('done',round(time.time()-t0),'s',flush=True)
