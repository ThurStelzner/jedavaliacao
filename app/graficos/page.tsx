"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiList } from "@/lib/api";
import { avaliouProblema, calcStats } from "@/lib/stats";
import type { Entrevista, Pergunta } from "@/lib/types";
import { Card, EmptyState, PageHeader } from "@/components/ui";

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

const CORES_STATUS: Record<string, string> = {
  planejada: "#d4d4d4",
  agendada: "#737373",
  realizada: "#0a0a0a",
};

const CORES_PRAZO = {
  sim: "#7C5AC8",
  parcial: "#a78bfa",
  nao: "#0a0a0a",
  naoInformado: "#d4d4d4",
  naoAvaliaram: "#e5e5e5",
};

const CORES_RECUSA = {
  sim: "#dc2626",
  nao: "#0a0a0a",
  incerto: "#a3a3a3",
  naoInformado: "#d4d4d4",
  naoAvaliaram: "#e5e5e5",
};

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
  const realizadas = useMemo(
    () => entrevistas.filter((e) => e.status === "realizada"),
    [entrevistas],
  );

  // 1) Entrevistas por dia + acumulado
  const porDia = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of realizadas) {
      const d = (e.data || "").trim();
      if (!d) continue;
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    let acc = 0;
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dia, total]) => {
        acc += total;
        return { dia: dia.slice(5), total, acumulado: acc };
      });
  }, [realizadas]);

  // 2) Status
  const porStatus = useMemo(
    () =>
      ["planejada", "agendada", "realizada"].map((s) => ({
        nome: s,
        valor: entrevistas.filter((e) => e.status === s).length,
      })),
    [entrevistas],
  );

  // 3) Por responsável
  const porResponsavel = useMemo(
    () =>
      stats.porResponsavel.map((d) => ({ nome: d.responsavel, total: d.total })),
    [stats],
  );

  // 4) Por porte
  const porPorte = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entrevistas) {
      const p = e.porte || "Não informado";
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([nome, total]) => ({ nome, total }));
  }, [entrevistas]);

  // 5) Por área
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

  // 6) Entendimento do prazo por responsável (empilhado)
  const prazoPorResponsavel = useMemo(() => {
    const map = new Map<
      string,
      {
        sim: number;
        parcial: number;
        nao: number;
        naoInformado: number;
        naoAvaliaram: number;
      }
    >();
    for (const e of realizadas) {
      const r = (e.responsavel || "Não informado").trim() || "Não informado";
      const atual =
        map.get(r) ??
        { sim: 0, parcial: 0, nao: 0, naoInformado: 0, naoAvaliaram: 0 };
      if (!avaliouProblema(e)) atual.naoAvaliaram += 1;
      else if (e.clienteEntendePrazos === "sim") atual.sim += 1;
      else if (e.clienteEntendePrazos === "parcial") atual.parcial += 1;
      else if (e.clienteEntendePrazos === "nao") atual.nao += 1;
      else atual.naoInformado += 1;
      map.set(r, atual);
    }
    return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [realizadas]);

  // 7) Recusa por responsável (empilhado)
  const recusaPorResponsavel = useMemo(() => {
    const map = new Map<
      string,
      {
        sim: number;
        nao: number;
        incerto: number;
        naoInformado: number;
        naoAvaliaram: number;
      }
    >();
    for (const e of realizadas) {
      const r = (e.responsavel || "Não informado").trim() || "Não informado";
      const atual =
        map.get(r) ??
        { sim: 0, nao: 0, incerto: 0, naoInformado: 0, naoAvaliaram: 0 };
      if (!avaliouProblema(e)) atual.naoAvaliaram += 1;
      else if (e.recusouServico === "sim") atual.sim += 1;
      else if (e.recusouServico === "incerto") atual.incerto += 1;
      else if (e.recusouServico === "nao") atual.nao += 1;
      else atual.naoInformado += 1;
      map.set(r, atual);
    }
    return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [realizadas]);

  // 8) Indicações por responsável
  const indicacoesPorResponsavel = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of realizadas) {
      const r = (e.responsavel || "Não informado").trim() || "Não informado";
      const n = e.indicacoes.filter((i) => i.trim()).length;
      map.set(r, (map.get(r) ?? 0) + n);
    }
    return Array.from(map.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [realizadas]);

  // 9) Taxa de resposta por pergunta
  const respostaPorPergunta = useMemo(
    () =>
      perguntas.map((p, i) => {
        const respondidas = realizadas.filter((e) => {
          const r = e.respostas.find((x) => x.perguntaId === p.id)?.resposta ?? "";
          return r.trim() && !r.startsWith("Não abordado");
        }).length;
        return { nome: `P${i + 1}`, respondidas, texto: p.texto };
      }),
    [perguntas, realizadas],
  );

  // 10) Confirmam por porte (empilhado)
  const problemaPorPorte = useMemo(() => {
    const map = new Map<
      string,
      { sim: number; nao: number; naoAvaliaram: number }
    >();
    for (const e of realizadas) {
      const p = e.porte || "Não informado";
      const atual = map.get(p) ?? { sim: 0, nao: 0, naoAvaliaram: 0 };
      if (!avaliouProblema(e)) atual.naoAvaliaram += 1;
      else if (e.identificouProblema) atual.sim += 1;
      else atual.nao += 1;
      map.set(p, atual);
    }
    return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }));
  }, [realizadas]);

  // 11) Funil de validação
  const funil = useMemo(() => {
    const base = stats.realizadas || 1;
    return [
      { rotulo: "Entrevistas realizadas", valor: stats.realizadas, cor: "#0a0a0a" },
      {
        rotulo: "Avaliaram o problema de prazo",
        valor: stats.avaliaramProblema,
        cor: "#7C5AC8",
      },
      {
        rotulo: "Confirmam o problema",
        valor: stats.identificaramProblema,
        cor: "#15803d",
      },
      {
        rotulo: "Já perderam serviço por prazo",
        valor: stats.recusas,
        cor: "#dc2626",
      },
    ].map((f) => ({ ...f, perc: Math.round((f.valor / base) * 100) }));
  }, [stats]);

  if (carregando) {
    return <PageHeader title="Gráficos" subtitle="Carregando..." />;
  }

  const semDados = entrevistas.length === 0;

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
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Entrevistas realizadas por dia (barras) e acumulado (linha)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={porDia}>
                  <XAxis
                    dataKey="dia"
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
                  <Bar
                    dataKey="total"
                    name="No dia"
                    fill="#0a0a0a"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="acumulado"
                    name="Acumulado"
                    stroke="#7C5AC8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#7C5AC8" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Status das entrevistas
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porStatus}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={85}
                    label={{ fill: "#737373", fontSize: 12 }}
                  >
                    {porStatus.map((s) => (
                      <Cell key={s.nome} fill={CORES_STATUS[s.nome] ?? "#737373"} />
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
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Entrevistas realizadas por responsável
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porResponsavel}>
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
                  <Bar dataKey="total" fill="#0a0a0a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Entrevistas por porte da empresa
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porPorte}>
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
                  <Bar dataKey="total" fill="#7C5AC8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Entrevistas por área do entrevistado
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porArea} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={tickStyle} />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={150}
                    tickLine={false}
                    axisLine={false}
                    tick={tickStyle}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="#0a0a0a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Entendimento do prazo por responsável
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prazoPorResponsavel}>
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
                  <Bar dataKey="sim" name="Entende" stackId="a" fill={CORES_PRAZO.sim} />
                  <Bar
                    dataKey="parcial"
                    name="Parcial"
                    stackId="a"
                    fill={CORES_PRAZO.parcial}
                  />
                  <Bar
                    dataKey="nao"
                    name="Não entende"
                    stackId="a"
                    fill={CORES_PRAZO.nao}
                  />
                  <Bar
                    dataKey="naoInformado"
                    name="Não informado"
                    stackId="a"
                    fill={CORES_PRAZO.naoInformado}
                  />
                  <Bar
                    dataKey="naoAvaliaram"
                    name="Não avaliaram"
                    stackId="a"
                    fill={CORES_PRAZO.naoAvaliaram}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Recusa de serviço por prazo, por responsável
            </h2>
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
                  <Bar
                    dataKey="sim"
                    name="Recusou"
                    stackId="a"
                    fill={CORES_RECUSA.sim}
                  />
                  <Bar
                    dataKey="nao"
                    name="Não recusou"
                    stackId="a"
                    fill={CORES_RECUSA.nao}
                  />
                  <Bar
                    dataKey="incerto"
                    name="Incerto"
                    stackId="a"
                    fill={CORES_RECUSA.incerto}
                  />
                  <Bar
                    dataKey="naoInformado"
                    name="Não informado"
                    stackId="a"
                    fill={CORES_RECUSA.naoInformado}
                  />
                  <Bar
                    dataKey="naoAvaliaram"
                    name="Não avaliaram"
                    stackId="a"
                    fill={CORES_RECUSA.naoAvaliaram}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Indicações obtidas por responsável
            </h2>
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
                  <Bar dataKey="total" fill="#7C5AC8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
              Taxa de resposta por pergunta
            </h2>
            <p className="mb-4 text-caption text-mid-gray">
              Quantas entrevistas responderam cada pergunta do roteiro
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
                  <Bar dataKey="respondidas" fill="#0a0a0a" radius={[6, 6, 0, 0]} />
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
              Da entrevista realizada até a perda de serviço
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
        </div>
      )}
    </div>
  );
}
