import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";

const CHECKIN = [
  "O dono ou o mecânico aperta o botão e fala: placa, modelo, cor, quilometragem e o problema que o cliente relatou.",
  "O agente entende o áudio e já preenche a ordem de serviço.",
  "A pessoa confere, corrige se precisar e confirma.",
  "Entram também a foto do carro e das avarias.",
  "No fim, o sistema gera um QR code para o cliente acompanhar.",
];

const PAPEIS = [
  {
    titulo: "Usuário",
    texto:
      "O dono na função de gestão e, quando existe, a recepcionista. O mecânico só fala o que está fazendo.",
  },
  {
    titulo: "Decisor",
    texto: "O dono da oficina. Ele decide sozinho, sem comitê.",
  },
  {
    titulo: "Cliente pagante",
    texto: "A oficina, com dinheiro do caixa.",
  },
  {
    titulo: "Cliente final",
    texto:
      "O dono do carro não paga nada. Ele recebe as mensagens e acompanha pelo QR code.",
  },
];

export default function SolucoesPage() {
  return (
    <div>
      <PageHeader
        title="Solução"
        subtitle="Um agente de check-in por áudio, um painel para o dono e uma página de acompanhamento para o cliente"
      />

      <Card>
        <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
          Em uma frase
        </p>
        <p className="mt-2 text-body text-ink-soft">
          Assinatura mensal de um agente que faz o check-in do carro por áudio,
          organiza a oficina e deixa o cliente acompanhar o serviço pelo QR code,
          sem instalar aplicativo e sem criar conta.
        </p>
        <p className="mt-3 text-caption text-mid-gray">
          A causa que atacamos é a falta de organização do fluxo da oficina. A
          comunicação clara com o cliente é a consequência.
        </p>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">
            O check-in em 2 minutos
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            O que a oficina faz na chegada do carro
          </p>
          <ol className="mt-3 space-y-2">
            {CHECKIN.map((passo, i) => (
              <li key={passo} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-caption font-semibold text-[#fafafa]">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-soft">{passo}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            O que o dono vê no painel
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>A fila inteira de carros.</li>
            <li>O problema relatado de cada carro.</li>
            <li>O que foi diagnosticado e o que está pendente.</li>
            <li>O histórico por carro e por cliente.</li>
            <li>Sem depender da memória ou do caderno.</li>
          </ul>
          <p className="mt-4 rounded-inputs bg-canvas px-3 py-2 text-caption text-mid-gray">
            O painel é de gestão, não de contabilidade: não substitui o sistema
            fiscal, financeiro ou de estoque que a oficina já usa.
          </p>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">
              O que o cliente final vê
            </h2>
            <p className="mt-1 text-caption text-mid-gray">
              Pelo QR code, no celular, sem baixar nada
            </p>
          </div>
          <Badge variant="soft">Sem app · sem conta</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Se o carro está na fila, em diagnóstico, esperando peça, em execução ou pronto.",
            "As fotos do carro e das avarias.",
            "O orçamento para aprovar.",
            "As mensagens automáticas do andamento.",
            "A previsão de entrega.",
            "O histórico do serviço.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-cards border border-hairline bg-surface-alt px-3 py-2 text-sm text-ink-soft"
            >
              {item}
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PAPEIS.map((p) => (
          <Card key={p.titulo}>
            <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
              {p.titulo}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{p.texto}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">
            O que a solução resolve
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>O check-in deixa de viver na cabeça e no papel.</li>
            <li>O dono sabe o problema de cada carro sem procurar.</li>
            <li>O cliente para de ligar sem resposta.</li>
            <li>O atraso é avisado com o motivo, não com silêncio.</li>
            <li>Menos serviço perdido por demora sem informação.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            O que ela não é
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Não é um ERP completo.</li>
            <li>Não substitui sistema fiscal, financeiro ou de estoque.</li>
            <li>Não promete acabar com os atrasos; promete organizar e informar.</li>
            <li>Pode conviver com o programa que a oficina já tem.</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">
          O que ainda vamos validar
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
          <li>
            Testar o acompanhamento com os clientes finais das oficinas — a
            pesquisa ouviu donos e gerentes.
          </li>
          <li>Confirmar os percentuais da pesquisa com a base final de entrevistas.</li>
          <li>Rodar o beta com oficinas reais e ajustar o preço.</li>
          <li>
            Medir quantos check-ins saem em menos de 2 minutos e quantos clientes
            escaneiam o QR code.
          </li>
        </ul>
        <p className="mt-3 text-caption text-mid-gray">
          A definição completa do negócio está na página{" "}
          <Link href="/pitch" className="font-medium text-ink underline">
            Pitch
          </Link>
          . O preço e a conquista dos primeiros clientes estão em{" "}
          <Link href="/vendas" className="font-medium text-ink underline">
            Vendas
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
