"use client";

import { useEffect, useState } from "react";
import { apiCreate, apiList } from "@/lib/api";
import type { Oficina } from "@/lib/types";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

function mensagemDeErro(e: unknown): string {
  const bruto = e instanceof Error ? e.message : String(e);
  const corte = bruto.indexOf(":");
  const json = corte >= 0 ? bruto.slice(corte + 1).trim() : bruto;
  try {
    const parsed = JSON.parse(json) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // mantém a mensagem original
  }
  return bruto;
}

export default function OficinasPage() {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [origem, setOrigem] = useState("");
  const [copiado, setCopiado] = useState("");

  async function carregar() {
    const lista = await apiList<Oficina>("oficinas");
    setOficinas(lista);
  }

  useEffect(() => {
    setOrigem(window.location.origin);
    carregar();
  }, []);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await apiCreate<Oficina>("oficinas", {
        nome: nome.trim(),
        numero: numero.trim(),
      });
      setNome("");
      setNumero("");
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function copiar(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(link);
      setTimeout(() => setCopiado(""), 2000);
    } catch {
      setErro("Não foi possível copiar o link.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Oficinas"
        subtitle="Cada oficina tem um número e um QR code exclusivos — o servidor recusa qualquer repetição"
        right={<Badge variant="outline">{oficinas.length} cadastradas</Badge>}
      />

      <Card className="mb-6">
        <h2 className="text-sm font-semibold text-ink">Cadastrar oficina</h2>
        <p className="mt-1 text-caption text-mid-gray">
          O número é único no sistema. Se você deixar em branco, o próximo número
          livre é gerado automaticamente (a partir de 1001). O QR code também é
          único e ligado a esta oficina.
        </p>
        <form onSubmit={cadastrar} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <label className="block">
            <span className="text-caption font-medium text-ink-soft">
              Nome da oficina
            </span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Mecânica do Paulinho"
              required
              className="mt-1 h-10 w-full rounded-inputs border border-hairline bg-paper px-3 text-sm text-ink outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-caption font-medium text-ink-soft">
              Número (opcional)
            </span>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
              placeholder="Automático"
              inputMode="numeric"
              maxLength={6}
              className="mt-1 h-10 w-full rounded-inputs border border-hairline bg-paper px-3 text-sm text-ink outline-none focus:border-ink"
            />
          </label>
          <button
            type="submit"
            disabled={salvando}
            className="mt-5 h-10 rounded-buttons bg-ink px-4 text-sm font-medium text-[#fafafa] hover:bg-ink-soft disabled:opacity-50 sm:mt-6"
          >
            {salvando ? "Salvando..." : "Cadastrar"}
          </button>
        </form>
        {erro && (
          <p className="mt-3 rounded-inputs border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
            {erro}
          </p>
        )}
      </Card>

      {oficinas.length === 0 ? (
        <EmptyState>
          Nenhuma oficina cadastrada. O primeiro cadastro recebe o número 1001.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {oficinas.map((o) => {
            const link = `${origem}/o/${o.qrToken}`;
            const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(link)}`;
            return (
              <Card key={o.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-caption font-medium uppercase tracking-wide text-mid-gray">
                      Oficina
                    </p>
                    <p className="text-heading-sm font-semibold text-ink">
                      #{o.numero}
                    </p>
                  </div>
                  <Badge variant={o.ativo ? "soft" : "outline"}>
                    {o.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-ink">{o.nome}</p>
                <div className="mt-4 flex justify-center rounded-cards border border-hairline bg-paper p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt={`QR code exclusivo da oficina ${o.numero}`}
                    width={160}
                    height={160}
                  />
                </div>
                <p className="mt-2 break-all text-caption text-mid-gray">{link}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => copiar(link)}
                    className="inline-flex h-9 items-center rounded-buttons border border-hairline px-3 text-sm font-medium text-ink hover:bg-canvas"
                  >
                    {copiado === link ? "Copiado" : "Copiar link"}
                  </button>
                  <a
                    href={link}
                    className="inline-flex h-9 items-center rounded-buttons bg-ink px-3 text-sm font-medium text-[#fafafa] hover:bg-ink-soft"
                  >
                    Abrir
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-caption text-mid-gray">
        Regra aplicada no servidor: número repetido devolve 409 e QR repetido
        também. Dois cadastros nunca compartilham o mesmo número ou o mesmo QR.
      </p>
    </div>
  );
}
