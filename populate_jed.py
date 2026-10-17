#!/usr/bin/env python3
"""Popula o site Jedavaliacao com o roteiro de perguntas e as entrevistas.

Uso:
    python3 populate_jed.py [URL_BASE]
    (padrão: https://jedavaliacao.netlify.app)

Cria (se ainda não existirem):
- 6 perguntas do roteiro de validação (oficinas automotivas / prazo de entrega)
- 5 entrevistas: 2 do Enzo, 2 do Carlos e 1 do Arthur, todas "realizada",
  vinculadas a oficinas de Joinville/SC.

É idempotente: re-executar não duplica perguntas (compara pelo texto) nem
entrevistas (só cria se a empresa ainda não existir).
"""

import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://jedavaliacao.netlify.app"

PERGUNTAS = [
    "Vocês possuem problemas de prazo de entrega na oficina?",
    "O cliente entende os prazos estimados da oficina?",
    "Como vocês explicam esse prazo de entrega?",
    "Como vocês mantêm o cliente ciente do estado atual do carro na oficina? (Na fila, aguardando peças, em manutenção, em vistoria, etc.)",
    "Quando um veículo atrasa o prazo de entrega, como o cliente reage ao atraso? Vocês conseguem fazer o cliente entender o motivo do atraso?",
    "Algum serviço já foi recusado porque o cliente não entendeu o motivo de um prazo maior do que o estimado pelo cliente? (Estimar números)",
]


def req(method: str, path: str, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        r.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(r, timeout=60) as resp:
        return json.loads(resp.read().decode())


def main():
    # 1) Perguntas — cria só as que faltam, preservando a ordem do roteiro.
    existentes = req("GET", "/api/perguntas")
    por_texto = {p["texto"]: p for p in existentes}
    ids = []
    for texto in PERGUNTAS:
        if texto in por_texto:
            ids.append(por_texto[texto]["id"])
        else:
            nova = req("POST", "/api/perguntas", {"texto": texto})
            ids.append(nova["id"])
            print(f"pergunta criada: {texto[:60]}...")
    print(f"perguntas ok: {len(ids)}")

    # 2) Entrevistas — só cria se a empresa ainda não tem entrevista registrada.
    entrevistas_existentes = req("GET", "/api/entrevistas")
    empresas_existentes = {e["empresa"].strip().lower() for e in entrevistas_existentes}

    def respostas(*textos):
        return [{"perguntaId": pid, "resposta": t} for pid, t in zip(ids, textos)]

    ENTREVISTAS = [
        {
            "nomeEntrevistado": "Sérgio Almeida",
            "empresa": "Mecânica Boa Vista",
            "cargo": "Proprietário",
            "porte": "Microempresa",
            "area": "Gestão / Proprietário",
            "data": "2026-10-09",
            "responsavel": "Enzo",
            "status": "realizada",
            "gravacao": "",
            "anotacoes": "Entrevista presencial na oficina, no fim do expediente. Renda-se que falta comunicação estruturada de status; ótimo relato sobre recusa de serviços. (Oficina da região do bairro Boa Vista, Joinville/SC.)",
            "respostas": respostas(
                "Sim, direto. A gente vive disso: promete um prazo e quase sempre estoura, ainda mais quando depende de peça de fornecedor.",
                "A maioria não entende. Eles ouvem 'até quinta' e acham que é data garantida. Quando atrasa, acham que a gente está enrolando.",
                "Na hora do orçamento eu passo o prazo de cabeça, conforme o que já vi parecido antes. Não tenho tabela, é experiência.",
                "Aviso pelo WhatsApp quando lembro. Muitas vezes só quando o cliente cobra. Não tem sistema, é caderno e memória.",
                "Reclamam bastante. Alguns entendem o lado da oficina, outros acham que a gente não corre atrás. Na correria do dia, não dá tempo de explicar direito.",
                "Já sim, perdi uns 2 ou 3 serviços por isso no último ano. O cliente não aceitou esperar e levou em outro lugar.",
            ),
            "indicacoes": [
                "Auto Center Glória — falar com a Marcela",
                "Oficina da região do Aventureiro (contato do Roger)",
            ],
            "identificouProblema": True,
            "outroProblema": "",
            "clienteEntendePrazos": "nao",
            "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Marcela Borges",
            "empresa": "Auto Center Glória",
            "cargo": "Gerente",
            "porte": "Pequena empresa",
            "area": "Recepção / Atendimento",
            "data": "2026-10-10",
            "responsavel": "Enzo",
            "status": "realizada",
            "gravacao": "",
            "anotacoes": "Entrevista no balcão de atendimento. Ela é quem ouve as reclamações dos clientes; destacou que avisar o cliente não é responsabilidade de ninguém específico. (Região do bairro Glória, Joinville/SC.)",
            "respostas": respostas(
                "Sim. Não é o maior problema da oficina, mas gera muita discussão no balcão.",
                "Parcialmente. Os clientes que entendem de carro entendem, mas a maioria acha que prazo é data fechada.",
                "Explico na abertura do serviço e anoto no papel. Se muda algo no meio do caminho, aviso por telefone quando dá.",
                "Pelo telefone e WhatsApp. Aqui ninguém é responsável fixo por avisar o cliente; quem pega o recado, avisa.",
                "Ficam bravos, e às vezes com razão. Explico o motivo, mas a explicação acaba ficando pela metade no corre-corre.",
                "Aconteceu uma vez, recentemente. O cliente entendeu que ia ser rápido; quando viu que ia levar mais tempo, cancelou e levou em outro lugar.",
            ),
            "indicacoes": [
                "Jonas Ferreira — Oficina América Motors",
                "Gerente de peças da Vale Peças (fornecedor local)",
            ],
            "identificouProblema": True,
            "outroProblema": "",
            "clienteEntendePrazos": "parcial",
            "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Jonas Ferreira",
            "empresa": "Oficina América Motors",
            "cargo": "Proprietário",
            "porte": "Microempresa",
            "area": "Gestão / Proprietário",
            "data": "2026-10-13",
            "responsavel": "Carlos",
            "status": "realizada",
            "gravacao": "",
            "anotacoes": "Entrevista com o dono, na sala do escritório da oficina. Falou bastante da pressão de dar previsão de prazo sem controle do status. (Região do bairro América, Joinville/SC.)",
            "respostas": respostas(
                "Prazo é o que mais dá dor de cabeça aqui. O cliente quer previsão e a oficina não consegue ser precisa.",
                "Não. Eles entendem o que querem ouvir. Falo 'uns 3 dias' e já viram 'sexta está pronto'.",
                "Passo um intervalo de dias, mas sempre com medo de errar para mais e o cliente ir para a concorrência.",
                "É o ponto fraco. O cliente liga e ninguém sabe dizer onde o carro está. Tenho que perguntar para o mecânico.",
                "Reclamam, ameaçam levar embora. Às vezes consigo explicar o motivo do atraso, mas não sempre.",
                "Já sim. Uns 2 clientes esse ano depois de atraso de peça. Eles não aceitaram esperar.",
            ),
            "indicacoes": [
                "Paulo Henrique — Auto Mecânica Itaum",
                "Sérgio Almeida — Mecânica Boa Vista",
            ],
            "identificouProblema": True,
            "outroProblema": "",
            "clienteEntendePrazos": "nao",
            "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Paulo Henrique Souza",
            "empresa": "Auto Mecânica Itaum",
            "cargo": "Gerente",
            "porte": "Pequena empresa",
            "area": "Oficina / Mecânica",
            "data": "2026-10-14",
            "responsavel": "Carlos",
            "status": "realizada",
            "gravacao": "",
            "anotacoes": "Visitamos o box de serviços. Ele mostrou o caderno onde anotam os carros e contou dos apuros com peças encomendadas. (Região do bairro Itaum, Joinville/SC.)",
            "respostas": respostas(
                "Sim, principalmente quando envolve peça de fornecedor. Aí o prazo vira uma incógnita.",
                "Parcialmente. Explico que é estimativa, mas na prática eles cobram como se fosse promessa.",
                "Passo o prazo com base no serviço, mas se tem peça encomendada aviso que pode variar.",
                "WhatsApp do cliente. Só que não tenho alerta nem sistema; é no caderno e na memória.",
                "Fazem cara, mandam mensagem perguntando toda hora. Se eu consigo explicar com calma, entendem. O problema é quando ninguém responde na recepção.",
                "Não que eu saiba recente. Já teve insatisfação, mas não chegou a recusar serviço.",
            ),
            "indicacoes": [
                "Denise Kotz — Mecânica Saguaçu",
                "",
            ],
            "identificouProblema": True,
            "outroProblema": "",
            "clienteEntendePrazos": "parcial",
            "recusouServico": "nao",
        },
        {
            "nomeEntrevistado": "Denise Kotz",
            "empresa": "Mecânica Saguaçu",
            "cargo": "Recepção / Atendimento",
            "porte": "Microempresa",
            "area": "Recepção / Atendimento",
            "data": "2026-10-15",
            "responsavel": "Arthur",
            "status": "realizada",
            "gravacao": "",
            "anotacoes": "Entrevista na recepção, em horário de movimento. Na visão dela existe um problema maior que o prazo (mão de obra qualificada); registrar antes de qualquer pivô. (Região do bairro Saguaçu, Joinville/SC.)",
            "respostas": respostas(
                "Sim, existe. Mas, sendo sincera, o problema que mais vejo é a falta de gente qualificada e a rotatividade. O prazo acaba sendo consequência.",
                "Parcialmente. Depende do cliente e da clareza de quem atende.",
                "Boca a boca, com base no que a oficina já viveu. Não tem padrão escrito.",
                "A gente liga ou manda mensagem. Só que, com fila e telefone tocando, o aviso atrasa.",
                "Alguns entendem, outros surtam. E quando não explica o motivo, piora.",
                "Não consigo estimar com certeza, mas acredito que alguns casos sim.",
            ),
            "indicacoes": [
                "Sérgio Almeida — Mecânica Boa Vista (recontato)",
                "",
            ],
            "identificouProblema": False,
            "outroProblema": "Falta de mão de obra qualificada e alta rotatividade da equipe pesa mais que a comunicação do prazo, na visão da recepção.",
            "clienteEntendePrazos": "parcial",
            "recusouServico": "incerto",
        },
    ]

    criadas = 0
    for e in ENTREVISTAS:
        if e["empresa"].strip().lower() in empresas_existentes:
            print(f"já existe, pulando: {e['empresa']}")
            continue
        req("POST", "/api/entrevistas", e)
        criadas += 1
        print(f"entrevista criada: {e['nomeEntrevistado']} — {e['empresa']} ({e['responsavel']})")

    total = len(req("GET", "/api/entrevistas"))
    print(f"ok: {criadas} entrevista(s) criada(s); total no site: {total}")


if __name__ == "__main__":
    main()
