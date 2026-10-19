import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";

const MEDICOES = [
  "Quantos check-ins foram feitos por áudio em menos de 2 minutos.",
  "Quantos clientes escanearam o QR code e acompanharam o carro.",
  "Quantos avisos saíram automaticamente.",
  "Quantas vezes o cliente cobrou informação antes e depois.",
  "Quantos minutos por dia o dono gastava respondendo.",
];

const CANAIS = [
  {
    titulo: "As oficinas já entrevistadas",
    texto:
      "3 a 5 delas testam por 7 a 15 dias pagando R$ 49, com desconto de fundador.",
  },
  {
    titulo: "Indicação",
    texto:
      "Usar as 36 indicações que já temos. Um mês grátis para quem indicar uma oficina que assine.",
  },
  {
    titulo: "Porta em porta e WhatsApp",
    texto:
      "Contato pessoal nos bairros de oficina. Esse dono não lê blog nem responde anúncio.",
  },
  {
    titulo: "Parceiros do bairro",
    texto:
      "Sindicato das oficinas de Joinville, associação comercial, lojas de peças e retíficas.",
  },
];

const PLANO = [
  {
    periodo: "30 dias",
    acao:
      "Fechar 3 a 5 testes com as oficinas entrevistadas, a R$ 49, e acompanhar de perto.",
  },
  {
    periodo: "60 dias",
    acao:
      "Medir os resultados, gravar vídeos curtos com donos reais e pedir indicação.",
  },
  {
    periodo: "90 dias",
    acao:
      "Chegar a 30 conversas, 10 testes e 5 oficinas pagando. Ajustar o preço com base no uso.",
  },
];

export default function VendasPage() {
  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Preço, forma de cobrança e o plano para conquistar as primeiras oficinas"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Quanto custa e como cobra
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                Uma mensalidade por oficina, não por pessoa
              </p>
            </div>
            <Badge variant="solid">Modelo de cobrança</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-cards border border-hairline bg-surface-alt p-4">
              <Badge variant="solid">Beta</Badge>
              <p className="mt-2 text-2xl font-semibold text-ink">R$ 49/mês</p>
              <p className="mt-1 text-caption text-mid-gray">
                cerca de R$ 1,60 por dia · entra e prova valor
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-surface-alt p-4">
              <Badge variant="outline">Alvo</Badge>
              <p className="mt-2 text-2xl font-semibold text-ink">R$ 99/mês</p>
              <p className="mt-1 text-caption text-mid-gray">
                cerca de R$ 3,30 por dia · preço que dá lucro
              </p>
            </div>
          </div>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Sem taxa de instalação.</li>
            <li>Sem fidelidade: cancela quando quiser.</li>
            <li>Pagamento por PIX ou cartão.</li>
            <li>Uma assinatura por oficina, não por funcionário.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            Por que começar em R$ 49?
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              Os programas de oficina que existem cobram de R$ 39 a R$ 99 só para
              começar.
            </li>
            <li>
              Nosso custo por oficina está estimado entre R$ 25 e R$ 40 por mês,
              somando mensagens de WhatsApp, transcrição dos áudios e servidor.
            </li>
            <li>
              R$ 49 serve para entrar e provar valor; R$ 99 é o preço que dá lucro.
            </li>
          </ul>
          <p className="mt-3 rounded-inputs bg-canvas px-3 py-2 text-caption text-mid-gray">
            O custo por oficina e o tempo economizado ainda são estimativas que o
            teste vai confirmar.
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            Quanto o problema custa hoje
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              <strong className="font-semibold text-ink">7 das 22</strong> oficinas
              entrevistadas já perderam serviço por causa de prazo.
            </li>
            <li>
              Uma delas perdeu <strong className="font-semibold text-ink">R$ 100</strong>{" "}
              em uma peça comprada que o cliente não quis esperar.
            </li>
            <li>R$ 100 é quase dois meses de mensalidade.</li>
          </ul>
          <p className="mt-3 text-caption text-mid-gray">
            As perdas são fatos ouvidos nas entrevistas; a economia de tempo ainda
            será medida no beta.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Como conquistar as primeiras oficinas
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                O dono decide sozinho, então a venda é conversa direta
              </p>
            </div>
            <Badge variant="outline">Plano de entrada</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CANAIS.map((c) => (
              <div
                key={c.titulo}
                className="rounded-cards border border-hairline bg-surface-alt p-3"
              >
                <p className="text-sm font-semibold text-ink">{c.titulo}</p>
                <p className="mt-1 text-sm text-ink-soft">{c.texto}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-cards border border-hairline bg-canvas p-3">
              <p className="text-caption text-mid-gray">Oferta</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                14 dias grátis + ajuda para configurar
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-canvas p-3">
              <p className="text-caption text-mid-gray">Custo por cliente</p>
              <p className="mt-1 text-sm font-semibold text-ink">R$ 50 a R$ 150</p>
              <p className="mt-1 text-caption text-mid-gray">
                gasolina + tempo
              </p>
            </div>
            <div className="rounded-cards border border-hairline bg-canvas p-3">
              <p className="text-caption text-mid-gray">Payback</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                1 a 3 meses de mensalidade
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            O que medir no teste
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            O beta não é só para usar: é para provar o valor
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            {MEDICOES.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Plano de 90 dias</h2>
          <p className="mt-1 text-caption text-mid-gray">
            Da validação para as primeiras oficinas pagando
          </p>
          <ul className="mt-4 space-y-3">
            {PLANO.map((p) => (
              <li key={p.periodo} className="flex items-start gap-3">
                <Badge variant="outline">{p.periodo}</Badge>
                <span className="pt-0.5 text-sm text-ink-soft">{p.acao}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">
            O que ainda precisa ser confirmado
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              Os números de 91%, 63%, 11% e 36%, e o &quot;5 de 5 usariam uma
              solução online&quot;, ainda precisam ter a base de cálculo confirmada.
            </li>
            <li>
              O que está firme: <strong className="font-semibold text-ink">64%</strong>{" "}
              confirmam o problema e <strong className="font-semibold text-ink">32%</strong>{" "}
              já perderam serviço por prazo, sobre as 22 entrevistas completas.
            </li>
            <li>
              O preço de R$ 99 e o custo de R$ 25 a R$ 40 por oficina serão testados
              no beta.
            </li>
          </ul>
          <p className="mt-3 text-caption text-mid-gray">
            A definição completa está no{" "}
            <Link href="/pitch" className="font-medium text-ink underline">
              Pitch
            </Link>
            . Os concorrentes estão em{" "}
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
