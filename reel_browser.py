# shared Chromium launch for shot.py / render_par.py
# WebGL goes through SwiftShader so frames render the same with or without a GPU.
# Set CHROMIUM to a browser binary when Playwright's bundled one isn't installed (e.g. CHROMIUM=/opt/pw-browsers/chromium).
import os,pathlib
H=pathlib.Path(__file__).resolve().parent
URL=(H/'index.html').as_uri()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
def launch(p):
    exe=os.environ.get('CHROMIUM')
    return p.chromium.launch(args=ARGS,**({'executable_path':exe} if exe else {}))
def open_reel(b,on_error=None):
    pg=b.new_page(viewport={'width':1080,'height':1920})
    if on_error: pg.on('pageerror',on_error)
    pg.goto(URL); pg.wait_for_function('window.READY===true',timeout=60000); pg.wait_for_timeout(800)
    return pg
