import { redirect } from "next/navigation";

// A página de gráficos era uma segunda versão da análise. Os gráficos
// canônicos ficam em /analise, com a base de cálculo ao lado de cada número.
export default function GraficosPage() {
  redirect("/analise");
}
