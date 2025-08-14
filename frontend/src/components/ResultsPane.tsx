"use client";
import { AnyResult } from "@/src/types/model";
import { useState, useMemo } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";

function ProbBar({ label, p, highlight=false }:{ label:string; p:number; highlight?:boolean }) {
  const pct = Math.round(p*100);
  return (
    <div className={`flex items-center gap-3 rounded-lg p-2 ${highlight ? "bg-white/10" : "bg-white/5"}`}>
      <div className="grow">
        <div className="flex justify-between text-xs text-slate-300">
          <span>{label}</span><span>{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-white/10">
          <div className={`h-1.5 ${highlight ? "bg-cyan-400" : "bg-cyan-700/70"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, onCopy, copied }:{ title:string; onCopy:()=>void; copied:boolean }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <button onClick={onCopy} className="btn btn-ghost h-8 px-2 text-xs">
        {copied ? <ClipboardCheck size={14}/> : <Clipboard size={14}/>} Copy JSON
      </button>
    </div>
  );
}

function ClassifierView({ data }:{ data: any }) {
  const pred = data?.prediction ?? "—";
  const conf = typeof data?.confidence_pct === "number" ? `${data.confidence_pct}%` : null;
  const probs: Record<string, number> = data?.probs || {};
  const sorted = useMemo(() =>
    Object.entries(probs).sort((a,b)=>b[1]-a[1]), [probs]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge">Prediction</span>
        <span className="rounded-lg bg-cyan-400/90 px-2 py-1 text-sm font-semibold text-slate-900">{pred}</span>
        {conf && <span className="badge">Confidence: {conf}</span>}
      </div>
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map(([lab, p]) => (
            <ProbBar key={lab} label={lab} p={p} highlight={lab===pred} />
          ))}
        </div>
      )}
      {data?.artifacts?.mask_url && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400">Artifact</div>
          <img src={data.artifacts.mask_url} alt="artifact" className="w-full rounded-xl border border-white/10" />
        </div>
      )}
    </div>
  );
}

function RiskView({ data }:{ data:any }) {
  const risk = typeof data?.risk === "number" ? data.risk : null;
  const cls  = data?.class ?? "—";
  const probs: Record<string, number> = data?.probs || {};
  const sorted = useMemo(() =>
    Object.entries(probs).sort((a,b)=>b[1]-a[1]), [probs]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge">Risk Class</span>
        <span className={`rounded-lg px-2 py-1 text-sm font-semibold ${cls==="high" ? "bg-rose-400/90 text-slate-900" : cls==="moderate" ? "bg-amber-300/90 text-slate-900" : "bg-emerald-300/90 text-slate-900"}`}>
          {cls}
        </span>
        {risk!==null && (
          <span className="badge">Positive-class probability: {Math.round(risk*100)}%</span>
        )}
      </div>
      {sorted.length>0 && (
        <div className="space-y-2">
          {sorted.map(([lab, p]) => (
            <ProbBar key={lab} label={lab} p={p} highlight={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function NLPDiagnosisView({ data }:{ data:any }) {
  return (
    <div className="space-y-2">
      {data?.summary && <div className="text-sm text-slate-200">{data.summary}</div>}
      {Array.isArray(data?.diagnoses) && data.diagnoses.length>0 && (
        <div>
          <div className="kicker mb-1">Diagnoses</div>
          <div className="flex flex-wrap gap-2">
            {data.diagnoses.map((d:string)=> <span key={d} className="badge">{d}</span>)}
          </div>
        </div>
      )}
      {Array.isArray(data?.icd10) && data.icd10.length>0 && (
        <div>
          <div className="kicker mb-1">ICD-10</div>
          <div className="flex flex-wrap gap-2">
            {data.icd10.map((c:string)=> <span key={c} className="badge">{c}</span>)}
          </div>
        </div>
      )}
      {Array.isArray(data?.warnings) && data.warnings.length>0 && (
        <div className="text-xs text-amber-300/90">{data.warnings.join(" • ")}</div>
      )}
    </div>
  );
}

function NLPTreatmentView({ data }:{ data:any }) {
  return (
    <div className="space-y-2">
      {data?.summary && <div className="text-sm text-slate-200">{data.summary}</div>}
      {Array.isArray(data?.medications) && data.medications.length>0 && (
        <div>
          <div className="kicker mb-1">Medications</div>
          <div className="flex flex-wrap gap-2">
            {data.medications.map((m:string)=> <span key={m} className="badge">{m}</span>)}
          </div>
        </div>
      )}
      {Array.isArray(data?.dosage_notes) && data.dosage_notes.length>0 && (
        <div className="text-xs text-slate-300 space-y-1">
          {data.dosage_notes.map((n:string, i:number)=> <div key={i}>• {n}</div>)}
        </div>
      )}
      {Array.isArray(data?.warnings) && data.warnings.length>0 && (
        <div className="text-xs text-amber-300/90">{data.warnings.join(" • ")}</div>
      )}
    </div>
  );
}

function SmartRenderer({ data }:{ data:any }) {
  if (!data || typeof data !== "object") return <div className="text-sm text-slate-400">No data yet.</div>;
  if ("task" in data && data.task === "diagnosis") return <NLPDiagnosisView data={data} />;
  if ("task" in data && data.task === "treatment") return <NLPTreatmentView data={data} />;
  const hasRisk = "risk" in data || "class" in data;
  const hasProbs = "probs" in data;
  const hasPred = "prediction" in data;
  if (hasRisk) return <RiskView data={data} />;
  if (hasPred || hasProbs) return <ClassifierView data={data} />;
  return (
    <div className="grid grid-cols-1 gap-2 text-sm">
      {Object.entries(data).map(([k,v])=>(
        <div key={k} className="flex gap-3 rounded-lg bg-white/5 p-2">
          <div className="w-32 shrink-0 text-slate-300">{k}</div>
          <div className="grow text-slate-100">{typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
        </div>
      ))}
    </div>
  );
}

export function ResultsPane({ imaging, others }:{ imaging?: AnyResult | null; others?: AnyResult | null }) {
  const [copied, setCopied] = useState<"imaging"|"others"|null>(null);
  const copy = async (id:"imaging"|"others", data:any) => {
    await navigator.clipboard.writeText(JSON.stringify(data ?? {}, null, 2));
    setCopied(id); setTimeout(()=>setCopied(null), 1200);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <SectionHeader title="Imaging Results" onCopy={()=>copy("imaging", imaging)} copied={copied==="imaging"} />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <SmartRenderer data={imaging} />
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">Show raw JSON</summary>
            <pre className="json mt-2">{JSON.stringify(imaging ?? {}, null, 2)}</pre>
          </details>
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader title="Disease Prediction / Signals / Audio / Text Processing Results" onCopy={()=>copy("others", others)} copied={copied==="others"} />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <SmartRenderer data={others} />
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">Show raw JSON</summary>
            <pre className="json mt-2">{JSON.stringify(others ?? {}, null, 2)}</pre>
          </details>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 text-xs text-slate-400">
        ⚠ For research & experimentation only. Not a substitute for clinical consultation.
      </div>
    </div>
  );
}
