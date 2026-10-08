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
import { calcStats, proximosPassos } from "@/lib/stats";
import type { Contato, Entrevista, Lembrete, Tarefa } from "@/lib/types";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";

const CORES_STATUS: Record<string, string> = {
  planejada: "#a3a3a3",
  agendada: "#737373",
  realizada: "#0a0a0a",
};

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

export default function DashboardPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [e, t, l, c] = await Promise.all([
        apiList<Entrevista>("entrevistas"),
        apiList<Tarefa>("tarefas"),
        apiList<Lembrete>("lembretes"),
        apiList<Contato>("contatos"),
      ]);
      setEntrevistas(e);
      setTarefas(t);
      setLembretes(l);
      setContatos(c);
      setCarregando(false);
    }
    carregar();
  }, []);

  const stats = useMemo(() => calcStats(entrevistas), [entrevistas]);
  const passos = useMemo(() => proximosPassos(stats), [stats]);

  const tarefasPendentes = tarefas.filter((t) => t.status !== "concluida").length;
  const contatosDisponiveis = contatos.filter(
    (c) => c.status !== "entrevistado" && c.status !== "sem_interesse",
  ).length;
  const lembretesAtivos = lembretes.filter((l) => l.ativo);

  const dadosStatus = stats.porStatus.map((s) => ({
    nome: s.status,
    total: s.total,
  }));

  const dadosProblema = [
    { nome: "Identificou o problema", valor: stats.identificaramProblema },
    {
      nome: "Não identificou",
      valor: Math.max(stats.realizadas - stats.identificaramProblema, 0),
    },
  ];

  if (carregando) {
    return <PageHeader title="Dashboard" subtitle="Carregando..." />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da validação do problema"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Stat
          label="Entrevistas realizadas"
          value={`${stats.realizadas}/${stats.total}`}
        />
        <Stat label="Empresas entrevistadas" value={String(stats.empresasEntrevistadas)} />
        <Stat label="RHs entrevistados" value={String(stats.rhEntrevistados)} />
        <Stat label="Indicações obtidas" value={String(stats.indicacoes)} />
        <Stat label="Identificaram o problema" value={`${stats.percIdentificaram}%`} />
        <Stat label="Apontaram outro problema" value={`${stats.percOutroProblema}%`} />
        <Stat label="Contatos disponíveis" value={String(contatosDisponiveis)} />
        <Stat label="Tarefas pendentes" value={String(tarefasPendentes)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Entrevistas por status
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosStatus}>
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
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {dadosStatus.map((s) => (
                    <Cell key={s.nome} fill={CORES_STATUS[s.nome] ?? "#737373"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            O problema foi identificado?
          </h2>
          {stats.realizadas === 0 ? (
            <EmptyState>Sem entrevistas realizadas ainda.</EmptyState>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosProblema}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={80}
                    label={{
                      fill: "#737373",
                      fontSize: 12,
                    }}
                  >
                    <Cell fill="#0a0a0a" />
                    <Cell fill="#e5e5e5" />
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
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Médias dos processos seletivos
          </h2>
          <ul className="text-sm">
            <li className="flex items-center justify-between gap-3 border-b border-hairline py-2.5 first:pt-0">
              <span className="text-mid-gray">Tempo médio do processo seletivo</span>
              <strong className="font-medium text-ink">
                {stats.tempoMedioHoras !== null ? `${stats.tempoMedioHoras} h` : "—"}
              </strong>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-hairline py-2.5">
              <span className="text-mid-gray">Currículos por abertura de vaga</span>
              <strong className="font-medium text-ink">
                {stats.mediaCurriculos !== null ? stats.mediaCurriculos : "—"}
              </strong>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
              <span className="text-mid-gray">Passam do período de experiência</span>
              <strong className="font-medium text-ink">
                {stats.percMediaExperiencia !== null
                  ? `${stats.percMediaExperiencia}%`
                  : "—"}
              </strong>
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Principais gargalos (pergunta 2)
          </h2>
          {stats.gargalos.length === 0 ? (
            <EmptyState>Ainda sem gargalos registrados.</EmptyState>
          ) : (
            <ul className="text-sm">
              {stats.gargalos.map((g, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 border-b border-hairline py-2.5 first:pt-0 last:border-0 last:pb-0"
                >
                  <span className="text-ink-soft">{g.texto}</span>
                  <Badge variant="soft">{g.quantidade}x</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">Próximos passos</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            {passos.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Lembretes importantes
          </h2>
          {lembretesAtivos.length === 0 ? (
            <EmptyState>Nenhum lembrete ativo.</EmptyState>
          ) : (
            <ul className="text-sm">
              {lembretesAtivos.map((l) => (
                <li
                  key={l.id}
                  className="flex items-start gap-3 border-b border-hairline py-2.5 first:pt-0 last:border-0 last:pb-0"
                >
                  <Badge variant={l.tipo === "critico" ? "solid" : "outline"}>
                    {l.tipo === "critico" ? "Crítico" : "Atenção"}
                  </Badge>
                  <span className="text-ink-soft">{l.texto}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
