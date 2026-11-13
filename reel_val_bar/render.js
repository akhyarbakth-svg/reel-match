// parallel render: node render.js <framesdir> <workers> <out.mp4>
// N Chromium pages each take a contiguous chunk of frames -> JPEGs, then one ffmpeg encode at 30 fps
// ffmpeg comes from the imageio-ffmpeg Python package (pip install imageio-ffmpeg) or FFMPEG=/path/to/ffmpeg
const {chromium}=require('playwright'), path=require('path'), fs=require('fs'), {pathToFileURL}=require('url'), {execFileSync}=require('child_process');
const URL=pathToFileURL(path.join(__dirname,'index.html')).href;
const [fdir,N='4',out='Valencia_vs_Barcelona_LaLiga_MD4_Reel.mp4']=process.argv.slice(2); fs.mkdirSync(fdir,{recursive:true});
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
async function open(b){ const pg=await b.newPage({viewport:{width:1080,height:1920}}); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto(URL); await pg.waitForFunction('window.READY===true',null,{timeout:30000}); await pg.evaluate('document.fonts.ready'); await pg.waitForTimeout(800); return pg; }
(async()=>{ const t0=Date.now(); const b=await chromium.launch({args:ARGS}); const p0=await open(b); const total=await p0.evaluate('TOTAL'); await p0.close();
  const n=+N, step=Math.ceil(total/n);
  await Promise.all([...Array(n)].map(async(_,w)=>{ const br=await chromium.launch({args:ARGS}); const pg=await open(br);
    for(let f=w*step;f<Math.min(total,(w+1)*step);f++){ await pg.evaluate(`frame(${f})`); await pg.screenshot({path:`${fdir}/f_${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:95});
      if((f-w*step)%100===0) console.log(`w${w} ${f-w*step}/${step} ${Math.round((Date.now()-t0)/1000)}s`); }
    await br.close(); }));
  await b.close();
  const miss=[...Array(total).keys()].filter(f=>!fs.existsSync(`${fdir}/f_${String(f).padStart(5,'0')}.jpg`)); if(miss.length){ console.log('MISSING',miss.slice(0,20)); process.exit(1); }
  const ff=process.env.FFMPEG||execFileSync('python3',['-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  execFileSync(ff,['-y','-loglevel','error','-framerate','30','-i',`${fdir}/f_%05d.jpg`,'-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709','-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-crf','16','-preset','medium','-tune','animation','-movflags','+faststart',out]);
  console.log('encoded',out,total,'frames',Math.round((Date.now()-t0)/1000),'s'); })();
