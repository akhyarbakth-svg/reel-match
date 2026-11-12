// Render the reel with headless Chromium (Node Playwright) + ffmpeg.
//   node render.js shot <outdir> <frame> [frame ...]      preview single frames as PNG
//   node render.js video <out.mp4> [workers]              N parallel workers -> JPEG frames -> H.264 at 30 fps
const {chromium}=require('playwright'), path=require('path'), fs=require('fs'), {spawnSync,fork}=require('child_process'), url=require('url');
const URL=url.pathToFileURL(path.join(__dirname,'index.html')).href;
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
async function open(){ const b=await chromium.launch({args:ARGS}); const pg=await b.newPage({viewport:{width:1080,height:1920}});
  pg.on('pageerror',e=>console.log('ERR',e.message)); await pg.goto(URL); await pg.waitForFunction('window.READY===true',null,{timeout:30000}); await pg.waitForTimeout(800); return [b,pg]; }
async function shot(out,frames){ fs.mkdirSync(out,{recursive:true}); const [b,pg]=await open();
  console.log(await pg.evaluate('({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})'));
  for(const f of frames){ const t0=Date.now(); await pg.evaluate(`frame(${f})`); await pg.screenshot({path:`${out}/f_${f}.png`}); console.log(f,(Date.now()-t0)/1000+'s'); } await b.close(); }
async function worker(lo,hi,dir){ const [b,pg]=await open(); const t0=Date.now();
  for(let f=lo;f<hi;f++){ await pg.evaluate(`frame(${f})`); await pg.screenshot({path:`${dir}/f_${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:95});
    if((f-lo)%100===0) console.log(`w ${lo}: ${f-lo}/${hi-lo} ${Math.round((Date.now()-t0)/1000)}s`); } await b.close(); }
async function video(out,N){ const dir=path.join(path.dirname(path.resolve(out)),'frames'); fs.mkdirSync(dir,{recursive:true});
  const [b,pg]=await open(); const total=await pg.evaluate('TOTAL'); await b.close(); console.log('frames',total);
  const step=Math.ceil(total/N); await Promise.all([...Array(N)].map((_,i)=>new Promise((res,rej)=>{ const lo=i*step, hi=Math.min(total,(i+1)*step);
    fork(__filename,['_worker',lo,hi,dir]).on('exit',c=>c?rej(new Error('worker '+i)):res()); })));
  const miss=[...Array(total).keys()].filter(f=>!fs.existsSync(`${dir}/f_${String(f).padStart(5,'0')}.jpg`)); if(miss.length) throw new Error('missing '+miss.slice(0,10));
  const r=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${dir}/f_%05d.jpg`,'-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
    '-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',out],{stdio:'inherit'});
  if(r.status) throw new Error('ffmpeg failed'); console.log('encoded',out); }
const [mode,...a]=process.argv.slice(2);
(mode==='shot'?shot(a[0],a.slice(1).map(Number)):mode==='video'?video(a[0],+(a[1]||4)):worker(+a[0],+a[1],a[2])).catch(e=>{console.error(e);process.exit(1);});
