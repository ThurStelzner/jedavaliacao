"use client";

import type { ReactNode } from "react";

const ACCENT = "#7C5AC8";

function seta(rotulo?: string) {
  return (
    <div className="flex flex-col items-center py-1.5" aria-hidden>
      <div className="h-4 w-px bg-hairline" />
      {rotulo && (
        <span className="my-1 rounded-badges border border-hairline bg-paper px-2 py-0.5 text-caption font-medium text-ink-soft">
          {rotulo}
        </span>
      )}
      <div className="h-4 w-px bg-hairline" />
      <div className="h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-[#a1a1aa]" />
    </div>
  );
}

function Etapa({
  numero,
  titulo,
  texto,
  tom = "neutro",
}: {
  numero?: string;
  titulo: string;
  texto?: string;
  tom?: "neutro" | "acento" | "sucesso" | "falha";
}) {
  const tons = {
    neutro: "border-hairline bg-paper",
    acento: "border-[#7C5AC8] bg-paper",
    sucesso: "border-[#15803d] bg-paper",
    falha: "border-[#dc2626] bg-paper",
  } as const;
  const numeroBg = {
    neutro: undefined,
    acento: ACCENT,
    sucesso: "#15803d",
    falha: "#dc2626",
  } as const;

  return (
    <div
      className={`w-full rounded-cards border px-4 py-3 text-center shadow-subtle ${tons[tom]}`}
    >
      {numero && (
        <span
          className="mb-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-caption font-semibold text-[#fafafa]"
          style={numeroBg[tom] ? { background: numeroBg[tom] } : undefined}
        >
          {numero}
        </span>
      )}
      <p className="text-sm font-semibold text-ink">{titulo}</p>
      {texto && <p className="mt-1 text-caption text-ink-soft">{texto}</p>}
    </div>
  );
}

function Decisao({ texto }: { texto: string }) {
  return (
    <div
      className="w-full rounded-cards border-2 px-4 py-3 text-center"
      style={{ borderColor: ACCENT, background: "#faf8fe" }}
    >
      <p
        className="text-caption font-semibold uppercase tracking-wide"
        style={{ color: ACCENT }}
      >
        Decisão
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{texto}</p>
    </div>
  );
}

function Ramo({
  rotulo,
  tom,
  children,
}: {
  rotulo: string;
  tom: "sucesso" | "falha";
  children: ReactNode;
}) {
  const cores = {
    sucesso: { bg: "#15803d" },
    falha: { bg: "#dc2626" },
  } as const;
  return (
    <div className="flex min-w-0 flex-col items-center rounded-cards border border-hairline bg-surface-alt p-3">
      <span
        className="mb-2 rounded-badges px-2.5 py-0.5 text-caption font-semibold text-white"
        style={{ background: cores[tom].bg }}
      >
        {rotulo}
      </span>
      <div className="flex w-full flex-col items-stretch gap-1">{children}</div>
    </div>
  );
}

export default function FluxogramaProblema() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-stretch">
      <Etapa
        numero="1"
        titulo="Cliente deixa o veículo e recebe a estimativa de prazo"
        texto="A estimativa costuma ser otimista, feita de cabeça e só falada."
      />
      {seta()}
      <Etapa
        numero="2"
        titulo="Oficina executa o serviço"
        texto="Fila → diagnóstico → aguardando peças → manutenção → vistoria"
      />
      {seta()}
      <Decisao texto="Acontece algum atraso? (peça que não chega, imprevisto, fila)" />
      {seta()}
      <div className="grid gap-3 sm:grid-cols-2">
        <Ramo rotulo="Não atrasou" tom="sucesso">
          <Etapa
            titulo="Entrega no prazo"
            texto="Cliente satisfeito e relação mantida."
            tom="sucesso"
          />
        </Ramo>
        <Ramo rotulo="Sim, atrasou" tom="falha">
          <Etapa
            titulo="O prazo estoura"
            texto="O carro fica na oficina além do combinado."
          />
        </Ramo>
      </div>
      {seta("continua pelo caminho do atraso")}
      <Decisao texto="A oficina avisa o cliente do atraso com o motivo claro?" />
      {seta()}
      <div className="grid gap-3 sm:grid-cols-2">
        <Ramo rotulo="Avisa" tom="sucesso">
          <Etapa
            titulo="Cliente entende e reorganiza"
            texto="Reagenda com o motivo explicado."
            tom="sucesso"
          />
        </Ramo>
        <Ramo rotulo="Não avisa / aviso vago" tom="falha">
          <Etapa
            titulo="Cliente liga e ninguém sabe responder"
            texto="Telefone não atende, recepção não tem o status, informação só verbal."
            tom="falha"
          />
        </Ramo>
      </div>
      {seta("sem aviso, a situação piora")}
      <Etapa
        titulo="Desconfiança cresce"
        texto="Cliente cobra, pressiona e perde a confiança na oficina."
      />
      {seta()}
      <Decisao texto="Cliente cancela o serviço ou retira o carro?" />
      {seta()}
      <div className="grid gap-3 sm:grid-cols-2">
        <Ramo rotulo="Sim, cancela" tom="falha">
          <Etapa
            titulo="RECUSA DO SERVIÇO + perda do cliente"
            texto="Prejuízo direto e boca a boca negativo."
            tom="falha"
          />
        </Ramo>
        <Ramo rotulo="Não, conclui" tom="falha">
          <Etapa
            titulo="Conclui insatisfeito"
            texto="Avaliação baixa e pouca chance de voltar."
          />
        </Ramo>
      </div>
      {seta()}
      <div
        className="w-full rounded-cards border px-4 py-3 text-center"
        style={{ borderColor: ACCENT, background: "#f5f0fd" }}
      >
        <p
          className="text-caption font-semibold uppercase tracking-wide"
          style={{ color: ACCENT }}
        >
          Ciclo vicioso
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          A perda de clientes pressiona o prazo → estimativas mais otimistas → mais
          atrasos sem aviso → mais recusas. O ciclo só quebra quando o status passa a
          ser comunicado de forma clara e contínua.
        </p>
      </div>
    </div>
  );
}
