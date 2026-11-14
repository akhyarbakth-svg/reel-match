// preview single frames: node shot.js <outdir> <seconds...>   (prints scene times)
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),url=require('url');
(async()=>{ const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch(), pg=await b.newPage({viewport:{width:1080,height:1920}});
  pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('console',m=>console.log('C:',m.text()));
  await pg.goto(url.pathToFileURL(path.join(__dirname,'index.html')).href); await pg.waitForFunction('window.READY===true');
  console.log(JSON.stringify(await pg.evaluate('({TOTAL,TIMES})')));
  for(const s of process.argv.slice(3)){ await pg.evaluate(`frame(${Math.round(parseFloat(s)*30)})`); await pg.screenshot({path:`${out}/t_${s}.png`}); }
  await b.close(); })();
