import { NextResponse } from "next/server";
import { COLLECTIONS, Collection, readDB, writeDB } from "@/lib/db";

function valida(collection: string): collection is Collection {
  return (COLLECTIONS as readonly string[]).includes(collection);
}

function erro(mensagem: string, status: number) {
  return NextResponse.json({ error: mensagem }, { status });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  if (!valida(collection)) {
    return erro("Coleção inválida", 404);
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
    return erro("Coleção inválida", 404);
  }
  const body = (await req.json()) as Record<string, unknown>;
  const db = await readDB();

  // Oficinas: número e QR code são únicos. A regra vive aqui, no servidor,
  // para que nem a tela nem uma chamada direta à API consigam duplicar.
  if (collection === "oficinas") {
    const oficinas = db.oficinas;

    let numero = String(body.numero ?? "").trim();
    if (!numero) {
      const maior = oficinas.reduce(
        (m, o) => Math.max(m, Number(o.numero) || 0),
        1000,
      );
      numero = String(maior + 1);
    }
    if (!/^\d{1,6}$/.test(numero)) {
      return erro("O número da oficina deve ter de 1 a 6 dígitos.", 400);
    }
    if (oficinas.some((o) => o.numero === numero)) {
      return erro(
        `O número ${numero} já está em uso por outra oficina. Escolha outro.`,
        409,
      );
    }

    let qrToken = String(body.qrToken ?? "").trim();
    if (!qrToken) {
      qrToken = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    }
    if (!/^[a-zA-Z0-9]{6,32}$/.test(qrToken)) {
      return erro("O código do QR deve ter de 6 a 32 letras ou números.", 400);
    }
    if (oficinas.some((o) => o.qrToken === qrToken)) {
      return erro("Este QR code já está ligado a outra oficina.", 409);
    }

    const nome = String(body.nome ?? "").trim();
    if (!nome) {
      return erro("Informe o nome da oficina.", 400);
    }

    body.numero = numero;
    body.qrToken = qrToken;
    body.nome = nome;
    body.ativo = body.ativo !== false;
  }

  const item = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  (db[collection] as unknown[]).push(item);
  await writeDB(db);
  return NextResponse.json(item, { status: 201 });
}
