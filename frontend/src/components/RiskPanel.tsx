"use client";
import { useMemo, useState } from "react";
import { postJSON } from "@/src/services/api";
import { useUploader } from "@/src/hooks/useUploader";
import type { RiskResult } from "@/src/types/model";
import type { RiskSchema, Field, SelectOption } from "@/src/config/riskSchemas";
import {
  HEART_FAILURE_SCHEMA,
  DIABETES_SCHEMA,
  STROKE_SCHEMA,
} from "@/src/config/riskSchemas";

type Payload = Record<string, any>;

function optValue(opt: SelectOption): string {
  return typeof opt === "string" ? opt : opt.value;
}
function optLabel(opt: SelectOption): string {
  return typeof opt === "string" ? opt : opt.label;
}
function labelForValue(options: SelectOption[], value: string | undefined) {
  if (!options?.length) return "";
  const hit = options.find((o) => optValue(o) === value);
  return hit ? optLabel(hit) : optLabel(options[0]);
}

function ScrollHint({ text }: { text: string }) {
  return (
    <div className="micro-scroll field-hint" title={text}>
      <span className="scrollpad">{text}</span>
    </div>
  );
}

function FieldInput({
  f,
  value,
  onChange,
}: {
  f: Field;
  value: any;
  onChange: (v: any) => void;
}) {
  const base = "w-full min-w-0 input py-2 text-sm";

  if (f.type === "number") {
    return (
      <div className="min-w-0">
        <input
          className={base}
          inputMode="decimal"
          placeholder=""
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          title={f.label}
        />
        <ScrollHint text={f.label} />
      </div>
    );
  }

  if (f.type === "select") {
    const shown = labelForValue(f.options, value);
    return (
      <div className="min-w-0">
        <select
          className={base}
          value={value ?? (f.options.length ? optValue(f.options[0]) : "")}
          onChange={(e) => onChange(e.target.value)}
          title={shown}
        >
          {f.options.map((o) => {
            const v = optValue(o);
            const l = optLabel(o);
            return (
              <option key={v} value={v}>
                {l}
              </option>
            );
          })}
        </select>
        <ScrollHint text={f.label} />
      </div>
    );
  }

  return (
    <label className="col-span-1 sm:col-span-2 flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span>{f.label}</span>
    </label>
  );
}

function RiskBox({
  schema,
  onResult,
}: {
  schema: RiskSchema;
  onResult: (r: RiskResult) => void;
}) {
  const up = useUploader<RiskResult>();

  const initial: Payload = useMemo(() => {
    return Object.fromEntries(
      schema.fields.map((f) => {
        if (f.type === "select") {
          const first = (f.options as SelectOption[])[0];
          return [f.key, first ? optValue(first) : ""];
        }
        if (f.type === "checkbox") return [f.key, false];
        return [f.key, ""];
      })
    );
  }, [schema]);

  const [form, setForm] = useState<Payload>(initial);
  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    const payload: Payload = {};
    for (const f of schema.fields) {
      const v = form[f.key];
      payload[f.key] = f.type === "number" ? (v === "" ? null : +v) : v;
    }
    const data = await up.run(() => postJSON<RiskResult>(schema.endpoint, payload));
    if (data) onResult(data);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-sm font-medium">{schema.title}</div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {schema.fields.map((f) => (
          <FieldInput key={f.key} f={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
        ))}

        <button
          className="btn btn-ghost btn-block btn-wrap sm:col-span-2"
          onClick={submit}
          disabled={up.loading}
        >
          <span className="btn-label">{up.loading ? "Predicting…" : "Predict"}</span>
        </button>
      </div>

      {!!up.progress && (
        <div className="progress mt-2">
          <div style={{ width: `${up.progress}%` }} />
        </div>
      )}
      {up.error && <div className="mt-1 text-sm text-rose-300">{up.error}</div>}
    </div>
  );
}

export function RiskPanel({ onResult }: { onResult: (r: RiskResult) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <RiskBox schema={HEART_FAILURE_SCHEMA} onResult={onResult} />
      <RiskBox schema={DIABETES_SCHEMA} onResult={onResult} />
      <RiskBox schema={STROKE_SCHEMA} onResult={onResult} />
    </div>
  );
}
