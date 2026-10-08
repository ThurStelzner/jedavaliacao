"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api";
import { AREAS, PORTES } from "@/lib/questions";
import type { Contato, StatusContato } from "@/lib/types";
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

const STATUS: StatusContato[] = [
  "novo",
  "contatado",
  "agendado",
  "entrevistado",
  "sem_interesse",
];

const CORES: Record<StatusContato, "slate" | "blue" | "yellow" | "green" | "red"> = {
  novo: "slate",
  contatado: "blue",
  agendado: "yellow",
  entrevistado: "green",
  sem_interesse: "red",
};

function vazio(): Contato {
  return {
    id: "",
    nome: "",
    empresa: "",
    cargo: "",
    porte: "",
    area: "",
    quemIndicou: "",
    contato: "",
    status: "novo",
    entrevistaRealizada: false,
    novasIndicacoes: "",
    createdAt: "",
  };
}

export default function ContatosPage() {
  const [lista, setLista] = useState<Contato[]>([]);
  const [form, setForm] = useState<Contato>(vazio());
  const [mostrarForm, setMostrarForm] = useState(false);

  async function carregar() {
    setLista(await apiList<Contato>("contatos"));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!form.nome.trim()) return;
    await apiCreate<Contato>("contatos", form);
    setForm(vazio());
    setMostrarForm(false);
    await carregar();
  }

  async function remover(id: string) {
    if (!confirm("Remover este contato?")) return;
    await apiDelete("contatos", id);
    await carregar();
  }

  async function mudarStatus(c: Contato, status: StatusContato) {
    await apiUpdate<Contato>("contatos", c.id, { status });
    await carregar();
  }

  const disponiveis = lista.filter(
    (c) => c.status !== "entrevistado" && c.status !== "sem_interesse",
  ).length;

  return (
    <div>
      <PageHeader
        title="Contatos"
        subtitle={`${lista.length} contato(s) · ${disponiveis} disponível(is)`}
        right={<Button onClick={() => setMostrarForm((v) => !v)}>+ Novo contato</Button>}
      />

      {mostrarForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Novo contato</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Nome">
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Field>
            <Field label="Empresa">
              <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            </Field>
            <Field label="Cargo">
              <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            </Field>
            <Field label="Porte">
              <Select value={form.porte} onChange={(e) => setForm({ ...form, porte: e.target.value })}>
                <option value="">—</option>
                {PORTES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field label="Área">
              <Select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                <option value="">—</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </Field>
            <Field label="Quem indicou">
              <Input value={form.quemIndicou} onChange={(e) => setForm({ ...form, quemIndicou: e.target.value })} />
            </Field>
            <Field label="Contato (telefone/e-mail)">
              <Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusContato })}
              >
                {STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Novas indicações feitas">
              <Textarea
                value={form.novasIndicacoes}
                onChange={(e) => setForm({ ...form, novasIndicacoes: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={adicionar}>Salvar</Button>
            <Button variant="ghost" onClick={() => setMostrarForm(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {lista.length === 0 ? (
        <EmptyState>Nenhum contato cadastrado.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Empresa / Cargo</th>
                <th className="p-3 font-medium">Indicado por</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Entrevista</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-3">
                    <p className="font-medium text-slate-900">{c.nome}</p>
                    {c.contato && <p className="text-xs text-slate-400">{c.contato}</p>}
                  </td>
                  <td className="p-3 text-slate-600">
                    {c.empresa || "—"} {c.cargo ? `· ${c.cargo}` : ""}
                    {c.novasIndicacoes && (
                      <p className="text-xs text-slate-400">Indicações: {c.novasIndicacoes}</p>
                    )}
                  </td>
                  <td className="p-3 text-slate-600">{c.quemIndicou || "—"}</td>
                  <td className="p-3">
                    <Select
                      className="w-36"
                      value={c.status}
                      onChange={(e) => mudarStatus(c, e.target.value as StatusContato)}
                    >
                      {STATUS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="p-3">
                    {c.entrevistaRealizada ? (
                      <Badge color="green">realizada</Badge>
                    ) : (
                      <Badge color={CORES[c.status]}>{c.status}</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="danger" onClick={() => remover(c.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
