// Parallel render: N Chromium pages each draw a contiguous chunk of frames to JPEG, then
// gen_audio.py builds the soundtrack and ffmpeg encodes 1080x1920 H.264 @ 30 fps + AAC.
// usage: node render.js <framesdir> <workers> <out.mp4>
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),url=require('url'),{execFileSync}=require('child_process');
const [fdir,NW,OUT]=[process.argv[2],+process.argv[3]||4,process.argv[4]];
const PAGE=url.pathToFileURL(path.join(__dirname,'index.html')).href;
(async()=>{ fs.mkdirSync(fdir,{recursive:true}); const t0=Date.now();
  const b=await chromium.launch();
  const open=async()=>{ const pg=await b.newPage({viewport:{width:1080,height:1920}}); pg.on('pageerror',e=>console.log('ERR',e.message));
    await pg.goto(PAGE); await pg.waitForFunction('window.READY===true'); return pg; };
  const p0=await open(); const {TOTAL,TIMES}=await p0.evaluate('({TOTAL,TIMES})');
  fs.writeFileSync(path.join(fdir,'times.json'),JSON.stringify(TIMES));
  const step=Math.ceil(TOTAL/NW), pages=[p0,...await Promise.all(Array.from({length:NW-1},open))];
  await Promise.all(pages.map(async(pg,w)=>{ for(let f=w*step;f<Math.min(TOTAL,(w+1)*step);f++){
      await pg.evaluate(`frame(${f})`); await pg.screenshot({path:`${fdir}/f_${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:95});
      if((f-w*step)%100===0) console.log(`w${w} ${f-w*step}/${step} ${Math.round((Date.now()-t0)/1000)}s`); } }));
  await b.close();
  const wav=path.join(fdir,'audio.wav');
  execFileSync('python3',['-I',path.join(__dirname,'gen_audio.py'),path.join(fdir,'times.json'),wav],{stdio:'inherit'});
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${fdir}/f_%05d.jpg`,'-i',wav,
    '-vf','scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709',
    '-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-r','30','-crf','18','-maxrate','10M','-bufsize','20M','-preset','slow','-tune','animation',
    '-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',OUT],{stdio:'inherit'});
  console.log('encoded',OUT,TOTAL,'frames',Math.round((Date.now()-t0)/1000)+'s'); })();
