export interface Pergunta {
  id: string;
  ordem: number;
  texto: string;
  aberta?: boolean;
  ajuda?: string;
}

export const PERGUNTAS: Pergunta[] = [
  { id: "q1", ordem: 1, texto: "Como funciona o processo seletivo da empresa?", aberta: true, ajuda: "Pergunta aberta: não induza a resposta. Deixe o entrevistado falar." },
  { id: "q2", ordem: 2, texto: "Dentro desses processos, qual é o principal gargalo?" },
  { id: "q3", ordem: 3, texto: "Quanto tempo, em horas, é gasto em todo o processo seletivo? Quem é responsável por ele?" },
  { id: "q4", ordem: 4, texto: "Qual é o tempo médio de reposição de uma vaga?" },
  { id: "q5", ordem: 5, texto: "Quantos currículos são recebidos em uma abertura de vaga?" },
  { id: "q6", ordem: 6, texto: "Como vocês fazem para validar as competências técnicas e comportamentais dos funcionários?" },
  { id: "q7", ordem: 7, texto: "Qual o percentual de funcionários contratados que passam do período de experiência?" },
  { id: "q8", ordem: 8, texto: "Quais outros problemas sua empresa enfrenta?" },
];

export const PORTES = [
  "MEI",
  "Microempresa",
  "Pequena empresa",
  "Média empresa",
  "Grande empresa",
];

export const AREAS = [
  "RH",
  "Gestão de Pessoas",
  "Operações",
  "Comercial",
  "TI",
  "Administrativo",
  "Produção",
  "Outro",
];

export function perguntaTexto(id: string): string {
  return PERGUNTAS.find((p) => p.id === id)?.texto ?? id;
}
