import { NextResponse } from "next/server";
import { COLLECTIONS, Collection, readDB, writeDB } from "@/lib/db";
import type { Oficina } from "@/lib/types";

function valida(collection: string): collection is Collection {
  return (COLLECTIONS as readonly string[]).includes(collection);
}

function erro(mensagem: string, status: number) {
  return NextResponse.json({ error: mensagem }, { status });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params;
  if (!valida(collection)) {
    return erro("Coleção inválida", 404);
  }
  const body = (await req.json()) as Record<string, unknown>;
  const db = await readDB();
  const lista = db[collection] as unknown as Array<Record<string, unknown>>;
  const idx = lista.findIndex((i) => i.id === id);
  if (idx === -1) {
    return erro("Não encontrado", 404);
  }

  if (collection === "oficinas") {
    const atual = lista[idx] as unknown as Oficina;
    const numero = String(body.numero ?? atual.numero).trim();
    const qrToken = String(body.qrToken ?? atual.qrToken).trim();

    if (!/^\d{1,6}$/.test(numero)) {
      return erro("O número da oficina deve ter de 1 a 6 dígitos.", 400);
    }
    if (lista.some((o, j) => j !== idx && String(o.numero) === numero)) {
      return erro(
        `O número ${numero} já está em uso por outra oficina. Escolha outro.`,
        409,
      );
    }
    if (
      lista.some((o, j) => j !== idx && String(o.qrToken) === qrToken)
    ) {
      return erro("Este QR code já está ligado a outra oficina.", 409);
    }

    body.numero = numero;
    body.qrToken = qrToken;
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
    return erro("Coleção inválida", 404);
  }
  const db = await readDB();
  const lista = db[collection] as unknown as Array<Record<string, unknown>>;
  const nova = lista.filter((i) => i.id !== id);
  if (nova.length === lista.length) {
    return erro("Não encontrado", 404);
  }
  (db as unknown as Record<string, unknown>)[collection] = nova;
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
