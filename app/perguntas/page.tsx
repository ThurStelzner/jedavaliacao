"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiCreate, apiDelete, apiList } from "@/lib/api";
import type { Pergunta } from "@/lib/types";
import { Button, Card, EmptyState, Field, PageHeader, Textarea } from "@/components/ui";

export default function PerguntasPage() {
  const [lista, setLista] = useState<Pergunta[]>([]);
  const [texto, setTexto] = useState("");

  async function carregar() {
    setLista(await apiList<Pergunta>("perguntas"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!texto.trim()) return;
    await apiCreate<Pergunta>("perguntas", { texto: texto.trim() });
    setTexto("");
    await carregar();
  }

  async function remover(id: string) {
    if (!confirm("Remover esta pergunta?")) return;
    await apiDelete("perguntas", id);
    await carregar();
  }

  return (
    <div>
      <PageHeader
        title="Perguntas"
        subtitle="Monte o roteiro de perguntas usado nas entrevistas"
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
              Roteiro usado nas 26 entrevistas
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              As perguntas abaixo são as que foram feitas de verdade para validar o
              problema. As respostas de cada oficina ficam na página Respostas.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-cards border border-hairline bg-surface-alt p-3">
          <p className="text-sm font-semibold text-ink">
            Perguntas da avaliação (5)
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Modelo de negócio, usuário, decisor e cliente pagante.</li>
            <li>Como o cliente paga, preço inicial e como chegaram ao valor.</li>
            <li>Concorrentes e posicionamento.</li>
            <li>Tamanho do mercado e parcela inicial.</li>
            <li>Como conquistar os primeiros clientes pagantes.</li>
          </ol>
          <p className="mt-2 text-caption text-mid-gray">
            As respostas completas estão na página{" "}
            <Link href="/pitch" className="font-medium text-ink underline">
              Pitch
            </Link>
            .
          </p>
        </div>
      </Card>

      <Card className="mb-6">
        <Field label="Nova pergunta">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite a pergunta..."
          />
        </Field>
        <div className="mt-5">
          <Button onClick={adicionar}>Adicionar pergunta</Button>
        </div>
      </Card>

      {lista.length === 0 ? (
        <EmptyState>
          Nenhuma pergunta cadastrada. Adicione a primeira pergunta acima para montar o
          roteiro das entrevistas.
        </EmptyState>
      ) : (
        <ol className="space-y-3">
          {lista.map((p, i) => (
            <Card key={p.id}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-buttons bg-ink text-caption font-semibold text-[#fafafa]">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 text-body font-medium text-ink">{p.texto}</p>
                <Button variant="danger" onClick={() => remover(p.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </ol>
      )}
    </div>
  );
}
