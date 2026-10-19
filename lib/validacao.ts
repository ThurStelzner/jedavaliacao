import type { Entrevista, Pergunta, Publico, Rodada } from "./types";

export const META_CLIENTE = 10;

export const ROTULOS_PUBLICO: Record<
  Publico,
  { nome: string; curto: string; descricao: string }
> = {
  oficina: {
    nome: "Oficina",
    curto: "Oficina",
    descricao: "Dono, recepção e mecânico. Paga, opera o check-in e usa o painel.",
  },
  cliente: {
    nome: "Cliente final",
    curto: "Cliente",
    descricao: "Motorista. Não paga. Acompanha o carro pelo QR code.",
  },
};

export const ROTULOS_RODADA: Record<Rodada, string> = {
  problema: "Problema",
  solucao: "Solução",
};

export function publicoDe(e: Entrevista): Publico {
  return e.publico ?? "oficina";
}

export function publicoDaPergunta(p: Pergunta): Publico {
  return p.publico ?? "oficina";
}

export function rodadaDaPergunta(p: Pergunta): Rodada {
  return p.rodada ?? "problema";
}

export function ordemDaPergunta(p: Pergunta): number {
  return p.ordem ?? 0;
}

export function ordenarPerguntas(a: Pergunta, b: Pergunta): number {
  return (
    ordemDaPergunta(a) - ordemDaPergunta(b) ||
    a.createdAt.localeCompare(b.createdAt)
  );
}

export function perguntasDoBloco(
  perguntas: Pergunta[],
  publico: Publico,
  rodada: Rodada,
): Pergunta[] {
  return perguntas
    .filter((p) => publicoDaPergunta(p) === publico && rodadaDaPergunta(p) === rodada)
    .sort(ordenarPerguntas);
}

export function perguntasDoPublico(
  perguntas: Pergunta[],
  publico: Publico,
): Pergunta[] {
  return perguntas
    .filter((p) => publicoDaPergunta(p) === publico)
    .sort((a, b) => {
      const ra = rodadaDaPergunta(a);
      const rb = rodadaDaPergunta(b);
      if (ra !== rb) return ra === "problema" ? -1 : 1;
      return ordenarPerguntas(a, b);
    });
}

export const BLOCOS: Array<{
  publico: Publico;
  rodada: Rodada;
  titulo: string;
  descricao: string;
}> = [
  {
    publico: "oficina",
    rodada: "problema",
    titulo: "Oficina · problema",
    descricao: "O que já foi validado com 26 entrevistas.",
  },
  {
    publico: "oficina",
    rodada: "solucao",
    titulo: "Oficina · solução",
    descricao: "O que ainda precisa ser testado com o dono e o mecânico.",
  },
  {
    publico: "cliente",
    rodada: "problema",
    titulo: "Cliente final · problema",
    descricao: "O que ainda precisa ser ouvido diretamente do motorista.",
  },
  {
    publico: "cliente",
    rodada: "solucao",
    titulo: "Cliente final · solução",
    descricao: "O que o cliente final precisa validar no QR code.",
  },
];

export const METRICAS_BETA = [
  {
    lado: "Oficina",
    metrica: "Check-in por áudio em menos de 2 minutos",
    como: "Tempo do áudio até a ordem de serviço confirmada.",
  },
  {
    lado: "Oficina",
    metrica: "Minutos por dia respondendo cliente",
    como: "Antes e depois do QR code, no mesmo período.",
  },
  {
    lado: "Oficina",
    metrica: "Check-ins feitos por dia",
    como: "Quantos carros entram no fluxo e quantos ficam sem registro.",
  },
  {
    lado: "Cliente final",
    metrica: "Quantos clientes escaneiam o QR code",
    como: "Escaneamentos por check-in e por status atualizado.",
  },
  {
    lado: "Cliente final",
    metrica: "Quantas vezes o cliente cobra notícia",
    como: "Comparar antes e depois no mesmo tipo de serviço.",
  },
  {
    lado: "Cliente final",
    metrica: "Confiança e escolha da oficina",
    como: "Perguntar se o aviso faria escolher a oficina de novo.",
  },
];
