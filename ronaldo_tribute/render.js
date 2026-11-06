// Parallel frame renderer: node render.js <frames_dir> <workers> <out.mp4>
// Each worker opens its own Chromium page, renders a contiguous chunk of frames to JPEG, then ffmpeg encodes 30 fps H.264.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const {execFileSync}=require('child_process');
const [dir,N,out]=[process.argv[2]||'frames',+(process.argv[3]||4),process.argv[4]||'Ronaldo_Portugal_Tribute.mp4'];
const URL='file://'+path.resolve(__dirname,'index.html');
async function work(id,lo,hi){
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
  pg.on('pageerror',e=>console.log('ERR',id,e.message));
  await pg.goto(URL);await pg.waitForFunction('window.READY===true',null,{timeout:60000});
  const t0=Date.now();
  for(let f=lo;f<hi;f++){await pg.evaluate(f=>window.frame(f),f);await pg.screenshot({path:`${dir}/f_${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:94});
    if((f-lo)%100===0)console.log(`w${id} ${f-lo}/${hi-lo} ${((Date.now()-t0)/1000)|0}s`)}
  await b.close();
}
(async()=>{fs.mkdirSync(dir,{recursive:true});
  const total=await (async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.goto(URL);await pg.waitForFunction('window.READY===true');const t=await pg.evaluate('TOTAL');await b.close();return t})();
  const step=Math.ceil(total/N);await Promise.all([...Array(N)].map((_,i)=>work(i,i*step,Math.min(total,(i+1)*step))));
  const miss=[...Array(total).keys()].filter(f=>!fs.existsSync(`${dir}/f_${String(f).padStart(5,'0')}.jpg`));
  if(miss.length){console.log('MISSING',miss.slice(0,20));process.exit(1)}
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${dir}/f_%05d.jpg`,
    '-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
    '-c:v','libx264','-pix_fmt','yuv420p','-r','30','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-crf','17','-preset','slow','-movflags','+faststart',out],{stdio:'inherit'});
  console.log('encoded',out);
})();
