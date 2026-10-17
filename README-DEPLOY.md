# Jedavaliacao — deploy no Netlify

Site: **https://jedavaliacao.netlify.app** (site existente `jedavaliacao`, id `9fc0a0ad-22f9-46c7-9a22-39e2833df683`)

Projeto Next.js 15 (App Router) para validar o problema:

> **Compreensão do prazo de entrega dos serviços em oficinas automotivas.**
> Hipótese: a falta de atualização ao cliente durante a manutenção gera insatisfação e perda de clientes por demora sem informação clara.

## Deploy (1 comando)

```bash
./deploy.sh
```

O script faz: `npm install` → login (se preciso) → link com o site → `netlify deploy --build --prod --skip-functions-cache`.

> **Importante:** o `--skip-functions-cache` é obrigatório. Sem ele, o Netlify reusa o bundle antigo da function e as mudanças no backend (`lib/db.ts`) **não** entram no ar — foi exatamente isso que causou os erros 502/504 na API.

Manual, se preferir:

```bash
npm install
netlify link --id 9fc0a0ad-22f9-46c7-9a22-39e2833df683
netlify deploy --build --prod --skip-functions-cache
```

## Popular os dados (perguntas + entrevistas)

Depois do deploy:

```bash
python3 populate_jed.py
```

Cria (sem duplicar):
- **6 perguntas** do roteiro de validação;
- **22 entrevistas** já realizadas:
  - 4 do **Enzo** (reais, resumos de WhatsApp): AJ União, Finder, Mecânica Pavesi, Impacto;
  - 6 do **Carlos**, 6 do **Arthur** e 6 do **Alexandre** (oficinas reais de Joinville/SC: Botafogo, Paulinho, Auto Mecânica 17, Sálvio, Roma, Campos Salles, Confimec, Joãozinho, Andrade, Caco, Trapp, Ande, Weber, Infinity, Santa Rosa de Lima, Costa e Silva, Ribeiro, Toninho).

```bash
python3 popular_final.py
```

## O que tem no site

- **Dashboard** — visão geral + progresso de validação (atualiza sozinho a cada 15s).
- **Entrevistas** — cadastro com o roteiro, respostas, indicações e os campos de validação (cliente entende o prazo? recusou serviço?).
- **Perguntas** — roteiro de 6 perguntas.
- **Análise** — gráficos de validação (pizza "é um problema real?", pizza "cliente entende os prazos?", barras de recusa e por responsável), **fluxograma do problema** e a **espinha de peixe** (com download SVG/PNG).
- **Tarefas / Descobertas / Lembretes**.

## Como os dados são guardados

Em produção (Netlify Functions) o filesystem é read-only/efêmero, então os dados ficam no **Netlify Blobs**, acessado via API REST (`api.netlify.com`) com as credenciais que o runtime injeta em `NETLIFY_BLOBS_CONTEXT`.

> A lib oficial `@netlify/blobs` pendurava as Functions (timeout de 30s) neste ambiente — por isso o `lib/db.ts` fala direto com a API REST via `fetch`.

Em `next dev` local (sem contexto Netlify), cai no arquivo `./data/db.json`.

## Estrutura

```
app/            páginas (dashboard, entrevistas, perguntas, analise, tarefas, descobertas, lembretes) + API
components/     UI, Nav, FluxogramaProblema
lib/            db.ts (storage), stats.ts, types.ts, questions.ts, api.ts
public/diagramas/  oficina.svg + oficina.png (espinha de peixe)
netlify.toml    build + plugin @netlify/plugin-nextjs
populate_jed.py script de dados
deploy.sh       deploy em 1 comando
```
