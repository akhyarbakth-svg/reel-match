# shared render setup: page URL next to this file, Chromium launch args, ffmpeg binary (works on Windows and in the cloud container)
import os,shutil,pathlib
H=os.path.dirname(os.path.abspath(__file__))
URL=pathlib.Path(H,'index.html').as_uri()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
def launch(p):
    exe=os.environ.get('CHROMIUM_PATH') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    return p.chromium.launch(args=ARGS,executable_path=exe) if exe else p.chromium.launch(args=ARGS)
def ffmpeg():
    try:
        import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError: return shutil.which('ffmpeg') or 'ffmpeg'
# H.264, BT.709 limited range, 30 fps, silent
ENC=['-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart','-an']
