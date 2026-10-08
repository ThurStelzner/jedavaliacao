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
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

const CORES = ["#64748b", "#eab308", "#22c55e", "#3b82f6", "#ef4444"];

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
        title="🏠 Dashboard"
        subtitle="Visão geral da validação do problema"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi titulo="Entrevistas realizadas" valor={`${stats.realizadas}/${stats.total}`} />
        <Kpi titulo="Empresas entrevistadas" valor={String(stats.empresasEntrevistadas)} />
        <Kpi titulo="RHs entrevistados" valor={String(stats.rhEntrevistados)} />
        <Kpi titulo="Indicações obtidas" valor={String(stats.indicacoes)} />
        <Kpi titulo="Identificaram o problema" valor={`${stats.percIdentificaram}%`} />
        <Kpi titulo="Apontaram outro problema" valor={`${stats.percOutroProblema}%`} />
        <Kpi titulo="Contatos disponíveis" valor={String(contatosDisponiveis)} />
        <Kpi titulo="Tarefas pendentes" valor={String(tarefasPendentes)} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Entrevistas por status
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosStatus}>
                <XAxis dataKey="nome" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {dadosStatus.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
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
                    label
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#cbd5e1" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            📊 Médias dos processos seletivos
          </h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex justify-between border-b border-slate-100 pb-1">
              <span>Tempo médio do processo seletivo</span>
              <strong>
                {stats.tempoMedioHoras !== null ? `${stats.tempoMedioHoras} h` : "—"}
              </strong>
            </li>
            <li className="flex justify-between border-b border-slate-100 pb-1">
              <span>Currículos por abertura de vaga</span>
              <strong>{stats.mediaCurriculos !== null ? stats.mediaCurriculos : "—"}</strong>
            </li>
            <li className="flex justify-between">
              <span>Passam do período de experiência</span>
              <strong>
                {stats.percMediaExperiencia !== null
                  ? `${stats.percMediaExperiencia}%`
                  : "—"}
              </strong>
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            🔎 Principais gargalos (pergunta 2)
          </h2>
          {stats.gargalos.length === 0 ? (
            <EmptyState>Ainda sem gargalos registrados.</EmptyState>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.gargalos.map((g, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span className="text-slate-700">{g.texto}</span>
                  <Badge color="blue">{g.quantidade}x</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">🧭 Próximos passos</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
            {passos.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">🚨 Lembretes importantes</h2>
          {lembretesAtivos.length === 0 ? (
            <EmptyState>Nenhum lembrete ativo.</EmptyState>
          ) : (
            <ul className="space-y-2 text-sm">
              {lembretesAtivos.map((l) => (
                <li key={l.id} className="flex items-start gap-2">
                  <span>{l.tipo === "critico" ? "🔴" : "🟡"}</span>
                  <span className="text-slate-700">{l.texto}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Card>
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{valor}</p>
    </Card>
  );
}
