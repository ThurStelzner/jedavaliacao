import { Badge, Card, PageHeader } from "@/components/ui";

const HIPOTESE_MVP = [
  {
    titulo: "Acreditamos que",
    texto:
      "hoje o cliente não sabe o que acontece com o carro durante a manutenção. O aviso depende de alguém cobrar a atualização e não tem padrão: o cliente cobra, o dono, com falta de organização, tem dificuldade de avisar todos, e o cliente fica com prazo aproximado. Nas entrevistas, 63% não têm regra fixa e 11% não avisam nada.",
  },
  {
    titulo: "Para testar, faremos",
    texto:
      "o MVP é um check-in por áudio + painel + página de acompanhamento. Na entrada, o dono ou o mecânico fala placa, modelo, cor, quilometragem e o problema relatado. O agente entende, preenche a ordem de serviço, a pessoa confere e confirma, e entram as fotos do carro e das avarias. No fim, é gerado um QR code para o cliente acompanhar fila, diagnóstico, espera de peça, execução e pronto, com fotos e orçamento para aprovar.",
  },
  {
    titulo: "Assim, no ambiente e nas condições",
    texto:
      "piloto em 3 a 5 das 26 oficinas entrevistadas de Joinville, no serviço real do dia a dia, por 7 a 15 dias, pagando R$ 49 com desconto de fundador. Regra do MVP: se o dono não sentir o benefício em 7 dias, corta ou simplifica.",
  },
  {
    titulo: "Mediremos",
    texto:
      "quantos check-ins foram feitos por áudio em menos de 2 minutos, quantos clientes escanearam o QR code e acompanharam o carro, quantos avisos saíram, quantas vezes o cliente cobrou informação antes e depois, e quantos minutos por dia o dono gastava respondendo.",
  },
  {
    titulo: "E compararemos com",
    texto:
      "a linha de base das entrevistas: 63% não têm regra fixa, nenhuma tem aviso automático, 36% dos clientes cobram notícia e 32% das oficinas já perderam serviço por prazo (7 de 22).",
  },
  {
    titulo: "Se o resultado for",
    texto:
      "a maioria dos serviços com check-in feito por áudio em menos de 2 minutos, mais clientes escaneando o QR code e menos cobrança de notícia do que hoje, com o dono sentindo o benefício já na 1ª semana,",
  },
  {
    titulo: "Então",
    texto:
      "colocamos o MVP em campo: piloto validado, apresentado na banca e virando oferta para as primeiras oficinas pagantes.",
  },
];

export default function MentoriaPage() {
  return (
    <div>
      <PageHeader
        title="Mentoria"
        subtitle="O que a banca apontou, nossa leitura e o plano de correção"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                O que os mentores disseram
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                Feedback da banca — registrado para virar ação, não para discutir
              </p>
            </div>
            <Badge variant="solid">Registrado</Badge>
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              <span className="font-medium text-ink">Sistema muito complexo:</span>{" "}
              precisamos de um MVP — menos funções, com o essencial funcionando bem.
            </li>
            <li>
              <span className="font-medium text-ink">Validação incompleta:</span>{" "}
              ouvimos donos e gerentes nas 26 entrevistas, mas não os clientes finais
              das oficinas — que são quem recebe o acompanhamento.
            </li>
            <li>
              <span className="font-medium text-ink">Definição do problema:</span>{" "}
              para eles, o problema não é a falta de comunicação entre mecânicos e
              clientes, e sim a falta de organização dos mecânicos.
            </li>
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Nossa leitura honesta</h2>
          <p className="mt-1 text-caption text-mid-gray">
            O que aceitamos, o que faltou comunicar e a frase para a próxima banca
          </p>
          <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-mid-gray">
            O que aceitamos
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              <span className="font-medium text-ink">Escopo grande demais:</span>{" "}
              quatro frentes (check-in, rastreio de peças, rede e lembretes) é muito
              para o estágio atual. Dá para entregar bem menos e já resolver.
            </li>
            <li>
              <span className="font-medium text-ink">Validação incompleta:</span>{" "}
              falta ouvir os clientes finais — é uma pendência real.
            </li>
            <li>
              <span className="font-medium text-ink">Organização como causa:</span>{" "}
              a leitura de fundo está certa: a raiz é o fluxo desorganizado da
              oficina.
            </li>
          </ul>
          <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-mid-gray">
            O que a banca não viu (e precisamos comunicar melhor)
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            O acompanhamento <span className="font-medium text-ink">é</span> a
            ferramenta de organização: o check-in registra o serviço (para de viver
            na cabeça e no papel), o painel dá visibilidade ao dono e o QR code tira
            o cliente do telefone.{" "}
            <span className="font-medium text-ink">
              Organização (causa) → comunicação (consequência).
            </span>{" "}
            O cliente cobrando no WhatsApp é o sintoma que mais dói: 7 oficinas já
            perderam serviço por prazo ou falta de informação (32% de quem avaliou).
          </p>
          <div className="mt-4 rounded-cards border border-hairline bg-canvas p-4">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">Frase pronta:</span>{" "}
              &quot;A raiz é a desorganização do fluxo de serviço. Nosso produto
              organiza esse fluxo no check-in por áudio e no painel, e a comunicação
              com o cliente vira consequência automática pelo QR code.&quot;
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Definição do problema (formato da banca)
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                Alinhada com os mentores (organização) e com os sintomas relatados
                nas entrevistas
              </p>
            </div>
            <Badge variant="outline">Aplicada</Badge>
          </div>
          <div className="mt-4 rounded-cards border border-hairline bg-canvas p-4">
            <p className="text-sm text-ink-soft">
              &quot;Oficinas mecânicas perdem tempo porque não têm organização: o
              check-in é verbal ou no papel, o andamento do serviço fica na cabeça
              e o cliente só é avisado quando cobra.&quot;
            </p>
          </div>
          <p className="mt-2 text-caption text-mid-gray">
            Formato direto: público-alvo luta para [ação] porque [causa raiz], o que
            resulta em [consequência negativa].
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              Sintomas relatados: não atualiza nada · mecânicos fazem tudo na
              oficina · só responde quando cobrado · avisos sem padrão · prazo de
              cabeça · orçamento de cabeça · defeito adicional exige visita ·
              check-in no papel.
            </li>
            <li>
              A raiz aparece como registro/organização; a comunicação com o cliente
              fica como consequência.
            </li>
            <li>
              Evidências firmes: 64% confirmam o problema (14 de 22 que avaliaram);
              22 de 23 sem registro formal do check-in; 7 recusas de serviço por
              prazo ou falta de informação (32%).
            </li>
            <li>
              Os números de 91%, 63%, 11% e 36%, e o &quot;5 de 5 usariam uma
              solução online&quot;, ainda precisam ter a base confirmada.
            </li>
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                MVP v0 - o menor recorte útil
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                Menos funções, entregue rápido e com o benefício visível em 7 dias
              </p>
            </div>
            <Badge variant="solid">Simplificar</Badge>
          </div>
          <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-mid-gray">
            Entra no MVP (o essencial)
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              <span className="font-medium text-ink">Check-in por áudio:</span> o
              dono ou o mecânico fala placa, modelo, cor, quilometragem e o problema
              relatado. O agente preenche a ordem de serviço, a pessoa confere e
              confirma, e entram as fotos do carro e das avarias.
            </li>
            <li>
              <span className="font-medium text-ink">Painel simples:</span> a fila
              inteira, o problema de cada carro, o que foi diagnosticado e o que
              está pendente.
            </li>
            <li>
              <span className="font-medium text-ink">QR code para o cliente:</span>{" "}
              fila, diagnóstico, esperando peça, em execução ou pronto, com fotos e
              orçamento para aprovar. Sem app e sem conta.
            </li>
            <li>
              <span className="font-medium text-ink">Histórico:</span> por carro e
              por cliente, para o dono não depender da memória.
            </li>
          </ul>
          <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-mid-gray">
            Fica para depois (v1/v2, só com uso comprovado)
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Rastreio de peças etapa por etapa.</li>
            <li>Rede de oficinas com promoções cruzadas.</li>
            <li>Lembretes de manutenção automáticos.</li>
            <li>Aplicativo próprio do cliente.</li>
          </ul>
          <p className="mt-4 text-caption text-mid-gray">
            Regra do MVP: se o dono não sentir o benefício em 7 dias, corta ou
            simplifica.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Hipótese do MVP - como vamos testar
              </h2>
              <p className="mt-1 text-caption text-mid-gray">
                Formato de teste da banca (Acreditamos que → Então), preenchido com
                o que as entrevistas já mostraram
              </p>
            </div>
            <Badge variant="outline">Para a banca</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {HIPOTESE_MVP.map((h) => (
              <div
                key={h.titulo}
                className="rounded-cards border border-hairline bg-canvas p-3"
              >
                <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
                  {h.titulo}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{h.texto}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            Validar com os clientes finais (o que faltou)
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            Plano para a pendência nº 2 dos mentores
          </p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>
              10 a 15 conversas curtas (5 a 7 min) na saída das oficinas já
              entrevistadas, ou por indicação delas.
            </li>
          </ul>
          <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-mid-gray">
            Perguntas-chave
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Como você fica sabendo do andamento do seu carro hoje?</li>
            <li>Quantas vezes já ligou ou mandou mensagem cobrando notícia?</li>
            <li>
              Um QR code com o andamento (recebido, previsão, pronto) mudaria sua
              confiança?
            </li>
            <li>Já desistiu ou recusou um orçamento por demora ou falta de aviso?</li>
            <li>Com preço igual, escolheria a oficina que avisa?</li>
          </ul>
          <p className="mt-3 text-caption text-mid-gray">
            Medir: % que já cobrou notícia · % que valoriza o acompanhamento · % que
            escolheria a oficina que avisa. Registrar em Entrevistas/Descobertas.
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">
            Roteiro para a próxima banca
          </h2>
          <p className="mt-1 text-caption text-mid-gray">
            Sair da banca com o MVP aprovado - não com mais funcionalidades
          </p>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-ink-soft marker:text-mid-gray">
            <li>Reconhecer os 3 pontos - sem discutir.</li>
            <li>Mostrar o MVP v0 (escopo reduzido: áudio + painel + QR code).</li>
            <li>Explicar a corrente organização → comunicação (frase pronta).</li>
            <li>Apresentar os números da validação com clientes finais.</li>
            <li>Pedir o aval dos mentores sobre o recorte do MVP.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
