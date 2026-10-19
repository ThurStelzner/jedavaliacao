"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiList } from "@/lib/api";
import { calcStats, META_ENTREVISTAS, META_PERC_PROBLEMA } from "@/lib/stats";
import type { Entrevista, Pergunta } from "@/lib/types";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

const tickStyle = { fill: "#737373", fontSize: 12 };
const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  boxShadow:
    "0 0 0 1px rgba(23,23,23,0.05), 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
  fontSize: 12,
  color: "#0a0a0a",
};

type RotuloProps = {
  percent?: number;
  value?: number;
  x?: number;
  y?: number;
  textAnchor?: string;
};

const rotuloPercentual = (p: RotuloProps) => (
  <text
    x={p.x}
    y={p.y}
    fill="#737373"
    fontSize={12}
    dominantBaseline="central"
    textAnchor={(p.textAnchor ?? "middle") as "start" | "middle" | "end"}
  >
    {`${Math.round((p.percent ?? 0) * 100)}% (${p.value ?? 0})`}
  </text>
);

const MERCADO = [
  {
    dado: "12%",
    texto: "dos reparos não são concluídos corretamente na 1ª visita",
    fonte: "J.D. Power CSI 2025 · EUA",
  },
  {
    dado: "28%",
    texto: "dos reparos com falha envolvem peça indisponível",
    fonte: "J.D. Power CSI 2025 · EUA",
  },
  {
    dado: "4 em 10",
    texto: "indicadores mais importantes da satisfação são de comunicação",
    fonte: "J.D. Power CSI 2025 · EUA",
  },
  {
    dado: "62%",
    texto: "das visitas em oficinas independentes duram menos de 1 hora",
    fonte: "J.D. Power CSI 2026 · EUA",
  },
  {
    dado: "53%",
    texto: "da manutenção no Brasil já é feita em oficinas independentes",
    fonte: "IQA/Ipsos · out/2026",
  },
  {
    dado: "33% × 8%",
    texto: "escolhem a oficina pela confiança no profissional, não pelo preço",
    fonte: "IQA/Ipsos · out/2026",
  },
  {
    dado: "56%",
    texto: "dos clientes preferem ser avisados por mensagem, não por ligação",
    fonte: "J.D. Power ASI · abr/2025 · EUA",
  },
  {
    dado: "2×",
    texto: "foto/vídeo do serviço mais que dobram a aprovação do trabalho recomendado",
    fonte: "J.D. Power ASI · abr/2026 · EUA",
  },
  {
    dado: "43%",
    texto: "das oficinas independentes já usam inspeção digital (47% têm agendamento online)",
    fonte: "Endeavor/AutoZone · dez/2025 · EUA",
  },
  {
    dado: "64% × 26%",
    texto: "dos clientes querem foto/vídeo da inspeção — só 26% dos populares recebem",
    fonte: "J.D. Power CSI · mar/2026 · EUA",
  },
];

function avaliouProblema(e: Entrevista): boolean {
  return (
    e.identificouProblema ||
    Boolean(e.clienteEntendePrazos) ||
    Boolean(e.recusouServico)
  );
}

// ===== Leitura das respostas livres (além da validação do problema) =====
// Regras de classificação calibradas com as 26 entrevistas registradas.
// Bases honestas: cada gráfico informa de quantas entrevistas os percentuais saem.

type CanalAviso = "whatsapp" | "telefone" | "presencial" | "ninguem";
type PadraoAviso = "semPadrao" | "fotoVideo" | "manual" | "presencial" | "naoAvisa";

const PADRAO_SEM_REGRA = [
  "quando lembra",
  "sem padrão",
  "quando dá",
  "sem rotina",
  "sem alarme",
  "esquece",
  "correria",
  "entre um serviço",
  "entre um carro",
  "morre entre",
  "depende de alguém",
  "ninguém é avisado",
  "não consegue atualizar",
  "sem notícia",
  "no telefone e na graxa",
  "tudo manual",
  "quando esquecem",
];

const QUER_ADOTAR = [
  "queria um sistema",
  "pretende adotar",
  "ferramenta acessível",
  "sistema de check-in fácil",
  "simples e fácil de adotar",
  "solução acessível",
];

const BARREIRA_ADOCAO = [
  "caros ou complicados",
  "considerados caros",
  "caras e incompletas",
  "custo",
  "pagar por mais de um",
];

function textoResposta(e: Entrevista, perguntaId?: string): string {
  if (!perguntaId) return "";
  return (e.respostas.find((r) => r.perguntaId === perguntaId)?.resposta ?? "").trim();
}

function textoEntrevista(e: Entrevista): string {
  return `${e.anotacoes ?? ""} ${(e.respostas ?? [])
    .map((r) => r.resposta)
    .join(" ")}`.toLowerCase();
}

function classificarCanal(t: string): CanalAviso | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado")) return null;
  if (s.includes("whatsapp")) return "whatsapp";
  if (s.includes("liga") || s.includes("telefone") || s.includes("celular"))
    return "telefone";
  if (s.includes("presencial")) return "presencial";
  if (s.includes("não avisa") || s.includes("morre entre")) return "ninguem";
  return null;
}

function classificarPadrao(t: string): PadraoAviso | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado")) return null;
  if (s.startsWith("não avisa")) return "naoAvisa";
  if (s.includes("presencial")) return "presencial";
  if (PADRAO_SEM_REGRA.some((k) => s.includes(k))) return "semPadrao";
  if (s.includes("foto") || s.includes("vídeo")) return "fotoVideo";
  if (s.includes("não apoiam") || s.includes("benefício esperado")) return null;
  return "manual";
}

function classificarPrazoEscrito(t: string): "escrito" | "falado" | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado") || s.startsWith("não detalhado"))
    return null;
  if (s.includes("ordem de serviço") || s.includes("no orçamento"))
    return "escrito";
  return "falado";
}

function classificarCheckin(e: Entrevista): "papel" | "naoFaz" | "digital" | null {
  const t = textoEntrevista(e);
  if (!t.includes("check-in") && !t.includes("checkin")) return null;
  if (t.includes("não faz check-in") || t.includes("não aderiu")) return "naoFaz";
  if (t.includes("papel")) return "papel";
  if (t.includes("tablet") || t.includes("automatizado")) return "digital";
  return null;
}

function usaSistema(e: Entrevista): boolean {
  const t = textoEntrevista(e);
  return (
    t.includes("utiliza vários sistemas") ||
    t.includes("plataformas pagas") ||
    t.includes("painel da loja")
  );
}

function querAdotar(e: Entrevista): boolean {
  const t = textoEntrevista(e);
  return QUER_ADOTAR.some((k) => t.includes(k));
}

function citaBarreiraAdocao(e: Entrevista): boolean {
  const t = textoEntrevista(e);
  return BARREIRA_ADOCAO.some((k) => t.includes(k));
}

export default function GraficosPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const [e, p] = await Promise.all([
        apiList<Entrevista>("entrevistas"),
        apiList<Pergunta>("perguntas"),
      ]);
      if (!ativo) return;
      setEntrevistas(e);
      setPerguntas(p);
      setCarregando(false);
      setAtualizadoEm(new Date().toLocaleTimeString("pt-BR"));
    }
    carregar();
    const id = setInterval(carregar, 15000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  const stats = useMemo(() => calcStats(entrevistas), [entrevistas]);

  // 1) Aprovação × negação do problema (base: quem avaliou o problema)
  const dadosProblema = useMemo(
    () => [
      {
        nome: "Confirmam o problema",
        valor: stats.identificaramProblema,
        cor: "#15803d",
      },
      {
        nome: "Não confirmam",
        valor: Math.max(stats.avaliaramProblema - stats.identificaramProblema, 0),
        cor: "#0a0a0a",
      },
    ],
    [stats],
  );

  // 2) Recusa de serviço por prazo (base: quem avaliou o problema)
  const dadosRecusaGeral = useMemo(
    () =>
      [
        { faixa: "sim", nome: "Já recusou", cor: "#dc2626" },
        { faixa: "nao", nome: "Não recusou", cor: "#0a0a0a" },
        { faixa: "incerto", nome: "Incerto", cor: "#a3a3a3" },
      ]
        .map((m) => ({
          nome: m.nome,
          cor: m.cor,
          valor: stats.porRecusa.find((f) => f.faixa === m.faixa)?.total ?? 0,
        }))
        .filter((d) => d.valor > 0),
    [stats],
  );

  // 4) Respostas por pergunta (respondidas × não abordadas × sem resposta)
  const respostaPorPergunta = useMemo(
    () =>
      perguntas.map((p, i) => {
        let respondidas = 0;
        let naoAbordadas = 0;
        let semResposta = 0;
        for (const e of entrevistas) {
          const r = e.respostas.find((x) => x.perguntaId === p.id)?.resposta ?? "";
          const t = r.trim();
          if (!t) semResposta += 1;
          else if (t.startsWith("Não abordado")) naoAbordadas += 1;
          else respondidas += 1;
        }
        return {
          nome: `P${i + 1}`,
          respondidas,
          naoAbordadas,
          semResposta,
          texto: p.texto,
        };
      }),
    [perguntas, entrevistas],
  );

  // 5) Confirmam por porte (empilhado)
  const problemaPorPorte = useMemo(() => {
    const map = new Map<
      string,
      { sim: number; nao: number; naoAvaliaram: number }
    >();
    for (const e of entrevistas) {
      const p = e.porte || "Não informado";
      const atual = map.get(p) ?? { sim: 0, nao: 0, naoAvaliaram: 0 };
      if (!avaliouProblema(e)) atual.naoAvaliaram += 1;
      else if (e.identificouProblema) atual.sim += 1;
      else atual.nao += 1;
      map.set(p, atual);
    }
    return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [entrevistas]);

  // 6) Funil de validação (confirmação e recusa: % sobre quem avaliou o problema)
  const funil = useMemo(() => {
    const base = stats.realizadas || 1;
    const baseAval = stats.avaliaramProblema || 1;
    return [
      {
        rotulo: "Entrevistas realizadas",
        valor: stats.realizadas,
        cor: "#0a0a0a",
        perc: 100,
      },
      {
        rotulo: "Avaliaram o problema de prazo",
        valor: stats.avaliaramProblema,
        cor: "#7C5AC8",
        perc: Math.round((stats.avaliaramProblema / base) * 100),
      },
      {
        rotulo: "Confirmam o problema",
        valor: stats.identificaramProblema,
        cor: "#15803d",
        perc: Math.round((stats.identificaramProblema / baseAval) * 100),
      },
      {
        rotulo: "Já perderam serviço por prazo",
        valor: stats.recusas,
        cor: "#dc2626",
        perc: Math.round((stats.recusas / baseAval) * 100),
      },
    ];
  }, [stats]);

  // 7) Canal do aviso ao cliente (pergunta 4 do roteiro)
  const canalAviso = useMemo(() => {
    const id = perguntas[3]?.id;
    const cont: Record<CanalAviso, number> = {
      whatsapp: 0,
      telefone: 0,
      presencial: 0,
      ninguem: 0,
    };
    let base = 0;
    for (const e of entrevistas) {
      const c = classificarCanal(textoResposta(e, id));
      if (c) {
        cont[c] += 1;
        base += 1;
      }
    }
    return {
      base,
      dados: [
        { nome: "WhatsApp", valor: cont.whatsapp, cor: "#15803d" },
        { nome: "Telefone / ligação", valor: cont.telefone, cor: "#7C5AC8" },
        {
          nome: "Cliente acompanha na oficina",
          valor: cont.presencial,
          cor: "#a3a3a3",
        },
        { nome: "Ninguém avisa", valor: cont.ninguem, cor: "#dc2626" },
      ].filter((d) => d.valor > 0),
    };
  }, [entrevistas, perguntas]);

  // 8) Padrão do aviso (pergunta 4 do roteiro)
  const padraoAviso = useMemo(() => {
    const id = perguntas[3]?.id;
    const cont: Record<PadraoAviso, number> = {
      semPadrao: 0,
      fotoVideo: 0,
      manual: 0,
      presencial: 0,
      naoAvisa: 0,
    };
    let base = 0;
    for (const e of entrevistas) {
      const c = classificarPadrao(textoResposta(e, id));
      if (c) {
        cont[c] += 1;
        base += 1;
      }
    }
    return {
      base,
      dados: [
        {
          nome: "Sem padrão (quando lembram)",
          valor: cont.semPadrao,
          cor: "#dc2626",
        },
        {
          nome: "Rotina com foto/vídeo",
          valor: cont.fotoVideo,
          cor: "#15803d",
        },
        { nome: "Manual simples", valor: cont.manual, cor: "#a78bfa" },
        { nome: "Cliente acompanha", valor: cont.presencial, cor: "#a3a3a3" },
        { nome: "Não avisa", valor: cont.naoAvisa, cor: "#0a0a0a" },
      ].filter((d) => d.valor > 0),
    };
  }, [entrevistas, perguntas]);

  // 9) Prazo por escrito (pergunta 3 do roteiro)
  const prazoEscrito = useMemo(() => {
    const id = perguntas[2]?.id;
    let escrito = 0;
    let falado = 0;
    for (const e of entrevistas) {
      const c = classificarPrazoEscrito(textoResposta(e, id));
      if (c === "escrito") escrito += 1;
      else if (c === "falado") falado += 1;
    }
    return {
      base: escrito + falado,
      dados: [
        { nome: "Só falado, sem registro", valor: falado, cor: "#0a0a0a" },
        {
          nome: "Por escrito (orçamento/OS)",
          valor: escrito,
          cor: "#15803d",
        },
      ].filter((d) => d.valor > 0),
    };
  }, [entrevistas, perguntas]);

  // 10) Check-in, sistemas e adoção (anotações + respostas)
  const checkinSistema = useMemo(() => {
    const chk = { papel: 0, naoFaz: 0, digital: 0 };
    let baseChk = 0;
    let sistema = 0;
    let quer = 0;
    let barreira = 0;
    for (const e of entrevistas) {
      const c = classificarCheckin(e);
      if (c) {
        chk[c] += 1;
        baseChk += 1;
      }
      if (usaSistema(e)) sistema += 1;
      if (querAdotar(e)) {
        quer += 1;
        if (citaBarreiraAdocao(e)) barreira += 1;
      }
    }
    return { chk, baseChk, sistema, total: entrevistas.length, quer, barreira };
  }, [entrevistas]);

  // 11) Aperto do dia a dia (P1, P4 e P5)
  const apertoDia = useMemo(() => {
    const p1 = perguntas[0]?.id;
    const p4 = perguntas[3]?.id;
    const p5 = perguntas[4]?.id;
    let baseRoteiro = 0;
    let prazoEstoura = 0;
    let cobra = 0;
    let baseDono = 0;
    let dono = 0;
    for (const e of entrevistas) {
      const t1 = textoResposta(e, p1).toLowerCase();
      if (t1 && !t1.startsWith("não abordado")) {
        baseRoteiro += 1;
        if (!t1.includes("não enfrenta") && !t1.includes("não é o prazo"))
          prazoEstoura += 1;
        const t45 = `${textoResposta(e, p4)} ${textoResposta(e, p5)}`.toLowerCase();
        if (
          ["cobram", "cobrança", "cobrando", "cobra como se", "aparece e pergunta"].some(
            (k) => t45.includes(k),
          )
        )
          cobra += 1;
      }
      const t4 = textoResposta(e, p4);
      if (classificarCanal(t4)) {
        baseDono += 1;
        if (
          [
            "próprio dono",
            "tudo com o dono",
            "dono no atendimento",
            "telefone e na graxa",
            "não tem recepcionista",
          ].some((k) => t4.toLowerCase().includes(k))
        )
          dono += 1;
      }
    }
    return { baseRoteiro, prazoEstoura, cobra, baseDono, dono };
  }, [entrevistas, perguntas]);

  // 12) Foto/vídeo no aviso ao cliente (P4)
  const fotoVideoCount = useMemo(() => {
    const id = perguntas[3]?.id;
    let total = 0;
    let base = 0;
    for (const e of entrevistas) {
      const t = textoResposta(e, id).toLowerCase();
      if (!classificarCanal(textoResposta(e, id))) continue;
      base += 1;
      if (t.includes("foto") || t.includes("vídeo")) total += 1;
    }
    return { total, base };
  }, [entrevistas, perguntas]);

  // 13) Entrevistas por área
  const porArea = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entrevistas) {
      const a = e.area || "Não informado";
      map.set(a, (map.get(a) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [entrevistas]);

  // 14) Entrevistas por porte
  const porPorteGeral = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entrevistas) {
      const p = e.porte || "Não informado";
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [entrevistas]);

  // 15) Confirmação do problema por área
  const problemaPorArea = useMemo(() => {
    const map = new Map<
      string,
      { sim: number; nao: number; naoAvaliaram: number }
    >();
    for (const e of entrevistas) {
      const a = e.area || "Não informado";
      const atual = map.get(a) ?? { sim: 0, nao: 0, naoAvaliaram: 0 };
      if (!avaliouProblema(e)) atual.naoAvaliaram += 1;
      else if (e.identificouProblema) atual.sim += 1;
      else atual.nao += 1;
      map.set(a, atual);
    }
    return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [entrevistas]);

  // 16) Recusa de serviço por responsável
  const recusaPorResponsavel = useMemo(() => {
    const map = new Map<
      string,
      { sim: number; nao: number; incerto: number; naoAvaliaram: number }
    >();
    for (const e of entrevistas) {
      const r = (e.responsavel || "Não informado").trim() || "Não informado";
      const atual = map.get(r) ?? {
        sim: 0,
        nao: 0,
        incerto: 0,
        naoAvaliaram: 0,
      };
      if (!avaliouProblema(e)) atual.naoAvaliaram += 1;
      else if (e.recusouServico === "sim") atual.sim += 1;
      else if (e.recusouServico === "nao") atual.nao += 1;
      else if (e.recusouServico === "incerto") atual.incerto += 1;
      else atual.naoAvaliaram += 1;
      map.set(r, atual);
    }
    return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [entrevistas]);

  // 17) Indicações por responsável
  const indicacoesPorResponsavel = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entrevistas.filter((x) => x.status === "realizada")) {
      const r = (e.responsavel || "Não informado").trim() || "Não informado";
      const qtd = e.indicacoes.filter((i) => i.trim()).length;
      map.set(r, (map.get(r) ?? 0) + qtd);
    }
    return Array.from(map.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [entrevistas]);

  // 18) Status das entrevistas
  const statusEntrevistas = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entrevistas) {
      map.set(e.status, (map.get(e.status) ?? 0) + 1);
    }
    const rotulos: Record<string, string> = {
      planejada: "Planejada",
      agendada: "Agendada",
      realizada: "Realizada",
    };
    return Array.from(map.entries()).map(([status, total]) => ({
      nome: rotulos[status] ?? status,
      total,
    }));
  }, [entrevistas]);

  if (carregando) {
    return <PageHeader title="Gráficos" subtitle="Carregando..." />;
  }

  const semDados = entrevistas.length === 0;

  const baseAvaliaram = stats.avaliaramProblema || 1;
  const percNegam = stats.avaliaramProblema
    ? Math.round(
        ((stats.avaliaramProblema - stats.identificaramProblema) /
          baseAvaliaram) *
          100,
      )
    : 0;
  const percRecusas = stats.avaliaramProblema
    ? Math.round((stats.recusas / baseAvaliaram) * 100)
    : 0;
  const linhasCheckin = [
    {
      rotulo: "Tem check-in digital",
      valor: checkinSistema.chk.digital,
      base: checkinSistema.baseChk,
      cor: "#15803d",
    },
    {
      rotulo: "Ainda registra em papel",
      valor: checkinSistema.chk.papel,
      base: checkinSistema.baseChk,
      cor: "#0a0a0a",
    },
    {
      rotulo: "Não faz check-in (pretende adotar)",
      valor: checkinSistema.chk.naoFaz,
      base: checkinSistema.baseChk,
      cor: "#a3a3a3",
    },
    {
      rotulo: "Usa algum sistema hoje",
      valor: checkinSistema.sistema,
      base: checkinSistema.total,
      cor: "#7C5AC8",
    },
    {
      rotulo: "Usariam algo online (check-in/aviso)",
      valor: checkinSistema.quer,
      base: checkinSistema.quer,
      cor: "#15803d",
    },
    {
      rotulo: "Barreira citada: custo / complexidade",
      valor: checkinSistema.barreira,
      base: checkinSistema.quer,
      cor: "#dc2626",
    },
  ].map((l) => ({
    ...l,
    perc: l.base ? Math.round((l.valor / l.base) * 100) : 0,
  }));

  const linhasAperto = [
    {
      rotulo: "Prazo estoura (de vez em quando ou sempre)",
      valor: apertoDia.prazoEstoura,
      base: apertoDia.baseRoteiro,
      cor: "#dc2626",
    },
    {
      rotulo: "Cliente cobra ou reclama quando demora",
      valor: apertoDia.cobra,
      base: apertoDia.baseRoteiro,
      cor: "#7C5AC8",
    },
    {
      rotulo: "O próprio dono é quem atende e avisa",
      valor: apertoDia.dono,
      base: apertoDia.baseDono,
      cor: "#0a0a0a",
    },
  ].map((l) => ({
    ...l,
    perc: l.base ? Math.round((l.valor / l.base) * 100) : 0,
  }));

  const whatsappCount =
    canalAviso.dados.find((d) => d.nome === "WhatsApp")?.valor ?? 0;
  const percWhatsapp = canalAviso.base
    ? Math.round((whatsappCount / canalAviso.base) * 100)
    : 0;
  const percFotoVideo = fotoVideoCount.base
    ? Math.round((fotoVideoCount.total / fotoVideoCount.base) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title="Gráficos"
        subtitle={`Área de gráficos da validação · ${entrevistas.length} entrevistas · atualiza automaticamente${atualizadoEm ? ` (última: ${atualizadoEm})` : ""}`}
      />

      {semDados ? (
        <EmptyState>
          Nenhuma entrevista cadastrada ainda. Registre as entrevistas para gerar os
          gráficos.
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Validação do problema
                </h2>
                <p className="mt-1 text-caption text-mid-gray">
                  {stats.realizadas} entrevistas realizadas · Meta:{" "}
                  {META_ENTREVISTAS} entrevistas e {META_PERC_PROBLEMA}% das oficinas
                  confirmando o problema
                </p>
              </div>
              <Badge variant={stats.validado ? "solid" : "soft"}>
                {stats.validado ? "Problema validado ✓" : "Ainda em validação"}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-caption text-mid-gray">Confirmam o problema</p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {stats.percIdentificaram}%
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  {stats.identificaramProblema} de {stats.avaliaramProblema} que
                  avaliaram o problema
                </p>
              </div>
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-caption text-mid-gray">Negam o problema</p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {percNegam}%
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  {stats.avaliaramProblema - stats.identificaramProblema} de{" "}
                  {stats.avaliaramProblema} que avaliaram o problema
                </p>
              </div>
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-caption text-mid-gray">
                  Não avaliaram o problema
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {stats.realizadas - stats.avaliaramProblema}
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  das {stats.realizadas} entrevistas realizadas
                </p>
              </div>
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-caption text-mid-gray">
                  Já perderam serviço por prazo
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {stats.recusas}
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  recusas de serviço registradas
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              O problema é real? (aprovação × negação)
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              {stats.realizadas} entrevistas realizadas — {stats.avaliaramProblema}{" "}
              avaliaram o problema de prazo (
              {stats.realizadas - stats.avaliaramProblema} não avaliaram)
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosProblema}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {dadosProblema.map((d) => (
                      <Cell key={d.nome} fill={d.cor} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Já recusou serviço por causa do prazo?
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              {stats.realizadas} entrevistas realizadas — {stats.recusas} das{" "}
              {stats.avaliaramProblema} que avaliaram já perderam serviço por não
              entender o prazo
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosRecusaGeral}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {dadosRecusaGeral.map((d) => (
                      <Cell key={d.nome} fill={d.cor} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Como o cliente é avisado hoje
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              De {canalAviso.base} entrevistas que descreveram como avisam o
              cliente (pergunta 4 do roteiro), de {stats.realizadas} realizadas
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={canalAviso.dados}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {canalAviso.dados.map((d) => (
                      <Cell key={d.nome} fill={d.cor} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              O aviso tem padrão? (ou depende de lembrar)
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Mesma base da pergunta 4 ({padraoAviso.base} entrevistas) —
              nenhuma tem aviso automático: é tudo manual
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={padraoAviso.dados}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {padraoAviso.dados.map((d) => (
                      <Cell key={d.nome} fill={d.cor} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Como o prazo é passado ao cliente
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              De {prazoEscrito.base} entrevistas que detalharam como explicam o
              prazo (pergunta 3 do roteiro) · por escrito = orçamento ou ordem
              de serviço
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prazoEscrito.dados}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {prazoEscrito.dados.map((d) => (
                      <Cell key={d.nome} fill={d.cor} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Check-in hoje: como é feito
            </h2>
            <p className="mb-4 text-caption text-mid-gray">
              O que os entrevistados contaram sobre o registro do veículo,
              sistemas usados e adoção — bases indicadas em cada linha
            </p>
            <div className="space-y-3">
              {linhasCheckin.map((l) => (
                <div key={l.rotulo}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-ink-soft">{l.rotulo}</span>
                    <span className="font-semibold text-ink">
                      {l.valor} de {l.base}{" "}
                      <span className="text-caption font-normal text-mid-gray">
                        ({l.perc}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${l.perc}%`, background: l.cor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              O aperto do dia a dia
            </h2>
            <p className="mb-4 text-caption text-mid-gray">
              Leitura das respostas das entrevistas do roteiro — bases indicadas
              em cada linha
            </p>
            <div className="space-y-3">
              {linhasAperto.map((l) => (
                <div key={l.rotulo}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-ink-soft">{l.rotulo}</span>
                    <span className="font-semibold text-ink">
                      {l.valor} de {l.base}{" "}
                      <span className="text-caption font-normal text-mid-gray">
                        ({l.perc}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${l.perc}%`, background: l.cor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Sugestão: perguntas para a próxima rodada
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Em cima do que já apareceu sobre check-in, sistemas e aviso ao
              cliente
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
              <li>
                Como é feito o check-in do veículo hoje: papel, sistema ou não
                existe?
              </li>
              <li>
                O que vocês já usam de sistema ou plataforma — e o que falta
                nele?
              </li>
              <li>
                Você usaria um check-in simples com aviso automático ao
                cliente? O que faria você desistir?
              </li>
              <li>
                Quanto tempo por dia vai embora respondendo cliente que cobra
                notícia?
              </li>
              <li>Quantos clientes por semana cobram notícia do carro?</li>
              <li>
                Quanto você pagaria por mês por um aviso automático ao cliente?
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Confirmam o problema, por porte
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemaPorPorte}>
                  <XAxis
                    dataKey="nome"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tick={tickStyle}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                  <Bar dataKey="sim" name="Confirmam" stackId="a" fill="#15803d" />
                  <Bar dataKey="nao" name="Não confirmam" stackId="a" fill="#0a0a0a" />
                  <Bar
                    dataKey="naoAvaliaram"
                    name="Não avaliaram"
                    stackId="a"
                    fill="#e5e5e5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Entrevistas por área
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Onde a pessoa entrevistada atua dentro da oficina
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porArea}
                    dataKey="total"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {porArea.map((d, i) => (
                      <Cell
                        key={d.nome}
                        fill={
                          [
                            "#0a0a0a",
                            "#7C5AC8",
                            "#15803d",
                            "#dc2626",
                            "#a3a3a3",
                            "#a78bfa",
                          ][i % 6]
                        }
                      />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Entrevistas por porte
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Distribuição das oficinas por tamanho
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porPorteGeral}>
                  <XAxis
                    dataKey="nome"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tick={tickStyle}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="total" name="Entrevistas" fill="#0a0a0a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Confirmação do problema por área
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Quem confirma, quem não confirma e quem não avaliou o problema
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemaPorArea}>
                  <XAxis
                    dataKey="nome"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tick={tickStyle}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                  <Bar dataKey="sim" name="Confirmam" stackId="a" fill="#15803d" />
                  <Bar dataKey="nao" name="Não confirmam" stackId="a" fill="#0a0a0a" />
                  <Bar
                    dataKey="naoAvaliaram"
                    name="Não avaliaram"
                    stackId="a"
                    fill="#e5e5e5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Recusa de serviço por responsável
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Quem entrevistou e quantas oficinas já perderam serviço por prazo
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recusaPorResponsavel}>
                  <XAxis
                    dataKey="nome"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tick={tickStyle}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                  <Bar dataKey="sim" name="Já recusou" stackId="a" fill="#dc2626" />
                  <Bar dataKey="nao" name="Não recusou" stackId="a" fill="#0a0a0a" />
                  <Bar dataKey="incerto" name="Incerto" stackId="a" fill="#a3a3a3" />
                  <Bar
                    dataKey="naoAvaliaram"
                    name="Não avaliaram"
                    stackId="a"
                    fill="#e5e5e5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Indicações por responsável
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Quantas oficinas cada pessoa indicou para ampliar a amostra
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indicacoesPorResponsavel}>
                  <XAxis
                    dataKey="nome"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tick={tickStyle}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="total"
                    name="Indicações"
                    fill="#7C5AC8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Status das entrevistas
            </h2>
            <p className="mb-3 text-caption text-mid-gray">
              Planejadas, agendadas e realizadas
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusEntrevistas}
                    dataKey="total"
                    nameKey="nome"
                    outerRadius={85}
                    label={rotuloPercentual}
                  >
                    {statusEntrevistas.map((d) => (
                      <Cell
                        key={d.nome}
                        fill={
                          d.nome === "Realizada"
                            ? "#0a0a0a"
                            : d.nome === "Agendada"
                              ? "#737373"
                              : "#a3a3a3"
                        }
                      />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#737373" }}
                    iconType="circle"
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Taxa de resposta por pergunta
            </h2>
            <p className="mb-4 text-caption text-mid-gray">
              Respondidas por completo, &quot;não abordadas&quot; ou sem resposta — por
              pergunta do roteiro
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={respostaPorPergunta}>
                  <XAxis
                    dataKey="nome"
                    tickLine={false}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tick={tickStyle}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={28}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number, _n, item) => [
                      `${v} entrevistas`,
                      (item?.payload as { texto?: string })?.texto ?? "",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                  <Bar
                    dataKey="respondidas"
                    name="Respondidas"
                    stackId="a"
                    fill="#0a0a0a"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="naoAbordadas"
                    name="Não abordadas"
                    stackId="a"
                    fill="#a3a3a3"
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="semResposta"
                    name="Sem resposta"
                    stackId="a"
                    fill="#e5e5e5"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ol className="mt-3 space-y-1 text-caption text-mid-gray">
              {respostaPorPergunta.map((p, i) => (
                <li key={p.nome}>
                  <span className="font-medium text-ink-soft">P{i + 1}:</span>{" "}
                  {p.texto.length > 90 ? `${p.texto.slice(0, 90)}…` : p.texto}
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Funil da validação
            </h2>
            <p className="mb-4 text-caption text-mid-gray">
              Da entrevista realizada até a perda de serviço (confirmação e recusa:
              % de quem avaliou o problema)
            </p>
            <div className="space-y-3">
              {funil.map((f) => (
                <div key={f.rotulo}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-ink-soft">{f.rotulo}</span>
                    <span className="font-semibold text-ink">
                      {f.valor}{" "}
                      <span className="text-caption font-normal text-mid-gray">
                        ({f.perc}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${f.perc}%`, background: f.cor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-1 text-sm font-semibold text-ink">
              Entrevistas + pesquisa online
            </h2>
            <p className="mb-4 text-caption text-mid-gray">
              O que ouvimos nas oficinas, lado a lado com as pesquisas do setor
            </p>
            <h3 className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
              Lado a lado
            </h3>
            <div className="mt-2 mb-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-sm font-semibold text-ink">Check-in digital</p>
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">
                    {checkinSistema.chk.digital} de {checkinSistema.baseChk} (
                    {checkinSistema.baseChk
                      ? Math.round(
                          (checkinSistema.chk.digital / checkinSistema.baseChk) *
                            100,
                        )
                      : 0}
                    %)
                  </span>{" "}
                  nas entrevistas · 43% das oficinas (EUA) já usam inspeção
                  digital — ~1 em 4 ainda faz o check-in à mão
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  Endeavor/AutoZone · dez/2025 · ALLDATA · 2023
                </p>
              </div>
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-sm font-semibold text-ink">
                  Atualização por mensagem
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">
                    {whatsappCount} de {canalAviso.base} ({percWhatsapp}%)
                  </span>{" "}
                  avisam por WhatsApp · 56% dos clientes preferem mensagem — quem
                  recebe fica +34 pontos mais satisfeito
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  J.D. Power ASI · abr/2025 · EUA
                </p>
              </div>
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-sm font-semibold text-ink">
                  Foto e vídeo do serviço
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">
                    {fotoVideoCount.total} de {fotoVideoCount.base} ({percFotoVideo}
                    %)
                  </span>{" "}
                  mandam foto/vídeo · foto e vídeo mais que dobram a aprovação do
                  serviço — 64% dos clientes querem, só 26% recebem
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  J.D. Power ASI/CSI · 2026 · EUA
                </p>
              </div>
              <div className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-sm font-semibold text-ink">Aviso automático</p>
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">
                    0 de {padraoAviso.base} (0%)
                  </span>{" "}
                  têm aviso automático · “manter o cliente informado” é 1 dos 4
                  KPIs de comunicação mais fortes da satisfação
                </p>
                <p className="mt-1 text-caption text-mid-gray">
                  J.D. Power CSI · 2025 · EUA
                </p>
              </div>
            </div>
            <h3 className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
              Nossas entrevistas · {stats.realizadas} realizadas
            </h3>
            <ul className="mt-2 mb-5 space-y-2 text-sm text-ink-soft">
              <li>
                <Badge variant="solid">{stats.percIdentificaram}%</Badge> confirmam o
                problema de prazo/comunicação ({stats.identificaramProblema} de{" "}
                {stats.avaliaramProblema} que avaliaram)
              </li>
              <li>
                <Badge variant="outline">{percRecusas}%</Badge> já perderam serviço
                por não entender o prazo ({stats.recusas} de {stats.avaliaramProblema})
              </li>
            </ul>
            <h3 className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
              Pesquisas online do setor
            </h3>
            <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MERCADO.map((m) => (
                <li
                  key={m.dado + m.texto}
                  className="rounded-cards border border-hairline bg-surface-alt p-3"
                >
                  <p className="text-xl font-semibold text-ink">{m.dado}</p>
                  <p className="mt-1 text-sm text-ink-soft">{m.texto}</p>
                  <p className="mt-1 text-caption text-mid-gray">{m.fonte}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
