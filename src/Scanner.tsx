import React,{useEffect,useRef,useState} from 'react';
export default function Scanner({onCode,onClose}){
 const video=useRef(null),[error,setError]=useState('');
 useEffect(()=>{
   let active=true,controls;
   (async()=>{
     const {BrowserMultiFormatReader}=await import('@zxing/browser');
     if(!active)return;
     controls=await new BrowserMultiFormatReader().decodeFromConstraints({video:{facingMode:{ideal:'environment'}},audio:false},video.current,(result,_error,stream)=>{
       if(active && result){active=false;stream.stop();onCode(result.getText())}
     });
     if(!active)controls.stop();
   })().catch(()=>{if(active)setError('Camera unavailable. Allow camera access or enter the barcode below.')});
   return ()=>{active=false;controls?.stop()};
 },[]);
 return <div><video ref={video} muted playsInline className="w-full max-h-52"/><p role="status">{error||'Point your camera at the barcode.'}</p><button className="bevel-btn p-1" type="button" onClick={onClose}>Close camera</button></div>
}
