export type StatusEntrevista = "planejada" | "agendada" | "realizada";
export type Publico = "oficina" | "cliente";
export type Rodada = "problema" | "solucao";
export type Prioridade = "baixa" | "media" | "alta";
export type StatusTarefa = "pendente" | "em_andamento" | "concluida";
export type TipoLembrete = "critico" | "atencao";
export type ClienteEntendePrazos = "sim" | "parcial" | "nao" | "";
export type RecusouServico = "sim" | "nao" | "incerto" | "";
export type CheckinAtual = "papel" | "verbal" | "sistema" | "";
export type AvisoAtual =
  | "whatsapp"
  | "telefone"
  | "presencial"
  | "nao_avisa"
  | "";
export type AtrasoAtual = "sim" | "as_vezes" | "nao" | "";
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
  publico?: Publico;
  rodada?: Rodada;
  ordem?: number;
  createdAt: string;
}

export interface Entrevista {
  id: string;
  nomeEntrevistado: string;
  empresa: string;
  cargo: string;
  publico?: Publico;
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
  clienteEntendePrazos?: ClienteEntendePrazos;
  recusouServico?: RecusouServico;
  // Classificação das respostas abertas (análise temática da equipe).
  checkin?: CheckinAtual;
  aviso?: AvisoAtual;
  atraso?: AtrasoAtual;
  software?: "sim" | "nao" | "";
  cobrouNoticia?: "sim" | "nao" | "";
  usariaQr?: "sim" | "nao" | "talvez" | "";
  exemplo?: boolean;
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

export interface Oficina {
  id: string;
  /** Número público da oficina. Único no sistema. */
  numero: string;
  nome: string;
  /** Token do QR code. Único no sistema. */
  qrToken: string;
  ativo: boolean;
  createdAt: string;
}

export interface DB {
  entrevistas: Entrevista[];
  perguntas: Pergunta[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  descobertas: Descoberta[];
  oficinas: Oficina[];
}
