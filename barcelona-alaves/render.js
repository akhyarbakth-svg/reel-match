// parallel render on Linux/macOS (Node + Playwright + ffmpeg on PATH):
//   python3 -m http.server 8765 --bind 127.0.0.1   (from the repo root, so ../three.min.js, ../fonts and ../gs_logo.png resolve)
//   node barcelona-alaves/render.js <frames dir> <workers> <out.mp4>
// N Chromium workers each take a contiguous chunk of frames and write JPEGs, then one ffmpeg encode at 30 fps
const {chromium}=require('playwright'), fs=require('fs'), {execFileSync}=require('child_process');
const URL='http://127.0.0.1:8765/barcelona-alaves/index.html';
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
async function open(b){ const pg=await b.newPage({viewport:{width:1080,height:1920}}); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto(URL); await pg.waitForFunction('window.READY===true',{timeout:30000}); await pg.waitForTimeout(800); return pg; }
(async()=>{ const [dir,nw,out]=process.argv.slice(2), N=+nw; fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch({args:ARGS}); const total=await (await open(b)).evaluate('TOTAL'); await b.close();
  const step=Math.ceil(total/N), t0=Date.now();
  await Promise.all([...Array(N)].map(async(_,w)=>{ const lo=w*step, hi=Math.min(total,lo+step);
    const b=await chromium.launch({args:ARGS}); const pg=await open(b);
    for(let f=lo;f<hi;f++){ await pg.evaluate(`frame(${f})`); await pg.screenshot({path:`${dir}/f_${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:95});
      if((f-lo)%100===0) console.log(`w${w} ${f-lo}/${hi-lo} ${Math.round((Date.now()-t0)/1000)}s`); }
    await b.close(); }));
  const miss=[...Array(total).keys()].filter(f=>!fs.existsSync(`${dir}/f_${String(f).padStart(5,'0')}.jpg`)); if(miss.length){ console.log('MISSING',miss.slice(0,20)); process.exit(1); }
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${dir}/f_%05d.jpg`,'-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
    '-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',out],{stdio:'inherit'});
  console.log('encoded',out,total,'frames',Math.round((Date.now()-t0)/1000)+'s'); })();
