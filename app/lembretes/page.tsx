"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api";
import type { Lembrete, TipoLembrete } from "@/lib/types";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
} from "@/components/ui";

function vazio(): Lembrete {
  return {
    id: "",
    texto: "",
    tipo: "atencao",
    ativo: true,
    createdAt: "",
  };
}

export default function LembretesPage() {
  const [lista, setLista] = useState<Lembrete[]>([]);
  const [form, setForm] = useState<Lembrete>(vazio());

  async function carregar() {
    setLista(await apiList<Lembrete>("lembretes"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!form.texto.trim()) return;
    await apiCreate<Lembrete>("lembretes", form);
    setForm(vazio());
    await carregar();
  }

  async function alternar(l: Lembrete) {
    await apiUpdate<Lembrete>("lembretes", l.id, { ativo: !l.ativo });
    await carregar();
  }

  async function remover(id: string) {
    await apiDelete("lembretes", id);
    await carregar();
  }

  const ativos = lista.filter((l) => l.ativo);

  return (
    <div>
      <PageHeader
        title="🚨 Lembretes"
        subtitle={`${ativos.length} lembrete(s) ativo(s)`}
      />

      <Card className="mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-3">
            <Field label="Novo lembrete">
              <Input
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Tipo">
            <Select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLembrete })}
            >
              <option value="critico">🔴 Crítico</option>
              <option value="atencao">🟡 Atenção</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={adicionar}>Adicionar</Button>
        </div>
      </Card>

      {lista.length === 0 ? (
        <EmptyState>Nenhum lembrete cadastrado.</EmptyState>
      ) : (
        <div className="space-y-2">
          {lista.map((l) => (
            <Card
              key={l.id}
              className={`border-l-4 ${
                l.tipo === "critico" ? "border-l-red-500" : "border-l-yellow-400"
              } ${l.ativo ? "" : "opacity-50"}`}
            >
              <div className="flex items-center gap-3">
                <span>{l.tipo === "critico" ? "🔴" : "🟡"}</span>
                <p className="flex-1 text-sm text-slate-800">{l.texto}</p>
                <Button variant="ghost" onClick={() => alternar(l)}>
                  {l.ativo ? "Desativar" : "Ativar"}
                </Button>
                <Button variant="danger" onClick={() => remover(l.id)}>
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
