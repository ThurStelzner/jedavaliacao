export type ItemNav = { href: string; label: string };
export type GrupoNav = ItemNav & { filhos?: ItemNav[] };

// Menu principal enxuto: 4 destinos, sem submenus. As páginas que saíram do
// menu continuam existindo por URL direta, mas não competem com o fluxo
// principal (registrar entrevista → entender a análise → apresentar).
export const GRUPOS_NAV: GrupoNav[] = [
  { href: "/", label: "Dashboard" },
  { href: "/entrevistas", label: "Entrevistas" },
  { href: "/analise", label: "Análise" },
  { href: "/pitch", label: "Pitch" },
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
