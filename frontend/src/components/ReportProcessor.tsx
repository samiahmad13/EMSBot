"use client";
import { useState } from "react";
import { useUploader } from "@/src/hooks/useUploader";
import { postForm } from "@/src/services/api";
import type { NLPResult } from "@/src/types/model";

export function ReportProcessor({ onResult }: { onResult: (r: NLPResult)=>void }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("balanced");
  const up = useUploader<NLPResult>();

  const submit = async () => {
    const fd = new FormData();
    fd.append("text", text);
    fd.append("mode", mode);
    await up.run(()=>postForm<NLPResult>("/api/nlp/report", fd));
    if (up.result) onResult(up.result);
  };

  return (
    <div className="p-4 border rounded-2xl space-y-3">
      <div className="text-sm font-semibold">Medical Report Processor</div>
      <textarea className="w-full h-28 px-3 py-2 rounded-xl border" placeholder="Paste a clinical note…" value={text} onChange={e=>setText(e.target.value)} />
      <div className="flex gap-2 items-center">
        <select className="px-3 py-2 rounded-xl border" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="balanced">Balanced</option>
          <option value="precise">Precise</option>
          <option value="creative">Creative</option>
        </select>
        <button onClick={submit} className="px-3 py-2 rounded-xl border">Process</button>
      </div>
    </div>
  );
}