"use client";
import { useState } from "react";
import { postJSON } from "@/src/services/api";
import { useUploader } from "@/src/hooks/useUploader";
import type { RiskResult } from "@/src/types/model";

export function RiskPanel({ onResult }: { onResult: (r: RiskResult) => void }) {
  const hf = useUploader<RiskResult>();
  const dm = useUploader<RiskResult>();
  const st = useUploader<RiskResult>();

  const [hfForm, setHF] = useState({ age:"", sex:"M", sbp:"", hr:"", bmi:"" });
  const [dmForm, setDM] = useState({ age:"", bmi:"", glu:"", sbp:"" });
  const [stForm, setST] = useState({ age:"", sex:"M", sbp:"", smoker:false, afib:false });

  const submitHF = async () => {
    await hf.run(()=>postJSON<RiskResult>("/api/risk/heart-failure", {
      age:+hfForm.age, sex:hfForm.sex, systolic_bp:+hfForm.sbp, heart_rate:+hfForm.hr, bmi:+hfForm.bmi
    }));
    if (hf.result) onResult(hf.result);
  };
  const submitDM = async () => {
    await dm.run(()=>postJSON<RiskResult>("/api/risk/diabetes", {
      age:+dmForm.age, bmi:+dmForm.bmi, fasting_glucose:+dmForm.glu, systolic_bp:+dmForm.sbp
    }));
    if (dm.result) onResult(dm.result);
  };
  const submitST = async () => {
    await st.run(()=>postJSON<RiskResult>("/api/risk/stroke", {
      age:+stForm.age, sex:stForm.sex, systolic_bp:+stForm.sbp, smoker:!!stForm.smoker, afib:!!stForm.afib
    }));
    if (st.result) onResult(st.result);
  };

  const box = "space-y-2 p-3 border rounded-2xl";
  const input = "px-3 py-2 rounded-xl border w-full";

  return (
    <div className="p-4 border rounded-2xl space-y-4">
      <div className="text-sm font-semibold">Risk Scores</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={box}>
          <div className="text-sm font-medium">Heart Failure</div>
          <div className="grid grid-cols-2 gap-2">
            <input className={input} placeholder="Age" value={hfForm.age} onChange={e=>setHF({...hfForm, age:e.target.value})}/>
            <select className={input} value={hfForm.sex} onChange={e=>setHF({...hfForm, sex:e.target.value})}><option>M</option><option>F</option></select>
            <input className={input} placeholder="SBP" value={hfForm.sbp} onChange={e=>setHF({...hfForm, sbp:e.target.value})}/>
            <input className={input} placeholder="HR" value={hfForm.hr} onChange={e=>setHF({...hfForm, hr:e.target.value})}/>
            <input className={input} placeholder="BMI" value={hfForm.bmi} onChange={e=>setHF({...hfForm, bmi:e.target.value})}/>
          </div>
          <button className="w-full px-3 py-2 rounded-xl border" onClick={submitHF}>Predict</button>
        </div>
        <div className={box}>
          <div className="text-sm font-medium">Diabetes</div>
          <div className="grid grid-cols-2 gap-2">
            <input className={input} placeholder="Age" value={dmForm.age} onChange={e=>setDM({...dmForm, age:e.target.value})}/>
            <input className={input} placeholder="BMI" value={dmForm.bmi} onChange={e=>setDM({...dmForm, bmi:e.target.value})}/>
            <input className={input} placeholder="Glucose" value={dmForm.glu} onChange={e=>setDM({...dmForm, glu:e.target.value})}/>
            <input className={input} placeholder="SBP" value={dmForm.sbp} onChange={e=>setDM({...dmForm, sbp:e.target.value})}/>
          </div>
          <button className="w-full px-3 py-2 rounded-xl border" onClick={submitDM}>Predict</button>
        </div>
        <div className={box}>
          <div className="text-sm font-medium">Stroke</div>
          <div className="grid grid-cols-2 gap-2">
            <input className={input} placeholder="Age" value={stForm.age} onChange={e=>setST({...stForm, age:e.target.value})}/>
            <select className={input} value={stForm.sex} onChange={e=>setST({...stForm, sex:e.target.value})}><option>M</option><option>F</option></select>
            <input className={input} placeholder="SBP" value={stForm.sbp} onChange={e=>setST({...stForm, sbp:e.target.value})}/>
            <label className="flex items-center gap-2 col-span-2 text-sm"><input type="checkbox" checked={stForm.smoker} onChange={e=>setST({...stForm, smoker:e.target.checked})}/> Smoker</label>
            <label className="flex items-center gap-2 col-span-2 text-sm"><input type="checkbox" checked={stForm.afib} onChange={e=>setST({...stForm, afib:e.target.checked})}/> AFib</label>
          </div>
          <button className="w-full px-3 py-2 rounded-xl border" onClick={submitST}>Predict</button>
        </div>
      </div>
    </div>
  );
}