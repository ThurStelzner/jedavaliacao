import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import type { DB, Descoberta, Entrevista, Lembrete, Prioridade, Tarefa } from "./types";

export const COLLECTIONS = [
  "entrevistas",
  "perguntas",
  "tarefas",
  "lembretes",
  "descobertas",
] as const;

export type Collection = (typeof COLLECTIONS)[number];

// Em produção (Netlify Functions) o filesystem é read-only/efêmero, então os
// dados ficam no Netlify Blobs. Em `next dev` local, mantém ./data/db.json.
const BLOB_STORE = "jedavaliacao";
const BLOB_KEY = "db.json";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function seedTarefas(): Tarefa[] {
  const itens: Array<{ titulo: string; responsavel: string; prioridade: Prioridade }> = [
    { titulo: "Mapear oficinas mecânicas por bairro em Joinville", responsavel: "Enzo", prioridade: "alta" },
    { titulo: "Conseguir contatos com donos e gerentes de oficina", responsavel: "Carlos", prioridade: "alta" },
    { titulo: "Agendar as primeiras entrevistas presenciais", responsavel: "Arthur", prioridade: "alta" },
    { titulo: "Gravar/anotar todas as entrevistas", responsavel: "Enzo", prioridade: "alta" },
    { titulo: "Registrar as respostas no site (Enzo, Carlos e Arthur)", responsavel: "Equipe", prioridade: "alta" },
    { titulo: "Pedir 2 indicações ao final de cada entrevista", responsavel: "Equipe", prioridade: "media" },
    { titulo: "Analisar os padrões das causas (espinha de peixe)", responsavel: "Carlos", prioridade: "media" },
    { titulo: "Verificar se o problema foi validado (meta: 5 entrevistas)", responsavel: "Enzo", prioridade: "alta" },
    { titulo: "Verificar se apareceu um problema mais relevante", responsavel: "Arthur", prioridade: "alta" },
    { titulo: "Fechar o fluxograma do problema para a apresentação", responsavel: "Equipe", prioridade: "media" },
    { titulo: "Montar a apresentação com os gráficos de validação", responsavel: "Enzo", prioridade: "media" },
    { titulo: "Definir proposta de solução e próximos passos", responsavel: "Equipe", prioridade: "media" },
  ];
  return itens.map((i) => ({
    id: uid(),
    titulo: i.titulo,
    responsavel: i.responsavel,
    prazo: "",
    prioridade: i.prioridade,
    status: "pendente" as const,
    createdAt: now(),
  }));
}

function seedLembretes(): Lembrete[] {
  const itens: Array<{ texto: string; tipo: "critico" | "atencao" }> = [
    { texto: "NÃO ESQUECER DE GRAVAR/ANOTAR TODAS AS ENTREVISTAS", tipo: "critico" },
    { texto: "As entrevistas devem ser presenciais, formais e seguir o roteiro de perguntas.", tipo: "atencao" },
    { texto: "A primeira pergunta deve ser aberta (deixar o dono da oficina falar).", tipo: "atencao" },
    { texto: "Perguntar sobre prazo/atraso usando os números reais da oficina (quantos casos).", tipo: "atencao" },
    { texto: "Pedir 2 indicações ao final de cada entrevista (outras oficinas ou contatos).", tipo: "atencao" },
    { texto: "Se não conseguir 2 indicações, conseguir pelo menos 1.", tipo: "atencao" },
    { texto: "Não assumir que o problema está validado antes de analisar as entrevistas.", tipo: "critico" },
    { texto: "Não pivotar antes de validar a ideia atual.", tipo: "critico" },
    { texto: "Separar as respostas pelo responsável (Enzo, Carlos e Arthur) para comparar.", tipo: "atencao" },
  ];
  return itens.map((i) => ({
    id: uid(),
    texto: i.texto,
    tipo: i.tipo,
    ativo: true,
    createdAt: now(),
  }));
}

function seedDescobertas(): Descoberta[] {
  return [];
}

function seedEntrevistas(): Entrevista[] {
  return [];
}

function seedDB(): DB {
  return {
    entrevistas: seedEntrevistas(),
    perguntas: [],
    tarefas: seedTarefas(),
    lembretes: seedLembretes(),
    descobertas: seedDescobertas(),
  };
}

function normalize(db: Partial<DB>): DB {
  return {
    entrevistas: db.entrevistas ?? [],
    perguntas: db.perguntas ?? [],
    tarefas: db.tarefas ?? [],
    lembretes: db.lembretes ?? [],
    descobertas: db.descobertas ?? [],
  };
}

// O runtime injeta NETLIFY_BLOBS_CONTEXT (base64 JSON) nas Functions. Usamos as
// credenciais dele para falar direto com a API REST do Netlify Blobs
// (api.netlify.com): a lib @netlify/blobs pendurava as Functions (edge URL).
// Sem contexto (ex.: `next dev` puro) caímos no arquivo JSON local.
const BLOBS_API = "https://api.netlify.com/api/v1/blobs";
const BLOBS_TIMEOUT_MS = 20000;

interface BlobsCreds {
  siteID: string;
  token: string;
}

function blobsCreds(): BlobsCreds | null {
  const encoded = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!encoded) return null;
  try {
    const ctx = JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as {
      siteID?: string;
      token?: string;
    };
    if (ctx.siteID && ctx.token) return { siteID: ctx.siteID, token: ctx.token };
  } catch (e) {
    console.error("[db] contexto blobs inválido:", e);
  }
  return null;
}

function blobsUrl(creds: BlobsCreds, key: string): string {
  return `${BLOBS_API}/${encodeURIComponent(creds.siteID)}/${BLOB_STORE}/${encodeURIComponent(key)}`;
}

async function blobsRead(key: string): Promise<DB | null> {
  const creds = blobsCreds();
  if (!creds) return null;
  const res = await fetch(`${blobsUrl(creds, key)}?consistency=strong`, {
    headers: { Authorization: `Bearer ${creds.token}` },
    signal: AbortSignal.timeout(BLOBS_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`blobs GET falhou: ${res.status}`);
  return normalize(JSON.parse(await res.text()) as Partial<DB>);
}

async function blobsWrite(key: string, db: DB): Promise<void> {
  const creds = blobsCreds();
  if (!creds) throw new Error("sem contexto do Netlify Blobs");
  const res = await fetch(blobsUrl(creds, key), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(db),
    signal: AbortSignal.timeout(BLOBS_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`blobs PUT falhou: ${res.status}`);
}

// Na Vercel o filesystem também é somente leitura. Com um Blob store conectado
// (BLOB_STORE_ID + OIDC automático), a base fica no Vercel Blob, privada.
const VERCEL_BLOB_KEY = "db.json";

function vercelBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

async function vercelBlobRead(): Promise<DB | null> {
  try {
    const result = await get(VERCEL_BLOB_KEY, {
      access: "private",
      useCache: false,
    });
    if (!result) return null;
    return normalize(
      JSON.parse(await new Response(result.stream).text()) as Partial<DB>,
    );
  } catch (e) {
    if (e instanceof Error && /not.?found/i.test(e.message)) return null;
    throw e;
  }
}

async function vercelBlobWrite(db: DB): Promise<void> {
  await put(VERCEL_BLOB_KEY, JSON.stringify(db), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readDB(): Promise<DB> {
  if (blobsCreds()) {
    const db = await blobsRead(BLOB_KEY);
    if (db) return db;
    const seeded = seedDB();
    await blobsWrite(BLOB_KEY, seeded);
    return seeded;
  }

  if (vercelBlobEnabled()) {
    const db = await vercelBlobRead();
    if (db) return db;
    const seeded = seedDB();
    await vercelBlobWrite(seeded);
    return seeded;
  }

  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return normalize(JSON.parse(raw) as Partial<DB>);
  } catch {
    const db = seedDB();
    await writeDB(db);
    return db;
  }
}

export async function writeDB(db: DB): Promise<void> {
  if (blobsCreds()) {
    await blobsWrite(BLOB_KEY, db);
    return;
  }
  if (vercelBlobEnabled()) {
    await vercelBlobWrite(db);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
