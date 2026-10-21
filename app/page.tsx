"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { apiList } from "@/lib/api";
import {
  calcStats,
  META_ENTREVISTAS,
  META_PERC_PROBLEMA,
  proximosPassos,
} from "@/lib/stats";
import type { Entrevista, Lembrete, Tarefa } from "@/lib/types";
import { publicoDe } from "@/lib/validacao";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";

export default function DashboardPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const [e, t, l] = await Promise.all([
        apiList<Entrevista>("entrevistas"),
        apiList<Tarefa>("tarefas"),
        apiList<Lembrete>("lembretes"),
      ]);
      if (!ativo) return;
      setEntrevistas(e);
      setTarefas(t);
      setLembretes(l);
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

  const reais = useMemo(() => entrevistas.filter((e) => !e.exemplo), [entrevistas]);
  const oficina = useMemo(() => reais.filter((e) => publicoDe(e) === "oficina"), [reais]);
  const clientes = useMemo(() => reais.filter((e) => publicoDe(e) === "cliente"), [reais]);
  const stats = useMemo(() => calcStats(oficina), [oficina]);
  const passos = useMemo(() => proximosPassos(stats).slice(0, 4), [stats]);

  const checkin = useMemo(() => {
    const mapa = { verbal: 0, papel: 0, sistema: 0 };
    for (const e of oficina) {
      if (e.checkin === "verbal") mapa.verbal += 1;
      else if (e.checkin === "papel") mapa.papel += 1;
      else if (e.checkin === "sistema") mapa.sistema += 1;
    }
    const base = mapa.verbal + mapa.papel + mapa.sistema;
    return { ...mapa, base, semRegistro: mapa.verbal + mapa.papel };
  }, [oficina]);

  const tarefasAbertas = tarefas
    .filter((t) => t.status !== "concluida")
    .sort((a, b) => {
      const peso = { alta: 0, media: 1, baixa: 2 } as const;
      return peso[a.prioridade] - peso[b.prioridade];
    });
  const lembretesAtivos = lembretes.filter((l) => l.ativo);

  if (carregando) {
    return <PageHeader title="Dashboard" subtitle="Carregando..." />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Validação do problema com oficinas mecânicas · atualiza automaticamente${atualizadoEm ? ` (última: ${atualizadoEm})` : ""}`}
        right={
          <Badge variant={stats.validado ? "solid" : "outline"}>
            {stats.validado ? "Problema validado" : "Em validação"}
          </Badge>
        }
      />

      <Card className="mb-4">
        <p className="max-w-4xl text-subheading font-semibold leading-snug text-ink md:text-heading-sm">
          Oficinas mecânicas perdem tempo porque não têm organização: o check-in é
          verbal ou no papel, o andamento do serviço fica na cabeça e o cliente só
          é avisado quando cobra.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-mid-gray">
          <Link
            href="/analise"
            className="font-medium text-ink underline underline-offset-2"
          >
            Ver a análise completa
          </Link>
          .
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Stat
          label="Entrevistas realizadas"
          value={`${stats.realizadas}/${META_ENTREVISTAS}`}
        />
        <Stat
          label="Confirmam o problema"
          value={`${stats.percIdentificaram}%`}
        />
        <Stat label="Perderam serviço" value={String(stats.recusas)} />
        <Stat label="Tarefas abertas" value={String(tarefasAbertas.length)} />
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">
            Onde estamos na validação
          </p>
          <p className="text-caption text-mid-gray">
            meta: {META_ENTREVISTAS} entrevistas + {META_PERC_PROBLEMA}% de confirmação
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${stats.percMeta}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {stats.realizadas} de {META_ENTREVISTAS} entrevistas ·{" "}
          {stats.identificaramProblema} de {stats.avaliaramProblema} confirmam (
          {stats.percIdentificaram}%) · {clientes.length} de 10 clientes finais
          ouvidos
        </p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">
            Da entrevista à confirmação
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            Base: {stats.realizadas} entrevistas realizadas
          </p>
          <div className="mt-4 space-y-3">
            {[
              {
                nome: "Entrevistadas",
                valor: stats.realizadas,
                largura: 100,
              },
              {
                nome: "Responderam ao critério",
                valor: stats.avaliaramProblema,
                largura:
                  stats.realizadas > 0
                    ? Math.round(
                        (stats.avaliaramProblema / stats.realizadas) * 100,
                      )
                    : 0,
              },
              {
                nome: "Confirmam o problema",
                valor: stats.identificaramProblema,
                largura:
                  stats.realizadas > 0
                    ? Math.round(
                        (stats.identificaramProblema / stats.realizadas) * 100,
                      )
                    : 0,
              },
            ].map((etapa) => (
              <div key={etapa.nome}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink-soft">{etapa.nome}</span>
                  <span className="font-medium text-ink">{etapa.valor}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${etapa.largura}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            Como o check-in é feito
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            Base: {checkin.base} entrevistas que responderam
          </p>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { nome: "Verbal", valor: checkin.verbal },
                  { nome: "Papel", valor: checkin.papel },
                  { nome: "Sistema", valor: checkin.sistema },
                ]}
                layout="vertical"
                margin={{ left: 4, right: 24 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#737373", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={80}
                  tick={{ fill: "#737373", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar
                  dataKey="valor"
                  fill="#0a0a0a"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                >
                  <LabelList
                    dataKey="valor"
                    position="right"
                    style={{ fill: "#0a0a0a", fontSize: 12, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-caption text-mid-gray">
            {checkin.semRegistro} de {checkin.base} não têm registro formal (verbal
            ou papel).
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Próximos passos</h2>
            <Link
              href="/analise"
              className="text-caption text-mid-gray underline underline-offset-2 hover:text-ink"
            >
              detalhes
            </Link>
          </div>
          {passos.length === 0 ? (
            <div className="mt-3">
              <EmptyState>Nada pendente por aqui.</EmptyState>
            </div>
          ) : (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
              {passos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Tarefas em aberto</h2>
            <Link
              href="/tarefas"
              className="text-caption text-mid-gray underline underline-offset-2 hover:text-ink"
            >
              todas
            </Link>
          </div>
          {tarefasAbertas.length === 0 ? (
            <div className="mt-3">
              <EmptyState>Nenhuma tarefa em aberto.</EmptyState>
            </div>
          ) : (
            <ul className="mt-3 text-sm">
              {tarefasAbertas.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-3 border-b border-hairline py-2 first:pt-0 last:border-0 last:pb-0"
                >
                  <Badge variant={t.prioridade === "alta" ? "solid" : "soft"}>
                    {t.prioridade === "alta"
                      ? "Alta"
                      : t.prioridade === "media"
                        ? "Média"
                        : "Baixa"}
                  </Badge>
                  <span className="text-ink-soft">{t.titulo}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {lembretesAtivos.length > 0 && (
        <details className="mt-4 rounded-cards border border-hairline bg-paper p-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
            Lembretes do projeto
            <span className="ml-2 text-caption font-normal text-mid-gray">
              {lembretesAtivos.length} ativos
            </span>
          </summary>
          <ul className="mt-4 text-sm">
            {lembretesAtivos.map((l) => (
              <li
                key={l.id}
                className="flex items-start gap-3 border-b border-hairline py-2 first:pt-0 last:border-0 last:pb-0"
              >
                <Badge variant={l.tipo === "critico" ? "solid" : "outline"}>
                  {l.tipo === "critico" ? "Crítico" : "Atenção"}
                </Badge>
                <span className="text-ink-soft">{l.texto}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
