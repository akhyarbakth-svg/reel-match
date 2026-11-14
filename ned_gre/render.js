// Render index.html frame by frame with headless Chromium, then encode with ffmpeg.
//   node render.js preview <outdir> <frame> [frame ...]     -> full-size PNGs for checking
//   node render.js video <out.mp4> [width=1080] [workers=4]  -> 30 fps H.264 at 1080x1920 (a smaller width downscales)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), { execFileSync } = require('child_process');
const URL = 'file://' + path.join(__dirname, 'index.html');
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

async function open() {
  const b = await chromium.launch({ args: ARGS });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto(URL); await pg.waitForFunction('window.READY===true', null, { timeout: 30000 });
  await pg.evaluate('document.fonts.ready'); await pg.waitForTimeout(500);
  return { b, pg };
}

async function worker(lo, hi, dir, id) {
  const { b, pg } = await open(); const t0 = Date.now();
  for (let f = lo; f < hi; f++) {
    await pg.evaluate(`frame(${f})`);
    await pg.screenshot({ path: path.join(dir, `f_${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
    if ((f - lo) % 100 === 0) console.log(`w${id} ${f - lo}/${hi - lo} ${Math.round((Date.now() - t0) / 1000)}s`);
  }
  await b.close();
}

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  if (mode === 'preview') {
    fs.mkdirSync(out, { recursive: true }); const { b, pg } = await open();
    console.log(await pg.evaluate('({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})'));
    for (const f of rest.map(Number)) { await pg.evaluate(`frame(${f})`); await pg.screenshot({ path: path.join(out, `f_${f}.png`) }); }
    await b.close(); return;
  }
  const width = Number(rest[0] || 1080), N = Number(rest[1] || 4);
  const { b, pg } = await open(); const total = await pg.evaluate('TOTAL'); await b.close();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-frames-'));
  const step = Math.ceil(total / N);
  await Promise.all([...Array(N)].map((_, i) => worker(i * step, Math.min(total, (i + 1) * step), dir, i)));
  const h = Math.round(width * 1920 / 1080 / 2) * 2;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(dir, 'f_%05d.jpg'),
    '-vf', `scale=${width}:${h}:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-crf', '16', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: 'inherit' });
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('encoded', out, `${width}x${h}`, total, 'frames');
})();
