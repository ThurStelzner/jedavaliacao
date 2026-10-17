#!/usr/bin/env bash
# Deploy do site Jedavaliacao no Netlify (site existente: jedavaliacao)
#
# Uso:  ./deploy.sh
#
# O flag --skip-functions-cache é OBRIGATÓRIO: sem ele o Netlify reusa o bundle
# antigo da function e as mudanças no backend (lib/db.ts) não entram no ar.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 1/4 Dependências"
if [ ! -d node_modules ]; then
  npm install
fi

echo "==> 2/4 Login no Netlify"
if ! netlify status >/dev/null 2>&1; then
  netlify login
fi

echo "==> 3/4 Link com o site jedavaliacao"
if [ ! -f .netlify/state.json ]; then
  netlify link --id 9fc0a0ad-22f9-46c7-9a22-39e2833df683
fi

echo "==> 4/4 Deploy de produção"
netlify deploy --build --prod --skip-functions-cache

echo
echo "Pronto: https://jedavaliacao.netlify.app"
echo "Para popular os dados (perguntas + entrevistas): python3 populate_jed.py"
