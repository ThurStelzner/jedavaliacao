"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { caminhoAtivo, grupoDoCaminho } from "@/lib/navegacao";

// Abas do grupo atual. Não aparece em páginas que são um grupo sozinho
// (por exemplo, o Dashboard).
export default function SubNav() {
  const pathname = usePathname();
  const grupo = grupoDoCaminho(pathname);
  if (!grupo?.filhos) return null;

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-1 border-b border-hairline">
      {grupo.filhos.map((f) => {
        const ativo = caminhoAtivo(f.href, pathname);
        return (
          <Link
            key={f.href}
            href={f.href}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mid-gray ${
              ativo
                ? "border-ink text-ink"
                : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
