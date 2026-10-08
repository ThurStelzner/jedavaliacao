import { NextResponse } from "next/server";
import { COLLECTIONS, Collection, readDB, writeDB } from "@/lib/db";

function valida(collection: string): collection is Collection {
  return (COLLECTIONS as readonly string[]).includes(collection);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  if (!valida(collection)) {
    return NextResponse.json({ error: "Coleção inválida" }, { status: 404 });
  }
  const db = await readDB();
  return NextResponse.json(db[collection]);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  if (!valida(collection)) {
    return NextResponse.json({ error: "Coleção inválida" }, { status: 404 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  const db = await readDB();
  const item = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  (db[collection] as unknown[]).push(item);
  await writeDB(db);
  return NextResponse.json(item, { status: 201 });
}
