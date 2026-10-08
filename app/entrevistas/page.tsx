"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api";
import { AREAS, PERGUNTAS, PORTES } from "@/lib/questions";
import type { Entrevista, Resposta, StatusEntrevista } from "@/lib/types";
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

const STATUS: StatusEntrevista[] = ["planejada", "agendada", "realizada"];

const CORES_STATUS: Record<StatusEntrevista, "slate" | "yellow" | "green"> = {
  planejada: "slate",
  agendada: "yellow",
  realizada: "green",
};

function vazio(): Entrevista {
  return {
    id: "",
    nomeEntrevistado: "",
    empresa: "",
    cargo: "",
    porte: PORTES[2],
    area: AREAS[0],
    data: new Date().toISOString().slice(0, 10),
    responsavel: "",
    status: "planejada",
    gravacao: "",
    anotacoes: "",
    respostas: PERGUNTAS.map((p) => ({ perguntaId: p.id, resposta: "" })),
    indicacoes: ["", ""],
    identificouProblema: false,
    outroProblema: "",
    createdAt: "",
  };
}

export default function EntrevistasPage() {
  const [lista, setLista] = useState<Entrevista[]>([]);
  const [form, setForm] = useState<Entrevista>(vazio());
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setLista(await apiList<Entrevista>("entrevistas"));
  }

  useEffect(() => {
    carregar();
  }, []);

  function novo() {
    setForm(vazio());
    setEditandoId(null);
    setMostrarForm(true);
  }

  function editar(e: Entrevista) {
    setForm({ ...e, respostas: PERGUNTAS.map((p) => ({
      perguntaId: p.id,
      resposta: e.respostas.find((r) => r.perguntaId === p.id)?.resposta ?? "",
    })) });
    setEditandoId(e.id);
    setMostrarForm(true);
  }

  function setResposta(perguntaId: string, resposta: string) {
    setForm((f) => ({
      ...f,
      respostas: f.respostas.map((r) =>
        r.perguntaId === perguntaId ? { ...r, resposta } : r,
      ),
    }));
  }

  function setIndicacao(idx: number, valor: string) {
    setForm((f) => {
      const indicacoes = [...f.indicacoes];
      indicacoes[idx] = valor;
      return { ...f, indicacoes };
    });
  }

  async function salvar() {
    if (!form.nomeEntrevistado.trim() && !form.empresa.trim()) return;
    setSalvando(true);
    try {
      if (editandoId) {
        await apiUpdate<Entrevista>("entrevistas", editandoId, form);
      } else {
        await apiCreate<Entrevista>("entrevistas", form);
      }
      setMostrarForm(false);
      setEditandoId(null);
      setForm(vazio());
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    if (!confirm("Remover esta entrevista?")) return;
    await apiDelete("entrevistas", id);
    await carregar();
  }

  async function mudarStatus(e: Entrevista, status: StatusEntrevista) {
    await apiUpdate<Entrevista>("entrevistas", e.id, { status });
    await carregar();
  }

  return (
    <div>
      <PageHeader
        title="🎤 Entrevistas"
        subtitle={`${lista.length} entrevista(s) cadastrada(s)`}
        right={<Button onClick={novo}>+ Nova entrevista</Button>}
      />

      {mostrarForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            {editandoId ? "Editar entrevista" : "Nova entrevista"}
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Nome do entrevistado">
              <Input
                value={form.nomeEntrevistado}
                onChange={(e) => setForm({ ...form, nomeEntrevistado: e.target.value })}
              />
            </Field>
            <Field label="Empresa">
              <Input
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
            </Field>
            <Field label="Cargo">
              <Input
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              />
            </Field>
            <Field label="Porte da empresa">
              <Select
                value={form.porte}
                onChange={(e) => setForm({ ...form, porte: e.target.value })}
              >
                {PORTES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field label="Área da empresa">
              <Select
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              >
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </Field>
            <Field label="Responsável pela entrevista">
              <Input
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as StatusEntrevista })
                }
              >
                {STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Gravação (link/arquivo)">
              <Input
                value={form.gravacao}
                onChange={(e) => setForm({ ...form, gravacao: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field
              label="Pergunta 1 (aberta)"
              hint="Não induza. Deixe o entrevistado falar livremente."
            >
              <Textarea
                value={form.respostas[0]?.resposta ?? ""}
                onChange={(e) => setResposta("q1", e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {PERGUNTAS.slice(1).map((p) => (
              <Field key={p.id} label={`${p.ordem}. ${p.texto}`}>
                <Textarea
                  value={form.respostas.find((r) => r.perguntaId === p.id)?.resposta ?? ""}
                  onChange={(e) => setResposta(p.id, e.target.value)}
                />
              </Field>
            ))}
          </div>

          <div className="mt-3">
            <Field label="Observações / anotações">
              <Textarea
                value={form.anotacoes}
                onChange={(e) => setForm({ ...form, anotacoes: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Field label="Indicação 1">
              <Input
                value={form.indicacoes[0] ?? ""}
                onChange={(e) => setIndicacao(0, e.target.value)}
              />
            </Field>
            <Field label="Indicação 2">
              <Input
                value={form.indicacoes[1] ?? ""}
                onChange={(e) => setIndicacao(1, e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.identificouProblema}
                onChange={(e) =>
                  setForm({ ...form, identificouProblema: e.target.checked })
                }
              />
              A empresa identificou o problema pesquisado?
            </label>
            <Field label="Apontou outro problema mais relevante?">
              <Textarea
                value={form.outroProblema}
                onChange={(e) => setForm({ ...form, outroProblema: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMostrarForm(false);
                setEditandoId(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {lista.length === 0 ? (
        <EmptyState>Nenhuma entrevista cadastrada. Clique em "Nova entrevista".</EmptyState>
      ) : (
        <div className="space-y-3">
          {lista.map((e) => (
            <Card key={e.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {e.nomeEntrevistado || "(sem nome)"}{" "}
                    <span className="font-normal text-slate-500">
                      — {e.empresa || "empresa não informada"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {e.cargo} · {e.area} · {e.porte} · {e.data || "sem data"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge color={CORES_STATUS[e.status]}>{e.status}</Badge>
                    {e.identificouProblema && <Badge color="green">identificou o problema</Badge>}
                    {e.outroProblema.trim() && <Badge color="red">outro problema</Badge>}
                    {e.indicacoes.filter((i) => i.trim()).length > 0 && (
                      <Badge color="blue">
                        {e.indicacoes.filter((i) => i.trim()).length} indicação(ões)
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    className="w-32"
                    value={e.status}
                    onChange={(ev) => mudarStatus(e, ev.target.value as StatusEntrevista)}
                  >
                    {STATUS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    onClick={() => setAberto(aberto === e.id ? null : e.id)}
                  >
                    {aberto === e.id ? "Fechar" : "Respostas"}
                  </Button>
                  <Button variant="ghost" onClick={() => editar(e)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => remover(e.id)}>
                    Excluir
                  </Button>
                </div>
              </div>

              {aberto === e.id && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {PERGUNTAS.map((p) => {
                    const r = e.respostas.find((x) => x.perguntaId === p.id)?.resposta;
                    return (
                      <div key={p.id} className="text-sm">
                        <p className="font-medium text-slate-700">
                          {p.ordem}. {p.texto}
                        </p>
                        <p className="text-slate-600">{r || "— sem resposta —"}</p>
                      </div>
                    );
                  })}
                  {e.anotacoes && (
                    <div className="text-sm">
                      <p className="font-medium text-slate-700">Anotações</p>
                      <p className="text-slate-600">{e.anotacoes}</p>
                    </div>
                  )}
                  {e.gravacao && (
                    <p className="text-sm text-slate-600">Gravação: {e.gravacao}</p>
                  )}
                  {e.outroProblema.trim() && (
                    <div className="text-sm">
                      <p className="font-medium text-red-600">Outro problema relatado</p>
                      <p className="text-slate-600">{e.outroProblema}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
