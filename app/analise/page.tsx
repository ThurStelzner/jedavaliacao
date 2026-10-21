"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
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

const pct = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 100) : 0;

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

  const oficina = useMemo(() => reais.filter((e) => publicoDe(e) === "oficina"), [reais]);
  const clientes = useMemo(() => reais.filter((e) => publicoDe(e) === "cliente"), [reais]);
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

  // Análise de prevalência da dor, calculada das entrevistas reais.
  const dor = useMemo(() => {
    const responderamPrazo = reais.filter((e) =>
      Boolean((e.clienteEntendePrazos || "").trim()),
    );
    const naoParcial = responderamPrazo.filter(
      (e) => e.clienteEntendePrazos === "nao" || e.clienteEntendePrazos === "parcial",
    ).length;
    const recusas = reais.filter((e) => e.recusouServico === "sim");
    return {
      basePrazo: responderamPrazo.length,
      naoParcial,
      percNaoEntendeParcial: Math.round(
        (naoParcial / (responderamPrazo.length || 1)) * 100,
      ),
      comRecusa: recusas.length,
      recusasSemEntendimento: recusas.filter(
        (e) => e.clienteEntendePrazos === "nao",
      ).length,
    };
  }, [reais]);

  // Cenário de impacto: hipóteses de trabalho que a equipe pode ajustar.
  const [cenario, setCenario] = useState({
    veiculosDia: 12,
    minutosCheckin: 15,
    reducaoPct: 50,
    valorHora: 45,
  });
  function mudaCenario(chave: keyof typeof cenario, valor: string) {
    const n = Number(valor.replace(",", "."));
    setCenario((c) => ({ ...c, [chave]: Number.isFinite(n) && n >= 0 ? n : 0 }));
  }
  const horasSemanaCheckin = (cenario.veiculosDia * 5 * cenario.minutosCheckin) / 60;
  const horasEconomizadas = (horasSemanaCheckin * cenario.reducaoPct) / 100;
  const valorMes = horasEconomizadas * 4.33 * cenario.valorHora;

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
          Oficinas perdem tempo com check-in lento, falta de comunicação com o
          cliente e má gestão: o serviço encalha, o cliente fica sem resposta e a
          oficina perde produtividade.
        </p>
        <p className="mt-3 max-w-3xl text-body text-mid-gray">
          A causa é a gestão do dia a dia (check-in e andamento sem padrão); a
          falta de comunicação é a consequência que o cliente sente. Abaixo estão
          apenas os números que sustentam essa frase: {stats.realizadas}{" "}
          entrevistas realizadas, {stats.avaliaramProblema} responderam à pergunta
          de validação.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Stat
          label="Entrevistas realizadas"
          value={`${stats.realizadas}/${META_ENTREVISTAS}`}
        />
        <Stat
          label="Confirmam o problema"
          value={`${stats.percIdentificaram}%`}
        />
        <Stat label="Perderam serviço por prazo" value={String(stats.recusas)} />
        <Stat label="Indicações obtidas" value={String(stats.indicacoes)} />
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
          Prova principal
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          Cada gráfico mostra a base de cálculo — nada de percentual solto.
        </p>

        {semDados ? (
          <EmptyState>
            Nenhuma entrevista realizada ainda. Registre as oficinas para gerar os
            gráficos.
          </EmptyState>
        ) : (
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

            <Card>
              <h3 className="text-sm font-semibold text-ink">
                Já perdeu serviço por causa do prazo?
              </h3>
              <p className="mt-1 text-caption text-mid-gray">
                Base: {stats.realizadas} entrevistas · {stats.recusas} já perderam
                serviço ({percRecusa}%)
              </p>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosRecusa} layout="vertical" margin={{ left: 8 }}>
                    <XAxis type="number" allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={108}
                      tick={tickStyle}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                    <Bar dataKey="valor" fill="#0a0a0a" radius={[0, 6, 6, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-caption text-mid-gray">
                {stats.recusas} sim ·{" "}
                {stats.porRecusa.find((d) => d.faixa === "nao")?.total ?? 0} não ·{" "}
                {stats.porRecusa.find((d) => d.faixa === "incerto")?.total ?? 0}{" "}
                incerto
              </p>
            </Card>
          </div>
        )}
      </div>

      {!semDados && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold text-ink">
            O cliente entende o prazo?
          </h3>
          <p className="mt-1 text-caption text-mid-gray">
            Pergunta feita dentro da entrevista com a oficina · base:{" "}
            {stats.realizadas}
          </p>
          <ul className="mt-4 space-y-2.5">
            {dadosPrazo.map((d) => (
              <li key={d.nome} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-ink-soft">{d.nome}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
                  <span
                    className="block h-full rounded-full bg-ink"
                    style={{ width: `${pct(d.valor, stats.realizadas)}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-ink">
                  {d.valor} ({pct(d.valor, stats.realizadas)}%)
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!semDados && (
        <Card className="mt-10">
          <h2 className="text-sm font-semibold text-ink">
            Prevalência da dor: quem sente e quanto
          </h2>
          <p className="mb-4 mt-1 text-caption text-mid-gray">
            Percentuais calculados das entrevistas reais — cada linha mostra a base
            usada.
          </p>
          <div className="space-y-4">
            {[
              {
                nome: "Percebem o problema como real",
                valor: stats.identificaramProblema,
                total: stats.realizadas,
                base: `${stats.realizadas} entrevistas`,
              },
              {
                nome: "Cliente não entende o prazo (não + parcial)",
                valor: dor.naoParcial,
                total: dor.basePrazo,
                base: `${dor.basePrazo} que responderam`,
              },
              {
                nome: "Já perderam serviço por prazo",
                valor: stats.recusas,
                total: stats.realizadas,
                base: `${stats.realizadas} entrevistas`,
              },
              {
                nome: "Apontam outro problema mais relevante",
                valor: stats.outroProblema,
                total: stats.realizadas,
                base: `${stats.realizadas} entrevistas`,
              },
            ].map((linha) => (
              <div key={linha.nome}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink-soft">
                    {linha.nome}{" "}
                    <span className="text-caption text-mid-gray">
                      (base: {linha.base})
                    </span>
                  </span>
                  <span className="font-medium text-ink">
                    {linha.valor} · {pct(linha.valor, linha.total)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-ink transition-all"
                    style={{ width: `${pct(linha.valor, linha.total)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-caption text-mid-gray">
            Das {dor.comRecusa} oficinas que já perderam serviço por prazo,{" "}
            {dor.recusasSemEntendimento} também relatam que o cliente não entende
            o prazo — a dor da comunicação anda junto com a perda de serviço. A
            dor do lado do cliente final ainda não foi medida: 0 de 10 clientes
            entrevistados.
          </p>
        </Card>
      )}

      <Card className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">
            Quanto vale resolver? (cálculo de impacto)
          </h2>
          <p className="text-caption text-mid-gray">hipóteses ajustáveis</p>
        </div>
        <p className="mb-4 mt-1 max-w-3xl text-caption text-mid-gray">
          Os donos relatam check-in sem padrão (papel, verbal, "de cabeça"). Se o
          tempo do check-in cair pela metade, quanto a oficina recupera? Ajuste os
          valores para a sua oficina-alvo.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Veículos por dia</span>
            <input
              type="number"
              min={0}
              value={cenario.veiculosDia}
              onChange={(ev) => mudaCenario("veiculosDia", ev.target.value)}
              className="h-10 w-full rounded-inputs border border-transparent bg-canvas px-2.5 py-2 text-body text-ink outline-none transition-colors focus:border-hairline focus:bg-paper"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Minutos por check-in</span>
            <input
              type="number"
              min={0}
              value={cenario.minutosCheckin}
              onChange={(ev) => mudaCenario("minutosCheckin", ev.target.value)}
              className="h-10 w-full rounded-inputs border border-transparent bg-canvas px-2.5 py-2 text-body text-ink outline-none transition-colors focus:border-hairline focus:bg-paper"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Redução esperada (%)

            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={cenario.reducaoPct}
              onChange={(ev) => mudaCenario("reducaoPct", ev.target.value)}
              className="h-10 w-full rounded-inputs border border-transparent bg-canvas px-2.5 py-2 text-body text-ink outline-none transition-colors focus:border-hairline focus:bg-paper"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Valor da hora (R$)</span>
            <input
              type="number"
              min={0}
              value={cenario.valorHora}
              onChange={(ev) => mudaCenario("valorHora", ev.target.value)}
              className="h-10 w-full rounded-inputs border border-transparent bg-canvas px-2.5 py-2 text-body text-ink outline-none transition-colors focus:border-hairline focus:bg-paper"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption font-medium uppercase text-mid-gray">
              Check-in hoje
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {Math.round(horasSemanaCheckin * 10) / 10} h/semana
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption font-medium uppercase text-mid-gray">
              Economia com {cenario.reducaoPct}% de redução
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {Math.round(horasEconomizadas * 10) / 10} h/semana
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption font-medium uppercase text-mid-gray">
              Valor aproximado
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              R$ {Math.round(valorMes)}/mês
            </p>
          </div>
        </div>
        <p className="mt-3 text-caption text-mid-gray">
          Estimativa para o cálculo de valor (o check-in ainda não foi cronometrado
          nas entrevistas — vale medir na próxima rodada). Resolver 50% do tempo é
          o cenário usado como exemplo, não uma meta confirmada.
        </p>
      </Card>

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
                "Check-in no papel e informação só verbal",
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
              {clientes.length} de 10 entrevistas com clientes finais. O lado de
              quem recebe o aviso ainda não foi ouvido.
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
          {exemplos} entrevistas de demonstração ficaram fora de todos os números.
        </p>
      )}
    </div>
  );
}
