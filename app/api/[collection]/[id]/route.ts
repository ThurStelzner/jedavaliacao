import { NextResponse } from "next/server";
import { COLLECTIONS, Collection, readDB, writeDB } from "@/lib/db";

function valida(collection: string): collection is Collection {
  return (COLLECTIONS as readonly string[]).includes(collection);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  if (!valida(collection)) {
    return NextResponse.json({ error: "Coleção inválida" }, { status: 404 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  const db = await readDB();
  const lista = db[collection] as unknown as Array<Record<string, unknown>>;
  const idx = lista.findIndex((i) => i.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  lista[idx] = { ...lista[idx], ...body, id };
  await writeDB(db);
  return NextResponse.json(lista[idx]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  if (!valida(collection)) {
    return NextResponse.json({ error: "Coleção inválida" }, { status: 404 });
  }
  const db = await readDB();
  const lista = db[collection] as unknown as Array<Record<string, unknown>>;
  const nova = lista.filter((i) => i.id !== id);
  if (nova.length === lista.length) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  (db as unknown as Record<string, unknown>)[collection] = nova;
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
