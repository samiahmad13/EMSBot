"use client";
import { useId } from "react";

export function FilePicker({
  accept,
  file,
  onSelect,
  buttonLabel = "Choose file",
  compact = false,
}: {
  accept: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  buttonLabel?: string;
  compact?: boolean;
}) {
  const inputId = useId();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <label
        htmlFor={inputId}
        className={`btn btn-ghost ${compact ? "btn-sm" : ""} shrink-0`}
        title={file?.name || buttonLabel}
      >
        {buttonLabel}
      </label>
      <div
        className="min-w-0 flex-1 text-xs text-slate-300 micro-scroll no-scrollbar"
        title={file?.name}
        >
        {file?.name ?? "No file selected"}
        </div>
    </div>
  );
}
