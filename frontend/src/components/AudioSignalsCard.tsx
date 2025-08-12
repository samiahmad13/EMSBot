"use client";
import { useState } from "react";
import { useUploader } from "@/src/hooks/useUploader";
import { postForm } from "@/src/services/api";
import type { SignalResult, AudioResult } from "@/src/types/model";

export function AudioSignalsCard({ onECG, onLung, onHeart }:{ onECG:(r:SignalResult)=>void; onLung:(r:AudioResult)=>void; onHeart:(r:AudioResult)=>void;}){
  const ecgUp = useUploader<SignalResult>();
  const lungUp = useUploader<AudioResult>();
  const heartUp = useUploader<AudioResult>();
  const [ecg, setECG] = useState<File|null>(null);
  const [lung, setLung] = useState<File|null>(null);
  const [heart, setHeart] = useState<File|null>(null);

  const send = async (file: File, key: "ecg"|"lung"|"heart") => {
    const fd = new FormData();
    const field = key === "ecg" ? "file" : "audio";
    fd.append(field, file);
    if (key === "ecg") {
      await ecgUp.run(()=>postForm<SignalResult>("/api/signals/ecg-classify", fd));
      if (ecgUp.result) onECG(ecgUp.result);
    } else if (key === "lung") {
      await lungUp.run(()=>postForm<AudioResult>("/api/audio/lung-dx", fd));
      if (lungUp.result) onLung(lungUp.result);
    } else {
      await heartUp.run(()=>postForm<AudioResult>("/api/audio/heart-dx", fd));
      if (heartUp.result) onHeart(heartUp.result);
    }
  };

  const bar = (v:number)=> (<div className="h-1 bg-gray-200 rounded"><div className="h-1 bg-gray-500 rounded" style={{width:`${v}%`}}/></div>);

  return (
    <div className="p-4 border rounded-2xl space-y-4">
      <div className="text-sm font-semibold">Signals & Auscultation</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 p-3 border rounded-2xl">
          <div className="text-sm font-medium">ECG</div>
          <input type="file" accept=".csv,.wav,.mat" onChange={e=>setECG(e.target.files?.[0]||null)} />
          <button className="w-full px-3 py-2 rounded-xl border" onClick={()=>ecg && send(ecg, "ecg")}>Classify</button>
          {!!ecgUp.progress && bar(ecgUp.progress)}
          {ecgUp.error && <div className="text-red-500 text-sm">{ecgUp.error}</div>}
        </div>
        <div className="space-y-2 p-3 border rounded-2xl">
          <div className="text-sm font-medium">Lung</div>
          <input type="file" accept="audio/*" onChange={e=>setLung(e.target.files?.[0]||null)} />
          <button className="w-full px-3 py-2 rounded-xl border" onClick={()=>lung && send(lung, "lung")}>Analyze</button>
          {!!lungUp.progress && bar(lungUp.progress)}
          {lungUp.error && <div className="text-red-500 text-sm">{lungUp.error}</div>}
        </div>
        <div className="space-y-2 p-3 border rounded-2xl">
          <div className="text-sm font-medium">Heart</div>
          <input type="file" accept="audio/*" onChange={e=>setHeart(e.target.files?.[0]||null)} />
          <button className="w-full px-3 py-2 rounded-xl border" onClick={()=>heart && send(heart, "heart")}>Analyze</button>
          {!!heartUp.progress && bar(heartUp.progress)}
          {heartUp.error && <div className="text-red-500 text-sm">{heartUp.error}</div>}
        </div>
      </div>
    </div>
  );
}