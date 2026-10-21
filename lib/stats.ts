import type { Entrevista } from "./types";

export const META_ENTREVISTAS = 20;

// Limiar de validação: maioria qualificada das oficinas que avaliaram confirmando
// o problema. Os percentuais de aprovação/negação consideram as entrevistas que
// responderam os campos de validação; as demais aparecem como "Não avaliaram".
// A dor central é a desorganização do check-in e do aviso ao cliente.
export const META_PERC_PROBLEMA = 60;

export interface Stats {
  total: number;
  realizadas: number;
  agendadas: number;
  planejadas: number;
  empresasEntrevistadas: number;
  recusas: number;
  avaliaramProblema: number;
  identificaramProblema: number;
  percIdentificaram: number;
  outroProblema: number;
  percOutroProblema: number;
  indicacoes: number;
  percMeta: number;
  validado: boolean;
  porStatus: Array<{ status: string; total: number }>;
  porPorte: Array<{ porte: string; total: number }>;
  porResponsavel: Array<{ responsavel: string; total: number }>;
  porClienteEntendePrazos: Array<{ faixa: string; total: number }>;
  porRecusa: Array<{ faixa: string; total: number }>;
}

function contar<T extends string>(
  valores: Array<T | undefined>,
  ordem: T[],
  rotulosPadrao = "Não informado",
): Array<{ faixa: string; total: number }> {
  const contagem = new Map<string, number>();
  for (const v of valores) {
    const chave = v && v.trim() ? v : rotulosPadrao;
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }
  const conhecidas = ordem.map((o) => ({ faixa: o, total: contagem.get(o) ?? 0 }));
  const outras = Array.from(contagem.entries())
    .filter(([k]) => !ordem.includes(k as T))
    .map(([faixa, total]) => ({ faixa, total }));
  return [...conhecidas, ...outras];
}

function avaliouProblema(e: Entrevista): boolean {
  return (
    e.identificouProblema ||
    Boolean(e.clienteEntendePrazos) ||
    Boolean(e.recusouServico)
  );
}

export function calcStats(entrevistas: Entrevista[]): Stats {
  // Entrevistas de demonstração (exemplo: true) não entram em nenhum número:
  // elas existem só para visualizar o layout em uma base vazia.
  const base = entrevistas.filter((e) => !e.exemplo);
  const realizadas = base.filter((e) => e.status === "realizada");
  const agendadas = base.filter((e) => e.status === "agendada");
  const planejadas = base.filter((e) => e.status === "planejada");

  const empresas = new Set(
    realizadas.map((e) => e.empresa.trim().toLowerCase()).filter(Boolean),
  );

  const identificaram = realizadas.filter((e) => e.identificouProblema);
  const comOutro = realizadas.filter((e) => e.outroProblema.trim().length > 0);
  const recusas = realizadas.filter((e) => e.recusouServico === "sim").length;

  // Entrevistas que responderam os campos de validação (base dos percentuais de
  // aprovação/negação). As demais ficam registradas e aparecem como "Não avaliaram".
  const avaliaram = realizadas.filter(avaliouProblema);

  const indicacoes = realizadas.reduce(
    (acc, e) => acc + e.indicacoes.filter((i) => i.trim()).length,
    0,
  );

  const statusCount = new Map<string, number>();
  for (const e of base) {
    statusCount.set(e.status, (statusCount.get(e.status) ?? 0) + 1);
  }

  const porteCount = new Map<string, number>();
  for (const e of base) {
    const p = e.porte || "Não informado";
    porteCount.set(p, (porteCount.get(p) ?? 0) + 1);
  }

  const responsavelCount = new Map<string, number>();
  for (const e of realizadas) {
    const r = (e.responsavel || "Não informado").trim() || "Não informado";
    responsavelCount.set(r, (responsavelCount.get(r) ?? 0) + 1);
  }

  // Percentuais de aprovação/negação: base = entrevistas que avaliaram o problema
  // ("Não avaliaram" aparece à parte nos gráficos).
  const totalAvaliaram = avaliaram.length || 1;
  const percIdentificaram = avaliaram.length
    ? Math.round((identificaram.length / totalAvaliaram) * 100)
    : 0;

  return {
    total: base.length,
    realizadas: realizadas.length,
    agendadas: agendadas.length,
    planejadas: planejadas.length,
    empresasEntrevistadas: empresas.size,
    recusas,
    avaliaramProblema: avaliaram.length,
    identificaramProblema: identificaram.length,
    percIdentificaram,
    outroProblema: comOutro.length,
    // "Outro problema" é uma observação da equipe registrada em toda entrevista
    // realizada, não uma resposta do critério de validação.
    percOutroProblema: realizadas.length
      ? Math.round((comOutro.length / realizadas.length) * 100)
      : 0,
    indicacoes,
    percMeta: Math.min(Math.round((realizadas.length / META_ENTREVISTAS) * 100), 100),
    validado:
      realizadas.length >= META_ENTREVISTAS && percIdentificaram >= META_PERC_PROBLEMA,
    porStatus: ["planejada", "agendada", "realizada"].map((s) => ({
      status: s,
      total: statusCount.get(s) ?? 0,
    })),
    porPorte: Array.from(porteCount.entries()).map(([porte, total]) => ({ porte, total })),
    porResponsavel: Array.from(responsavelCount.entries())
      .map(([responsavel, total]) => ({ responsavel, total }))
      .sort((a, b) => b.total - a.total),
    porClienteEntendePrazos: contar(
      realizadas.map((e) =>
        avaliouProblema(e) ? e.clienteEntendePrazos : "Não avaliaram o prazo",
      ),
      ["sim", "parcial", "nao"],
    ),
    porRecusa: contar(
      realizadas.map((e) =>
        avaliouProblema(e) ? e.recusouServico : "Não avaliaram o prazo",
      ),
      ["sim", "nao", "incerto"],
    ),
  };
}

export function proximosPassos(s: Stats): string[] {
  const passos: string[] = [];
  if (s.total === 0) {
    passos.push("Cadastre as oficinas que serão entrevistadas para começar.");
    passos.push("Revise o roteiro de perguntas antes da primeira entrevista.");
    return passos;
  }
  if (s.realizadas < META_ENTREVISTAS) {
    passos.push(`Realizar mais entrevistas (${s.realizadas} de ${META_ENTREVISTAS} da meta).`);
  }
  if (s.realizadas > 0) {
    passos.push("Registrar e revisar as respostas das entrevistas realizadas.");
    passos.push("Cruzar os relatos com a espinha de peixe (causas da desorganização).");
  }
  if (s.realizadas >= 3) {
    passos.push(
      `Verificar se o problema foi validado (${s.percIdentificaram}% identificaram o problema; meta ${META_PERC_PROBLEMA}%).`,
    );
  }
  if (s.recusas > 0) {
    passos.push(
      `Destacar as ${s.recusas} recusas de serviço por prazo ou falta de informação na apresentação (evidência forte).`,
    );
  }
  if (s.outroProblema > 0) {
    passos.push(
      `Analisar os ${s.outroProblema} relatos de outro problema mais relevante antes de pivotar.`,
    );
  }
  if (s.indicacoes < s.realizadas * 2 && s.realizadas > 0) {
    passos.push("Buscar mais indicações: meta de 2 por entrevista.");
  }
  if (s.realizadas >= META_ENTREVISTAS) {
    passos.push("Confirmar ou alterar a definição do problema com base nas evidências.");
  }
  return passos;
}
