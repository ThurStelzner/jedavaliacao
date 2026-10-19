"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { caminhoNoGrupo, GRUPOS_NAV } from "@/lib/navegacao";

export default function Nav() {
  const pathname = usePathname();
  return (
    <aside className="shrink-0 border-b border-hairline bg-surface-alt md:sticky md:top-0 md:h-screen md:w-60 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="px-5 pt-5 text-center md:py-6 md:text-left">
        <p className="text-subheading font-semibold text-ink">Jedavaliacao</p>
        <p className="mt-1 text-caption text-mid-gray">Validação de problema</p>
      </div>
      <nav className="flex flex-wrap justify-center gap-1 px-3 py-3 md:flex-col md:flex-nowrap md:justify-start md:py-0">
        {GRUPOS_NAV.map((g) => {
          const ativo = caminhoNoGrupo(g, pathname);
          return (
            <Link
              key={g.href}
              href={g.href}
              className={`whitespace-nowrap rounded-buttons px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mid-gray ${
                ativo
                  ? "bg-ink text-[#fafafa]"
                  : "text-ink-soft hover:bg-canvas"
              }`}
            >
              {g.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
