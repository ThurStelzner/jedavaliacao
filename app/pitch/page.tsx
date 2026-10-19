import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";

const PAPEIS = [
  {
    titulo: "Usuário",
    texto:
      "O dono na função de gestão e, quando existe, a recepcionista. O mecânico só fala o que está fazendo.",
  },
  {
    titulo: "Decisor",
    texto: "O dono da oficina, que decide sozinho.",
  },
  {
    titulo: "Cliente pagante",
    texto: "A oficina, com dinheiro do caixa.",
  },
  {
    titulo: "Cliente final",
    texto:
      "O dono do carro não paga nada: recebe as mensagens e acompanha pelo QR code.",
  },
];

export default function PitchPage() {
  return (
    <div>
      <PageHeader
        title="Pitch"
        subtitle="As 5 perguntas da avaliação, respondidas com os dados do projeto"
      />

      <div className="grid gap-4">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              1. Qual é o modelo de negócio proposto, e quem são o usuário, o
              decisor e o cliente pagante?
            </h2>
            <Badge variant="outline">Pergunta 1</Badge>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Vendemos uma <strong className="font-semibold text-ink">assinatura
            mensal</strong> de um agente de check-in por áudio, junto com um painel
            de gestão da oficina e uma página de acompanhamento para o cliente.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Na prática, o dono ou o mecânico aperta o botão e fala: placa, modelo,
            cor, quilometragem e o problema que o cliente relatou. O agente entende
            o áudio e já preenche a ordem de serviço, que a pessoa confere e
            confirma. Também entram a foto do carro e das avarias.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            No fim do check-in é gerado um <strong className="font-semibold text-ink">QR
            code</strong>: o cliente aponta a câmera do celular e passa a acompanhar
            o próprio carro, vendo se está na fila, em diagnóstico, esperando peça,
            em execução ou pronto, com as fotos e o orçamento para aprovar. Não
            precisa instalar aplicativo nem criar conta.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            O dono usa o painel para a gestão: vê a fila inteira, o problema
            relatado de cada carro, o que foi diagnosticado, o que está pendente e o
            histórico por carro e por cliente, sem depender da memória.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PAPEIS.map((p) => (
              <div
                key={p.titulo}
                className="rounded-cards border border-hairline bg-surface-alt p-3"
              >
                <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
                  {p.titulo}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{p.texto}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              2. Como o cliente pagará, qual é o preço inicial proposto e como
              vocês chegaram a esse valor?
            </h2>
            <Badge variant="outline">Pergunta 2</Badge>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            É uma <strong className="font-semibold text-ink">mensalidade por
            oficina</strong>, não por pessoa. Sem taxa de instalação, sem
            fidelidade, dá para cancelar quando quiser, pagando por PIX ou cartão.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-cards border border-hairline bg-surface-alt p-4">
              <Badge variant="solid">Preço de entrada</Badge>
              <p className="mt-2 text-2xl font-semibold text-ink">R$ 49/mês</p>
              <p className="mt-1 text-caption text-mid-gray">
                cerca de R$ 1,60 por dia · fase beta
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-4">
              <Badge variant="outline">Preço-alvo</Badge>
              <p className="mt-2 text-2xl font-semibold text-ink">R$ 99/mês</p>
              <p className="mt-1 text-caption text-mid-gray">
                cerca de R$ 3,30 por dia · preço que dá lucro
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Por que R$ 49? Porque os programas de oficina que existem cobram de R$
            39 a R$ 99 só para começar, e os nossos custos por oficina ficam
            estimados entre R$ 25 e R$ 40 por mês, somando mensagens de WhatsApp,
            transcrição dos áudios e servidor. Então R$ 49 serve para entrar e
            provar valor, e R$ 99 é o preço que dá lucro.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Do lado do ganho, <strong className="font-semibold text-ink">7 das 22
            oficinas</strong> entrevistadas já perderam serviço por causa de prazo.
            Uma delas perdeu R$ 100 em uma peça comprada que o cliente não quis
            esperar. R$ 100 é quase dois meses de mensalidade.
          </p>
          <p className="mt-3 rounded-inputs bg-canvas px-3 py-2 text-caption text-mid-gray">
            Os preços dos concorrentes e as perdas são fatos que ouvimos; o custo
            por oficina e o tempo economizado ainda são estimativas que o teste vai
            confirmar.
          </p>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              3. Quem são os principais concorrentes ou substitutos e como vocês
              pretendem se posicionar em relação a eles?
            </h2>
            <Badge variant="outline">Pergunta 3</Badge>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Hoje a maioria resolve na base do improviso: WhatsApp, telefone,
            caderno e memória do dono. Nenhuma oficina que ouvimos tem aviso
            automático. Das que avisam, <strong className="font-semibold text-ink">63%
            não têm regra fixa</strong>, e <strong className="font-semibold text-ink">11%
            não avisam nada</strong>.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Os concorrentes de verdade são os programas completos de gestão de
            oficina, como Oficina Integrada, Wust, Wayssoft, MaxxiOficina e
            RepareCar. Eles cuidam de estoque, financeiro, nota e ordem de serviço,
            custam de R$ 39 a R$ 379 e são complicados para quem tem uma oficina
            pequena.
          </p>
          <div className="mt-4 rounded-cards border border-hairline bg-surface-alt p-4">
            <p className="text-sm font-semibold text-ink">Nosso posicionamento</p>
            <p className="mt-1 text-sm text-ink-soft">
              A diferença é o jeito de usar e o que o cliente vê. Em vez de o dono
              parar para digitar, ele fala, e o agente monta a ordem de serviço. E o
              cliente acompanha pelo QR code, numa página simples, sem instalar
              nada. Não queremos ser o sistema completo da oficina: queremos
              resolver o check-in, a organização do andamento e a conversa com o
              cliente, podendo até conviver com o programa que a oficina já tem.
            </p>
          </div>
          <p className="mt-3 text-caption text-mid-gray">
            Lista com preços e destaques na página{" "}
            <Link href="/concorrentes" className="font-medium text-ink underline">
              Concorrentes
            </Link>
            .
          </p>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              4. Qual é o tamanho do mercado que vocês pretendem explorar e qual
              parcela pretendem atender inicialmente?
            </h2>
            <Badge variant="outline">Pergunta 4</Badge>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            O Brasil tem cerca de <strong className="font-semibold text-ink">72.800
            oficinas de reparação mecânica</strong>, número conservador, e pode
            chegar a <strong className="font-semibold text-ink">224 mil empresas</strong>{" "}
            do setor. Se todas pagassem R$ 99 por mês, isso daria de R$ 87 milhões a
            R$ 267 milhões por ano.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Esse número grande serve só para mostrar o tamanho da oportunidade, não
            é o que vamos buscar. O mercado que dá para atender perto de nós é de
            aproximadamente <strong className="font-semibold text-ink">2.700
            oficinas em Santa Catarina</strong> e umas{" "}
            <strong className="font-semibold text-ink">450 em Joinville e
            região</strong>, por estimativa baseada na população.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            A meta é ter de <strong className="font-semibold text-ink">20 a 30
            oficinas pagando em 12 meses</strong>, o que dá de R$ 24 mil a R$ 36 mil
            por ano a R$ 99, ou de R$ 12 mil a R$ 18 mil no preço de teste. Parece
            pouco, mas é o que a equipe consegue instalar e atender bem, e é
            possível porque já conhecemos 26 oficinas, temos 36 indicações e o dono
            decide sozinho, sem comitê.
          </p>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              5. Como vocês pretendem conquistar os primeiros clientes pagantes?
            </h2>
            <Badge variant="outline">Pergunta 5</Badge>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Começamos pelas oficinas que já entrevistamos:{" "}
            <strong className="font-semibold text-ink">3 a 5 delas testam por 7 a
            15 dias pagando R$ 49</strong>, com desconto de fundador. Nesse período
            medimos quantos check-ins foram feitos por áudio em menos de dois
            minutos, quantos clientes escanearam o QR code e acompanharam o carro,
            quantos avisos saíram, quantas vezes o cliente cobrou informação antes e
            depois, e quantos minutos por dia o dono gastava respondendo.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Depois pedimos indicação, usando as 36 que já temos, com a oferta de um
            mês grátis para quem indicar uma oficina que assine. O contato é
            pessoal, de porta em porta nos bairros de oficina e pelo WhatsApp,
            porque esse dono não lê blog nem responde anúncio.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Também vale conversar com o sindicato das oficinas de Joinville, a
            associação comercial e as lojas de peças e retíficas, que entram nas
            oficinas todo dia e podem indicar. Para mostrar resultado, gravamos
            vídeos curtos com donos reais e com clientes usando o QR code. A oferta
            é sem risco: <strong className="font-semibold text-ink">14 dias grátis</strong>{" "}
            e ajuda para configurar tudo.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Meta em 90 dias</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                30 conversas · 10 testes · 5 pagando
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Custo por cliente</p>
              <p className="mt-1 text-sm font-semibold text-ink">R$ 50 a R$ 150</p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-3">
              <p className="text-caption text-mid-gray">Payback</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                1 a 3 meses de mensalidade
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              Aviso para a apresentação
            </h2>
            <Badge variant="soft">Base a confirmar</Badge>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Os números de <strong className="font-semibold text-ink">91%, 63%, 11%
            e 36%</strong>, e o &quot;5 de 5 usariam uma solução online&quot;, ainda
            precisam ter a base de cálculo confirmada.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            O que está firme no nosso levantamento é que{" "}
            <strong className="font-semibold text-ink">64% confirmam o problema</strong>{" "}
            e <strong className="font-semibold text-ink">32% já perderam serviço por
            prazo</strong>, ambos sobre as 22 entrevistas completas.
          </p>
          <p className="mt-3 text-caption text-mid-gray">
            Números e fontes também nas páginas{" "}
            <Link href="/graficos" className="font-medium text-ink underline">
              Gráficos
            </Link>
            ,{" "}
            <Link href="/vendas" className="font-medium text-ink underline">
              Vendas
            </Link>{" "}
            e{" "}
            <Link href="/concorrentes" className="font-medium text-ink underline">
              Concorrentes
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
