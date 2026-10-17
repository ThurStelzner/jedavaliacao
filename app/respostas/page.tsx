"use client";

import { useEffect, useMemo, useState } from "react";
import { apiList } from "@/lib/api";
import type { Entrevista, Pergunta } from "@/lib/types";
import {
  Badge,
  Card,
  EmptyState,
  Field,
  PageHeader,
  Select,
} from "@/components/ui";

export default function RespostasPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<string>("todos");

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

  const responsaveis = useMemo(
    () =>
      Array.from(
        new Set(entrevistas.map((e) => (e.responsavel || "").trim()).filter(Boolean)),
      ).sort(),
    [entrevistas],
  );

  const visiveis = useMemo(
    () =>
      filtro === "todos"
        ? entrevistas
        : entrevistas.filter((e) => (e.responsavel || "").trim() === filtro),
    [entrevistas, filtro],
  );

  if (carregando) {
    return <PageHeader title="Respostas" subtitle="Carregando..." />;
  }

  return (
    <div>
      <PageHeader
        title="Respostas"
        subtitle="Pergunta e resposta de cada entrevista · atualiza automaticamente"
        right={
          <Field label="">
            <Select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-44"
            >
              <option value="todos">Todos ({entrevistas.length})</option>
              {responsaveis.map((r) => (
                <option key={r} value={r}>
                  {r} ({entrevistas.filter((e) => (e.responsavel || "").trim() === r).length})
                </option>
              ))}
            </Select>
          </Field>
        }
      />

      {visiveis.length === 0 ? (
        <EmptyState>Nenhuma entrevista para exibir.</EmptyState>
      ) : (
        <div className="space-y-4">
          {visiveis.map((e) => (
            <Card key={e.id}>
              <div className="border-b border-hairline pb-3">
                <p className="text-body font-semibold text-ink">
                  {e.nomeEntrevistado || "(sem nome)"}{" "}
                  <span className="font-normal text-mid-gray">— {e.empresa || "empresa não informada"}</span>
                </p>
                <p className="mt-0.5 text-caption text-mid-gray">
                  {[e.cargo, e.data || null].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {(e.responsavel || "").trim() && (
                    <Badge variant="solid">{e.responsavel}</Badge>
                  )}
                  <Badge variant="soft">{e.status}</Badge>
                  {e.identificouProblema && (
                    <Badge variant="outline">identificou o problema</Badge>
                  )}
                  {e.recusouServico === "sim" && (
                    <Badge variant="outline">recusou serviço por prazo</Badge>
                  )}
                </div>
              </div>

              <ol className="mt-3 space-y-4">
                {perguntas.map((p, i) => {
                  const r = e.respostas.find((x) => x.perguntaId === p.id)?.resposta;
                  return (
                    <li key={p.id}>
                      <p className="text-sm font-medium text-ink">
                        {i + 1}. {p.texto}
                      </p>
                      <p className="mt-1 rounded-inputs bg-canvas px-3 py-2 text-sm text-ink-soft">
                        {r?.trim() ? (
                          <>
                            <span className="font-medium text-ink">
                              {e.nomeEntrevistado?.split(" ")[0] || "Entrevistado"} disse:{" "}
                            </span>
                            {r}
                          </>
                        ) : (
                          <span className="text-mid-gray">— sem resposta —</span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ol>

              {e.anotacoes?.trim() && (
                <p className="mt-3 text-caption text-mid-gray">
                  <span className="font-medium text-ink-soft">Anotações: </span>
                  {e.anotacoes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
