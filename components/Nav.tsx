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
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900">Jeda Validação</h1>
        <p className="text-xs text-slate-500 mt-1">Validação de problema</p>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {LINKS.map((l) => {
          const ativo = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                ativo
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
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
