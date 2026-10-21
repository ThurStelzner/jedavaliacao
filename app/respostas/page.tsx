"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiList } from "@/lib/api";
import { calcStats } from "@/lib/stats";
import type { Entrevista, Pergunta, Publico } from "@/lib/types";
import {
  META_CLIENTE,
  perguntasDoPublico,
  publicoDe,
  ROTULOS_PUBLICO,
} from "@/lib/validacao";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Select,
} from "@/components/ui";

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

export default function RespostasPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [lado, setLado] = useState<Publico>("oficina");
  const [responsavel, setResponsavel] = useState<string>("todos");

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
    }
    carregar();
    const id = setInterval(carregar, 15000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  const oficina = useMemo(
    () => entrevistas.filter((e) => publicoDe(e) === "oficina"),
    [entrevistas],
  );
  const cliente = useMemo(
    () => entrevistas.filter((e) => publicoDe(e) === "cliente"),
    [entrevistas],
  );
  const statsOficina = useMemo(() => calcStats(oficina), [oficina]);
  const statsCliente = useMemo(() => calcStats(cliente), [cliente]);

  const doLado = lado === "oficina" ? oficina : cliente;
  const stats = lado === "oficina" ? statsOficina : statsCliente;
  const perguntasDoLado = perguntasDoPublico(perguntas, lado);

  const responsaveis = useMemo(
    () =>
      Array.from(
        new Set(doLado.map((e) => (e.responsavel || "").trim()).filter(Boolean)),
      ).sort(),
    [doLado],
  );

  const visiveis = useMemo(
    () =>
      responsavel === "todos"
        ? doLado
        : doLado.filter((e) => (e.responsavel || "").trim() === responsavel),
    [doLado, responsavel],
  );

  if (carregando) {
    return <PageHeader title="Respostas" subtitle="Carregando..." />;
  }

  function mudarLado(novo: Publico) {
    setLado(novo);
    setResponsavel("todos");
  }

  return (
    <div>
      <PageHeader
        title="Respostas"
        subtitle={`O que ${oficina.length} oficinas e ${cliente.length} clientes finais responderam`}
        right={
          lado === "oficina" ? (
            <Select
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-44"
              aria-label="Filtrar por responsável"
            >
              <option value="todos">Todos ({doLado.length})</option>
              {responsaveis.map((r) => (
                <option key={r} value={r}>
                  {r} (
                  {
                    doLado.filter((e) => (e.responsavel || "").trim() === r)
                      .length
                  }
                  )
                </option>
              ))}
            </Select>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={lado === "oficina" ? "primary" : "outline"}
          onClick={() => mudarLado("oficina")}
        >
          Oficina ({oficina.length})
        </Button>
        <Button
          variant={lado === "cliente" ? "primary" : "outline"}
          onClick={() => mudarLado("cliente")}
        >
          Cliente final ({cliente.length})
        </Button>
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              {ROTULOS_PUBLICO[lado].nome}
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              {ROTULOS_PUBLICO[lado].descricao}
            </p>
          </div>
          <Badge variant={lado === "oficina" ? "solid" : "outline"}>
            {lado === "oficina"
              ? `${oficina.length} entrevistas`
              : `${cliente.length} de ${META_CLIENTE} entrevistas`}
          </Badge>
        </div>

        {lado === "oficina" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniStat
              rotulo="Confirmam o problema"
              valor={`${stats.percIdentificaram}%`}
              detalhe={`${stats.identificaramProblema} de ${stats.avaliaramProblema} que avaliaram`}
            />
            <MiniStat
              rotulo="Já perderam serviço"
              valor={`${stats.recusas}`}
              detalhe={`por prazo ou falta de informação · de ${stats.avaliaramProblema} que avaliaram`}
            />
            <MiniStat
              rotulo="Entrevistas realizadas"
              valor={`${stats.realizadas}`}
              detalhe="base de oficina"
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniStat
              rotulo="Entrevistas"
              valor={`${cliente.length}`}
              detalhe={`meta: ${META_CLIENTE}`}
            />
            <MiniStat
              rotulo="Confirmaram a falta de informação"
              valor={`${statsCliente.percIdentificaram}%`}
              detalhe={`${statsCliente.identificaramProblema} de ${statsCliente.avaliaramProblema}`}
            />
            <MiniStat
              rotulo="Já desistiram ou recusaram"
              valor={`${statsCliente.recusas}`}
              detalhe="por falta de informação ou aviso"
            />
          </div>
        )}
      </Card>

      {lado === "oficina" && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Como ler estas respostas
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                O que está firme no levantamento e o que ainda precisa de base
              </p>
            </div>
            <Badge variant="soft">Transparência</Badge>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            <strong className="font-semibold text-ink">64%</strong> confirmam o
            problema (14 de 22 entrevistas completas de oficina) e{" "}
            <strong className="font-semibold text-ink">32%</strong> já perderam
            serviço por prazo ou falta de informação (7 de 22). Os números de 91%,
            63%, 11% e 36%, e o &quot;5 de 5 usariam uma solução online&quot;, ainda
            precisam ter a base confirmada.
          </p>
          <p className="mt-2 text-caption text-mid-gray">
            As 5 respostas da avaliação estão na página{" "}
            <Link href="/pitch" className="font-medium text-ink underline">
              Pitch
            </Link>
            . Toque em cada entrevista para abrir as respostas.
          </p>
        </Card>
      )}

      {visiveis.length === 0 ? (
        <EmptyState>Nenhuma entrevista para exibir neste lado.</EmptyState>
      ) : (
        <div className="space-y-2">
          {visiveis.map((e) => {
            const respondidas = perguntasDoLado.filter((p) =>
              e.respostas.some(
                (r) => r.perguntaId === p.id && r.resposta.trim(),
              ),
            );
            const orfas = e.respostas.filter(
              (r) =>
                !perguntasDoLado.some((p) => p.id === r.perguntaId) &&
                r.resposta.trim(),
            );
            return (
              <details
                key={e.id}
                className="group rounded-cards border border-hairline bg-paper shadow-subtle"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold text-ink">
                      {e.nomeEntrevistado || "(sem nome)"}
                      {e.empresa ? (
                        <span className="font-normal text-mid-gray">
                          {" "}
                          — {e.empresa}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-caption text-mid-gray">
                      {[e.cargo, e.data].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="hidden flex-wrap items-center gap-2 sm:flex">
                    {e.identificouProblema && (
                      <Badge variant="solid">
                        {lado === "cliente"
                          ? "confirmou a dor"
                          : "identificou o problema"}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {respondidas.length} respostas
                    </Badge>
                  </span>
                  <span
                    aria-hidden
                    className="text-lg leading-none text-mid-gray transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <div className="border-t border-hairline px-4 pb-4 pt-3">
                  <div className="mb-3 flex flex-wrap items-center gap-2 sm:hidden">
                    {e.identificouProblema && (
                      <Badge variant="solid">
                        {lado === "cliente"
                          ? "confirmou a dor"
                          : "identificou o problema"}
                      </Badge>
                    )}
                  </div>

                  {respondidas.length === 0 ? (
                    <p className="text-sm text-mid-gray">
                      Nenhuma resposta registrada para este lado.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {respondidas.map((p, i) => {
                        const r = e.respostas.find(
                          (x) => x.perguntaId === p.id,
                        )?.resposta;
                        return (
                          <div key={p.id} className="text-sm">
                            <p className="font-medium text-ink">
                              {i + 1}. {p.texto}
                            </p>
                            <p className="mt-0.5 text-ink-soft">{r}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {orfas.map((r) => (
                    <div key={r.perguntaId} className="mt-3 text-sm">
                      <p className="font-medium text-ink">Pergunta removida</p>
                      <p className="mt-0.5 text-ink-soft">{r.resposta}</p>
                    </div>
                  ))}

                  {e.anotacoes && (
                    <div className="mt-3 text-sm">
                      <p className="font-medium text-ink">Anotações</p>
                      <p className="mt-0.5 text-ink-soft">{e.anotacoes}</p>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
