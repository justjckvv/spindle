// Original 48-second chip loops for the shared listening room.
const tunes = {neon:[60,67,70,67,63,67,72,70],midnight:[50,57,62,65,53,60,65,67],glass:[64,71,76,74,67,71,79,78]};
export default function audio(req,res){
  const notes=Object.hasOwn(tunes,req.query.track)?tunes[req.query.track]:null;
  if(!notes)return res.status(404).end();
  const rate=12000,size=48*rate*2,bytes=Buffer.alloc(44+size);
  bytes.write('RIFF');bytes.writeUInt32LE(size+36,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(size,40);
  const hz=n=>440*2**((n-69)/12);
  for(let i=0;i<size/2;i++){const time=i/rate,beat=Math.floor(time*4),phase=time-beat/4;
    const env=Math.min(1,phase*130)*Math.exp(-phase*13);
    const lead=Math.sin(2*Math.PI*hz(notes[beat%8])*phase),bass=Math.sin(2*Math.PI*hz(notes[Math.floor(beat/8)%8]-24)*time);
    bytes.writeInt16LE(Math.round((lead*.25+bass*.15)*env*32767),44+i*2)}
  res.setHeader('Content-Type','audio/wav');res.setHeader('Cache-Control','public,max-age=86400,s-maxage=604800');
  res.end(bytes);
}
