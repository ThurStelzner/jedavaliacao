"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
          Oficinas perdem tempo com check-in lento, falta de comunicação com o
          cliente e má gestão: o serviço encalha, o cliente fica sem resposta e a
          oficina perde produtividade.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-mid-gray">
          A causa é a gestão do dia a dia; a falta de comunicação é a consequência.{" "}
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
        <Stat label="Perderam serviço por prazo" value={String(stats.recusas)} />
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
