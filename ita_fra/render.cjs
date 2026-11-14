// Render the reel with Playwright (Node) + system ffmpeg.
//   node render.cjs prev 0 120 400        -> PNG previews of those frames in prev/
//   node render.cjs video [workers] [out]  -> frames/ (JPEG) in parallel, then one 30 fps H.264 encode
const { chromium } = require('playwright'); // global install is fine: NODE_PATH=$(npm root -g)
const { execFileSync } = require('node:child_process');
const { mkdirSync, existsSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const H = __dirname;
const URL = pathToFileURL(path.join(H, 'index.html')).href;
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
async function page(browser) {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto(URL); await pg.waitForFunction('window.READY===true', null, { timeout: 30000 });
  await pg.evaluate('document.fonts.ready'); await pg.waitForTimeout(500); return pg;
}
(async () => {
const [mode, ...rest] = process.argv.slice(2);
const browser = await chromium.launch({ args: ARGS });
if (mode === 'prev') {
  mkdirSync(path.join(H, 'prev'), { recursive: true }); const pg = await page(browser);
  console.log(await pg.evaluate('({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})'));
  for (const f of rest.map(Number)) { await pg.evaluate(`frame(${f})`); await pg.screenshot({ path: path.join(H, 'prev', `f_${f}.png`) }); console.log('frame', f); }
} else {
  const N = Number(rest[0] || 4), out = rest[1] || path.join(H, 'Italy_vs_France_Nations_League_Reel.mp4');
  const fdir = path.join(H, 'frames'); mkdirSync(fdir, { recursive: true });
  const probe = await page(browser); const total = await probe.evaluate('TOTAL'); await probe.close();
  const step = Math.ceil(total / N), t0 = Date.now();
  await Promise.all([...Array(N)].map(async (_, w) => {
    const b = await chromium.launch({ args: ARGS }); const pg = await page(b);
    for (let f = w * step; f < Math.min(total, (w + 1) * step); f++) {
      await pg.evaluate(`frame(${f})`); await pg.screenshot({ path: path.join(fdir, `f_${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
      if ((f - w * step) % 100 === 0) console.log(`w${w} ${f - w * step}/${step} ${Math.round((Date.now() - t0) / 1000)}s`);
    }
    await b.close();
  }));
  for (let f = 0; f < total; f++) if (!existsSync(path.join(fdir, `f_${String(f).padStart(5, '0')}.jpg`))) throw new Error('missing frame ' + f);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(fdir, 'f_%05d.jpg'),
    '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30',
    '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-crf', '18', '-preset', 'medium', '-tune', 'animation', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('encoded', out, Math.round((Date.now() - t0) / 1000) + 's');
}
await browser.close();
})();
