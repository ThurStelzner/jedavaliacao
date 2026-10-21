"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiList } from "@/lib/api";
import { calcStats, META_ENTREVISTAS, META_PERC_PROBLEMA } from "@/lib/stats";
import type { Entrevista } from "@/lib/types";
import { publicoDe } from "@/lib/validacao";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";
import FluxogramaProblema from "@/components/FluxogramaProblema";

const tickStyle = { fill: "#737373", fontSize: 12 };
const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  boxShadow:
    "0 0 0 1px rgba(23,23,23,0.05), 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
  fontSize: 12,
  color: "#0a0a0a",
};

const CORES_PROBLEMA = ["#0a0a0a", "#a3a3a3", "#e5e5e5"];

const ROTULOS_RECUSA: Record<string, string> = {
  sim: "Sim",
  nao: "Não",
  incerto: "Incerto",
  "Não avaliaram o prazo": "Não responderam",
  "Não informado": "Não responderam",
};

const ROTULOS_PRAZO: Record<string, string> = {
  sim: "Entende bem",
  parcial: "Entende em parte",
  nao: "Não entende",
  "Não avaliaram o prazo": "Não responderam",
  "Não informado": "Não responderam",
};

const ROTULOS_CHECKIN: Record<string, string> = {
  verbal: "Verbal / sem registro",
  papel: "Papel / ordem impressa",
  sistema: "Sistema",
};

const ROTULOS_AVISO: Record<string, string> = {
  whatsapp: "WhatsApp",
  telefone: "Telefone",
  presencial: "Só presencial",
  nao_avisa: "Não avisa",
};

const ROTULOS_ATRASO: Record<string, string> = {
  sim: "Acontece",
  as_vezes: "Às vezes",
  nao: "Não acontece",
};

const ROTULOS_SOFTWARE: Record<string, string> = {
  sim: "Usa algum sistema",
  nao: "Não usa",
};

const ROTULOS_PORTE: Record<string, string> = {
  Microempresa: "Micro",
  "Pequena empresa": "Pequena",
  "Média empresa": "Média",
  "Grande empresa": "Grande",
};

const pct = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 100) : 0;

function contar(
  itens: Entrevista[],
  campo: "checkin" | "aviso" | "atraso" | "software",
  ordem: string[],
  rotulos: Record<string, string>,
) {
  const mapa = new Map<string, number>();
  let base = 0;
  for (const e of itens) {
    const valor = String(e[campo] ?? "").trim();
    if (!valor) continue;
    base += 1;
    mapa.set(valor, (mapa.get(valor) ?? 0) + 1);
  }
  return {
    base,
    dados: ordem.map((k) => ({ nome: rotulos[k] ?? k, valor: mapa.get(k) ?? 0 })),
  };
}

function GraficoBarras({
  dados,
  cor = "#0a0a0a",
}: {
  dados: Array<{ nome: string; valor: number }>;
  cor?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dados} layout="vertical" margin={{ left: 4, right: 26 }}>
        <XAxis
          type="number"
          allowDecimals={false}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nome"
          width={140}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
        <Bar dataKey="valor" fill={cor} radius={[0, 6, 6, 0]} barSize={20}>
          <LabelList
            dataKey="valor"
            position="right"
            style={{ fill: "#0a0a0a", fontSize: 12, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function BlocoGrafico({
  titulo,
  base,
  nota,
  children,
}: {
  titulo: string;
  base: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
      <p className="mt-1 text-caption text-mid-gray">{base}</p>
      <div className="mt-3 h-56">{children}</div>
      {nota && <p className="mt-2 text-caption text-mid-gray">{nota}</p>}
    </Card>
  );
}

export default function AnalisePage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const e = await apiList<Entrevista>("entrevistas");
      if (!ativo) return;
      setEntrevistas(e);
      setCarregando(false);
      setAtualizadoEm(new Date().toLocaleTimeString("pt-BR"));
    }
    carregar();
    const id = setInterval(carregar, 15000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  const reais = useMemo(() => entrevistas.filter((e) => !e.exemplo), [entrevistas]);
  const exemplos = entrevistas.length - reais.length;

  const oficina = useMemo(
    () => reais.filter((e) => publicoDe(e) === "oficina"),
    [reais],
  );
  const clientesReais = useMemo(
    () => reais.filter((e) => publicoDe(e) === "cliente"),
    [reais],
  );
  const clientesSimulados = useMemo(
    () => entrevistas.filter((e) => e.exemplo && publicoDe(e) === "cliente"),
    [entrevistas],
  );
  const stats = useMemo(() => calcStats(oficina), [oficina]);

  const dadosProblema = useMemo(
    () => [
      { nome: "Confirmam", valor: stats.identificaramProblema },
      {
        nome: "Não confirmam",
        valor: Math.max(stats.avaliaramProblema - stats.identificaramProblema, 0),
      },
      {
        nome: "Não responderam",
        valor: Math.max(stats.realizadas - stats.avaliaramProblema, 0),
      },
    ],
    [stats],
  );

  const dadosRecusa = useMemo(
    () =>
      stats.porRecusa.map((d) => ({
        nome: ROTULOS_RECUSA[d.faixa] ?? d.faixa,
        valor: d.total,
      })),
    [stats],
  );

  const dadosPrazo = useMemo(
    () =>
      stats.porClienteEntendePrazos.map((d) => ({
        nome: ROTULOS_PRAZO[d.faixa] ?? d.faixa,
        valor: d.total,
      })),
    [stats],
  );

  const checkin = useMemo(
    () =>
      contar(
        oficina,
        "checkin",
        ["verbal", "papel", "sistema"],
        ROTULOS_CHECKIN,
      ),
    [oficina],
  );

  const aviso = useMemo(
    () =>
      contar(
        oficina,
        "aviso",
        ["whatsapp", "telefone", "presencial", "nao_avisa"],
        ROTULOS_AVISO,
      ),
    [oficina],
  );

  const atraso = useMemo(
    () =>
      contar(oficina, "atraso", ["sim", "as_vezes", "nao"], ROTULOS_ATRASO),
    [oficina],
  );

  const software = useMemo(
    () => contar(oficina, "software", ["nao", "sim"], ROTULOS_SOFTWARE),
    [oficina],
  );

  const porPorte = useMemo(() => {
    const mapa = new Map<string, { confirmam: number; nao: number }>();
    for (const e of oficina) {
      const p = e.porte || "Não informado";
      const atual = mapa.get(p) ?? { confirmam: 0, nao: 0 };
      if (e.identificouProblema) atual.confirmam += 1;
      else atual.nao += 1;
      mapa.set(p, atual);
    }
    return ["Microempresa", "Pequena empresa", "Média empresa", "Grande empresa"]
      .filter((p) => mapa.has(p))
      .map((p) => {
        const v = mapa.get(p)!;
        return {
          nome: ROTULOS_PORTE[p] ?? p,
          confirmam: v.confirmam,
          nao: v.nao,
          total: v.confirmam + v.nao,
        };
      });
  }, [oficina]);

  const porteTotal = useMemo(
    () =>
      ["Microempresa", "Pequena empresa", "Média empresa", "Grande empresa"]
        .map((p) => ({
          nome: ROTULOS_PORTE[p] ?? p,
          valor: oficina.filter((e) => (e.porte || "Não informado") === p).length,
        }))
        .filter((d) => d.valor > 0),
    [oficina],
  );

  const dor = useMemo(() => {
    const responderamPrazo = reais.filter((e) =>
      Boolean((e.clienteEntendePrazos || "").trim()),
    );
    const naoParcial = responderamPrazo.filter(
      (e) =>
        e.clienteEntendePrazos === "nao" || e.clienteEntendePrazos === "parcial",
    ).length;
    const recusas = reais.filter((e) => e.recusouServico === "sim");
    return {
      basePrazo: responderamPrazo.length,
      naoParcial,
      percNaoEntendeParcial: pct(naoParcial, responderamPrazo.length),
      comRecusa: recusas.length,
      recusasSemEntendimento: recusas.filter(
        (e) =>
          e.clienteEntendePrazos === "nao" ||
          e.clienteEntendePrazos === "parcial",
      ).length,
    };
  }, [reais]);

  const atrasoRotina = useMemo(
    () =>
      atraso.dados
        .filter((d) => d.nome === "Acontece" || d.nome === "Às vezes")
        .reduce((acc, d) => acc + d.valor, 0),
    [atraso],
  );

  const sim = useMemo(() => {
    const total = clientesSimulados.length;
    return {
      total,
      cobrou: clientesSimulados.filter((e) => e.cobrouNoticia === "sim").length,
      desistiu: clientesSimulados.filter((e) => e.recusouServico === "sim")
        .length,
      semPrazo: clientesSimulados.filter(
        (e) =>
          e.clienteEntendePrazos === "nao" ||
          e.clienteEntendePrazos === "parcial",
      ).length,
      usariaQr: clientesSimulados.filter((e) => e.usariaQr === "sim").length,
    };
  }, [clientesSimulados]);

  if (carregando) {
    return <PageHeader title="Análise" subtitle="Carregando..." />;
  }

  const semDados = stats.realizadas === 0;
  const faltamEntrevistas = Math.max(META_ENTREVISTAS - stats.realizadas, 0);
  const faltamPontos = Math.max(META_PERC_PROBLEMA - stats.percIdentificaram, 0);
  const percRecusa = pct(stats.recusas, stats.realizadas);

  return (
    <div>
      <PageHeader
        title="Análise"
        subtitle={`${stats.realizadas} entrevistas com oficinas · ${stats.identificaramProblema} confirmam o problema · atualiza automaticamente${atualizadoEm ? ` (última: ${atualizadoEm})` : ""}`}
        right={
          <Badge variant={stats.validado ? "solid" : "outline"}>
            {stats.validado ? "Problema validado" : semDados ? "Sem dados" : "Em validação"}
          </Badge>
        }
      />

      <Card className="mb-4">
        <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
          O problema em uma frase
        </p>
        <p className="mt-2 max-w-4xl text-subheading font-semibold leading-snug text-ink md:text-heading-sm">
          Oficinas mecânicas perdem tempo porque não têm organização: o check-in é
          verbal ou no papel, o andamento do serviço fica na cabeça e tarefas
          simples demoram — e o cliente fica sem informação.
        </p>
        <p className="mt-3 max-w-3xl text-body text-mid-gray">
          Os números abaixo saem das {stats.realizadas} entrevistas reais com
          oficinas. Cada gráfico mostra a base de cálculo.
        </p>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-ink">Resumo executivo</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          <li>
            <span className="font-medium text-ink">
              {stats.realizadas} oficinas entrevistadas
            </span>{" "}
            em Joinville; {stats.avaliaramProblema} responderam ao critério e{" "}
            {stats.identificaramProblema} confirmam o problema (
            {stats.percIdentificaram}%).
          </li>
          <li>
            <span className="font-medium text-ink">
              {atrasoRotina} de {atraso.base} relatam atraso
            </span>{" "}
            ({pct(atrasoRotina, atraso.base)}%) — não é exceção, é rotina.
          </li>
          <li>
            <span className="font-medium text-ink">
              {checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.verbal)?.valor ?? 0}{" "}
              de {checkin.base} não têm registro formal
            </span>{" "}
            do check-in: fazem verbal ou no papel.
          </li>
          <li>
            <span className="font-medium text-ink">
              {dor.naoParcial} de {dor.basePrazo} dizem que o cliente não entende o
              prazo
            </span>{" "}
            ({dor.percNaoEntendeParcial}%).
          </li>
          <li>
            <span className="font-medium text-ink">
              {dor.comRecusa} de {dor.basePrazo} já perderam serviço
            </span>{" "}
            ({pct(dor.comRecusa, dor.basePrazo)}%) — e os {dor.comRecusa} também
            relatam cliente sem informação.
          </li>
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Stat
          label="Entrevistas realizadas"
          value={`${stats.realizadas}/${META_ENTREVISTAS}`}
        />
        <Stat label="Confirmam o problema" value={`${stats.percIdentificaram}%`} />
        <Stat
          label="Relatam atraso"
          value={`${pct(atrasoRotina, atraso.base)}%`}
        />
        <Stat label="Perderam serviço por prazo" value={String(stats.recusas)} />
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Critérios de validação</h2>
          <p className="text-caption text-mid-gray">
            meta: {META_ENTREVISTAS} entrevistas + {META_PERC_PROBLEMA}% de confirmação
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-ink-soft">Entrevistas realizadas</span>
              <span className="font-medium text-ink">
                {stats.realizadas}/{META_ENTREVISTAS}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-ink transition-all"
                style={{ width: `${stats.percMeta}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-ink-soft">Confirmam o problema</span>
              <span className="font-medium text-ink">
                {stats.identificaramProblema} de {stats.avaliaramProblema} ·{" "}
                {stats.percIdentificaram}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(stats.percIdentificaram, 100)}%`,
                  background: stats.validado ? "#15803d" : "#0a0a0a",
                }}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-soft">
          {stats.validado ? (
            <>
              Critérios atingidos: {stats.realizadas} entrevistas e{" "}
              {stats.percIdentificaram}% de confirmação. As{" "}
              {Math.max(stats.realizadas - stats.avaliaramProblema, 0)} entrevistas
              que não responderam ao critério ficam fora do percentual.
            </>
          ) : (
            <>
              {faltamEntrevistas > 0 && (
                <>Faltam {faltamEntrevistas} entrevista(s). </>
              )}
              {faltamPontos > 0 && (
                <>Faltam {faltamPontos} ponto(s) percentual(is) de confirmação. </>
              )}
              O percentual considera só quem respondeu ao critério (
              {stats.avaliaramProblema} de {stats.realizadas}).
            </>
          )}
        </p>
      </Card>

      <div className="mt-10">
        <h2 className="text-heading-sm font-semibold text-ink md:text-heading">
          Como a oficina trabalha hoje
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          A causa da definição, medida nas respostas abertas. Classificação feita
          pela equipe a partir do que cada dono relatou.
        </p>

        {semDados ? (
          <EmptyState>
            Nenhuma entrevista realizada ainda. Registre as oficinas para gerar os
            gráficos.
          </EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <BlocoGrafico
              titulo="O atraso acontece?"
              base={`Base: ${atraso.base} entrevistas que responderam`}
              nota={`${atrasoRotina} de ${atraso.base} relatam atraso (${pct(atrasoRotina, atraso.base)}%).`}
            >
              <GraficoBarras dados={atraso.dados} />
            </BlocoGrafico>

            <BlocoGrafico
              titulo="Como o check-in é registrado?"
              base={`Base: ${checkin.base} entrevistas que responderam · ${Math.max(stats.realizadas - checkin.base, 0)} não informaram`}
              nota={`${checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.verbal)?.valor ?? 0} fazem verbal, ${checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.papel)?.valor ?? 0} no papel e ${checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.sistema)?.valor ?? 0} em sistema.`}
            >
              <GraficoBarras dados={checkin.dados} />
            </BlocoGrafico>

            <BlocoGrafico
              titulo="Como o cliente é avisado?"
              base={`Base: ${aviso.base} entrevistas que responderam · ${Math.max(stats.realizadas - aviso.base, 0)} não abordaram`}
              nota="Nenhuma oficina relata aviso automático: todo aviso depende de alguém lembrar."
            >
              <GraficoBarras dados={aviso.dados} />
            </BlocoGrafico>

            <BlocoGrafico
              titulo="Já usa algum software?"
              base={`Base: ${software.base} entrevistas que falaram de ferramentas`}
              nota="Todos os que usam sistema também relatam que ele não cobre o check-in ou a comunicação como precisam."
            >
              <GraficoBarras dados={software.dados} />
            </BlocoGrafico>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-heading-sm font-semibold text-ink md:text-heading">
          A dor que o cliente sente
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          Cada gráfico mostra a base — nada de percentual solto.
        </p>

        {!semDados && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold text-ink">
                O problema é real para a oficina?
              </h3>
              <p className="mt-1 text-caption text-mid-gray">
                Base: {stats.avaliaramProblema} entrevistas que responderam ·{" "}
                {stats.percIdentificaram}% confirmam
              </p>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosProblema}
                      dataKey="valor"
                      nameKey="nome"
                      innerRadius={52}
                      outerRadius={86}
                      paddingAngle={2}
                      label={(d: { name?: string; value?: number }) =>
                        `${d.name}: ${d.value}`
                      }
                      labelLine={false}
                    >
                      {dadosProblema.map((d, i) => (
                        <Cell key={d.nome} fill={CORES_PROBLEMA[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-caption text-mid-gray">
                {stats.identificaramProblema} confirmam ·{" "}
                {Math.max(stats.avaliaramProblema - stats.identificaramProblema, 0)}{" "}
                não confirmam ·{" "}
                {Math.max(stats.realizadas - stats.avaliaramProblema, 0)} não
                responderam
              </p>
            </Card>

            <BlocoGrafico
              titulo="O cliente entende o prazo?"
              base={`Base: ${stats.realizadas} entrevistas`}
              nota={`${dor.naoParcial} de ${dor.basePrazo} dizem que o cliente não entende ou entende só em parte (${dor.percNaoEntendeParcial}%).`}
            >
              <GraficoBarras dados={dadosPrazo} />
            </BlocoGrafico>

            <BlocoGrafico
              titulo="Já perdeu serviço por causa do prazo?"
              base={`Base: ${stats.realizadas} entrevistas`}
              nota={`${stats.recusas} já perderam serviço (${percRecusa}%).`}
            >
              <GraficoBarras dados={dadosRecusa} />
            </BlocoGrafico>

            <Card>
              <h3 className="text-sm font-semibold text-ink">
                Quem perde serviço também não comunica?
              </h3>
              <p className="mt-1 text-caption text-mid-gray">
                Base: {dor.comRecusa} oficinas que já perderam serviço
              </p>
              <p className="mt-6 text-heading font-semibold text-ink">
                {dor.recusasSemEntendimento} de {dor.comRecusa}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                das oficinas que perderam serviço também relatam que o cliente não
                entende o prazo (
                {pct(dor.recusasSemEntendimento, dor.comRecusa)}%).
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${pct(dor.recusasSemEntendimento, dor.comRecusa)}%` }}
                />
              </div>
              <p className="mt-4 text-caption text-mid-gray">
                A comunicação ruim e a perda de serviço aparecem juntas nos relatos.
                Não prova causa sozinha, mas é o padrão mais forte da amostra.
              </p>
            </Card>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-heading-sm font-semibold text-ink md:text-heading">
          Quem foi ouvido
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          O caminho da amostra, sem esconder quem ficou de fora.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="text-sm font-semibold text-ink">Funil da validação</h3>
            <p className="mt-1 text-caption text-mid-gray">
              Base: {stats.realizadas} entrevistas realizadas
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  nome: "Entrevistadas",
                  valor: stats.realizadas,
                  largura: 100,
                  nota: "",
                },
                {
                  nome: "Responderam ao critério",
                  valor: stats.avaliaramProblema,
                  largura: pct(stats.avaliaramProblema, stats.realizadas),
                  nota: `−${Math.max(stats.realizadas - stats.avaliaramProblema, 0)} não responderam`,
                },
                {
                  nome: "Confirmam o problema",
                  valor: stats.identificaramProblema,
                  largura: pct(stats.identificaramProblema, stats.realizadas),
                  nota: `−${Math.max(stats.avaliaramProblema - stats.identificaramProblema, 0)} não confirmam`,
                },
              ].map((etapa) => (
                <div key={etapa.nome}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-ink-soft">{etapa.nome}</span>
                    <span className="font-medium text-ink">{etapa.valor}</span>
                  </div>
                  <div className="mt-1.5 h-7 w-full overflow-hidden rounded-buttons bg-canvas">
                    <div
                      className="flex h-full items-center justify-end rounded-buttons bg-ink px-2 text-caption font-medium text-[#fafafa]"
                      style={{ width: `${etapa.largura}%` }}
                    >
                      {etapa.largura}%
                    </div>
                  </div>
                  {etapa.nota && (
                    <p className="mt-1 text-caption text-mid-gray">{etapa.nota}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <BlocoGrafico
            titulo="Entrevistas por porte"
            base={`Base: ${stats.realizadas} entrevistas`}
            nota="22 das 26 são micro ou pequenas — o recorte é de oficina de bairro."
          >
            <GraficoBarras dados={porteTotal} />
          </BlocoGrafico>

          <Card className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-ink">
              Confirmação por porte
            </h3>
            <p className="mt-1 text-caption text-mid-gray">
              Base: {stats.realizadas} entrevistas · barra escura = confirmam
            </p>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={porPorte}
                  layout="vertical"
                  margin={{ left: 4, right: 16 }}
                >
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={80}
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="confirmam"
                    name="Confirmam"
                    stackId="a"
                    fill="#0a0a0a"
                    radius={[6, 0, 0, 6]}
                    barSize={22}
                  />
                  <Bar
                    dataKey="nao"
                    name="Não confirmam / não responderam"
                    stackId="a"
                    fill="#d4d4d4"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-caption text-mid-gray">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink" /> Confirmam
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#d4d4d4]" /> Não confirmam
                / não responderam
              </span>
            </div>
            <p className="mt-2 text-caption text-mid-gray">
              {porPorte
                .map((p) => `${p.nome}: ${p.confirmam}/${p.total}`)
                .join(" · ")}
            </p>
          </Card>
        </div>
      </div>

      <Card className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Onde atacar primeiro</h2>
        <p className="mt-1 text-caption text-mid-gray">
          Eixo X = frequência medida nas entrevistas · eixo Y = impacto estimado
          pela equipe (1 a 5). O impacto não é medição, é julgamento declarado.
        </p>
        <div className="relative mt-6 h-80 w-full rounded-cards border border-hairline bg-canvas">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-b border-r border-hairline" />
            <div className="border-b border-hairline" />
            <div className="border-r border-hairline" />
            <div />
          </div>
          <span className="absolute left-2 top-2 text-caption text-mid-gray">
            alta frequência · alto impacto
          </span>
          <span className="absolute bottom-2 right-2 text-caption text-mid-gray">
            baixa frequência · baixo impacto
          </span>
          {[
            { nome: "Atraso é rotina", freq: 95, impacto: 3, base: "21/22" },
            {
              nome: "Cliente sem informação",
              freq: 73,
              impacto: 4,
              base: "16/22",
            },
            { nome: "Perda de serviço", freq: 32, impacto: 5, base: "7/22" },
          ].map((p) => (
            <div
              key={p.nome}
              className="absolute z-10 -translate-x-1/2 translate-y-1/2"
              style={{
                left: `${Math.min(p.freq, 90)}%`,
                bottom: `${(p.impacto / 5) * 100}%`,
              }}
            >
              <div className="flex flex-col items-center">
                <span className="whitespace-nowrap rounded-buttons border border-hairline bg-paper px-2 py-1 text-caption font-medium text-ink shadow-sm">
                  {p.nome} · {p.base}
                </span>
                <span className="mt-1 h-3 w-3 rounded-full bg-ink" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-caption text-mid-gray">
          Prioridade: perda de serviço (impacto 5) e cliente sem informação
          (frequência 73%). O atraso é o sintoma que aparece em quase toda
          entrevista, mas atacar só ele não resolve o registro.
        </p>
      </Card>

      <div className="mt-10">
        <h2 className="text-heading-sm font-semibold text-ink md:text-heading">
          O que isso custa na prática
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          Números tirados das entrevistas — nada estimado por fora.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-caption font-medium uppercase text-mid-gray">
              Perda de serviço
            </p>
            <p className="mt-2 text-heading font-semibold text-ink">
              {stats.recusas} de {stats.realizadas}
            </p>
            <p className="mt-1 text-caption text-mid-gray">
              oficinas já perderam serviço por prazo ({percRecusa}%). Uma relatou
              perder R$ 100 num único cliente que desistiu de esperar a peça.
            </p>
          </Card>
          <Card>
            <p className="text-caption font-medium uppercase text-mid-gray">
              Tempo do check-in
            </p>
            <p className="mt-2 text-heading font-semibold text-ink">Sem padrão</p>
            <p className="mt-1 text-caption text-mid-gray">
              {checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.verbal)?.valor ?? 0}{" "}
              de {checkin.base} não registram nada por escrito: o prazo vive na
              cabeça de quem atende.
            </p>
          </Card>
          <Card>
            <p className="text-caption font-medium uppercase text-mid-gray">
              Comunicação com o cliente
            </p>
            <p className="mt-2 text-heading font-semibold text-ink">
              {dor.naoParcial} de {dor.basePrazo}
            </p>
            <p className="mt-1 text-caption text-mid-gray">
              oficinas dizem que o cliente não entende o prazo (
              {dor.percNaoEntendeParcial}% das que responderam) — e só avisam
              quando ele cobra.
            </p>
          </Card>
        </div>

        <Card className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Na voz dos donos</h2>
            <p className="text-caption text-mid-gray">
              citações das {stats.realizadas} entrevistas
            </p>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              {
                fala: "“Você perde mais tempo explicando do que consertando.”",
                fonte: "Oficina Mecânica do Paulinho",
              },
              {
                fala:
                  "“Quase metade das recusas de serviço é por causa do tempo de serviço.”",
                fonte: "AJ União",
              },
              {
                fala: "“Você não avisou, então achei que estava pronto.”",
                fonte: "Mecânica Weber",
              },
              {
                fala: "“A informação morre entre o box e o balcão.”",
                fonte: "Mecânica Andrade",
              },
              {
                fala: "“Olha o carro, chuta um prazo e torce.”",
                fonte: "Auto Mecânica do Toninho",
              },
            ].map((q) => (
              <li key={q.fonte} className="border-l-2 border-ink pl-4">
                <p className="text-body-lg text-ink-soft">{q.fala}</p>
                <p className="mt-1 text-caption text-mid-gray">{q.fonte}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Cliente final</h2>
          <Badge variant="outline">simulação · não é evidência</Badge>
        </div>
        <p className="mt-1 text-caption text-mid-gray">
          {sim.total} respostas criadas para testar o roteiro. Não entram nos
          percentuais de validação e precisam ser substituídas por conversas reais.
        </p>

        {sim.total > 0 ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Já cobraram notícia" value={`${sim.cobrou}/${sim.total}`} />
              <Stat
                label="Já desistiram do serviço"
                value={`${sim.desistiu}/${sim.total}`}
              />
              <Stat
                label="Não entendem o prazo"
                value={`${sim.semPrazo}/${sim.total}`}
              />
              <Stat label="Usariam o QR code" value={`${sim.usariaQr}/${sim.total}`} />
            </div>
            <p className="mt-3 text-caption text-mid-gray">
              {clientesReais.length} entrevistas reais com clientes finais até agora.
              A meta é 12 reais — hoje há {sim.total} simulações no lugar.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">
            Nenhuma resposta de cliente final registrada.
          </p>
        )}
      </Card>

      <Card className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Benchmark do setor</h2>
        <p className="mt-1 text-caption text-mid-gray">
          Referências externas — não são nossos dados e não entram nos percentuais.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-ink-soft">
          <li>
            <span className="font-medium text-ink">MOTOR (ago/2026), 14 oficinas dos EUA:</span>{" "}
            78% enviam atualização de status; 7% só quando o cliente pede; 50%
            dependem do tipo de serviço.
          </li>
          <li>
            <span className="font-medium text-ink">MOTOR (ago/2026):</span> 71% usam
            sistema de gestão e 35% têm portal/app, mas 85% apontam o cliente que
            não responde como maior desafio e 71% sofrem com atraso na aprovação.
          </li>
          <li>
            <span className="font-medium text-ink">Leitura para nós:</span> ter
            ferramenta não basta; o que falta é rotina de registro e aviso. É
            exatamente o que os 26 relatos mostram.
          </li>
        </ul>
        <p className="mt-3 text-caption text-mid-gray">
          Fonte: motor.com/2026/08/automotive-service-shop-communication-survey
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Objeções da banca</h2>
        <div className="mt-4 space-y-4">
          {[
            {
              pergunta: "“Gestão ruim é vago.”",
              resposta: `A definição não para no adjetivo: ${checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.verbal)?.valor ?? 0} de ${checkin.base} não registram o check-in e ${checkin.dados.find((d) => d.nome === ROTULOS_CHECKIN.papel)?.valor ?? 0} usam papel; ${aviso.dados[0]?.valor ?? 0} avisam por WhatsApp e ${aviso.dados[1]?.valor ?? 0} por telefone, sempre manual.`,
            },
            {
              pergunta: "“Quanto tempo eles perdem?”",
              resposta:
                "Ainda não cronometramos. É a próxima medição: tempo de check-in em 5 oficinas, antes e depois. Sem isso, “perde tempo” fica qualitativo — mas é sustentado por 21 de 22 relatos de atraso.",
            },
            {
              pergunta: "“Por que a oficina pagaria?”",
              resposta:
                "Não validamos preço. Sabemos que 2 de 5 que falaram de ferramentas já usam algum sistema e reclamam de custo e cobertura. Preço é hipótese, não evidência.",
            },
            {
              pergunta: "“A amostra não é pequena e regional?”",
              resposta:
                "É: 26 oficinas de Joinville, 22 delas micro ou pequenas. Serve para validar o problema no recorte, não para generalizar o setor.",
            },
            {
              pergunta: "“E o cliente final?”",
              resposta:
                "Ainda não foi ouvido de verdade: 0 entrevistas reais. As 12 respostas no site são simulação para testar o roteiro e estão marcadas como tal.",
            },
          ].map((o) => (
            <div key={o.pergunta} className="border-l-2 border-hairline pl-4">
              <p className="text-sm font-medium text-ink">{o.pergunta}</p>
              <p className="mt-1 text-sm text-ink-soft">{o.resposta}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Próximos passos</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Cronometrar o check-in em 5 oficinas (tempo atual vs. meta de 2 min).</li>
            <li>
              Aplicar o roteiro do cliente final em 12 conversas reais e substituir a
              simulação.
            </li>
            <li>Testar disposição a pagar com 5 donos (hipótese, não promessa).</li>
            <li>Fechar o MVP: check-in por áudio + aviso automático ao cliente.</li>
            <li>Revisar a definição com os números finais antes da banca.</li>
          </ol>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">O que ainda falta provar</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <span className="font-medium text-ink">Cliente final:</span>{" "}
              {clientesReais.length} de 12 entrevistas reais.
            </li>
            <li>
              <span className="font-medium text-ink">Tempo:</span> nenhum check-in
              foi cronometrado.
            </li>
            <li>
              <span className="font-medium text-ink">Preço:</span> nenhuma oficina
              testou pagar pela solução.
            </li>
            <li>
              <span className="font-medium text-ink">Outro problema:</span>{" "}
              {stats.outroProblema} de {stats.realizadas} apontam outro problema mais
              relevante ({stats.percOutroProblema}%) — risco de a tese não ser a
              principal.
            </li>
          </ul>
        </Card>
      </div>

      <details className="group mt-10 rounded-cards border border-hairline bg-paper p-5">
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
          Detalhes da validação (perfil da amostra, sintomas e causa raiz)
          <span className="ml-2 text-caption font-normal text-mid-gray">
            clique para abrir
          </span>
        </summary>

        <div className="mt-5 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.porPorte.map((p) => (
              <div
                key={p.porte}
                className="rounded-cards border border-hairline bg-surface-alt p-3"
              >
                <p className="text-caption text-mid-gray">{p.porte}</p>
                <p className="mt-1 text-xl font-semibold text-ink">{p.total}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Quem entrevistou</p>
            <p className="mt-1 text-sm text-ink-soft">
              {stats.porResponsavel
                .map((r) => `${r.responsavel} (${r.total})`)
                .join(" · ")}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Sintomas relatados</p>
            <ul className="mt-2 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
              {[
                "Mecânico não atualiza nada — só fala quando o cliente cobra",
                "Mecânicos fazem tudo na oficina; não sobra tempo para responder",
                "Avisos sem padrão: tem dia que avisa 3 clientes, tem dia que não avisa nenhum",
                "Prazo e orçamento “de cabeça”, sem registro estruturado",
                "Check-in no papel ou só verbal",
                "Cliente precisa cobrar ou ir à oficina antes de o carro ficar pronto",
              ].map((s) => (
                <li key={s} className="list-disc pl-1 marker:text-mid-gray">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Lacuna da amostra</p>
            <p className="mt-1 text-sm text-ink-soft">
              {clientesReais.length} de 12 entrevistas com clientes finais. O lado de
              quem recebe o aviso ainda não foi ouvido de verdade.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Fluxograma do problema</p>
            <p className="mb-3 mt-1 text-caption text-mid-gray">
              Como o check-in lento e a falta de comunicação travam o serviço
            </p>
            <Card>
              <FluxogramaProblema />
            </Card>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">
              Espinha de peixe (causa raiz)
            </p>
            <p className="mb-3 mt-1 text-caption text-mid-gray">
              Falta de organização para atualizar o cliente
            </p>
            <Card>
              <img
                src="/diagramas/oficina.svg"
                alt="Diagrama de espinha de peixe: causas da falta de organização para atualizar o cliente nas oficinas mecânicas"
                className="w-full rounded-inputs border border-hairline bg-paper"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className="inline-flex h-9 items-center rounded-buttons bg-ink px-3 text-sm font-medium text-[#fafafa] hover:bg-ink-soft"
                  href="/diagramas/oficina.svg"
                  download
                >
                  Baixar SVG
                </a>
                <a
                  className="inline-flex h-9 items-center rounded-buttons border border-hairline px-3 text-sm font-medium text-ink hover:bg-canvas"
                  href="/diagramas/oficina.png"
                  download
                >
                  Baixar PNG
                </a>
              </div>
            </Card>
          </div>
        </div>
      </details>

      {exemplos > 0 && (
        <p className="mt-6 text-caption text-mid-gray">
          {exemplos} registros de demonstração/simulação ficaram fora dos números de
          oficina.
        </p>
      )}
    </div>
  );
}
