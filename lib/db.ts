import { promises as fs } from "fs";
import path from "path";
import type { DB, Descoberta, Entrevista, Lembrete, Tarefa } from "./types";

export const COLLECTIONS = [
  "entrevistas",
  "perguntas",
  "tarefas",
  "lembretes",
  "descobertas",
] as const;

export type Collection = (typeof COLLECTIONS)[number];

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function seedTarefas(): Tarefa[] {
  const titulos = [
    "Entrevistar Roger",
    "Criar formulário",
    "Conseguir contatos com os mentores",
    "Falar com os profissionais de RH do SENAI",
    "Conversar com a professora de Gestão de Pessoas",
    "Definir primeiros entrevistados",
    "Realizar entrevistas",
    "Registrar respostas",
    "Analisar resultados",
    "Identificar padrões",
    "Verificar se o problema foi validado",
    "Verificar se apareceu um problema mais relevante",
    "Definir próximos passos",
  ];
  return titulos.map((titulo) => ({
    id: uid(),
    titulo,
    responsavel: "",
    prazo: "",
    prioridade: "media" as const,
    status: "pendente" as const,
    createdAt: now(),
  }));
}

function seedLembretes(): Lembrete[] {
  const itens: Array<{ texto: string; tipo: "critico" | "atencao" }> = [
    { texto: "NÃO ESQUECER DE GRAVAR/ANOTAR TODAS AS ENTREVISTAS", tipo: "critico" },
    { texto: "As entrevistas devem ser formais e seguir as perguntas.", tipo: "atencao" },
    { texto: "A primeira pergunta deve ser aberta.", tipo: "atencao" },
    { texto: "Pedir 2 indicações ao final de cada entrevista.", tipo: "atencao" },
    { texto: "Se não conseguir 2 indicações, conseguir pelo menos 1.", tipo: "atencao" },
    { texto: "Não assumir que o problema está validado antes de analisar as entrevistas.", tipo: "critico" },
    { texto: "Não pivotar antes de validar a ideia atual.", tipo: "critico" },
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

export async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const db = JSON.parse(raw) as Partial<DB>;
    return {
      entrevistas: db.entrevistas ?? [],
      perguntas: db.perguntas ?? [],
      tarefas: db.tarefas ?? [],
      lembretes: db.lembretes ?? [],
      descobertas: db.descobertas ?? [],
    };
  } catch {
    const db = seedDB();
    await writeDB(db);
    return db;
  }
}

export async function writeDB(db: DB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
