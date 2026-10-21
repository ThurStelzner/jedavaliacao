import { readDB } from "@/lib/db";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OficinaPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = await readDB();
  const oficina = db.oficinas.find(
    (o) => o.qrToken === token && o.ativo !== false,
  );

  if (!oficina) {
    return (
      <div>
        <PageHeader
          title="QR não reconhecido"
          subtitle="Este código não está ligado a nenhuma oficina ativa"
        />
        <Card>
          <p className="text-sm text-ink-soft">
            Peça um novo QR code para a oficina. Cada oficina tem um código
            exclusivo — não é possível duas oficinas usarem o mesmo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Oficina #${oficina.numero}`}
        subtitle={oficina.nome}
        right={<Badge variant="solid">QR exclusivo</Badge>}
      />

      <Card>
        <p className="text-caption font-semibold uppercase tracking-wide text-mid-gray">
          Acompanhamento do veículo
        </p>
        <p className="mt-2 max-w-2xl text-body text-ink-soft">
          Este QR code é exclusivo desta oficina. Quando o check-in do carro for
          registrado, o andamento aparece aqui — sem instalar aplicativo e sem
          criar conta.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <dt className="text-caption text-mid-gray">Oficina</dt>
            <dd className="mt-1 text-sm font-medium text-ink">#{oficina.numero}</dd>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <dt className="text-caption text-mid-gray">Nome</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{oficina.nome}</dd>
          </div>
          <div className="rounded-cards border border-hairline bg-surface-alt p-3">
            <dt className="text-caption text-mid-gray">Status</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {oficina.ativo ? "Ativa" : "Inativa"}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
