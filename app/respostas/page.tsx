"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiList } from "@/lib/api";
import { calcStats } from "@/lib/stats";
import type { Entrevista, Pergunta, Publico } from "@/lib/types";
import {
  META_CLIENTE,
  perguntasDoBloco,
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
        subtitle="O que a oficina já respondeu e o que ainda falta ouvir do cliente final"
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
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Confirmam o problema</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {stats.percIdentificaram}%
              </p>
              <p className="mt-1 text-caption text-mid-gray">
                {stats.identificaramProblema} de {stats.avaliaramProblema}
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
                de {stats.avaliaramProblema} que avaliaram
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Cliente entende o prazo</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {stats.porClienteEntendePrazos
                  .filter((f) => ["sim", "parcial", "nao"].includes(f.faixa))
                  .map((f) => `${f.faixa}: ${f.total}`)
                  .join(" · ")}
              </p>
              <p className="mt-1 text-caption text-mid-gray">
                sim · parcial · não
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Aviso ao cliente</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                Sem padrão / manual
              </p>
              <p className="mt-1 text-caption text-mid-gray">
                ver detalhes em Gráficos
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Entrevistas</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {cliente.length}
              </p>
              <p className="mt-1 text-caption text-mid-gray">
                meta: {META_CLIENTE}
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Confirmaram a dor</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {statsCliente.identificaramProblema}
              </p>
              <p className="mt-1 text-caption text-mid-gray">
                de {statsCliente.avaliaramProblema} que avaliaram
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Status</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                A iniciar
              </p>
              <p className="mt-1 text-caption text-mid-gray">
                roteiro pronto na página Perguntas
              </p>
            </div>
          </div>
        )}
      </Card>

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
          serviço por prazo (7 de 22).
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Os números de 91%, 63%, 11% e 36%, e o &quot;5 de 5 usariam uma solução
          online&quot;, ainda precisam ter a base de cálculo confirmada.
        </p>
        <p className="mt-2 text-caption text-mid-gray">
          As 5 respostas da avaliação estão na página{" "}
          <Link href="/pitch" className="font-medium text-ink underline">
            Pitch
          </Link>
          . Abaixo estão as respostas de cada entrevista, por lado.
        </p>
      </Card>

      {lado === "cliente" && cliente.length === 0 ? (
        <>
          <Card className="mb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Ainda não ouvimos o cliente final
                </h2>
                <p className="mt-1 text-caption text-mid-gray">
                  A validação de 26 entrevistas foi feita com donos, gerentes e
                  mecânicos. Falta ouvir quem recebe o acompanhamento.
                </p>
              </div>
              <Badge variant="outline">Pendente</Badge>
            </div>
            <Link
              href="/entrevistas"
              className="mt-4 inline-flex h-9 items-center rounded-buttons bg-ink px-3 text-sm font-medium text-[#fafafa] transition-colors hover:bg-ink-soft"
            >
              Registrar entrevista com cliente
            </Link>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-ink">
              Roteiro do cliente final
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              {META_CLIENTE} entrevistas curtas, na saída da oficina ou por
              indicação.
            </p>
            {(["problema", "solucao"] as const).map((rodada) => {
              const bloco = perguntasDoBloco(perguntas, "cliente", rodada);
              return (
                <div key={rodada} className="mt-4">
                  <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
                    {rodada === "problema" ? "Problema" : "Solução"}
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
                    {bloco.map((p) => (
                      <li key={p.id}>{p.texto}</li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </Card>
        </>
      ) : visiveis.length === 0 ? (
        <EmptyState>Nenhuma entrevista para exibir neste lado.</EmptyState>
      ) : (
        <div className="space-y-4">
          {visiveis.map((e) => {
            const respondidas = perguntasDoLado.filter((p) =>
              e.respostas.some(
                (r) => r.perguntaId === p.id && r.resposta.trim(),
              ),
            );
            return (
              <Card key={e.id}>
                <div className="border-b border-hairline pb-3">
                  <p className="text-body font-semibold text-ink">
                    {e.nomeEntrevistado || "(sem nome)"}{" "}
                    <span className="font-normal text-mid-gray">
                      — {e.empresa || "empresa não informada"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-caption text-mid-gray">
                    {[e.cargo, e.data || null].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="soft">
                      {publicoDe(e) === "cliente" ? "Cliente final" : "Oficina"}
                    </Badge>
                    {(e.responsavel || "").trim() && (
                      <Badge variant="outline">{e.responsavel}</Badge>
                    )}
                    {e.identificouProblema && (
                      <Badge variant="solid">
                        {publicoDe(e) === "cliente"
                          ? "confirmou a dor"
                          : "identificou o problema"}
                      </Badge>
                    )}
                  </div>
                </div>

                {respondidas.length === 0 ? (
                  <p className="mt-3 text-sm text-mid-gray">
                    Nenhuma resposta registrada para este lado.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
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

                {e.respostas
                  .filter(
                    (r) =>
                      !perguntasDoLado.some((p) => p.id === r.perguntaId) &&
                      r.resposta.trim(),
                  )
                  .map((r) => (
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
