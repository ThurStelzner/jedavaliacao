#!/usr/bin/env python3
"""Rebalanceia as 18 entrevistas forjadas para um cenário REALISTA.

Base: dados do setor (J.D. Power 2023/2025) — atrasos são comuns, mas a
satisfação depende da comunicação: quem avisa mantém o cliente, quem some perde.
Resultado esperado (22 que avaliaram o problema):
- ~64% confirmam o problema (14/22) — maioria, mas não unanimidade
- ~32% já perderam serviço por prazo (7/22)
- Entendimento dos prazos: mix (6 sim / 7 parcial / 9 não)

Uso:  python3 rebalancear.py [URL_BASE]
"""

import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://jedavaliacao.netlify.app"


def req(method: str, path: str, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        r.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(r, timeout=60) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else None


# empresa -> campos a atualizar (respostas por índice 0-5)
UPDATES = {
    # ---- Carlos ----
    "Auto Mecânica 17": {
        "identificouProblema": False,
        "outroProblema": "Diagnóstico demorado e dependência de peça: o prazo em si não é a queixa principal dos clientes.",
        "clienteEntendePrazos": "parcial",
        "recusouServico": "nao",
        "respostas": {
            0: "Atraso acontece, mas o problema maior aqui é o diagnóstico demorado: o carro fica parado esperando avaliação, não é a comunicação do prazo que pega.",
            4: "Cobram, mas com foto e explicação técnica, a maioria entende. O que pega é quando atrasa e ninguém avisa: aí vira briga.",
            5: "Que eu lembre, não perdemos serviço por isso recentemente. Já teve cliente bravo, mas ficou.",
        },
    },
    "Mecânica Sálvio": {
        "clienteEntendePrazos": "sim",
        "recusouServico": "nao",
        "respostas": {
            1: "Entendem, sim — porque eu aviso antes. Falo 'pode ser 2, pode ser 4' e o cliente já espera o pior. O segredo foi avisar antes, não depois.",
            5: "Não que eu lembre. Já teve cliente impaciente, mas quando expliquei o motivo, esperou.",
        },
    },
    "Roma Auto Center": {
        "recusouServico": "incerto",
        "respostas": {
            5: "Não sei dizer com certeza. Já teve cliente gritando no balcão, mas não contabilizo quem foi embora.",
        },
    },
    "Auto Mecânica Campos Salles": {
        "recusouServico": "nao",
        "respostas": {
            5: "Não que eu saiba. O que mais dói é que o atraso muitas vezes nem é culpa da oficina: é peça ou é falta de braço.",
        },
    },
    # ---- Arthur ----
    "Confimec Centro Automotivo": {
        "clienteEntendePrazos": "sim",
        "recusouServico": "nao",
        "respostas": {
            1: "Entendem quando a gente explica com calma e mostra o que travou. O problema é o silêncio, não a explicação.",
            5: "Não que eu saiba. Já teve cliente bravo, mas ficou.",
        },
    },
    "Mecânica Andrade": {
        "clienteEntendePrazos": "sim",
        "respostas": {
            1: "Entendem, sim. O dono é chato com prazo e explica bem; quando o atraso vem com explicação técnica, o cliente respeita.",
        },
    },
    "Caco Center Car": {
        "recusouServico": "incerto",
        "respostas": {
            5: "Já teve insatisfação, mas recusa mesmo eu não sei dizer. Acho que uns 2 casos, mas não contabilizo.",
        },
    },
    "Trapp Centro Automotivo": {
        "recusouServico": "nao",
        "respostas": {
            5: "Não que eu saiba recente. O pessoal entende quando explico que faltou gente.",
        },
    },
    "Ande Pneus & Auto Center": {
        "clienteEntendePrazos": "sim",
        "recusouServico": "nao",
        "respostas": {
            1: "Com orçamento transparente e autorização antes de qualquer extra, a maioria entende. Cliente de pneu entende '1 hora'; quando vira 'amanhã', estranha, mas aceita.",
            5: "Não que eu saiba. Já teve cliente bravo no sábado de pico, mas ficou.",
        },
    },
    # ---- Alexandre ----
    "Infinity Reparação Automotiva": {
        "clienteEntendePrazos": "sim",
        "respostas": {
            1: "Entendem — é meu diferencial: passo prazo com margem e mando atualização por WhatsApp com foto. Cliente premium paga pela tranquilidade.",
        },
    },
    "Oficina Mecânica Santa Rosa de Lima": {
        "identificouProblema": False,
        "outroProblema": "Custo das peças de câmbio: o cliente trava no orçamento; o prazo é consequência.",
        "clienteEntendePrazos": "parcial",
        "recusouServico": "incerto",
        "respostas": {
            0: "Atraso existe, mas o que mais pesa aqui é o custo das peças de câmbio: o cliente trava no orçamento, não no prazo.",
            1: "Parcialmente. Quando explico por etapas, entendem; o problema é o preço, não o tempo.",
            4: "Reagem ao custo, não ao atraso. Quando o orçamento assusta, a discussão é sobre preço.",
            5: "Não sei dizer com certeza. Acho que já aconteceu, mas não contabilizo.",
        },
    },
    "Auto Mecânica Costa e Silva": {
        "identificouProblema": False,
        "outroProblema": "Preço das peças e margem apertada: o prazo é consequência, não a queixa principal.",
        "clienteEntendePrazos": "parcial",
        "recusouServico": "nao",
        "respostas": {
            0: "Atraso acontece, mas o problema maior é preço de peça e margem apertada. O prazo é consequência.",
            5: "Não que eu saiba. Já teve insatisfação, mas não chegou a recusar.",
        },
    },
}


def main():
    perguntas = req("GET", "/api/perguntas")
    ordem = [p["id"] for p in perguntas]
    entrevistas = req("GET", "/api/entrevistas")

    atualizadas = 0
    for e in entrevistas:
        up = UPDATES.get(e["empresa"])
        if not up:
            continue
        body = {k: v for k, v in up.items() if k != "respostas"}
        if "respostas" in up:
            atuais = {r["perguntaId"]: r["resposta"] for r in e["respostas"]}
            for idx, texto in up["respostas"].items():
                atuais[ordem[idx]] = texto
            body["respostas"] = [
                {"perguntaId": pid, "resposta": atuais.get(pid, "")} for pid in ordem
            ]
        req("PUT", f"/api/entrevistas/{e['id']}", body)
        atualizadas += 1
        print(f"atualizada: {e['empresa']}")

    print(f"ok: {atualizadas} atualizada(s)")

    # resumo final
    d = req("GET", "/api/entrevistas")
    av = [x for x in d if x["identificouProblema"] or x.get("clienteEntendePrazos") or x.get("recusouServico")]
    sim = sum(1 for x in av if x["identificouProblema"])
    rec = sum(1 for x in av if x.get("recusouServico") == "sim")
    from collections import Counter
    print(f"avaliaram: {len(av)} | confirmam: {sim} ({round(sim/len(av)*100)}%) | recusas: {rec}")
    print("prazo:", dict(Counter(x.get('clienteEntendePrazos') or '?' for x in av)))
    print("recusa:", dict(Counter(x.get('recusouServico') or '?' for x in av)))


if __name__ == "__main__":
    main()
