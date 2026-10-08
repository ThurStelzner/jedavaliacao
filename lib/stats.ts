import type { Entrevista } from "./types";

export interface Gargalo {
  texto: string;
  quantidade: number;
}

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
  tempoMedioHoras: number | null;
  mediaCurriculos: number | null;
  percMediaExperiencia: number | null;
  gargalos: Gargalo[];
  porStatus: Array<{ status: string; total: number }>;
  porPorte: Array<{ porte: string; total: number }>;
}

function numeros(texto: string): number[] {
  if (!texto) return [];
  const matches = texto.replace(/\.(?=\d{3}\b)/g, "").match(/\d+(?:[.,]\d+)?/g);
  if (!matches) return [];
  return matches.map((m) => parseFloat(m.replace(",", "."))).filter((n) => !isNaN(n));
}

function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function arredonda(n: number | null, casas = 1): number | null {
  if (n === null) return null;
  const f = Math.pow(10, casas);
  return Math.round(n * f) / f;
}

function respostaDe(e: Entrevista, perguntaId: string): string {
  return e.respostas.find((r) => r.perguntaId === perguntaId)?.resposta ?? "";
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

  const tempo = realizadas.flatMap((e) => numeros(respostaDe(e, "q3")));
  const curriculos = realizadas.flatMap((e) => numeros(respostaDe(e, "q5")));
  const experiencia = realizadas
    .flatMap((e) => numeros(respostaDe(e, "q7")))
    .map((n) => (n <= 1 ? n * 100 : n));

  const contagemGargalos = new Map<string, number>();
  for (const e of realizadas) {
    const g = respostaDe(e, "q2").trim();
    if (!g) continue;
    const key = g.toLowerCase();
    contagemGargalos.set(key, (contagemGargalos.get(key) ?? 0) + 1);
  }
  const gargalos: Gargalo[] = Array.from(contagemGargalos.entries())
    .map(([texto, quantidade]) => ({ texto, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

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
    tempoMedioHoras: arredonda(media(tempo)),
    mediaCurriculos: arredonda(media(curriculos), 0),
    percMediaExperiencia: arredonda(media(experiencia), 0),
    gargalos,
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
