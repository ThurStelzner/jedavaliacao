"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api";
import { AREAS, PORTES } from "@/lib/questions";
import type {
  ClienteEntendePrazos,
  Entrevista,
  Pergunta,
  Publico,
  RecusouServico,
  StatusEntrevista,
} from "@/lib/types";
import {
  perguntasDoPublico,
  publicoDe,
  ROTULOS_PUBLICO,
} from "@/lib/validacao";
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
    publico: "oficina",
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
    clienteEntendePrazos: "",
    recusouServico: "",
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
  const [filtroPublico, setFiltroPublico] = useState<"todos" | Publico>("todos");

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
    setForm({ ...e, publico: publicoDe(e) });
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

  function mudarPublico(publico: Publico) {
    setForm((f) => ({ ...f, publico, respostas: [] }));
  }

  const visiveis =
    filtroPublico === "todos"
      ? lista
      : lista.filter((e) => publicoDe(e) === filtroPublico);
  const perguntasForm = perguntasDoPublico(perguntas, form.publico ?? "oficina");
  const totalOficina = lista.filter((e) => publicoDe(e) === "oficina").length;
  const totalCliente = lista.filter((e) => publicoDe(e) === "cliente").length;

  return (
    <div>
      <PageHeader
        title="Entrevistas"
        subtitle={`${lista.length} entrevista(s) · ${totalOficina} oficina · ${totalCliente} cliente final`}
        right={<Button onClick={novo}>Nova entrevista</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["todos", `Todos (${lista.length})`],
            ["oficina", `Oficina (${totalOficina})`],
            ["cliente", `Cliente final (${totalCliente})`],
          ] as const
        ).map(([valor, rotulo]) => (
          <Button
            key={valor}
            variant={filtroPublico === valor ? "primary" : "outline"}
            onClick={() => setFiltroPublico(valor)}
          >
            {rotulo}
          </Button>
        ))}
      </div>

      {mostrarForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {editandoId ? "Editar entrevista" : "Nova entrevista"}
          </h2>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Field label="Tipo de entrevista">
              <Select
                value={form.publico ?? "oficina"}
                onChange={(e) => mudarPublico(e.target.value as Publico)}
              >
                <option value="oficina">Oficina (dono, recepção, mecânico)</option>
                <option value="cliente">Cliente final (motorista)</option>
              </Select>
            </Field>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3 text-caption text-mid-gray">
              {form.publico === "cliente"
                ? "O cliente final não paga. As perguntas são sobre o que ele vê e acompanha no carro."
                : "As perguntas são sobre a organização da oficina e a comunicação com o cliente."}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nome do entrevistado">
              <Input
                value={form.nomeEntrevistado}
                onChange={(e) => setForm({ ...form, nomeEntrevistado: e.target.value })}
              />
            </Field>
            <Field
              label={
                form.publico === "cliente"
                  ? "Oficina onde é cliente (opcional)"
                  : "Empresa"
              }
            >
              <Input
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
            </Field>
            <Field
              label={form.publico === "cliente" ? "Ocupação (opcional)" : "Cargo"}
            >
              <Input
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              />
            </Field>
            {form.publico === "oficina" && (
              <>
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
              </>
            )}
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
            {perguntasForm.length === 0 ? (
              <EmptyState>
                Nenhuma pergunta cadastrada para{" "}
                {form.publico === "cliente" ? "o cliente final" : "a oficina"}. Monte o
                roteiro na página "Perguntas".
              </EmptyState>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {perguntasForm.map((p, i) => (
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
              {form.publico === "cliente"
                ? "O cliente confirmou a falta de informação?"
                : "A oficina identificou o problema pesquisado?"}
            </label>
            <Field label="Apontou outro problema mais relevante?">
              <Textarea
                value={form.outroProblema}
                onChange={(e) => setForm({ ...form, outroProblema: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label={
                form.publico === "cliente"
                  ? "O cliente entende o prazo da oficina?"
                  : "O cliente entende os prazos estimados?"
              }
            >
              <Select
                value={form.clienteEntendePrazos ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    clienteEntendePrazos: e.target.value as ClienteEntendePrazos,
                  })
                }
              >
                <option value="">Não informado</option>
                <option value="sim">Sim, entende</option>
                <option value="parcial">Parcialmente</option>
                <option value="nao">Não entende</option>
              </Select>
            </Field>
            <Field
              label={
                form.publico === "cliente"
                  ? "Já desistiu ou recusou serviço por atraso ou falta de aviso?"
                  : "Já recusou serviço por não entender o prazo?"
              }
            >
              <Select
                value={form.recusouServico ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    recusouServico: e.target.value as RecusouServico,
                  })
                }
              >
                <option value="">Não informado</option>
                <option value="sim">Sim, já perdeu serviço</option>
                <option value="nao">Não</option>
                <option value="incerto">Não sabe / incerto</option>
              </Select>
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

      {visiveis.length === 0 ? (
        <EmptyState>
          {lista.length === 0
            ? 'Nenhuma entrevista cadastrada. Clique em "Nova entrevista".'
            : "Nenhuma entrevista deste lado ainda. Troque o filtro ou cadastre uma nova."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {visiveis.map((e) => (
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
                    <Badge variant="soft">
                      {publicoDe(e) === "cliente" ? "Cliente final" : "Oficina"}
                    </Badge>
                    <Badge variant={VARIANTES_STATUS[e.status]}>{e.status}</Badge>
                    {e.identificouProblema && (
                      <Badge variant="solid">
                        {publicoDe(e) === "cliente"
                          ? "confirmou a dor"
                          : "identificou o problema"}
                      </Badge>
                    )}
                    {e.outroProblema.trim() && (
                      <Badge variant="outline">outro problema</Badge>
                    )}
                    {e.clienteEntendePrazos === "nao" && (
                      <Badge variant="outline">cliente não entende prazo</Badge>
                    )}
                    {e.recusouServico === "sim" && (
                      <Badge variant="solid">recusou serviço por prazo</Badge>
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
                  {perguntasDoPublico(perguntas, publicoDe(e))
                    .filter((p) =>
                      e.respostas.some(
                        (r) => r.perguntaId === p.id && r.resposta.trim(),
                      ),
                    )
                    .map((p, i) => {
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
                        !perguntasDoPublico(perguntas, publicoDe(e)).some(
                          (p) => p.id === r.perguntaId,
                        ) && r.resposta.trim(),
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
