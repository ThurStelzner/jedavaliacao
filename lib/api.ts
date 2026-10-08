export type ItemBase = { id: string };

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

export async function apiList<T>(collection: string): Promise<T[]> {
  const res = await fetch(`/api/${collection}`, { cache: "no-store" });
  return handle<T[]>(res);
}

export async function apiCreate<T>(collection: string, data: unknown): Promise<T> {
  const res = await fetch(`/api/${collection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<T>(res);
}

export async function apiUpdate<T>(
  collection: string,
  id: string,
  data: unknown,
): Promise<T> {
  const res = await fetch(`/api/${collection}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<T>(res);
}

export async function apiDelete(collection: string, id: string): Promise<void> {
  const res = await fetch(`/api/${collection}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
}
