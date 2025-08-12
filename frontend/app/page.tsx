"use client";
import { useState } from "react";
import { ImagingCard } from "@/src/components/ImagingCard";
import { RiskPanel } from "@/src/components/RiskPanel";
import { AudioSignalsCard } from "@/src/components/AudioSignalsCard";
import { ReportProcessor } from "@/src/components/ReportProcessor";
import { ResultsPane } from "@/src/components/ResultsPane";
import type { AnyResult } from "@/src/types/model";

export default function Page() {
  const [imagingRes, setImagingRes] = useState<AnyResult | null>(null);
  const [otherRes, setOtherRes] = useState<AnyResult | null>(null);

  return (
    <main className="p-4 md:p-8 grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">EMSBot</h1>
          <p className="text-sm text-gray-500">Unified clinical ML assistant • Imaging · Signals · Audio · NLP · Risk</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox"/> PHI-safe mode</label>
          <span className="px-2 py-1 rounded-full border">v0.1</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ImagingCard onResult={(r)=>setImagingRes(r)} />
          <AudioSignalsCard onECG={(r)=>setOtherRes(r)} onLung={(r)=>setOtherRes(r)} onHeart={(r)=>setOtherRes(r)} />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <RiskPanel onResult={(r)=>setOtherRes(r)} />
          <ReportProcessor onResult={(r)=>setOtherRes(r)} />
          <ResultsPane imaging={imagingRes} others={otherRes} />
        </div>
      </div>

      <footer className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} EMSBot • Ensure de-identification before uploads.</footer>
    </main>
  );
}