"use client";
import { useState } from "react";
import { postForm } from "@/src/services/api";
import { useUploader } from "@/src/hooks/useUploader";
import type { VisionResult } from "@/src/types/model";

export function ImagingCard({ onResult }: { onResult: (r: VisionResult) => void }) {
  const [tab, setTab] = useState<"cxr" | "burn" | "wound">("cxr");
  const [file, setFile] = useState<File | null>(null);
  const up = useUploader<VisionResult>();

  const endpoints = {
    cxr: "/api/vision/cxr-classify",
    burn: "/api/vision/burn-classify",
    wound: "/api/vision/wound-segment",
  } as const;

  const submit = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    await up.run(() => postForm<VisionResult>(endpoints[tab], fd));
    if (up.result) onResult(up.result);
  };

  return (
    <div className="p-4 border rounded-2xl space-y-3">
      <div className="text-sm font-semibold">Imaging</div>
      <div className="flex gap-2 text-sm">
        {(["cxr","burn","wound"] as const).map(k=> (
          <button key={k} onClick={()=>setTab(k)}
            className={`px-3 py-1 rounded-full border ${tab===k?"bg-gray-100 dark:bg-zinc-800":""}`}>{k.toUpperCase()}</button>
        ))}
      </div>
      <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <button onClick={submit} disabled={!file || up.loading} className="w-full px-3 py-2 rounded-xl border">
        {up.loading ? "Running..." : "Run"}
      </button>
      {!!up.progress && <div className="h-1 bg-gray-200 rounded"><div className="h-1 bg-gray-500 rounded" style={{width:`${up.progress}%`}}/></div>}
      {up.error && <div className="text-red-500 text-sm">{up.error}</div>}
    </div>
  );
}