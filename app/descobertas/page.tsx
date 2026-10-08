"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList } from "@/lib/api";
import type { Descoberta, TipoDescoberta } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";

const TIPOS: { valor: TipoDescoberta; label: string }[] = [
  { valor: "novo_problema", label: "Novo problema" },
  { valor: "problema_recorrente", label: "Problema recorrente" },
  { valor: "sugestao", label: "Sugestão do entrevistado" },
  { valor: "necessidade", label: "Necessidade da empresa" },
  { valor: "oportunidade", label: "Possível oportunidade" },
  { valor: "ideia_solucao", label: "Ideia de solução" },
];

function vazio(): Descoberta {
  return {
    id: "",
    tipo: "novo_problema",
    texto: "",
    empresa: "",
    entrevistaId: "",
    createdAt: "",
  };
}

function labelTipo(t: TipoDescoberta): string {
  return TIPOS.find((x) => x.valor === t)?.label ?? t;
}

export default function DescobertasPage() {
  const [lista, setLista] = useState<Descoberta[]>([]);
  const [form, setForm] = useState<Descoberta>(vazio());

  async function carregar() {
    setLista(await apiList<Descoberta>("descobertas"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!form.texto.trim()) return;
    await apiCreate<Descoberta>("descobertas", form);
    setForm(vazio());
    await carregar();
  }

  async function remover(id: string) {
    await apiDelete("descobertas", id);
    await carregar();
  }

  return (
    <div>
      <PageHeader
        title="Descobertas"
        subtitle="Novos problemas, padrões e oportunidades que surgirem nas entrevistas"
      />

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Tipo">
            <Select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoDescoberta })}
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Empresa (opcional)">
            <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
          </Field>
          <Field label="ID da entrevista (opcional)">
            <Input
              value={form.entrevistaId}
              onChange={(e) => setForm({ ...form, entrevistaId: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Descrição">
            <Textarea
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-5">
          <Button onClick={adicionar}>Registrar descoberta</Button>
        </div>
      </Card>

      {lista.length === 0 ? (
        <EmptyState>
          Nenhuma descoberta registrada. Se o mesmo problema aparecer em várias entrevistas,
          registre aqui para comparar com o problema inicial.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {lista.map((d) => (
            <Card key={d.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Badge variant="soft">{labelTipo(d.tipo)}</Badge>
                  <p className="mt-2 text-body text-ink-soft">{d.texto}</p>
                  <p className="mt-1 text-caption text-mid-gray">
                    {d.empresa ? `Empresa: ${d.empresa}` : ""}
                    {d.entrevistaId ? ` · Entrevista: ${d.entrevistaId}` : ""}
                  </p>
                </div>
                <Button variant="danger" onClick={() => remover(d.id)}>
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
