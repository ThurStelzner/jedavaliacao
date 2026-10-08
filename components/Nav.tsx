"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/entrevistas", label: "Entrevistas" },
  { href: "/contatos", label: "Contatos" },
  { href: "/perguntas", label: "Perguntas" },
  { href: "/tarefas", label: "Tarefas" },
  { href: "/descobertas", label: "Descobertas" },
  { href: "/lembretes", label: "Lembretes" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <aside className="shrink-0 border-b border-hairline bg-surface-alt md:sticky md:top-0 md:h-screen md:w-60 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="px-5 pt-5 text-center md:py-6 md:text-left">
        <p className="text-subheading font-semibold text-ink">Jedavaliacao</p>
        <p className="mt-1 text-caption text-mid-gray">Validação de problema</p>
      </div>
      <nav className="flex flex-wrap justify-center gap-1 px-3 py-3 md:flex-col md:flex-nowrap md:justify-start md:py-0">
        {LINKS.map((l) => {
          const ativo = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-buttons px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mid-gray ${
                ativo
                  ? "bg-ink text-[#fafafa]"
                  : "text-ink-soft hover:bg-canvas"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
