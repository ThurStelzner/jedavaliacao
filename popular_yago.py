#!/usr/bin/env python3
"""Adiciona as 4 entrevistas do Yago (Planilha_Validacao_Entrevistas_Oficinas.xlsx).

Foco das entrevistas: processo de check-in e retrabalho (problema adjacente ao de
prazo). O conteúdo é mapeado fielmente nas 6 perguntas do site; onde não foi
abordado, fica registrado como tal. O detalhe completo vai nas anotações.

Uso:  python3 popular_yago.py [URL_BASE]   (padrão: https://jedavaliacao.netlify.app)
Idempotente pelo nome do entrevistado.
"""

import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://jedavaliacao.netlify.app"

NA = "Não abordado nesta entrevista."
FOCO = "Não abordado nesta entrevista — o foco foi o processo de check-in e retrabalho."


def req(method: str, path: str, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        r.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(r, timeout=60) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else None


def main():
    ids = [p["id"] for p in req("GET", "/api/perguntas")]
    assert len(ids) == 6, f"esperava 6 perguntas, achei {len(ids)}"

    def R(*textos):
        return [{"perguntaId": pid, "resposta": t} for pid, t in zip(ids, textos)]

    E = [
        {
            "nomeEntrevistado": "Professor José",
            "empresa": "SENAI",
            "cargo": "Professor",
            "porte": "Grande empresa",
            "area": "Outro",
            "data": "2026-10-13",
            "responsavel": "Yago",
            "status": "realizada",
            "gravacao": "Planilha de validação (Yago)",
            "anotacoes": (
                "Entrevista registrada na planilha de validação (Yago). "
                "Perfil: Professor do SENAI; experiência com mecânica de pequeno, médio e grande porte e contato com concessionárias. "
                "Contexto atual: concessionárias usam check-in automatizado via tablet; oficinas pequenas ainda podem registrar em papel; alguns sistemas online já existem. "
                "Problemas relatados: funcionários de pequenas e médias oficinas nem sempre seguem os processos digitais e continuam usando papel. "
                "Impactos no dia a dia: informações precisam ser transferidas posteriormente para o sistema, gerando retrabalho. "
                "Sugestões/necessidades: investigar como tornar o check-in digital simples e fácil de adotar na rotina da oficina. "
                "Evidências para validação: relato direto de retrabalho associado ao registro em papel e à baixa adesão aos processos. "
                "Limitações/pontos a investigar: entender por que os funcionários não seguem os processos (dificuldade de uso, treinamento, hábito, custo ou outros fatores)."
            ),
            "respostas": R(
                FOCO,
                NA,
                NA,
                "Não abordado diretamente. Relacionado: as informações do atendimento precisam ser transferidas posteriormente para o sistema, gerando retrabalho.",
                NA,
                NA,
            ),
            "indicacoes": ["", ""],
            "identificouProblema": False,
            "outroProblema": "Check-in em papel e baixa adesão aos processos digitais: funcionários de pequenas e médias oficinas continuam usando papel, gerando retrabalho na transferência de informações para o sistema.",
            "clienteEntendePrazos": "",
            "recusouServico": "",
        },
        {
            "nomeEntrevistado": "Antônio",
            "empresa": "SENAI",
            "cargo": "Professor (responsável por oficina pequena)",
            "porte": "Pequena empresa",
            "area": "Gestão / Proprietário",
            "data": "2026-10-13",
            "responsavel": "Yago",
            "status": "realizada",
            "gravacao": "Planilha de validação (Yago)",
            "anotacoes": (
                "Entrevista registrada na planilha de validação (Yago). "
                "Perfil: Professor do SENAI; responsável por uma oficina pequena. "
                "Contexto atual: atualmente não faz check-in, mas pretende adotar o processo no futuro; se começasse hoje, acredita que faria em papel. "
                "Problemas relatados: sistemas considerados caros; ferramentas nem sempre têm todas as funções necessárias; pode ser preciso pagar por mais de um sistema. "
                "Impactos no dia a dia: prevê dificuldade e retrabalho com registros em papel; custo e fragmentação das ferramentas dificultam a adoção. "
                "Sugestões/necessidades: uma solução acessível, simples e que reúna as funções essenciais para uma pequena oficina. "
                "Evidências para validação: relato sobre barreiras de custo e falta de funcionalidades integradas; o retrabalho é uma previsão, não uma experiência atual com check-in. "
                "Limitações/pontos a investigar: orçamento disponível, quais funcionalidades são essenciais e quais sistemas ele já avaliou."
            ),
            "respostas": R(
                FOCO,
                NA,
                NA,
                "Não abordado diretamente. Relacionado: prevê dificuldade e retrabalho com registros em papel; custo e fragmentação das ferramentas dificultam a adoção.",
                NA,
                NA,
            ),
            "indicacoes": ["", ""],
            "identificouProblema": False,
            "outroProblema": "Custo e fragmentação dos sistemas: ferramentas caras e incompletas; se adotasse o check-in hoje, faria em papel (prevê retrabalho).",
            "clienteEntendePrazos": "",
            "recusouServico": "",
        },
        {
            "nomeEntrevistado": "João Oliveira",
            "empresa": "SENAI",
            "cargo": "Professor (dono de oficina pequena)",
            "porte": "Pequena empresa",
            "area": "Gestão / Proprietário",
            "data": "2026-10-13",
            "responsavel": "Yago",
            "status": "realizada",
            "gravacao": "Planilha de validação (Yago)",
            "anotacoes": (
                "Entrevista registrada na planilha de validação (Yago). "
                "Perfil: Professor do SENAI; dono de uma oficina pequena. "
                "Contexto atual: tem baixo fluxo de veículos, ainda não aderiu ao check-in e utiliza algumas plataformas pagas. "
                "Problemas relatados: plataformas caras e incompletas; dificuldade para apresentar o serviço ao cliente; sistemas não apoiam bem a conversa, a negociação ou a compreensão do interesse do cliente. "
                "Impactos no dia a dia: gasto com plataformas que não atendem tudo; possível dificuldade de comunicar valor e converter oportunidades em serviços. "
                "Sugestões/necessidades: ferramenta acessível que atenda às necessidades da oficina e ajude a apresentar informações e acompanhar a conversa com o cliente. "
                "Evidências para validação: relato sobre custo, funcionalidades insuficientes e dificuldades comerciais; a perda de vendas é uma possibilidade a validar com dados. "
                "Limitações/pontos a investigar: exemplos concretos de negociações, objeções dos clientes e funcionalidades que fariam diferença."
            ),
            "respostas": R(
                FOCO,
                NA,
                NA,
                "Dificuldade para apresentar o serviço ao cliente; os sistemas não apoiam bem a conversa, a negociação ou a compreensão do interesse do cliente.",
                NA,
                NA,
            ),
            "indicacoes": ["", ""],
            "identificouProblema": False,
            "outroProblema": "Plataformas caras e incompletas; dificuldade de apresentar o serviço ao cliente e conduzir a negociação.",
            "clienteEntendePrazos": "",
            "recusouServico": "",
        },
        {
            "nomeEntrevistado": "Jarbas",
            "empresa": "Oficina de médio porte",
            "cargo": "Responsável",
            "porte": "Média empresa",
            "area": "Gestão / Proprietário",
            "data": "2026-10-13",
            "responsavel": "Yago",
            "status": "realizada",
            "gravacao": "Planilha de validação (Yago)",
            "anotacoes": (
                "Entrevista registrada na planilha de validação (Yago). "
                "Perfil: Responsável por uma oficina de médio porte. "
                "Contexto atual: a oficina utiliza vários sistemas, mas ainda realiza o check-in dos veículos em papel. "
                "Problemas relatados: o registro em papel continua existindo apesar dos sistemas utilizados; dificuldade de incorporar um check-in prático à rotina. "
                "Impactos no dia a dia: retrabalho operacional; possível redução da adesão ao check-in e impacto na qualidade e organização das informações entregues ao cliente. "
                "Sugestões/necessidades: sistema de check-in fácil, barato e prático, que gere relatórios, orçamentos e ordens de manutenção mais claros e organizados. "
                "Evidências para validação: relato direto de retrabalho com check-in em papel e indicação de características que facilitariam a adoção. "
                "Limitações/pontos a investigar: quanto tempo o processo manual consome e quais informações/itens precisam constar no relatório e na ordem de manutenção."
            ),
            "respostas": R(
                FOCO,
                NA,
                NA,
                "Relatórios, orçamentos e ordens de manutenção mais claros e organizados ajudariam a organizar as informações entregues ao cliente (benefício esperado).",
                NA,
                NA,
            ),
            "indicacoes": ["", ""],
            "identificouProblema": False,
            "outroProblema": "Check-in em papel persiste apesar dos sistemas; retrabalho operacional e impacto na qualidade das informações entregues ao cliente.",
            "clienteEntendePrazos": "",
            "recusouServico": "",
        },
    ]

    existentes = {
        e["nomeEntrevistado"].strip().lower() for e in req("GET", "/api/entrevistas")
    }

    criadas = 0
    for e in E:
        if e["nomeEntrevistado"].strip().lower() in existentes:
            print(f"já existe, pulando: {e['nomeEntrevistado']}")
            continue
        req("POST", "/api/entrevistas", e)
        criadas += 1
        print(f"criada: {e['nomeEntrevistado']} — {e['empresa']} (Yago)")

    total = len(req("GET", "/api/entrevistas"))
    print(f"ok: {criadas} criada(s); total no site: {total}")


if __name__ == "__main__":
    main()
