// preview single frames: node shot.js <outdir> <frame> [<frame> ...]
const {chromium}=require('playwright'), path=require('path'), fs=require('fs'), {pathToFileURL}=require('url');
const URL=pathToFileURL(path.join(__dirname,'index.html')).href;
const [out,...fr]=process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
(async()=>{ const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1080,height:1920}}); pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('console',m=>console.log('C:',m.text()));
  await pg.goto(URL); await pg.waitForFunction('window.READY===true',null,{timeout:30000}); await pg.evaluate('document.fonts.ready'); await pg.waitForTimeout(800);
  console.log(await pg.evaluate('({FT:FT_FRAME,TOTAL,trig:trig.map(x=>Math.round(x*FPS))})'));
  for(const f of fr.map(Number)){ const t0=Date.now(); await pg.evaluate(`frame(${f})`); await pg.screenshot({path:`${out}/f_${f}.png`}); console.log(f,(Date.now()-t0)/1000,'s'); }
  await b.close(); })();
