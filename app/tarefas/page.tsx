"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api";
import type { Prioridade, StatusTarefa, Tarefa } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
} from "@/components/ui";

const PRIORIDADES: Prioridade[] = ["baixa", "media", "alta"];
const VARIANTES_PRIORIDADE: Record<Prioridade, "solid" | "soft" | "outline"> = {
  baixa: "outline",
  media: "soft",
  alta: "solid",
};

function vazia(): Tarefa {
  return {
    id: "",
    titulo: "",
    responsavel: "",
    prazo: "",
    prioridade: "media",
    status: "pendente",
    createdAt: "",
  };
}

export default function TarefasPage() {
  const [lista, setLista] = useState<Tarefa[]>([]);
  const [form, setForm] = useState<Tarefa>(vazia());
  const [mostrarForm, setMostrarForm] = useState(false);

  async function carregar() {
    setLista(await apiList<Tarefa>("tarefas"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!form.titulo.trim()) return;
    await apiCreate<Tarefa>("tarefas", form);
    setForm(vazia());
    setMostrarForm(false);
    await carregar();
  }

  async function alternar(t: Tarefa) {
    const status: StatusTarefa = t.status === "concluida" ? "pendente" : "concluida";
    await apiUpdate<Tarefa>("tarefas", t.id, { status });
    await carregar();
  }

  async function remover(id: string) {
    await apiDelete("tarefas", id);
    await carregar();
  }

  const concluidas = lista.filter((t) => t.status === "concluida").length;

  return (
    <div>
      <PageHeader
        title="Tarefas"
        subtitle={`${concluidas}/${lista.length} concluída(s)`}
        right={<Button onClick={() => setMostrarForm((v) => !v)}>Nova tarefa</Button>}
      />

      {mostrarForm && (
        <Card className="mb-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2">
              <Field label="Tarefa">
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </Field>
            </div>
            <Field label="Responsável">
              <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
            </Field>
            <Field label="Prazo">
              <Input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
            </Field>
            <Field label="Prioridade">
              <Select
                value={form.prioridade}
                onChange={(e) => setForm({ ...form, prioridade: e.target.value as Prioridade })}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={adicionar}>Salvar</Button>
            <Button variant="ghost" onClick={() => setMostrarForm(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {lista.length === 0 ? (
        <EmptyState>Nenhuma tarefa cadastrada.</EmptyState>
      ) : (
        <div className="space-y-2">
          {lista.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.status === "concluida"}
                  onChange={() => alternar(t)}
                  className="h-4 w-4 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-body font-medium ${
                      t.status === "concluida"
                        ? "text-mid-gray line-through"
                        : "text-ink"
                    }`}
                  >
                    {t.titulo}
                  </p>
                  <p className="mt-0.5 text-caption text-mid-gray">
                    {t.responsavel ? `Resp.: ${t.responsavel}` : "Sem responsável"}
                    {t.prazo ? ` · Prazo: ${t.prazo}` : ""}
                  </p>
                </div>
                <Badge variant={VARIANTES_PRIORIDADE[t.prioridade]}>
                  {t.prioridade}
                </Badge>
                <Button variant="danger" onClick={() => remover(t.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
