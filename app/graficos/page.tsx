"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import type { Entrevista, Pergunta, Rodada } from "@/lib/types";
import {
  ehExemplo,
  META_CLIENTE,
  publicoDaPergunta,
  publicoDe,
  rodadaDaPergunta,
} from "@/lib/validacao";
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
const CORES = ["#0a0a0a", "#15803d", "#7C5AC8", "#dc2626", "#a3a3a3", "#a78bfa"];

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

type Fatia = { nome: string; valor: number; cor: string };
type Barra = { rotulo: string; valor: number; base: number; cor: string };

function PizzaCard({
  titulo,
  subtitulo,
  dados,
  vazio,
  altura = "h-64",
}: {
  titulo: string;
  subtitulo: string;
  dados: Fatia[];
  vazio: string;
  altura?: string;
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      <p className="mb-3 mt-1 text-caption text-mid-gray">{subtitulo}</p>
      {dados.length === 0 ? (
        <div
          className={`flex ${altura} flex-col items-center justify-center rounded-cards border border-dashed border-hairline bg-surface-alt p-4 text-center`}
        >
          <p className="text-caption text-mid-gray">{vazio}</p>
        </div>
      ) : (
        <div className={altura}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dados}
                dataKey="valor"
                nameKey="nome"
                outerRadius={82}
                label={rotuloPercentual}
              >
                {dados.map((d) => (
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
      )}
    </Card>
  );
}

function BarList({
  titulo,
  subtitulo,
  itens,
}: {
  titulo: string;
  subtitulo?: string;
  itens: Barra[];
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      {subtitulo && (
        <p className="mb-4 mt-1 text-caption text-mid-gray">{subtitulo}</p>
      )}
      <div className="space-y-3.5">
        {itens.map((l) => {
          const perc = l.base ? Math.round((l.valor / l.base) * 100) : 0;
          return (
            <div key={l.rotulo}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="text-ink-soft">{l.rotulo}</span>
                <span className="whitespace-nowrap font-semibold text-ink">
                  {l.valor}
                  <span className="font-normal text-mid-gray"> de {l.base}</span>{" "}
                  <span className="text-caption font-normal text-mid-gray">
                    ({perc}%)
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${perc}%`, background: l.cor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MiniStat({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <div className="rounded-cards border border-hairline bg-surface-alt p-3">
      <p className="text-caption text-mid-gray">{rotulo}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{valor}</p>
      <p className="mt-1 text-caption text-mid-gray">{detalhe}</p>
    </div>
  );
}

function Titulo({ children, nota }: { children: React.ReactNode; nota?: string }) {
  return (
    <div className="mt-2 lg:col-span-2">
      <h2 className="text-sm font-semibold text-ink">{children}</h2>
      {nota && <p className="text-caption text-mid-gray">{nota}</p>}
    </div>
  );
}

function aval(i: Entrevista): boolean {
  return (
    i.identificouProblema ||
    Boolean(i.clienteEntendePrazos) ||
    Boolean(i.recusouServico)
  );
}

function resposta(e: Entrevista, id?: string): string {
  if (!id) return "";
  return (e.respostas.find((r) => r.perguntaId === id)?.resposta ?? "").trim();
}

function textoCompleto(e: Entrevista): string {
  return `${e.anotacoes ?? ""} ${(e.respostas ?? [])
    .map((r) => r.resposta)
    .join(" ")}`.toLowerCase();
}

const SEM_REGRA = [
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
const BARREIRA = ["caros ou complicados", "considerados caros", "custo", "pagar por mais de um"];

function classificarCanal(t: string): "whatsapp" | "telefone" | "presencial" | "ninguem" | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado")) return null;
  if (s.includes("whatsapp")) return "whatsapp";
  if (s.includes("liga") || s.includes("telefone") || s.includes("celular")) return "telefone";
  if (s.includes("presencial")) return "presencial";
  if (s.includes("não avisa") || s.includes("morre entre")) return "ninguem";
  return null;
}

function classificarPadrao(t: string): "semPadrao" | "fotoVideo" | "manual" | "presencial" | "naoAvisa" | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado")) return null;
  if (s.startsWith("não avisa")) return "naoAvisa";
  if (s.includes("presencial")) return "presencial";
  if (SEM_REGRA.some((k) => s.includes(k))) return "semPadrao";
  if (s.includes("foto") || s.includes("vídeo")) return "fotoVideo";
  if (s.includes("não apoiam") || s.includes("benefício esperado")) return null;
  return "manual";
}

function classificarPrazo(t: string): "escrito" | "falado" | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado") || s.startsWith("não detalhado")) return null;
  if (s.includes("ordem de serviço") || s.includes("no orçamento")) return "escrito";
  return "falado";
}

function classificarCheckin(e: Entrevista): "papel" | "naoFaz" | "digital" | null {
  const t = textoCompleto(e);
  if (!t.includes("check-in") && !t.includes("checkin")) return null;
  if (t.includes("não faz check-in") || t.includes("não aderiu")) return "naoFaz";
  if (t.includes("papel")) return "papel";
  if (t.includes("tablet") || t.includes("automatizado")) return "digital";
  return null;
}

const CONFIANCA: Array<{ nome: string; chaves: string[] }> = [
  { nome: "Fotos do serviço", chaves: ["foto", "vídeo"] },
  {
    nome: "Prazo e data de entrega",
    chaves: ["prazo", "data de entrega", "previsão", "quando fica"],
  },
  { nome: "Valor e orçamento", chaves: ["orçamento", "valor", "custo", "preço"] },
  {
    nome: "Status e etapas do serviço",
    chaves: ["status", "etapa", "diagnóstico", "o que está sendo feito", "andamento"],
  },
  { nome: "Contato de quem mexe", chaves: ["contato", "quem está", "falar com o mecânico"] },
];

const DESISTIR: Array<{ nome: string; chaves: string[] }> = [
  { nome: "Se a oficina não atualizar", chaves: ["não atualiz", "nada atualizado", "não tivesse nada"] },
  {
    nome: "Se for complicado (app, conta, cadastro)",
    chaves: ["complicado", "burocrático", "aplicativo", "app", "conta", "cadastro", "difícil", "não abrisse", "abrir"],
  },
  { nome: "Se tiver propaganda demais", chaves: ["propaganda"] },
  { nome: "Se avisar só no fim", chaves: ["só quando o carro"] },
];

function classificarPagar(t: string): "nao" | "talvez" | "sim" | null {
  const s = t.toLowerCase();
  if (!s || s.startsWith("não abordado")) return null;
  if (s.startsWith("não") || s.includes("não pagaria")) return "nao";
  if (s.includes("talvez") || s.includes("se fosse barato")) return "talvez";
  if (s.includes("pagaria") || s.includes("pago")) return "sim";
  return null;
}

const MERCADO = [
  { dado: "12%", texto: "dos reparos não são concluídos corretamente na 1ª visita", fonte: "J.D. Power CSI 2025 · EUA" },
  { dado: "28%", texto: "dos reparos com falha envolvem peça indisponível", fonte: "J.D. Power CSI 2025 · EUA" },
  { dado: "4 em 10", texto: "indicadores mais importantes da satisfação são de comunicação", fonte: "J.D. Power CSI 2025 · EUA" },
  { dado: "56%", texto: "dos clientes preferem ser avisados por mensagem, não por ligação", fonte: "J.D. Power ASI · abr/2025 · EUA" },
  { dado: "2×", texto: "foto/vídeo do serviço mais que dobram a aprovação do trabalho recomendado", fonte: "J.D. Power ASI · abr/2026 · EUA" },
  { dado: "64% × 26%", texto: "dos clientes querem foto/vídeo da inspeção — só 26% dos populares recebem", fonte: "J.D. Power CSI · mar/2026 · EUA" },
  { dado: "53%", texto: "da manutenção no Brasil já é feita em oficinas independentes", fonte: "IQA/Ipsos · out/2026" },
  { dado: "33% × 8%", texto: "escolhem a oficina pela confiança no profissional, não pelo preço", fonte: "IQA/Ipsos · out/2026" },
  { dado: "43%", texto: "das oficinas independentes já usam inspeção digital", fonte: "Endeavor/AutoZone · dez/2025 · EUA" },
];

const ABAS = [
  { id: "oficina", nome: "Oficina" },
  { id: "cliente", nome: "Cliente final" },
  { id: "amostra", nome: "Amostra e qualidade" },
] as const;

type Aba = (typeof ABAS)[number]["id"];

export default function GraficosPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState("");
  const [aba, setAba] = useState<Aba>("oficina");

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

  const oficina = useMemo(() => entrevistas.filter((e) => publicoDe(e) === "oficina"), [entrevistas]);
  const cliente = useMemo(() => entrevistas.filter((e) => publicoDe(e) === "cliente"), [entrevistas]);
  const statsOficina = useMemo(() => calcStats(oficina), [oficina]);
  const statsCliente = useMemo(() => calcStats(cliente), [cliente]);
  const temDemo = useMemo(() => cliente.some(ehExemplo), [cliente]);

  const perguntasBase = useMemo(
    () =>
      perguntas
        .filter((p) => publicoDaPergunta(p) === "oficina" && rodadaDaPergunta(p) === "problema")
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.createdAt.localeCompare(b.createdAt)),
    [perguntas],
  );
  const perguntasCliente = useMemo(
    () =>
      perguntas
        .filter((p) => publicoDaPergunta(p) === "cliente")
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [perguntas],
  );
  const pid = (publico: "oficina" | "cliente", rodada: Rodada, ordem: number) =>
    (publico === "cliente" ? perguntasCliente : perguntasBase).find(
      (p) => rodadaDaPergunta(p) === rodada && (p.ordem ?? 0) === ordem,
    )?.id;

  // ---------- Oficina ----------
  const oficinaProblema = useMemo<Fatia[]>(
    () => [
      { nome: "Confirmam o problema", valor: statsOficina.identificaramProblema, cor: "#15803d" },
      {
        nome: "Não confirmam",
        valor: Math.max(statsOficina.avaliaramProblema - statsOficina.identificaramProblema, 0),
        cor: "#0a0a0a",
      },
    ],
    [statsOficina],
  );

  const oficinaRecusa = useMemo<Fatia[]>(
    () =>
      [
        { faixa: "sim", nome: "Já recusou", cor: "#dc2626" },
        { faixa: "nao", nome: "Não recusou", cor: "#0a0a0a" },
        { faixa: "incerto", nome: "Incerto", cor: "#a3a3a3" },
      ]
        .map((m) => ({
          nome: m.nome,
          cor: m.cor,
          valor: statsOficina.porRecusa.find((f) => f.faixa === m.faixa)?.total ?? 0,
        }))
        .filter((d) => d.valor > 0),
    [statsOficina],
  );

  const canal = useMemo(() => {
    const id = pid("oficina", "problema", 4);
    const cont = { whatsapp: 0, telefone: 0, presencial: 0, ninguem: 0 };
    let base = 0;
    for (const e of oficina) {
      const c = classificarCanal(resposta(e, id));
      if (c) {
        cont[c] += 1;
        base += 1;
      }
    }
    return {
      base,
      itens: [
        { rotulo: "WhatsApp", valor: cont.whatsapp, base, cor: "#15803d" },
        { rotulo: "Telefone / ligação", valor: cont.telefone, base, cor: "#7C5AC8" },
        { rotulo: "Cliente acompanha na oficina", valor: cont.presencial, base, cor: "#a3a3a3" },
        { rotulo: "Ninguém avisa", valor: cont.ninguem, base, cor: "#dc2626" },
      ].filter((d) => d.valor > 0),
    };
  }, [oficina, perguntasCliente, perguntasBase]);

  const padrao = useMemo(() => {
    const id = pid("oficina", "problema", 4);
    const cont = { semPadrao: 0, fotoVideo: 0, manual: 0, presencial: 0, naoAvisa: 0 };
    let base = 0;
    for (const e of oficina) {
      const c = classificarPadrao(resposta(e, id));
      if (c) {
        cont[c] += 1;
        base += 1;
      }
    }
    return {
      base,
      itens: [
        { rotulo: "Sem padrão (quando lembram)", valor: cont.semPadrao, base, cor: "#dc2626" },
        { rotulo: "Rotina com foto/vídeo", valor: cont.fotoVideo, base, cor: "#15803d" },
        { rotulo: "Manual simples", valor: cont.manual, base, cor: "#a78bfa" },
        { rotulo: "Cliente acompanha na oficina", valor: cont.presencial, base, cor: "#a3a3a3" },
        { rotulo: "Não avisa", valor: cont.naoAvisa, base, cor: "#0a0a0a" },
      ].filter((d) => d.valor > 0),
    };
  }, [oficina, perguntasBase]);

  const prazo = useMemo(() => {
    const id = pid("oficina", "problema", 3);
    let escrito = 0;
    let falado = 0;
    for (const e of oficina) {
      const c = classificarPrazo(resposta(e, id));
      if (c === "escrito") escrito += 1;
      else if (c === "falado") falado += 1;
    }
    const base = escrito + falado;
    return {
      itens: [
        { rotulo: "Só falado, sem registro", valor: falado, base, cor: "#0a0a0a" },
        { rotulo: "Por escrito (orçamento/OS)", valor: escrito, base, cor: "#15803d" },
      ].filter((d) => d.valor > 0 || base === 0),
    };
  }, [oficina, perguntasBase]);

  const checkin = useMemo(() => {
    const chk = { papel: 0, naoFaz: 0, digital: 0 };
    let base = 0;
    let sistema = 0;
    let quer = 0;
    let barreira = 0;
    for (const e of oficina) {
      const c = classificarCheckin(e);
      if (c) {
        chk[c] += 1;
        base += 1;
      }
      const t = textoCompleto(e);
      if (
        t.includes("utiliza vários sistemas") ||
        t.includes("plataformas pagas") ||
        t.includes("painel da loja")
      )
        sistema += 1;
      if (QUER_ADOTAR.some((k) => t.includes(k))) {
        quer += 1;
        if (BARREIRA.some((k) => t.includes(k))) barreira += 1;
      }
    }
    return {
      total: oficina.length,
      itens: [
        { rotulo: "Ainda registra em papel", valor: chk.papel, base, cor: "#0a0a0a" },
        { rotulo: "Tem check-in digital", valor: chk.digital, base, cor: "#15803d" },
        { rotulo: "Não faz check-in", valor: chk.naoFaz, base, cor: "#a3a3a3" },
        { rotulo: "Usa algum sistema hoje", valor: sistema, base: oficina.length, cor: "#7C5AC8" },
        { rotulo: "Citaram querer algo online", valor: quer, base: oficina.length, cor: "#15803d" },
        { rotulo: "Barreira entre quem quer: custo", valor: barreira, base: quer, cor: "#dc2626" },
      ].filter((d) => d.valor > 0 || d.base === 0),
    };
  }, [oficina]);

  const aperto = useMemo(() => {
    const p1 = pid("oficina", "problema", 1);
    const p4 = pid("oficina", "problema", 4);
    const p5 = pid("oficina", "problema", 5);
    let baseRoteiro = 0;
    let prazoEstoura = 0;
    let cobra = 0;
    let baseDono = 0;
    let dono = 0;
    for (const e of oficina) {
      const t1 = resposta(e, p1).toLowerCase();
      if (t1 && !t1.startsWith("não abordado")) {
        baseRoteiro += 1;
        if (!t1.includes("não enfrenta") && !t1.includes("não é o prazo")) prazoEstoura += 1;
        const t45 = `${resposta(e, p4)} ${resposta(e, p5)}`.toLowerCase();
        if (["cobram", "cobrança", "cobrando", "cobra como se", "aparece e pergunta"].some((k) => t45.includes(k)))
          cobra += 1;
      }
      const t4 = resposta(e, p4);
      if (classificarCanal(t4)) {
        baseDono += 1;
        if (
          ["próprio dono", "tudo com o dono", "dono no atendimento", "telefone e na graxa", "não tem recepcionista"].some(
            (k) => t4.toLowerCase().includes(k),
          )
        )
          dono += 1;
      }
    }
    return {
      itens: [
        { rotulo: "O prazo estoura (de vez em quando ou sempre)", valor: prazoEstoura, base: baseRoteiro, cor: "#dc2626" },
        { rotulo: "O cliente cobra quando demora", valor: cobra, base: baseRoteiro, cor: "#7C5AC8" },
        { rotulo: "O próprio dono atende e avisa", valor: dono, base: baseDono, cor: "#0a0a0a" },
      ],
    };
  }, [oficina, perguntasBase]);

  const funil = useMemo(() => {
    const base = statsOficina.realizadas || 1;
    const baseAval = statsOficina.avaliaramProblema || 1;
    return [
      { rotulo: "Entrevistas realizadas", valor: statsOficina.realizadas, base, cor: "#0a0a0a" },
      { rotulo: "Avaliaram o problema de prazo", valor: statsOficina.avaliaramProblema, base, cor: "#7C5AC8" },
      { rotulo: "Confirmam o problema", valor: statsOficina.identificaramProblema, base: baseAval, cor: "#15803d" },
      { rotulo: "Já perderam serviço por prazo", valor: statsOficina.recusas, base: baseAval, cor: "#dc2626" },
    ];
  }, [statsOficina]);

  // ---------- Cliente final ----------
  const clienteProblema = useMemo<Fatia[]>(
    () =>
      [
        { nome: "Confirmam a falta de informação", valor: statsCliente.identificaramProblema, cor: "#15803d" },
        {
          nome: "Não confirmam",
          valor: Math.max(statsCliente.avaliaramProblema - statsCliente.identificaramProblema, 0),
          cor: "#0a0a0a",
        },
      ].filter((d) => d.valor > 0),
    [statsCliente],
  );

  const clientePrazo = useMemo<Fatia[]>(() => {
    const v = (f: string) => statsCliente.porClienteEntendePrazos.find((x) => x.faixa === f)?.total ?? 0;
    return [
      { nome: "Entendem o prazo", valor: v("sim"), cor: "#15803d" },
      { nome: "Entendem em parte", valor: v("parcial"), cor: "#a3a3a3" },
      { nome: "Não entendem", valor: v("nao"), cor: "#dc2626" },
    ].filter((d) => d.valor > 0);
  }, [statsCliente]);

  const clienteRecusa = useMemo<Fatia[]>(() => {
    const v = (f: string) => statsCliente.porRecusa.find((x) => x.faixa === f)?.total ?? 0;
    return [
      { nome: "Já desistiram ou recusaram", valor: v("sim"), cor: "#dc2626" },
      { nome: "Não recusaram", valor: v("nao"), cor: "#0a0a0a" },
      { nome: "Incerto", valor: v("incerto"), cor: "#a3a3a3" },
    ].filter((d) => d.valor > 0);
  }, [statsCliente]);

  const clienteUsaria = useMemo<Fatia[]>(() => {
    const id = pid("cliente", "solucao", 1);
    let sim = 0;
    let talvez = 0;
    let nao = 0;
    for (const e of cliente) {
      const s = resposta(e, id).toLowerCase();
      if (!s) continue;
      if (s.startsWith("não") || s.includes("não usaria")) nao += 1;
      else if (s.includes("talvez") || s.includes("depende")) talvez += 1;
      else sim += 1;
    }
    return [
      { nome: "Usariam o QR code", valor: sim, cor: "#15803d" },
      { nome: "Talvez / depende", valor: talvez, cor: "#a3a3a3" },
      { nome: "Não usariam", valor: nao, cor: "#dc2626" },
    ].filter((d) => d.valor > 0);
  }, [cliente, perguntasCliente]);

  const clienteConfianca = useMemo(() => {
    const id = pid("cliente", "solucao", 2);
    let base = 0;
    const cont = CONFIANCA.map((c) => ({ ...c, total: 0 }));
    for (const e of cliente) {
      const s = resposta(e, id).toLowerCase();
      if (!s) continue;
      base += 1;
      for (const c of cont) if (c.chaves.some((k) => s.includes(k))) c.total += 1;
    }
    return {
      base,
      itens: cont
        .map((c, i) => ({ rotulo: c.nome, valor: c.total, base, cor: CORES[i % CORES.length] }))
        .filter((d) => d.valor > 0),
    };
  }, [cliente, perguntasCliente]);

  const clienteDesistir = useMemo(() => {
    const id = pid("cliente", "solucao", 4);
    let base = 0;
    const cont = DESISTIR.map((c) => ({ ...c, total: 0 }));
    for (const e of cliente) {
      const s = resposta(e, id).toLowerCase();
      if (!s) continue;
      base += 1;
      for (const c of cont) if (c.chaves.some((k) => s.includes(k))) c.total += 1;
    }
    return {
      base,
      itens: cont
        .map((c, i) => ({ rotulo: c.nome, valor: c.total, base, cor: CORES[i % CORES.length] }))
        .filter((d) => d.valor > 0),
    };
  }, [cliente, perguntasCliente]);

  const clientePagar = useMemo(() => {
    const id = pid("cliente", "solucao", 5);
    const cont = { nao: 0, talvez: 0, sim: 0 };
    let base = 0;
    for (const e of cliente) {
      const c = classificarPagar(resposta(e, id));
      if (c) {
        cont[c] += 1;
        base += 1;
      }
    }
    return {
      base,
      itens: [
        { rotulo: "Não pagariam nada", valor: cont.nao, base, cor: "#0a0a0a" },
        { rotulo: "Talvez, se fosse barato", valor: cont.talvez, base, cor: "#a3a3a3" },
        { rotulo: "Pagariam", valor: cont.sim, base, cor: "#15803d" },
      ].filter((d) => d.valor > 0),
    };
  }, [cliente, perguntasCliente]);

  const clienteFrases = useMemo(() => {
    const id = pid("cliente", "solucao", 3);
    return cliente
      .map((e) => ({ quem: e.cargo || e.nomeEntrevistado, texto: resposta(e, id) }))
      .filter((f) => f.texto)
      .slice(0, 4);
  }, [cliente, perguntasCliente]);

  // ---------- Amostra ----------
  const composicao = useMemo<Fatia[]>(
    () => [
      { nome: "Oficina", valor: oficina.length, cor: "#0a0a0a" },
      { nome: "Cliente final", valor: cliente.length, cor: "#7C5AC8" },
    ],
    [oficina.length, cliente.length],
  );

  const porArea = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of oficina) m.set(e.area || "Não informado", (m.get(e.area || "Não informado") ?? 0) + 1);
    return Array.from(m.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [oficina]);

  const porPorte = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of oficina) m.set(e.porte || "Não informado", (m.get(e.porte || "Não informado") ?? 0) + 1);
    return Array.from(m.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [oficina]);

  const confirmaPorArea = useMemo(() => {
    const m = new Map<string, { sim: number; nao: number; naoAvaliaram: number }>();
    for (const e of oficina) {
      const a = e.area || "Não informado";
      const atual = m.get(a) ?? { sim: 0, nao: 0, naoAvaliaram: 0 };
      if (!aval(e)) atual.naoAvaliaram += 1;
      else if (e.identificouProblema) atual.sim += 1;
      else atual.nao += 1;
      m.set(a, atual);
    }
    return Array.from(m.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [oficina]);

  const recusaPorResponsavel = useMemo(() => {
    const m = new Map<string, { sim: number; nao: number; incerto: number; naoAvaliaram: number }>();
    for (const e of oficina) {
      const rr = (e.responsavel || "Não informado").trim() || "Não informado";
      const atual = m.get(rr) ?? { sim: 0, nao: 0, incerto: 0, naoAvaliaram: 0 };
      if (!aval(e)) atual.naoAvaliaram += 1;
      else if (e.recusouServico === "sim") atual.sim += 1;
      else if (e.recusouServico === "nao") atual.nao += 1;
      else if (e.recusouServico === "incerto") atual.incerto += 1;
      else atual.naoAvaliaram += 1;
      m.set(rr, atual);
    }
    return Array.from(m.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [oficina]);

  const taxaResposta = useMemo(
    () =>
      perguntasBase.map((p, i) => {
        let respondidas = 0;
        let naoAbordadas = 0;
        let semResposta = 0;
        for (const e of oficina) {
          const t = resposta(e, p.id);
          if (!t) semResposta += 1;
          else if (t.startsWith("Não abordado")) naoAbordadas += 1;
          else respondidas += 1;
        }
        return { nome: `P${i + 1}`, respondidas, naoAbordadas, semResposta, texto: p.texto };
      }),
    [perguntasBase, oficina],
  );

  const indicacoes = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of oficina.filter((x) => x.status === "realizada")) {
      const rr = (e.responsavel || "Não informado").trim() || "Não informado";
      m.set(rr, (m.get(rr) ?? 0) + e.indicacoes.filter((i) => i.trim()).length);
    }
    return Array.from(m.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [oficina]);

  if (carregando) {
    return <PageHeader title="Gráficos" subtitle="Carregando..." />;
  }

  const semDados = entrevistas.length === 0;

  return (
    <div>
      <PageHeader
        title="Gráficos"
        subtitle={`Validação dos dois lados · ${oficina.length} oficina(s) · ${cliente.length} cliente(s) final(is) · atualiza automaticamente${atualizadoEm ? ` (última: ${atualizadoEm})` : ""}`}
      />

      {semDados ? (
        <EmptyState>
          Nenhuma entrevista cadastrada ainda. Registre as entrevistas para gerar os
          gráficos.
        </EmptyState>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <MiniStat
              rotulo="Oficina"
              valor={`${oficina.length}`}
              detalhe={`${statsOficina.percIdentificaram}% confirmam o problema · ${statsOficina.recusas} perderam serviço`}
            />
            <MiniStat
              rotulo="Cliente final"
              valor={`${cliente.length}`}
              detalhe={`${statsCliente.percIdentificaram}% confirmam a falta de informação`}
            />
            <MiniStat
              rotulo="Amostra total"
              valor={`${entrevistas.length}`}
              detalhe="oficinas e clientes finais entrevistados"
            />
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {ABAS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`inline-flex h-9 items-center rounded-buttons px-3 text-sm font-medium transition-colors ${
                  aba === a.id
                    ? "bg-ink text-[#fafafa]"
                    : "border border-hairline text-ink hover:bg-canvas"
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>

          {aba === "oficina" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      Validação da oficina
                    </h2>
                    <p className="mt-1 text-caption text-mid-gray">
                      {statsOficina.realizadas} entrevistas realizadas · meta:{" "}
                      {META_ENTREVISTAS} entrevistas e {META_PERC_PROBLEMA}% confirmando o
                      problema
                    </p>
                  </div>
                  <Badge variant={statsOficina.validado ? "solid" : "soft"}>
                    {statsOficina.validado ? "Problema validado" : "Ainda em validação"}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MiniStat
                    rotulo="Confirmam o problema"
                    valor={`${statsOficina.percIdentificaram}%`}
                    detalhe={`${statsOficina.identificaramProblema} de ${statsOficina.avaliaramProblema} que avaliaram`}
                  />
                  <MiniStat
                    rotulo="Negam o problema"
                    valor={`${
                      statsOficina.avaliaramProblema
                        ? Math.round(
                            ((statsOficina.avaliaramProblema - statsOficina.identificaramProblema) /
                              statsOficina.avaliaramProblema) *
                              100,
                          )
                        : 0
                    }%`}
                    detalhe={`${statsOficina.avaliaramProblema - statsOficina.identificaramProblema} de ${statsOficina.avaliaramProblema}`}
                  />
                  <MiniStat
                    rotulo="Não avaliaram o problema"
                    valor={`${statsOficina.realizadas - statsOficina.avaliaramProblema}`}
                    detalhe={`das ${statsOficina.realizadas} entrevistas`}
                  />
                  <MiniStat
                    rotulo="Perderam serviço por prazo"
                    valor={`${statsOficina.recusas}`}
                    detalhe="recusas de serviço registradas"
                  />
                </div>
              </Card>

              <Titulo nota="A dor que a oficina confirma, com os números firmes (14 de 22).">
                1. O problema
              </Titulo>
              <PizzaCard
                titulo="O problema é real?"
                subtitulo={`Base: ${statsOficina.avaliaramProblema} de ${statsOficina.realizadas} entrevistas que avaliaram o problema`}
                dados={oficinaProblema}
                vazio="Nenhuma entrevista avaliou o problema ainda."
              />
              <PizzaCard
                titulo="Já recusou serviço por causa do prazo?"
                subtitulo={`${statsOficina.recusas} das ${statsOficina.avaliaramProblema} oficinas que avaliaram já perderam serviço`}
                dados={oficinaRecusa}
                vazio="Sem recusas registradas até agora."
              />

              <Titulo nota="Como a oficina avisa e passa o prazo. É aqui que a conversa com o cliente trava.">
                2. Comunicação com o cliente
              </Titulo>
              <BarList
                titulo="Como o cliente é avisado hoje"
                subtitulo={`De ${canal.base} entrevistas que descreveram o aviso`}
                itens={canal.itens}
              />
              <BarList
                titulo="O aviso tem padrão?"
                subtitulo={`Mesma base da pergunta 4 (${padrao.base} entrevistas)`}
                itens={padrao.itens}
              />
              <BarList
                titulo="Como o prazo é passado"
                subtitulo="Por escrito = orçamento ou ordem de serviço"
                itens={prazo.itens}
              />

              <Titulo nota="O registro do carro e os apertos do dia a dia.">
                3. Como o serviço acontece hoje
              </Titulo>
              <BarList
                titulo="Check-in e sistemas"
                subtitulo={`Bases indicadas em cada linha · ${checkin.total} oficinas`}
                itens={checkin.itens}
              />
              <BarList
                titulo="O aperto do dia a dia"
                subtitulo="Leitura das respostas do roteiro"
                itens={aperto.itens}
              />

              <Titulo nota="Da entrevista realizada até a perda de serviço.">4. Funil</Titulo>
              <div className="lg:col-span-2">
                <BarList titulo="Funil da validação" itens={funil} />
              </div>
            </div>
          )}

          {aba === "cliente" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {temDemo && (
                <Card className="lg:col-span-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="solid">Demonstração</Badge>
                    <p className="text-sm text-ink-soft">
                      As {cliente.length} entrevistas do cliente final são{" "}
                      <strong className="font-semibold text-ink">
                        exemplos criados para mostrar como a página fica
                      </strong>
                      . Troque pelas respostas reais quando ouvir os clientes.
                    </p>
                  </div>
                </Card>
              )}

              <Card className="lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      Validação do cliente final
                    </h2>
                    <p className="mt-1 text-caption text-mid-gray">
                      {cliente.length} de {META_CLIENTE} entrevistas com motoristas
                    </p>
                  </div>
                  <Badge variant="outline">Meta {META_CLIENTE}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MiniStat
                    rotulo="Confirmam a falta de informação"
                    valor={`${statsCliente.percIdentificaram}%`}
                    detalhe={`${statsCliente.identificaramProblema} de ${statsCliente.avaliaramProblema}`}
                  />
                  <MiniStat
                    rotulo="Entendem o prazo"
                    valor={`${
                      statsCliente.porClienteEntendePrazos.find((f) => f.faixa === "sim")?.total ?? 0
                    }`}
                    detalhe={`de ${statsCliente.avaliaramProblema} · ${
                      statsCliente.porClienteEntendePrazos.find((f) => f.faixa === "parcial")?.total ?? 0
                    } entendem em parte`}
                  />
                  <MiniStat
                    rotulo="Já desistiram ou recusaram"
                    valor={`${statsCliente.recusas}`}
                    detalhe="por atraso ou falta de aviso"
                  />
                  <MiniStat
                    rotulo="Usariam o QR code"
                    valor={`${
                      clienteUsaria.find((d) => d.nome.includes("Usariam"))?.valor ?? 0
                    }`}
                    detalhe={`de ${cliente.length} clientes ouvidos`}
                  />
                </div>
              </Card>

              <Titulo nota="O que o motorista responde sobre a falta de informação hoje.">
                1. A dor do cliente final
              </Titulo>
              <PizzaCard
                titulo="Confirma a falta de informação?"
                subtitulo={`Base: ${statsCliente.avaliaramProblema} clientes que avaliaram`}
                dados={clienteProblema}
                vazio="Nenhum cliente final avaliou a dor ainda."
              />
              <PizzaCard
                titulo="Entende o prazo da oficina?"
                subtitulo={`Base: ${statsCliente.avaliaramProblema} clientes`}
                dados={clientePrazo}
                vazio="Nenhum cliente final respondeu sobre o prazo ainda."
              />
              <PizzaCard
                titulo="Já desistiu ou recusou um serviço?"
                subtitulo={`Base: ${statsCliente.avaliaramProblema} clientes`}
                dados={clienteRecusa}
                vazio="Nenhum cliente final respondeu sobre recusa ainda."
              />

              <Titulo nota="O que o cliente final responde sobre a solução por QR code.">
                2. A solução na visão do cliente
              </Titulo>
              <PizzaCard
                titulo="Usaria o QR code para acompanhar?"
                subtitulo={`Base: ${cliente.length} clientes ouvidos`}
                dados={clienteUsaria}
                vazio="Nenhum cliente final respondeu sobre o QR code ainda."
              />
              <BarList
                titulo="O que precisaria ver para confiar"
                subtitulo={`Menções em ${clienteConfianca.base} respostas`}
                itens={clienteConfianca.itens}
              />
              <BarList
                titulo="O que faria desistir de usar"
                subtitulo={`Menções em ${clienteDesistir.base} respostas`}
                itens={clienteDesistir.itens}
              />
              <BarList
                titulo="Pagaria algo pelo acompanhamento?"
                subtitulo={`Base: ${clientePagar.base} clientes · o cliente final não paga`}
                itens={clientePagar.itens}
              />

              {clienteFrases.length > 0 && (
                <Card className="lg:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-ink">
                        Frases do cliente final
                      </h3>
                      <p className="mt-1 text-caption text-mid-gray">
                        Respostas a "você confiaria mais em uma oficina que avisa o
                        andamento?"
                      </p>
                    </div>
                    <Link
                      href="/respostas"
                      className="text-caption font-medium text-ink underline underline-offset-2"
                    >
                      Ver todas as respostas
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {clienteFrases.map((f, i) => (
                      <blockquote
                        key={i}
                        className="rounded-cards border border-hairline bg-surface-alt p-3"
                      >
                        <p className="text-sm text-ink-soft">"{f.texto}"</p>
                        <p className="mt-2 text-caption text-mid-gray">{f.quem}</p>
                      </blockquote>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {aba === "amostra" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <PizzaCard
                titulo="Composição da amostra"
                subtitulo={`${entrevistas.length} entrevistas no total`}
                dados={composicao}
                vazio="Sem entrevistas."
                altura="h-56"
              />
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-ink">
                  Entrevistas por área
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porArea}>
                      <XAxis dataKey="nome" tickLine={false} axisLine={{ stroke: "#e5e5e5" }} tick={tickStyle} />
                      <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} tick={tickStyle} />
                      <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                      <Bar dataKey="total" name="Entrevistas" radius={[6, 6, 0, 0]}>
                        {porArea.map((d, i) => (
                          <Cell key={d.nome} fill={CORES[i % CORES.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-ink">
                  Entrevistas por porte
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porPorte}>
                      <XAxis dataKey="nome" tickLine={false} axisLine={{ stroke: "#e5e5e5" }} tick={tickStyle} />
                      <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} tick={tickStyle} />
                      <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                      <Bar dataKey="total" name="Entrevistas" fill="#0a0a0a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-ink">
                  Confirmação do problema por área
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confirmaPorArea}>
                      <XAxis dataKey="nome" tickLine={false} axisLine={{ stroke: "#e5e5e5" }} tick={tickStyle} />
                      <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} tick={tickStyle} />
                      <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                      <Bar dataKey="sim" name="Confirmam" stackId="a" fill="#15803d" />
                      <Bar dataKey="nao" name="Não confirmam" stackId="a" fill="#0a0a0a" />
                      <Bar dataKey="naoAvaliaram" name="Não avaliaram" stackId="a" fill="#e5e5e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-ink">
                  Recusa de serviço por responsável
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recusaPorResponsavel}>
                      <XAxis dataKey="nome" tickLine={false} axisLine={{ stroke: "#e5e5e5" }} tick={tickStyle} />
                      <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} tick={tickStyle} />
                      <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                      <Bar dataKey="sim" name="Já recusou" stackId="a" fill="#dc2626" />
                      <Bar dataKey="nao" name="Não recusou" stackId="a" fill="#0a0a0a" />
                      <Bar dataKey="incerto" name="Incerto" stackId="a" fill="#a3a3a3" />
                      <Bar dataKey="naoAvaliaram" name="Não avaliaram" stackId="a" fill="#e5e5e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-ink">
                  Indicações por responsável
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={indicacoes}>
                      <XAxis dataKey="nome" tickLine={false} axisLine={{ stroke: "#e5e5e5" }} tick={tickStyle} />
                      <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} tick={tickStyle} />
                      <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                      <Bar dataKey="total" name="Indicações" fill="#7C5AC8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-ink">
                  Taxa de resposta por pergunta
                </h3>
                <p className="mb-4 mt-1 text-caption text-mid-gray">
                  Roteiro da oficina · respondidas, não abordadas ou sem resposta
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taxaResposta}>
                      <XAxis dataKey="nome" tickLine={false} axisLine={{ stroke: "#e5e5e5" }} tick={tickStyle} />
                      <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} tick={tickStyle} />
                      <Tooltip
                        cursor={{ fill: "#f5f5f5" }}
                        contentStyle={tooltipStyle}
                        formatter={(v: number, _n, item) => [
                          `${v} entrevistas`,
                          (item?.payload as { texto?: string })?.texto ?? "",
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#737373" }} />
                      <Bar dataKey="respondidas" name="Respondidas" stackId="a" fill="#0a0a0a" isAnimationActive={false} />
                      <Bar dataKey="naoAbordadas" name="Não abordadas" stackId="a" fill="#a3a3a3" isAnimationActive={false} />
                      <Bar dataKey="semResposta" name="Sem resposta" stackId="a" fill="#e5e5e5" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-ink">
                  Entrevistas + pesquisa online
                </h3>
                <p className="mb-4 mt-1 text-caption text-mid-gray">
                  O que ouvimos nas oficinas, lado a lado com as pesquisas do setor
                </p>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {MERCADO.map((m) => (
                    <li key={m.dado + m.texto} className="rounded-cards border border-hairline bg-surface-alt p-3">
                      <p className="text-xl font-semibold text-ink">{m.dado}</p>
                      <p className="mt-1 text-sm text-ink-soft">{m.texto}</p>
                      <p className="mt-1 text-caption text-mid-gray">{m.fonte}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
