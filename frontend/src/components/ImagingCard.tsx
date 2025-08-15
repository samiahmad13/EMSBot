"use client";
import { useState } from "react";
import { useUploader } from "@/src/hooks/useUploader";
import { postForm } from "@/src/services/api";
import type { VisionResult } from "@/src/types/model";
import { FilePicker } from "@/src/components/FilePicker";

export function ImagingCard({
  onResult,
}: {
  onResult: (r: VisionResult) => void;
}) {
  const [cxr, setCXR] = useState<File | null>(null);
  const [burn, setBurn] = useState<File | null>(null);
  const [wound, setWound] = useState<File | null>(null);

  const cxrUp = useUploader<VisionResult>();
  const burnUp = useUploader<VisionResult>();
  const woundUp = useUploader<VisionResult>();

  const send = async (file: File, kind: "cxr" | "burn" | "wound") => {
    const fd = new FormData();
    fd.append("image", file);

    if (kind === "cxr") {
      const data = await cxrUp.run(() =>
        postForm<VisionResult>("/api/vision/cxr-classify", fd)
      );
      if (data) onResult(data);
    } else if (kind === "burn") {
      const data = await burnUp.run(() =>
        postForm<VisionResult>("/api/vision/burn-classify", fd)
      );
      if (data) onResult(data);
    } else {
      const data = await woundUp.run(() =>
        postForm<VisionResult>("/api/vision/wound-segment", fd)
      );
      if (data) onResult(data);
    }
  };

  const Box = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-medium">{title}</div>
      {children}
    </div>
  );

  const bar = (v: number) => (
    <div className="progress mt-2">
      <div style={{ width: `${v}%` }} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Chest X-Ray */}
      <Box title="Chest X-Ray">
        <FilePicker
          accept="image/*"
          file={cxr}
          onSelect={setCXR}
          buttonLabel="Choose image"
          compact
        />
        <button
          className="btn btn-ghost btn-block btn-wrap mt-2"
          onClick={() => cxr && send(cxr, "cxr")}
          disabled={cxrUp.loading}
        >
          {cxrUp.loading ? "Analyzing..." : "Analyze"}
        </button>
        {!!cxrUp.progress && bar(cxrUp.progress)}
        {cxrUp.error && (
          <div className="mt-1 text-rose-300 text-sm">{cxrUp.error}</div>
        )}
      </Box>

      {/* Burn Wound Image */}
      <Box title="Burn Wound">
        <FilePicker
          accept="image/*"
          file={burn}
          onSelect={setBurn}
          buttonLabel="Choose image"
          compact
        />
        <button
          className="btn btn-ghost btn-block btn-wrap mt-2"
          onClick={() => burn && send(burn, "burn")}
          disabled={burnUp.loading}
        >
          {burnUp.loading ? "Analyzing..." : "Analyze"}
        </button>
        {!!burnUp.progress && bar(burnUp.progress)}
        {burnUp.error && (
          <div className="mt-1 text-rose-300 text-sm">{burnUp.error}</div>
        )}
      </Box>

      {/* Wound Segmentation */}
      <Box title="Wound Segmentation">
        <FilePicker
          accept="image/*"
          file={wound}
          onSelect={setWound}
          buttonLabel="Choose image"
          compact
        />
        <button
          className="btn btn-ghost btn-block btn-wrap mt-2"
          onClick={() => wound && send(wound, "wound")}
          disabled={woundUp.loading}
        >
          {woundUp.loading ? "Analyzing..." : "Analyze"}
        </button>
        {!!woundUp.progress && bar(woundUp.progress)}
        {woundUp.error && (
          <div className="mt-1 text-rose-300 text-sm">{woundUp.error}</div>
        )}
      </Box>
    </div>
  );
}
