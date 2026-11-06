// preview single frames: node shot.js <outdir> <frame> [frame...]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));pg.on('console',m=>console.log('C:',m.text()));
await pg.goto('file://'+path.resolve(__dirname,'index.html'));await pg.waitForFunction('window.READY===true',null,{timeout:30000});
for(const f of process.argv.slice(3).map(Number)){await pg.evaluate(f=>window.frame(f),f);await pg.screenshot({path:`${out}/f_${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:85})}
await b.close()})();
