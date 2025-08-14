"use client";
import { useState } from "react";
import { useUploader } from "@/src/hooks/useUploader";
import { postForm } from "@/src/services/api";
import type { NLPResult } from "@/src/types/model";

export function ReportProcessor({ onResult }: { onResult: (r: NLPResult)=>void }) {
  const [text, setText] = useState("");
  const dxUp = useUploader<NLPResult>();
  const txUp = useUploader<NLPResult>();

  const runDx = async () => {
    const fd = new FormData();
    fd.append("text", text);
    const data = await dxUp.run(() => postForm<NLPResult>("/api/nlp/diagnosis", fd));
    if (data) onResult(data);
  };

  const runTx = async () => {
    const fd = new FormData();
    fd.append("text", text);
    const data = await txUp.run(() => postForm<NLPResult>("/api/nlp/treatment", fd));
    if (data) onResult(data);
  };

  return (
    <div className="space-y-3">
      <textarea
        className="textarea h-28"
        placeholder="Paste a clinical note…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={runDx} className="btn btn-ghost sm:w-auto w-full btn-wrap">
          <span className="btn-label">Run Diagnosis</span>
        </button>
        <button onClick={runTx} className="btn btn-ghost sm:w-auto w-full btn-wrap">
          <span className="btn-label">Run Treatment</span>
        </button>
      </div>

      {(dxUp.progress || txUp.progress) ? (
        <div className="progress"><div style={{ width: `${dxUp.progress || txUp.progress}%` }} /></div>
      ) : null}

      {(dxUp.error || txUp.error) && (
        <div className="text-rose-300 text-sm">{dxUp.error || txUp.error}</div>
      )}
    </div>
  );
}
