import Link from "next/link";
import { PERGUNTAS } from "@/lib/questions";
import { Card, PageHeader } from "@/components/ui";

export default function PerguntasPage() {
  return (
    <div>
      <PageHeader
        title="Perguntas"
        subtitle="Roteiro fixo para manter a entrevista organizada e no objetivo"
        right={
          <Link
            href="/entrevistas"
            className="inline-flex h-9 items-center rounded-buttons bg-ink px-3 text-sm font-medium text-[#fafafa] transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mid-gray"
          >
            Ir para entrevistas
          </Link>
        }
      />

      <Card className="mb-6 bg-surface-alt">
        <p className="text-sm text-ink-soft">
          <strong className="font-semibold text-ink">Não induza a resposta.</strong> A
          primeira pergunta é aberta de propósito: deixe o entrevistado descrever o
          processo com as próprias palavras antes de aprofundar.
        </p>
      </Card>

      <ol className="space-y-3">
        {PERGUNTAS.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-buttons bg-ink text-caption font-semibold text-[#fafafa]">
                {p.ordem}
              </span>
              <div>
                <p className="text-body font-medium text-ink">{p.texto}</p>
                {p.aberta && (
                  <p className="mt-1 text-caption text-mid-gray">
                    Pergunta aberta — não conduza a resposta.
                  </p>
                )}
                {p.ajuda && <p className="mt-1 text-caption text-mid-gray">{p.ajuda}</p>}
              </div>
            </div>
          </Card>
        ))}
      </ol>

      <Card className="mt-6 bg-surface-alt">
        <p className="text-sm text-ink-soft">
          Ao final, sempre pedir <strong className="font-semibold text-ink">2 indicações</strong>.
          Se não conseguir 2, conseguir pelo menos 1.
        </p>
      </Card>
    </div>
  );
}
