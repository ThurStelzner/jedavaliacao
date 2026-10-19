export type ItemNav = { href: string; label: string };
export type GrupoNav = ItemNav & { filhos?: ItemNav[] };

// O menu lateral mostra só os grupos. Cada grupo abre as páginas
// relacionadas como abas dentro da própria página (componente SubNav).
export const GRUPOS_NAV: GrupoNav[] = [
  { href: "/", label: "Dashboard" },
  {
    href: "/entrevistas",
    label: "Validação",
    filhos: [
      { href: "/entrevistas", label: "Entrevistas" },
      { href: "/perguntas", label: "Perguntas" },
      { href: "/respostas", label: "Respostas" },
    ],
  },
  {
    href: "/analise",
    label: "Análise",
    filhos: [
      { href: "/analise", label: "Análise" },
      { href: "/graficos", label: "Gráficos" },
    ],
  },
  {
    href: "/solucoes",
    label: "Solução",
    filhos: [
      { href: "/solucoes", label: "Solução" },
      { href: "/concorrentes", label: "Concorrentes" },
      { href: "/vendas", label: "Vendas" },
    ],
  },
  {
    href: "/pitch",
    label: "Pitch",
    filhos: [
      { href: "/pitch", label: "Pitch" },
      { href: "/mentoria", label: "Mentoria" },
      { href: "/descobertas", label: "Descobertas" },
    ],
  },
  {
    href: "/tarefas",
    label: "Tarefas",
    filhos: [
      { href: "/tarefas", label: "Tarefas" },
      { href: "/lembretes", label: "Lembretes" },
    ],
  },
];

function alvosDoGrupo(g: GrupoNav): ItemNav[] {
  return g.filhos ?? [{ href: g.href, label: g.label }];
}

/** O grupo (item do menu lateral) ao qual o caminho atual pertence. */
export function grupoDoCaminho(pathname: string): GrupoNav | undefined {
  return GRUPOS_NAV.find((g) => caminhoNoGrupo(g, pathname));
}

/** O caminho atual está dentro deste grupo? */
export function caminhoNoGrupo(g: GrupoNav, pathname: string): boolean {
  if (g.href === "/") return pathname === "/";
  return alvosDoGrupo(g).some(
    (a) => pathname === a.href || pathname.startsWith(`${a.href}/`),
  );
}

/** O caminho atual é exatamente este item? */
export function caminhoAtivo(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
