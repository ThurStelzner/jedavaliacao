import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";

const CONCORRENTES = [
  {
    nome: "Oficina Integrada",
    texto: "Gestão completa: estoque, financeiro, nota e ordem de serviço.",
  },
  {
    nome: "Wust",
    texto: "Sistema de gestão para oficina, com ordem de serviço e financeiro.",
  },
  {
    nome: "Wayssoft",
    texto: "Programa de gestão de oficina com módulos de estoque e faturamento.",
  },
  {
    nome: "MaxxiOficina",
    texto: "ERP para oficina, com controle de serviços, peças e caixa.",
  },
  {
    nome: "RepareCar",
    texto: "Sistema de gestão para oficinas, com ordem de serviço e cadastro.",
  },
];

const MERCADO = [
  {
    dado: "72.800",
    texto: "oficinas de reparação mecânica no Brasil (número conservador).",
  },
  {
    dado: "224 mil",
    texto: "empresas do setor, considerando o mercado ampliado.",
  },
  {
    dado: "2.700",
    texto: "oficinas em Santa Catarina, por estimativa baseada na população.",
  },
  {
    dado: "450",
    texto: "oficinas em Joinville e região, por estimativa.",
  },
];

export default function ConcorrentesPage() {
  return (
    <div>
      <PageHeader
        title="Concorrentes"
        subtitle="Como as oficinas resolvem hoje, quem são os concorrentes de verdade e onde a nossa solução se encaixa"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Como a maioria resolve hoje
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                O substituto mais comum não é um sistema: é o improviso
              </p>
            </div>
            <Badge variant="solid">Substitutos</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["WhatsApp", "Telefone", "Caderno", "Memória do dono"].map((item) => (
              <div
                key={item}
                className="rounded-cards border border-hairline bg-surface-alt px-3 py-2 text-sm text-ink-soft"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Nenhuma oficina que ouvimos tem aviso automático. Das que avisam,{" "}
            <strong className="font-semibold text-ink">63% não têm regra fixa</strong>{" "}
            e <strong className="font-semibold text-ink">11% não avisam nada</strong>.
            O cliente só descobre o andamento quando liga ou vai até a oficina.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Concorrentes de verdade
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                Programas completos de gestão de oficina
              </p>
            </div>
            <Badge variant="outline">R$ 39 a R$ 379/mês</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONCORRENTES.map((c) => (
              <div
                key={c.nome}
                className="rounded-cards border border-hairline bg-surface-alt p-3"
              >
                <p className="text-sm font-semibold text-ink">{c.nome}</p>
                <p className="mt-1 text-sm text-ink-soft">{c.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Eles cuidam de estoque, financeiro, nota e ordem de serviço. Custam de
            R$ 39 a R$ 379 por mês e são complicados para quem tem uma oficina
            pequena, que muitas vezes não tem tempo nem equipe para operar o
            sistema inteiro.
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Nosso posicionamento</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              <strong className="font-semibold text-ink">Não somos um ERP completo.</strong>{" "}
              Não cuidamos de estoque, financeiro ou nota fiscal.
            </li>
            <li>
              Resolvemos o <strong className="font-semibold text-ink">check-in por
              áudio</strong>, a <strong className="font-semibold text-ink">organização
              do andamento</strong> e a{" "}
              <strong className="font-semibold text-ink">conversa com o cliente</strong>.
            </li>
            <li>
              Podemos conviver com o programa que a oficina já tem — não exigimos
              trocar tudo.
            </li>
            <li>
              O cliente acompanha por QR code, numa página simples, sem instalar
              aplicativo e sem criar conta.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            A diferença na prática
          </h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-sm font-semibold text-ink">
                Em vez de digitar, falar
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                O dono ou o mecânico fala o problema e o agente monta a ordem de
                serviço. É o check-in em segundos, com foto do carro e das avarias.
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-sm font-semibold text-ink">
                Em vez de ligar, acompanhar
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                O cliente vê fila, diagnóstico, espera de peça, execução e pronto,
                com fotos e orçamento para aprovar.
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-sm font-semibold text-ink">
                Em vez de memória, painel
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                O dono vê a fila inteira, o problema de cada carro e o histórico por
                carro e por cliente.
              </p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">
            Tamanho do mercado
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            Números para mostrar a oportunidade, não a meta
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MERCADO.map((m) => (
              <div
                key={m.dado}
                className="rounded-cards border border-hairline bg-surface-alt p-3"
              >
                <p className="text-xl font-semibold text-ink">{m.dado}</p>
                <p className="mt-1 text-sm text-ink-soft">{m.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            A meta é ter de 20 a 30 oficinas pagando em 12 meses. É o que a equipe
            consegue instalar e atender bem, começando por Joinville e região, onde
            já conhecemos 26 oficinas e temos 36 indicações.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">
            O que ainda precisa ser confirmado
          </h2>
          <p className="mt-3 text-sm text-ink-soft">
            Os números de <strong className="font-semibold text-ink">91%, 63%, 11% e
            36%</strong>, e o &quot;5 de 5 usariam uma solução online&quot;, ainda
            precisam ter a base de cálculo confirmada.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            O que está firme: <strong className="font-semibold text-ink">64%</strong>{" "}
            confirmam o problema e <strong className="font-semibold text-ink">32%</strong>{" "}
            já perderam serviço por prazo, sobre as 22 entrevistas completas.
          </p>
          <p className="mt-3 text-caption text-mid-gray">
            Preço e plano de entrada em{" "}
            <Link href="/vendas" className="font-medium text-ink underline">
              Vendas
            </Link>
            . Definição do negócio no{" "}
            <Link href="/pitch" className="font-medium text-ink underline">
              Pitch
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
