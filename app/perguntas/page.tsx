"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiCreate, apiDelete, apiList } from "@/lib/api";
import type { Entrevista, Pergunta, Publico, Rodada } from "@/lib/types";
import {
  BLOCOS,
  ehExemplo,
  perguntasDoBloco,
  publicoDe,
  ROTULOS_PUBLICO,
  ROTULOS_RODADA,
} from "@/lib/validacao";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";

export default function PerguntasPage() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [texto, setTexto] = useState("");
  const [publico, setPublico] = useState<Publico>("oficina");
  const [rodada, setRodada] = useState<Rodada>("problema");

  async function carregar() {
    const [p, e] = await Promise.all([
      apiList<Pergunta>("perguntas"),
      apiList<Entrevista>("entrevistas"),
    ]);
    setPerguntas(p);
    setEntrevistas(e);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!texto.trim()) return;
    const doBloco = perguntasDoBloco(perguntas, publico, rodada);
    await apiCreate<Pergunta>("perguntas", {
      texto: texto.trim(),
      publico,
      rodada,
      ordem: doBloco.length + 1,
    });
    setTexto("");
    await carregar();
  }

  async function remover(id: string) {
    if (!confirm("Remover esta pergunta?")) return;
    await apiDelete("perguntas", id);
    await carregar();
  }

  const oficina = entrevistas.filter((e) => publicoDe(e) === "oficina");
  const cliente = entrevistas.filter((e) => publicoDe(e) === "cliente");
  const temDemoCliente = cliente.some((e) => ehExemplo(e));

  return (
    <div>
      <PageHeader
        title="Perguntas"
        subtitle="O roteiro da validação, separado por lado: oficina e cliente final"
        right={
          <Link
            href="/entrevistas"
            className="inline-flex h-9 items-center rounded-buttons bg-ink px-3 text-sm font-medium text-[#fafafa] transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mid-gray"
          >
            Ir para entrevistas
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              A validação tem dois lados
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              O produto é usado pela oficina e pelo cliente final. Cada lado tem
              perguntas de problema e de solução.
            </p>
          </div>
          <Badge variant="soft">Dois usuários</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-sm font-semibold text-ink">Usuário 1 · Oficina</p>
            <p className="mt-1 text-sm text-ink-soft">
              Dono, recepção e mecânico. Paga, faz o check-in e usa o painel.
            </p>
            <p className="mt-2 text-caption text-mid-gray">
              {oficina.length} entrevista(s) · 6 perguntas de problema · 6 de
              solução
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-sm font-semibold text-ink">
              Usuário 2 · Cliente final
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Motorista. Não paga. Acompanha o carro pelo QR code.
            </p>
            <p className="mt-2 text-caption text-mid-gray">
              {cliente.length} entrevista(s) · 5 perguntas de problema · 5 de
              solução
            </p>
            {temDemoCliente && (
              <p className="mt-1 text-caption text-mid-gray">
                Hoje são respostas de exemplo (demonstração).
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCOS.map((b) => {
            const doBloco = perguntasDoBloco(perguntas, b.publico, b.rodada);
            const pessoas =
              b.publico === "oficina" ? oficina.length : cliente.length;
            const respondidas = doBloco.filter((p) =>
              (b.publico === "oficina" ? oficina : cliente).some((e) =>
                e.respostas.some(
                  (r) => r.perguntaId === p.id && r.resposta.trim(),
                ),
              ),
            ).length;
            const status =
              respondidas === 0
                ? "A iniciar"
                : respondidas < doBloco.length
                  ? "Em andamento"
                  : "Respondido";
            return (
              <div
                key={`${b.publico}-${b.rodada}`}
                className="rounded-cards border border-hairline bg-canvas p-3"
              >
                <p className="text-sm font-semibold text-ink">{b.titulo}</p>
                <p className="mt-1 text-caption text-mid-gray">{b.descricao}</p>
                <p className="mt-2 text-caption text-ink-soft">
                  {doBloco.length} pergunta(s) · {pessoas} pessoa(s)
                </p>
                <p className="mt-1">
                  <Badge variant={respondidas > 0 ? "solid" : "outline"}>
                    {status}
                  </Badge>
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Perguntas da avaliação (5)
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              As perguntas do entregável de negócio, respondidas no Pitch.
            </p>
          </div>
          <Link
            href="/pitch"
            className="text-caption font-medium text-ink underline underline-offset-2"
          >
            Ver respostas
          </Link>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft marker:text-mid-gray">
          <li>Modelo de negócio, usuário, decisor e cliente pagante.</li>
          <li>Como o cliente paga, preço inicial e como chegaram ao valor.</li>
          <li>Concorrentes e posicionamento.</li>
          <li>Tamanho do mercado e parcela inicial.</li>
          <li>Como conquistar os primeiros clientes pagantes.</li>
        </ol>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Nova pergunta</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Lado">
            <Select
              value={publico}
              onChange={(e) => setPublico(e.target.value as Publico)}
            >
              <option value="oficina">Oficina</option>
              <option value="cliente">Cliente final</option>
            </Select>
          </Field>
          <Field label="Rodada">
            <Select
              value={rodada}
              onChange={(e) => setRodada(e.target.value as Rodada)}
            >
              <option value="problema">Problema</option>
              <option value="solucao">Solução</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button onClick={adicionar}>Adicionar pergunta</Button>
          </div>
        </div>
        <div className="mt-4">
          <Field label="Pergunta">
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Digite a pergunta..."
            />
          </Field>
        </div>
      </Card>

      {BLOCOS.map((b) => {
        const doBloco = perguntasDoBloco(perguntas, b.publico, b.rodada);
        const pessoas =
          b.publico === "oficina" ? oficina.length : cliente.length;
        return (
          <Card key={`${b.publico}-${b.rodada}`} className="mb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">{b.titulo}</h2>
                <p className="mt-1 text-caption text-mid-gray">{b.descricao}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {ROTULOS_PUBLICO[b.publico].nome}
                </Badge>
                <Badge variant="soft">{ROTULOS_RODADA[b.rodada]}</Badge>
                <Badge variant="outline">{pessoas} pessoa(s)</Badge>
              </div>
            </div>

            {doBloco.length === 0 ? (
              <p className="mt-4 text-sm text-mid-gray">
                Nenhuma pergunta neste bloco ainda.
              </p>
            ) : (
              <ol className="mt-4 space-y-2">
                {doBloco.map((p, i) => {
                  const respondidas = (
                    b.publico === "oficina" ? oficina : cliente
                  ).filter((e) =>
                    e.respostas.some(
                      (r) => r.perguntaId === p.id && r.resposta.trim(),
                    ),
                  ).length;
                  return (
                    <li
                      key={p.id}
                      className="flex items-start gap-3 rounded-cards border border-hairline bg-surface-alt p-3"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-buttons bg-ink text-caption font-semibold text-[#fafafa]">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{p.texto}</p>
                        <p className="mt-1 text-caption text-mid-gray">
                          {respondidas} resposta(s)
                        </p>
                      </div>
                      <Button variant="danger" onClick={() => remover(p.id)}>
                        Excluir
                      </Button>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        );
      })}

      {perguntas.length === 0 && (
        <EmptyState>
          Nenhuma pergunta cadastrada. Adicione a primeira pergunta acima.
        </EmptyState>
      )}
    </div>
  );
}
