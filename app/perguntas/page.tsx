import { PERGUNTAS } from "@/lib/questions";
import { Card, PageHeader } from "@/components/ui";

export default function PerguntasPage() {
  return (
    <div>
      <PageHeader
        title="❓ Perguntas"
        subtitle="Roteiro fixo para manter a entrevista organizada e no objetivo"
        right={
          <a
            href="/entrevistas"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Ir para entrevistas
          </a>
        }
      />

      <Card className="mb-4 border-l-4 border-l-red-500">
        <p className="text-sm text-slate-700">
          🔴 <strong>Não induza a resposta.</strong> A primeira pergunta é aberta de propósito:
          deixe o entrevistado descrever o processo com as próprias palavras antes de
          aprofundar.
        </p>
      </Card>

      <ol className="space-y-3">
        {PERGUNTAS.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {p.ordem}
              </span>
              <div>
                <p className="font-medium text-slate-900">{p.texto}</p>
                {p.aberta && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Pergunta aberta — não conduza a resposta.
                  </p>
                )}
                {p.ajuda && <p className="mt-1 text-xs text-slate-400">{p.ajuda}</p>}
              </div>
            </div>
          </Card>
        ))}
      </ol>

      <Card className="mt-4 border-l-4 border-l-yellow-400">
        <p className="text-sm text-slate-700">
          🟡 Ao final, sempre pedir <strong>2 indicações</strong>. Se não conseguir 2, conseguir pelo
          menos 1.
        </p>
      </Card>
    </div>
  );
}
