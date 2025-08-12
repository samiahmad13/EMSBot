export type Probs = Record<string, number>;

export interface VisionResult {
  prediction?: string;
  probs?: Probs;
  artifacts?: { mask_url?: string; gradcam_url?: string };
  meta?: Record<string, unknown>;
}

export interface RiskResult {
  risk: number;
  class: "low" | "moderate" | "high";
  features?: Record<string, number>;
}

export interface SignalResult {
  rhythm?: string; confidence?: number; notes?: string;
}

export interface AudioResult {
  finding?: string; severity?: string; confidence?: number;
}

export interface NLPResult {
  summary: string;
  icd10?: string[];
  meds?: string[];
  warnings?: string[];
  mode?: string;
}

export type AnyResult = VisionResult | RiskResult | SignalResult | AudioResult | NLPResult | Record<string, unknown>;

