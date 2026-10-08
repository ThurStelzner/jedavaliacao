export type StatusEntrevista = "planejada" | "agendada" | "realizada";
export type Prioridade = "baixa" | "media" | "alta";
export type StatusTarefa = "pendente" | "em_andamento" | "concluida";
export type TipoLembrete = "critico" | "atencao";
export type TipoDescoberta =
  | "novo_problema"
  | "problema_recorrente"
  | "sugestao"
  | "necessidade"
  | "oportunidade"
  | "ideia_solucao";

export interface Resposta {
  perguntaId: string;
  resposta: string;
}

export interface Pergunta {
  id: string;
  texto: string;
  createdAt: string;
}

export interface Entrevista {
  id: string;
  nomeEntrevistado: string;
  empresa: string;
  cargo: string;
  porte: string;
  area: string;
  data: string;
  responsavel: string;
  status: StatusEntrevista;
  gravacao: string;
  anotacoes: string;
  respostas: Resposta[];
  indicacoes: string[];
  identificouProblema: boolean;
  outroProblema: string;
  createdAt: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  responsavel: string;
  prazo: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  createdAt: string;
}

export interface Lembrete {
  id: string;
  texto: string;
  tipo: TipoLembrete;
  ativo: boolean;
  createdAt: string;
}

export interface Descoberta {
  id: string;
  tipo: TipoDescoberta;
  texto: string;
  empresa: string;
  entrevistaId: string;
  createdAt: string;
}

export interface DB {
  entrevistas: Entrevista[];
  perguntas: Pergunta[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  descobertas: Descoberta[];
}
