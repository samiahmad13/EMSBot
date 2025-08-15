"use client";
import { useState } from "react";
import { useUploader } from "@/src/hooks/useUploader";
import { postForm } from "@/src/services/api";
import type { SignalResult, AudioResult } from "@/src/types/model";
import { FilePicker } from "@/src/components/FilePicker";

export function AudioSignalsCard({
  onECG, onLung, onHeart,
}:{
  onECG:(r:SignalResult)=>void;
  onLung:(r:AudioResult)=>void;
  onHeart:(r:AudioResult)=>void;
}) {
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
      const data = await ecgUp.run(()=>postForm<SignalResult>("/api/signals/ecg-classify", fd));
      if (data) onECG(data);
    } else if (key === "lung") {
      const data = await lungUp.run(()=>postForm<AudioResult>("/api/audio/lung-dx", fd));
      if (data) onLung(data);
    } else {
      const data = await heartUp.run(()=>postForm<AudioResult>("/api/audio/heart-dx", fd));
      if (data) onHeart(data);
    }
  };

  const Box = ({title, children}:{title:string; children:React.ReactNode}) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-medium">{title}</div>
      {children}
    </div>
  );

  const bar = (v:number)=> (
    <div className="progress mt-2">
      <div style={{width:`${v}%`}}/>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Box title="Electrocardiogram (ECG)">
        <FilePicker accept=".csv,.wav,.mat" file={ecg} onSelect={setECG} buttonLabel="Choose file" compact />
        <button className="btn btn-ghost btn-block btn-wrap mt-2" onClick={() => ecg && send(ecg, "ecg")}>
          {ecgUp.loading ? "Analyzing..." : "Analyze"}
        </button>
        {!!ecgUp.progress && bar(ecgUp.progress)}
        {ecgUp.error && <div className="mt-1 text-rose-300 text-sm">{ecgUp.error}</div>}
      </Box>

      <Box title="Lung Auscultation">
        <FilePicker accept="audio/*" file={lung} onSelect={setLung} buttonLabel="Choose audio" compact />
        <button className="btn btn-ghost btn-block btn-wrap mt-2" onClick={() => lung && send(lung, "lung")}>
          {lungUp.loading ? "Analyzing..." : "Analyze"}
        </button>
        {!!lungUp.progress && bar(lungUp.progress)}
        {lungUp.error && <div className="mt-1 text-rose-300 text-sm">{lungUp.error}</div>}
      </Box>

      <Box title="Heart Auscultation">
        <FilePicker accept="audio/*" file={heart} onSelect={setHeart} buttonLabel="Choose audio" compact />
        <button className="btn btn-ghost btn-block btn-wrap mt-2" onClick={() => heart && send(heart, "heart")}>
          {heartUp.loading ? "Analyzing..." : "Analyze"}
        </button>
        {!!heartUp.progress && bar(heartUp.progress)}
        {heartUp.error && <div className="mt-1 text-rose-300 text-sm">{heartUp.error}</div>}
      </Box>
    </div>
  );

}
