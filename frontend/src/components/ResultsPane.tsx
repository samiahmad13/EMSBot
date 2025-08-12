"use client";
import { AnyResult } from "@/src/types/model";

export function ResultsPane({ imaging, others }:{ imaging?: AnyResult | null; others?: AnyResult | null }){
  const block = (title:string, data:any) => (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{title}</div>
      <pre className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-3 text-xs overflow-auto max-h-72">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
  return (
    <div className="p-4 border rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
      {block("Imaging", imaging)}
      {block("Risk / Signals / Audio / NLP", others)}
      <div className="col-span-1 md:col-span-2 text-xs text-gray-500">⚠ For research and education. Not a substitute for clinical judgement.</div>
    </div>
  );
}