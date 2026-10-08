import { promises as fs } from "fs";
import path from "path";
import type { Contato, DB, Descoberta, Entrevista, Lembrete, Tarefa } from "./types";

export const COLLECTIONS = [
  "entrevistas",
  "contatos",
  "tarefas",
  "lembretes",
  "descobertas",
] as const;

export type Collection = (typeof COLLECTIONS)[number];

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function contato(
  nome: string,
  cargo: string,
  quemIndicou: string,
  extra: Partial<Contato> = {},
): Contato {
  return {
    id: uid(),
    nome,
    empresa: "",
    cargo,
    porte: "",
    area: "",
    quemIndicou,
    contato: "",
    status: "novo",
    entrevistaRealizada: false,
    novasIndicacoes: "",
    createdAt: now(),
    ...extra,
  };
}

function seedContatos(): Contato[] {
  const list: Contato[] = [
    contato("Gerente de RH", "Gerente de RH", "Arthur"),
    contato("Professor(a) de Gestão de Pessoas", "Professor(a)", "Indicação"),
    contato("Profissional de RH 1", "RH", "SENAI", { empresa: "SENAI" }),
    contato("Profissional de RH 2", "RH", "SENAI", { empresa: "SENAI" }),
    contato("Roger", "Mentor", "Mentores"),
    contato("Professor(a) SENAI 1", "Professor(a)", "SENAI", { empresa: "SENAI" }),
    contato("Professor(a) SENAI 2", "Professor(a)", "SENAI", { empresa: "SENAI" }),
    contato("Professor(a) SENAI 3", "Professor(a)", "SENAI", { empresa: "SENAI" }),
    contato("Yago", "Oficina", "Equipe"),
    contato("Enzo", "Oficina", "Equipe"),
    contato("Oficina (contato 3)", "Oficina", "Equipe"),
    contato("Oficina (contato 4)", "Oficina", "Equipe"),
    contato("Anthony", "Empresário", "Anthony"),
    contato("Empresário (contato 2)", "Empresário", "Anthony"),
  ];
  for (let i = 1; i <= 5; i++) {
    list.push(contato(`Contato de mentor ${i}`, "Indicação de mentor", "Mentores"));
  }
  return list;
}

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
    contatos: seedContatos(),
    tarefas: seedTarefas(),
    lembretes: seedLembretes(),
    descobertas: seedDescobertas(),
  };
}

export async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as DB;
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
