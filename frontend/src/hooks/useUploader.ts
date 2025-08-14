import { useState } from "react";

export function useUploader<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const run = async (fn: () => Promise<T>): Promise<T | null> => {
    setError(null); setResult(null); setLoading(true); setProgress(10);
    try {
      const data = await fn();
      setProgress(100);
      setResult(data);
      return data;
    } catch (e: any) {
      setError(e?.message || "Request failed");
      return null;
    } finally {
      setLoading(false);
      setTimeout(()=>setProgress(0), 600);
    }
  };

  return { loading, progress, error, result, setResult, run };
}