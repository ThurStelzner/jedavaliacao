import type { Entrevista } from "./types";

export interface Stats {
  total: number;
  realizadas: number;
  agendadas: number;
  planejadas: number;
  empresasEntrevistadas: number;
  rhEntrevistados: number;
  identificaramProblema: number;
  percIdentificaram: number;
  outroProblema: number;
  percOutroProblema: number;
  indicacoes: number;
  porStatus: Array<{ status: string; total: number }>;
  porPorte: Array<{ porte: string; total: number }>;
}

export function calcStats(entrevistas: Entrevista[]): Stats {
  const realizadas = entrevistas.filter((e) => e.status === "realizada");
  const agendadas = entrevistas.filter((e) => e.status === "agendada");
  const planejadas = entrevistas.filter((e) => e.status === "planejada");

  const empresas = new Set(
    realizadas.map((e) => e.empresa.trim().toLowerCase()).filter(Boolean),
  );

  const rh = realizadas.filter((e) => {
    const t = `${e.area} ${e.cargo}`.toLowerCase();
    return t.includes("rh") || t.includes("gestão de pessoas") || t.includes("recursos humanos");
  });

  const identificaram = realizadas.filter((e) => e.identificouProblema);
  const comOutro = realizadas.filter((e) => e.outroProblema.trim().length > 0);

  const indicacoes = realizadas.reduce(
    (acc, e) => acc + e.indicacoes.filter((i) => i.trim()).length,
    0,
  );

  const statusCount = new Map<string, number>();
  for (const e of entrevistas) {
    statusCount.set(e.status, (statusCount.get(e.status) ?? 0) + 1);
  }

  const porteCount = new Map<string, number>();
  for (const e of entrevistas) {
    const p = e.porte || "Não informado";
    porteCount.set(p, (porteCount.get(p) ?? 0) + 1);
  }

  const totalRealizadas = realizadas.length || 1;

  return {
    total: entrevistas.length,
    realizadas: realizadas.length,
    agendadas: agendadas.length,
    planejadas: planejadas.length,
    empresasEntrevistadas: empresas.size,
    rhEntrevistados: rh.length,
    identificaramProblema: identificaram.length,
    percIdentificaram: realizadas.length ? Math.round((identificaram.length / totalRealizadas) * 100) : 0,
    outroProblema: comOutro.length,
    percOutroProblema: realizadas.length ? Math.round((comOutro.length / totalRealizadas) * 100) : 0,
    indicacoes,
    porStatus: ["planejada", "agendada", "realizada"].map((s) => ({
      status: s,
      total: statusCount.get(s) ?? 0,
    })),
    porPorte: Array.from(porteCount.entries()).map(([porte, total]) => ({ porte, total })),
  };
}

export function proximosPassos(s: Stats): string[] {
  const passos: string[] = [];
  if (s.total === 0) {
    passos.push("Cadastre as entrevistas planejadas e agendadas para começar.");
    passos.push("Comece entrevistando o Roger (mentor).");
    return passos;
  }
  if (s.realizadas < 5) {
    passos.push(`Realizar mais entrevistas (${s.realizadas} de pelo menos 5).`);
  }
  if (s.realizadas > 0) {
    passos.push("Registrar e revisar as respostas das entrevistas realizadas.");
    passos.push("Analisar resultados e identificar padrões nos gargalos.");
  }
  if (s.realizadas >= 3) {
    passos.push(
      `Verificar se o problema foi validado (${s.percIdentificaram}% identificaram o problema).`,
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
  if (s.realizadas >= 5) {
    passos.push("Confirmar ou alterar a definição do problema com base nas evidências.");
  }
  return passos;
}
