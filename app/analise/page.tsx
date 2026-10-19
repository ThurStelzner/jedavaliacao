"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
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
import { META_CLIENTE, publicoDe } from "@/lib/validacao";
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

const CORES_PROBLEMA = ["#0a0a0a", "#e5e5e5", "#d4d4d4"];
const CORES_RECUSA = ["#dc2626", "#0a0a0a", "#a3a3a3", "#e5e5e5"];

const ROTULOS_RECUSA: Record<string, string> = {
  sim: "Sim, já perdeu serviço",
  nao: "Não",
  incerto: "Incerto",
  "Não avaliaram o prazo": "Não avaliaram o prazo",
  "Não informado": "Não informado",
};

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

  const oficina = useMemo(
    () => entrevistas.filter((e) => publicoDe(e) === "oficina"),
    [entrevistas],
  );
  const cliente = useMemo(
    () => entrevistas.filter((e) => publicoDe(e) === "cliente"),
    [entrevistas],
  );
  const stats = useMemo(() => calcStats(oficina), [oficina]);
  const statsCliente = useMemo(() => calcStats(cliente), [cliente]);

  const dadosProblema = [
    { nome: "Sim, é problema real", valor: stats.identificaramProblema },
    {
      nome: "Não identificou",
      valor: Math.max(stats.avaliaramProblema - stats.identificaramProblema, 0),
    },
    {
      nome: "Não avaliaram o problema",
      valor: Math.max(stats.realizadas - stats.avaliaramProblema, 0),
    },
  ];

  const dadosRecusa = stats.porRecusa.map((d) => ({
    nome: ROTULOS_RECUSA[d.faixa] ?? d.faixa,
    valor: d.total,
  }));

  const dadosResponsavel = stats.porResponsavel.map((d) => ({
    nome: d.responsavel,
    total: d.total,
  }));

  if (carregando) {
    return <PageHeader title="Análise" subtitle="Carregando..." />;
  }

  const semDados = stats.realizadas === 0;

  return (
    <div>
      <PageHeader
        title="Análise & Validação"
        subtitle={`Organização do fluxo e comunicação com o cliente em oficinas automotivas · atualiza automaticamente${atualizadoEm ? ` (última: ${atualizadoEm})` : ""}`}
      />

      <Card className="mb-6">
        <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
          Qual é o problema?
        </p>
        <p className="mt-1.5 text-body text-ink-soft">
          A validação tem dois lados. No lado da oficina,{" "}
          <strong className="font-semibold text-ink">
            o check-in e o andamento do serviço ficam na cabeça de quem está na
            oficina
          </strong>
          , sem registro com padrão — o aviso ao cliente só acontece quando ele
          cobra. No lado do cliente final, a consequência é{" "}
          <strong className="font-semibold text-ink">
            ficar sem informação, cobrar, ir à oficina ou desistir do serviço
          </strong>
          . A causa está na organização da oficina; a comunicação é o efeito.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
              Lado 1 · Oficina (já ouvida)
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft marker:text-mid-gray">
              <li>Check-in no papel e informação só verbal.</li>
              <li>Prazo e orçamento "de cabeça", sem registro.</li>
              <li>Ninguém é dono do aviso; o mecânico não reporta.</li>
            </ul>
            <p className="mt-2 text-caption text-mid-gray">
              {oficina.length} entrevistas · {stats.percIdentificaram}% confirmam ·
              meta {META_ENTREVISTAS}
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
              Lado 2 · Cliente final (a ouvir)
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft marker:text-mid-gray">
              <li>Não sabe o andamento sem ligar ou ir lá.</li>
              <li>Cobra notícia e nem sempre entende o prazo.</li>
              <li>Sem informação, desiste ou escolhe outra oficina.</li>
            </ul>
            <p className="mt-2 text-caption text-mid-gray">
              {cliente.length} de {META_CLIENTE} entrevistas com motoristas ·
              roteiro pronto
            </p>
          </div>
        </div>
        <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-mid-gray">
          Sintomas relatados nas entrevistas
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
          <li>
            Mecânico não atualiza nada — só fala quando o cliente manda mensagem
          </li>
          <li>
            Mecânicos fazem tudo na oficina — não sobra tempo para responder no
            meio do serviço
          </li>
          <li>
            Avisos sem padrão: tem dia que avisa 3 clientes, tem dia que não avisa
            nenhum
          </li>
          <li>
            Prazo &quot;de cabeça&quot; — nenhum registro estruturado do andamento
          </li>
          <li>
            Orçamento &quot;de cabeça&quot; — valores e aprovações sem registro
          </li>
          <li>
            Defeito adicional: tem que marcar de ir ver para perguntar se pode
            fazer
          </li>
          <li>Check-in no papel</li>
          <li>
            Cliente tem que cobrar ou ir à oficina antes de o carro ficar pronto
          </li>
        </ul>
        <p className="mt-3 text-caption text-mid-gray">
          Critérios de validação: {META_ENTREVISTAS} entrevistas realizadas e{" "}
          {META_PERC_PROBLEMA}% das oficinas confirmando o problema (maioria
          qualificada).
        </p>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              O que está firme e o que falta confirmar
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              Para não misturar evidência com estimativa na apresentação
            </p>
          </div>
          <Badge variant="soft">Transparência</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption text-mid-gray">Firme · Oficina</p>
            <p className="mt-1 text-xl font-semibold text-ink">64%</p>
            <p className="mt-1 text-caption text-mid-gray">
              14 de 22 entrevistas completas confirmam o problema
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption text-mid-gray">Firme · Oficina</p>
            <p className="mt-1 text-xl font-semibold text-ink">32%</p>
            <p className="mt-1 text-caption text-mid-gray">
              7 de 22 já perderam serviço por prazo
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption text-mid-gray">A iniciar · Cliente final</p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {cliente.length}/{META_CLIENTE}
            </p>
            <p className="mt-1 text-caption text-mid-gray">
              entrevistas com motoristas · {statsCliente.identificaramProblema}{" "}
              confirmaram a dor
            </p>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <p className="text-caption text-mid-gray">A confirmar</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              91% · 63% · 11% · 36% · 5 de 5
            </p>
            <p className="mt-1 text-caption text-mid-gray">
              ainda precisam ter a base de cálculo confirmada
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Stat
          label="Entrevistas realizadas"
          value={`${stats.realizadas}/${META_ENTREVISTAS}`}
        />
        <Stat label="Confirmam o problema" value={`${stats.percIdentificaram}%`} />
        <Stat label="Perderam serviço por prazo" value={String(stats.recusas)} />
        <Stat
          label="Veredito"
          value={stats.validado ? "Validado" : semDados ? "—" : "Em validação"}
        />
      </div>

      <Card className="mt-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">
          Estamos conseguindo validar?
        </h2>
        <p className="mb-4 text-caption text-mid-gray">
          Progresso até a meta de {META_ENTREVISTAS} entrevistas
        </p>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${stats.percMeta}%`,
              background: stats.validado ? "#15803d" : "#0a0a0a",
            }}
          />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {stats.realizadas} de {META_ENTREVISTAS} entrevistas ·{" "}
          {stats.validado ? (
            <span className="font-medium text-ink">
              problema validado: {stats.percIdentificaram}% das oficinas confirmam a
              dificuldade com o prazo.
            </span>
          ) : (
            `faltam ${Math.max(META_ENTREVISTAS - stats.realizadas, 0)} entrevista(s) e/ou confirmação de ${META_PERC_PROBLEMA}% para validar.`
          )}
        </p>
        <p className="mt-1 text-caption text-mid-gray">
          Das {stats.realizadas} entrevistas realizadas, {stats.avaliaramProblema}{" "}
          responderam sobre o problema de prazo; as{" "}
          {Math.max(stats.realizadas - stats.avaliaramProblema, 0)} demais focaram
          outros temas (ex.: check-in e retrabalho) e aparecem como "Não avaliaram"
          nos gráficos. Os percentuais consideram quem avaliou o problema.
        </p>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Validação · Cliente final
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              O lado de quem recebe o acompanhamento por QR code
            </p>
          </div>
          <Badge variant={cliente.length >= META_CLIENTE ? "solid" : "outline"}>
            {cliente.length >= META_CLIENTE ? "Validado" : "A iniciar"}
          </Badge>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-mid-gray transition-all"
            style={{
              width: `${Math.min(
                Math.round((cliente.length / META_CLIENTE) * 100),
                100,
              )}%`,
            }}
          />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {cliente.length} de {META_CLIENTE} entrevistas com motoristas ·{" "}
          {statsCliente.identificaramProblema} confirmaram a falta de informação ·{" "}
          {statsCliente.recusas} já desistiram ou recusaram serviço.
        </p>
        <p className="mt-1 text-caption text-mid-gray">
          O roteiro do cliente final (problema e solução) está pronto na página{" "}
          <a href="/perguntas" className="underline underline-offset-2">
            Perguntas
          </a>
          . Sem essas conversas, a dor do motorista continua sendo a visão da
          oficina, não a voz dele.
        </p>
      </Card>

      {semDados ? (
        <div className="mt-6">
          <EmptyState>
            Nenhuma entrevista realizada ainda. Cadastre as oficinas e registre as
            respostas para gerar os gráficos.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-ink">
                É um problema real? (oficinas que confirmam)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosProblema}
                      dataKey="valor"
                      nameKey="nome"
                      outerRadius={85}
                      label={{ fill: "#737373", fontSize: 12 }}
                    >
                      {dadosProblema.map((d, i) => (
                        <Cell key={d.nome} fill={CORES_PROBLEMA[i]} />
                      ))}
                    </Pie>
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: "#737373" }}
                      iconType="circle"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-sm font-semibold text-ink">
                Já recusou serviço por não entender o prazo?
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosRecusa}>
                    <XAxis
                      dataKey="nome"
                      tickLine={false}
                      axisLine={{ stroke: "#e5e5e5" }}
                      tick={tickStyle}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tickLine={false}
                      axisLine={false}
                      tick={tickStyle}
                    />
                    <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                      {dadosRecusa.map((d, i) => (
                        <Cell key={d.nome} fill={CORES_RECUSA[i % CORES_RECUSA.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-sm font-semibold text-ink">
                Entrevistas por responsável
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosResponsavel}>
                    <XAxis
                      dataKey="nome"
                      tickLine={false}
                      axisLine={{ stroke: "#e5e5e5" }}
                      tick={tickStyle}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tickLine={false}
                      axisLine={false}
                      tick={tickStyle}
                    />
                    <Tooltip cursor={{ fill: "#f5f5f5" }} contentStyle={tooltipStyle} />
                    <Bar dataKey="total" fill="#0a0a0a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card>
              <h3 className="text-sm font-semibold text-ink">Leitura dos dados</h3>
              <ul className="mt-2 space-y-2 text-sm text-ink-soft">
                <li>
                  <Badge variant="solid">{stats.percIdentificaram}%</Badge> das oficinas
                  confirmam o problema de prazo/comunicação.
                </li>
                <li>
                  <Badge variant="outline">{stats.recusas}</Badge> oficinas já perderam
                  serviço por causa disso.
                </li>
                <li>
                  <Badge variant="soft">{stats.indicacoes}</Badge> indicações obtidas
                  para ampliar a amostra.
                </li>
              </ul>
            </Card>
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-ink">O que isso indica</h3>
              <p className="mt-2 text-sm text-ink-soft">
                {stats.validado
                  ? `A maioria das oficinas (${stats.percIdentificaram}%) confirma o problema, e ${stats.recusas} já perderam serviço por causa dele — sinal de que o problema é real. Mas não é unânime: parte das oficinas não confirma, seja porque comunica bem (e o cliente entende), seja porque aponta outro problema mais urgente (mão de obra, custo de peças). Dados do setor (J.D. Power) reforçam o padrão: atrasos são comuns e a satisfação do cliente depende de mantê-lo informado. O próximo passo é organizar o check-in e o andamento — a comunicação com o cliente vem como consequência.`
                  : "A amostra ou o percentual de confirmação ainda não atingem os critérios. Continue entrevistando oficinas e registrando as respostas para decidir com segurança se o problema é real."}
              </p>
              <p className="mt-2 text-caption text-mid-gray">
                Referências de setor (pesquisas online 2025/2026): J.D. Power CSI —
                12% dos reparos falham na 1ª visita (28% por peça indisponível;
                comunicação está entre os 4 indicadores mais importantes de
                satisfação); no Brasil, IQA/Ipsos (out/2026): 53% da manutenção é em
                oficina independente e a confiança pesa mais que o preço (33% × 8%).
              </p>
            </Card>
          </div>
        </>
      )}

      <div className="mt-10">
        <h2 className="text-heading-sm font-semibold text-ink md:text-heading">
          Fluxograma do problema
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          Como o atraso sem comunicação leva o cliente à recusa do serviço
        </p>
        <Card>
          <FluxogramaProblema />
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-heading-sm font-semibold text-ink md:text-heading">
          Espinha de peixe (causa raiz)
        </h2>
        <p className="mb-4 mt-1.5 text-body text-mid-gray">
          Análise de causa raiz · oficinas mecânicas — falta de organização para
          atualizar o cliente
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Processo", "Checklist sem atualização · sem momento definido · informação só verbal · sem padrão de follow-up"],
              ["Equipe", "Mecânico não reporta · ninguém é dono do contato · recepção sobrecarregada · sem treino de atendimento"],
              ["Sistemas", "Sem sistema de status · dados em papel e WhatsApp · sem alertas automáticos · sistema pouco prático"],
              ["Prazos", "Estimativa otimista · reprogramação não avisada · sem meta de resposta · espera de peças sem data"],
              ["Peças & terceiros", "Fornecedor não avisa atraso · sem rastreio do pedido · terceirizado sem retorno · peça errada sem aviso"],
              ["Cliente & canais", "Não sabe com quem falar · telefone nunca atende · avisos só quando cobram · contato desatualizado"],
            ].map(([titulo, itens]) => (
              <div key={titulo} className="rounded-cards border border-hairline bg-surface-alt p-3">
                <p className="text-sm font-semibold text-ink">{titulo}</p>
                <p className="mt-1 text-caption text-ink-soft">{itens}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}