"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api";
import { AREAS, PORTES } from "@/lib/questions";
import type { Entrevista, Pergunta, StatusEntrevista } from "@/lib/types";
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

const VARIANTES_STATUS: Record<StatusEntrevista, "soft" | "outline" | "solid"> = {
  planejada: "soft",
  agendada: "outline",
  realizada: "solid",
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
    respostas: [],
    indicacoes: ["", ""],
    identificouProblema: false,
    outroProblema: "",
    createdAt: "",
  };
}

export default function EntrevistasPage() {
  const [lista, setLista] = useState<Entrevista[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [form, setForm] = useState<Entrevista>(vazio());
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const [entrevistas, perguntasCarregadas] = await Promise.all([
      apiList<Entrevista>("entrevistas"),
      apiList<Pergunta>("perguntas"),
    ]);
    setLista(entrevistas);
    setPerguntas(perguntasCarregadas);
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
    setForm(e);
    setEditandoId(e.id);
    setMostrarForm(true);
  }

  function setResposta(perguntaId: string, resposta: string) {
    setForm((f) => {
      const existe = f.respostas.some((r) => r.perguntaId === perguntaId);
      return {
        ...f,
        respostas: existe
          ? f.respostas.map((r) =>
              r.perguntaId === perguntaId ? { ...r, resposta } : r,
            )
          : [...f.respostas, { perguntaId, resposta }],
      };
    });
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
        title="Entrevistas"
        subtitle={`${lista.length} entrevista(s) cadastrada(s)`}
        right={<Button onClick={novo}>Nova entrevista</Button>}
      />

      {mostrarForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {editandoId ? "Editar entrevista" : "Nova entrevista"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {perguntas.length === 0 ? (
              <EmptyState>
                Nenhuma pergunta cadastrada. Monte o roteiro na página "Perguntas".
              </EmptyState>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {perguntas.map((p, i) => (
                  <Field key={p.id} label={`${i + 1}. ${p.texto}`}>
                    <Textarea
                      value={form.respostas.find((r) => r.perguntaId === p.id)?.resposta ?? ""}
                      onChange={(e) => setResposta(p.id, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <Field label="Observações / anotações">
              <Textarea
                value={form.anotacoes}
                onChange={(e) => setForm({ ...form, anotacoes: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={form.identificouProblema}
                onChange={(e) =>
                  setForm({ ...form, identificouProblema: e.target.checked })
                }
                className="h-4 w-4"
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

          <div className="mt-5 flex flex-wrap gap-2">
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-body font-medium text-ink">
                    {e.nomeEntrevistado || "(sem nome)"}{" "}
                    <span className="font-normal text-mid-gray">
                      — {e.empresa || "empresa não informada"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-caption text-mid-gray">
                    {e.cargo} · {e.area} · {e.porte} · {e.data || "sem data"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={VARIANTES_STATUS[e.status]}>{e.status}</Badge>
                    {e.identificouProblema && (
                      <Badge variant="solid">identificou o problema</Badge>
                    )}
                    {e.outroProblema.trim() && (
                      <Badge variant="outline">outro problema</Badge>
                    )}
                    {e.indicacoes.filter((i) => i.trim()).length > 0 && (
                      <Badge variant="soft">
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
                <div className="mt-4 space-y-3 border-t border-hairline pt-4">
                  {perguntas.map((p, i) => {
                    const r = e.respostas.find((x) => x.perguntaId === p.id)?.resposta;
                    return (
                      <div key={p.id} className="text-sm">
                        <p className="font-medium text-ink">
                          {i + 1}. {p.texto}
                        </p>
                        <p className="mt-0.5 text-ink-soft">
                          {r || <span className="text-mid-gray">— sem resposta —</span>}
                        </p>
                      </div>
                    );
                  })}
                  {e.respostas
                    .filter(
                      (r) =>
                        !perguntas.some((p) => p.id === r.perguntaId) &&
                        r.resposta.trim(),
                    )
                    .map((r) => (
                      <div key={r.perguntaId} className="text-sm">
                        <p className="font-medium text-ink">Pergunta removida</p>
                        <p className="mt-0.5 text-ink-soft">{r.resposta}</p>
                      </div>
                    ))}
                  {e.anotacoes && (
                    <div className="text-sm">
                      <p className="font-medium text-ink">Anotações</p>
                      <p className="mt-0.5 text-ink-soft">{e.anotacoes}</p>
                    </div>
                  )}
                  {e.gravacao && (
                    <p className="text-sm text-mid-gray">Gravação: {e.gravacao}</p>
                  )}
                  {e.outroProblema.trim() && (
                    <div className="text-sm">
                      <p className="font-medium text-ink">Outro problema relatado</p>
                      <p className="mt-0.5 text-ink-soft">{e.outroProblema}</p>
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
