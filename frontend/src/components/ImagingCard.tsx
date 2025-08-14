"use client";
import { useState } from "react";
import { postForm } from "@/src/services/api";
import { useUploader } from "@/src/hooks/useUploader";
import type { VisionResult } from "@/src/types/model";
import { Image as ImageIcon, Syringe, Loader2 } from "lucide-react";
import { FilePicker } from "@/src/components/FilePicker";

export function ImagingCard({ onResult }: { onResult: (r: VisionResult) => void }) {
  const [tab, setTab] = useState<"cxr" | "burn">("cxr");
  const [file, setFile] = useState<File | null>(null);
  const up = useUploader<VisionResult>();

  const endpoints = {
    cxr: "/api/vision/cxr-classify",
    burn: "/api/vision/burn-classify",
  } as const;

  const submit = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const data = await up.run(() => postForm<VisionResult>(endpoints[tab], fd));
    if (data) onResult(data);
  };

  const tabBtn = (k: "cxr" | "burn", label: string) => (
    <button
      key={k}
      onClick={() => setTab(k)}
      className={`btn btn-sm ${tab === k ? "btn-primary" : "btn-ghost"} btn-wrap flex items-center justify-center`}
      title={label}
    >
      <span className="btn-label leading-none">{label}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="pillbar no-scrollbar">
        {tabBtn("cxr", "Chest X-Ray")}
        {tabBtn("burn", "Burn Wound Image")}
      </div>

      <FilePicker
        accept="image/*"
        file={file}
        onSelect={setFile}
        buttonLabel="Choose image"
        compact
      />

      <button
        onClick={submit}
        disabled={!file || up.loading}
        className="btn btn-ghost btn-block btn-wrap mt-2"
      >
        <span className="btn-label">{up.loading ? "Running…" : "Analyze"}</span>
      </button>

      {!!up.progress && (
        <div className="progress">
          <div style={{ width: `${up.progress}%` }} />
        </div>
      )}
      {up.error && <div className="text-rose-300 text-sm">{up.error}</div>}

    </div>
  );
}
