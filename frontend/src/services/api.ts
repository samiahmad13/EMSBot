const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function postForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}