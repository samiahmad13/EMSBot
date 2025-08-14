"use client";
import { useState } from "react";
import { Activity, HeartPulse, Hospital, Lock, ShieldCheck } from "lucide-react";
import { ImagingCard } from "@/src/components/ImagingCard";
import { AudioSignalsCard } from "@/src/components/AudioSignalsCard";
import { RiskPanel } from "@/src/components/RiskPanel";
import { ReportProcessor } from "@/src/components/ReportProcessor";
import { ResultsPane } from "@/src/components/ResultsPane";
import type { AnyResult } from "@/src/types/model";

export default function Page() {
  const [imagingRes, setImagingRes] = useState<AnyResult | null>(null);
  const [otherRes, setOtherRes] = useState<AnyResult | null>(null);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20">
            <Hospital size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">EMSBot</h1>
            <p className="kicker">ML assistant for Emergency medical care</p>
          </div>
        </div>
      </header>

      {/* Imaging*/}
      <section className="mx-auto w-full max-w-5xl">
        <div className="card p-4">
          <div className="section-title"><Activity size={16}/> Imaging</div>
          <p className="mt-1 text-xs text-slate-400">Chest X-Ray • Burn</p>
          <div className="mt-4">
            <ImagingCard onResult={(r)=>setImagingRes(r)} />
          </div>
        </div>
      </section>

      {/* Signals & Auscultation*/}
      <section className="mx-auto mt-6 w-full max-w-5xl">
        <div className="card p-4">
          <div className="section-title"><HeartPulse size={16}/> Signals & Auscultation</div>
          <p className="mt-1 text-xs text-slate-400">ECG • Lung • Heart</p>
          <div className="mt-4">
            <AudioSignalsCard
              onECG={(r)=>setOtherRes(r)}
              onLung={(r)=>setOtherRes(r)}
              onHeart={(r)=>setOtherRes(r)}
            />
          </div>
        </div>
      </section>

      {/* Clinical Documentation Analysis*/}
      <section className="mx-auto mt-6 w-full max-w-5xl">
        <div className="card p-4">
          <div className="section-title"><Lock size={16}/> Clinical Documentation Analysis</div>
          <p className="mt-1 text-xs text-slate-400">Diagnosis • Treatment</p>
          <div className="mt-4">
            <ReportProcessor onResult={(r)=>setOtherRes(r)} />
          </div>
        </div>
      </section>

      {/* Risk Scores (full row) */}
      <section className="mt-6">
        <div className="card p-4">
          <div className="section-title"><Lock size={16}/> Risk Scores</div>
          <p className="mt-1 text-xs text-slate-400">Heart Disease • Diabetes • Stroke</p>
          <div className="mt-4">
            <RiskPanel onResult={(r)=>setOtherRes(r)} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mt-6">
        <div className="card p-4">
          <ResultsPane imaging={imagingRes} others={otherRes} />
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} EMSBot
      </footer>
    </main>
  );
}
