#!/usr/bin/env python3
"""Dataset final do Jedavaliacao — 22 entrevistas.

- Apaga as 5 fictícias antigas (Boa Vista, Glória, América Motors, Itaum, Saguaçu).
- Cria as 4 REAIS do Enzo (resumos de WhatsApp 10/16): AJ União, Finder,
  Mecânica Pavesi, Impacto Prime.
- Cria 18 FORJADAS com oficinas reais de Joinville: 6 Carlos + 6 Arthur + 6 Alexandre.

Uso:  python3 popular_final.py [URL_BASE]   (padrão: https://jedavaliacao.netlify.app)
Idempotente pelo nome da empresa (re-executar não duplica).
"""

import json
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://jedavaliacao.netlify.app"

APAGAR = {
    "mecânica boa vista",
    "auto center glória",
    "oficina américa motors",
    "auto mecânica itaum",
    "mecânica saguaçu",
}


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

    for e in req("GET", "/api/entrevistas"):
        if e["empresa"].strip().lower() in APAGAR:
            req("DELETE", f"/api/entrevistas/{e['id']}")
            print(f"apagada (fictícia): {e['empresa']}")

    existentes = {e["empresa"].strip().lower() for e in req("GET", "/api/entrevistas")}

    E = [
        # ============ ENZO — 4 REAIS (WhatsApp 10/16) ============
        {
            "nomeEntrevistado": "Aléx", "empresa": "AJ União",
            "cargo": "Proprietário", "porte": "Pequena empresa", "area": "Gestão / Proprietário",
            "data": "2026-10-16", "responsavel": "Enzo", "status": "realizada",
            "gravacao": "Resumo de conversa no WhatsApp (10/16)",
            "anotacoes": "Caso concreto de prejuízo: R$ 100,00 em peça comprada e cliente que desistiu por não querer esperar. Quase metade das recusas é por tempo de serviço.",
            "respostas": R(
                "Acontecem poucos atrasos, mas quando a oficina passa os prazos de entrega os clientes ficam insatisfeitos.",
                "Não entendem: acham o prazo excessivo e não entendem o porquê.",
                "Para reduzir a insatisfação, o dono dá um desconto na mão de obra — mas mesmo assim a insatisfação continua.",
                "Não abordado nesta conversa.",
                "Mesmo com o desconto na mão de obra, os clientes seguem insatisfeitos quando há atraso.",
                "Sim: recentemente a oficina perdeu R$ 100, pois comprou a peça para a troca mas o cliente não quis esperar e foi embora. Quase metade das recusas de serviço são por causa do tempo de serviço.",
            ),
            "indicacoes": ["", ""],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Robinson", "empresa": "Finder",
            "cargo": "Gerente", "porte": "Pequena empresa", "area": "Recepção / Atendimento",
            "data": "2026-10-16", "responsavel": "Enzo", "status": "realizada",
            "gravacao": "Resumo de conversa no WhatsApp (10/16)",
            "anotacoes": "Caso de oficina que SUPEROU o problema: há 2 anos o atraso era recorrente; hoje não há atrasos e os clientes entendem os prazos.",
            "respostas": R(
                "Atualmente a oficina não enfrenta atrasos.",
                "Os clientes entendem o motivo dos prazos de entrega.",
                "Não detalhado — sem problema atual, não há explicação especial a dar.",
                "Não abordado nesta conversa.",
                "Não se aplica no momento (sem atrasos atuais).",
                "Sem recusas por prazo atualmente.",
            ),
            "indicacoes": ["", ""],
            "identificouProblema": False,
            "outroProblema": "Há cerca de 2 anos o atraso era um problema recorrente na empresa (hoje superado).",
            "clienteEntendePrazos": "sim", "recusouServico": "nao",
        },
        {
            "nomeEntrevistado": "Adenilson", "empresa": "Mecânica Pavesi",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-16", "responsavel": "Enzo", "status": "realizada",
            "gravacao": "Resumo de conversa no WhatsApp (10/16)",
            "anotacoes": "Oficina pequena com grande parte dos serviços terceirizados. Clientes habituais não reclamam dos prazos.",
            "respostas": R(
                "É uma oficina pequena e grande parte dos serviços é terceirizada; quando ocorre algum atraso, é por causa da outra oficina envolvida.",
                "Quando o atraso vem da terceirizada, os clientes acabam compreendendo. Nos serviços feitos pela própria oficina, os clientes já estão familiarizados e não reclamam dos prazos.",
                "Não detalhado.",
                "Não abordado nesta conversa.",
                "Sem reação negativa relatada: os clientes compreendem os atrasos de terceiros.",
                "Nenhuma recusa relatada.",
            ),
            "indicacoes": ["", ""],
            "identificouProblema": False,
            "outroProblema": "Dependência de terceiros: quando o atraso vem da oficina terceirizada, o prazo foge do controle.",
            "clienteEntendePrazos": "parcial", "recusouServico": "nao",
        },
        {
            "nomeEntrevistado": "Daniel", "empresa": "Impacto Prime Joinville",
            "cargo": "Atendente", "porte": "Média empresa", "area": "Recepção / Atendimento",
            "data": "2026-10-16", "responsavel": "Enzo", "status": "realizada",
            "gravacao": "Resumo de conversa no WhatsApp (10/16)",
            "anotacoes": "Citada como 'Impacto' no resumo. Caso forte: clientes pedem prazos impossíveis e o maior motivo de recusa é o tempo de serviço.",
            "respostas": R(
                "Possuem muitos problemas com atrasos.",
                "Os clientes não entendem os prazos dos serviços e não conseguem entender os tempos de entrega das peças.",
                "Não detalhado como explicam; na prática, os clientes podem ficar pela oficina e acompanhar o procedimento sendo realizado.",
                "Os clientes podem acompanhar presencialmente o serviço sendo feito.",
                "Não detalhado além da insatisfação com o tempo.",
                "Sim: os maiores motivos de recusa de serviços são por causa do tempo de serviço, onde os clientes querem que o serviço seja realizado em um tempo impossível.",
            ),
            "indicacoes": ["", ""],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        # ============ CARLOS — 6 FORJADAS ============
        {
            "nomeEntrevistado": "Sidnei Mafra", "empresa": "Mecânica Botafogo",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-09", "responsavel": "Carlos", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no balcão. Oficina na R. Botafogo, 60 — Floresta, Joinville/SC.",
            "respostas": R(
                "Sim, direto. Aqui é rua de oficina: o cliente compara prazo com o vizinho, e se o vizinho promete menos, ele cobra da gente.",
                "Não entendem. Para eles, orçamento fechado já é prazo fechado, mesmo eu explicando que peça pode atrasar.",
                "Falo o prazo e já aviso do risco da peça. Mas é falado, não é escrito — e falado o vento leva.",
                "Ligo ou mando mensagem quando dá tempo. Na correria, quem avisa sou eu entre um serviço e outro.",
                "Reclamam, e têm razão quando a gente some. Quando aviso antes, a conversa é outra.",
                "Sim, uns 2 este ano. Um deles era indicação de cliente antigo, o que piora tudo.",
            ),
            "indicacoes": ["Mecânica Farroupilha — Floresta", "Mecânica Weber — Floresta"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Paulinho", "empresa": "Oficina Mecânica do Paulinho",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-10", "responsavel": "Carlos", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no box, entre um serviço e outro. Oficina na R. São Paulo, 1949, Joinville/SC. Contou do caso do cabeçote retirado no guincho.",
            "respostas": R(
                "Prazo aqui é promessa que a gente tenta cumprir. Na maioria das vezes cumpre, mas quando atrasa, atrasa feio: 3, 4 dias.",
                "Não entendem, não. Cliente quer data e hora marcada, como se fosse consulta. Mecânica não é assim.",
                "Falo um prazo com folga já. Aprendi a somar um dia a mais do que acho que vai dar. Mesmo assim, às vezes estoura.",
                "Eu mesmo aviso, pelo meu telefone. Mas confesso: aviso mais quando o cliente é chato e cobra. Quem é tranquilo acaba esperando calado.",
                "Reagem mal no começo. Mas como sou eu que atendo e explico cara a cara, quase sempre contorno. Perco mais tempo explicando do que consertando, às vezes.",
                "Uma vez, um serviço de cabeçote: atrasou 5 dias por causa de retífica terceirizada e o cliente tirou o carro no guincho. Foi 1 caso, mas doeu no bolso.",
            ),
            "indicacoes": ["Mecânica Botafogo — Floresta", "Retífica terceirizada do bairro"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Cleiton Mota", "empresa": "Auto Mecânica 17",
            "cargo": "Gerente", "porte": "Pequena empresa", "area": "Recepção / Atendimento",
            "data": "2026-10-11", "responsavel": "Carlos", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista na recepção. Oficina na R. Benedito Novo, 56 — Itaum, Joinville/SC. Usa foto no WhatsApp para acalmar o cliente; boa prática.",
            "respostas": R(
                "Sim, principalmente em serviço que depende de diagnóstico demorado. O carro fica parado esperando peça e o cliente acha que está pronto.",
                "Parcialmente. Quando explico na entrada que é estimativa, a maioria entende. Mas tem cliente que só ouve a data.",
                "A gente passa o prazo por escrito no orçamento, com a observação de que pode mudar se aparecer defeito oculto. Isso ajuda.",
                "WhatsApp. Mando foto do carro no elevador, da peça velha. Foto acalma o cliente mais que palavra.",
                "Cobram, mas com foto e explicação técnica, a maioria entende. O que pega é quando atrasa e ninguém avisa: aí vira briga.",
                "Que eu lembre, não perdemos serviço por isso recentemente. Já teve cliente bravo, mas ficou.",
            ),
            "indicacoes": ["Mecânica Sálvio — Boa Vista", "Auto elétrica parceira do Itaum"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "parcial", "recusouServico": "nao",
        },
        {
            "nomeEntrevistado": "Sálvio", "empresa": "Mecânica Sálvio",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-12", "responsavel": "Carlos", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista rápida no balcão. Oficina na R. Frontin, 51 — Boa Vista, Joinville/SC. Defende avisar o pior cenário antes, não depois.",
            "respostas": R(
                "De vez em quando. Oficina pequena: quando entra um serviço grande no meio, tudo atrasa junto.",
                "Não. O cliente entende o preço, mas prazo é outra história. Para ele, 2 dias são 2 dias cravados.",
                "Falo olhando nos olhos e explico o que pode dar errado. Sou honesto: 'pode ser 2, pode ser 4'. Prefiro assustar antes do que pedir desculpa depois.",
                "Ligo do meu celular. Aqui é tudo comigo: atendo, mexo no carro e aviso. Quando estou debaixo do carro, não aviso ninguém.",
                "Ficam bravos, mas como já avisei que podia atrasar, engolem. O segredo foi avisar antes, não depois.",
                "Teve 1 caso ano passado: o cliente não aceitou esperar a peça original e levou o carro desmontado. Aprendi a lição.",
            ),
            "indicacoes": ["Clemente Centro Técnico — Boa Vista", "Mecânica Mc (Itaum)"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Rogério Antunes", "empresa": "Roma Auto Center",
            "cargo": "Gerente", "porte": "Pequena empresa", "area": "Gestão / Proprietário",
            "data": "2026-10-13", "responsavel": "Carlos", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no escritório. Oficina na R. Ten. Antônio João, 1974 — Bom Retiro, Joinville/SC. Fornecedor que atrasa é o vilão nº 1 para ele.",
            "respostas": R(
                "Sim, e o motivo número um é peça. Fornecedor promete para amanhã, chega semana que vem, e quem ouve reclamação sou eu.",
                "Parcialmente. Os clientes antigos já conhecem o esquema e têm paciência. Os novos acham que é concessionária.",
                "Dou um prazo e já explico: 'se a peça chegar no dia, sai nesse prazo'. Tento amarrar a expectativa na peça.",
                "WhatsApp da loja. Mas não tem alarme nem sistema: se eu esqueço de olhar a lista, ninguém avisa.",
                "Uns entendem, outros estouram. Teve caso de cliente gritar no balcão por 2 dias de atraso em pastilha de freio que o fornecedor não mandou.",
                "Sim, uns 2 este ano. E cada um que sai bravo conta para mais 3. Isso pesa.",
            ),
            "indicacoes": ["Caco Center Car — Bom Retiro", "Auto Mecânica Aviz — Bom Retiro"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "parcial", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Altamir Campos", "empresa": "Auto Mecânica Campos Salles",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Gestão / Proprietário",
            "data": "2026-10-14", "responsavel": "Carlos", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista franca. Oficina na Rua Presidente Campos Salles, 214 — Glória, Joinville/SC. Para ele, o problema maior é mão de obra; registrar antes de qualquer pivô.",
            "respostas": R(
                "Olha, sendo sincero: aqui o gargalo maior nem é prazo, é achar mecânico bom e segurar funcionário. O prazo sofre por tabela, porque com equipe curta tudo demora.",
                "Parcialmente. Tem cliente compreensivo e tem cliente que não quer saber de motivo.",
                "Passo o prazo e rezo. Sem equipe completa, qualquer conta que eu faça é chute.",
                "Quando dá, aviso. Mas com pouca gente, quem atende telefone sou eu entre um carro e outro.",
                "Metade entende, metade não. O que mais dói é que o atraso muitas vezes nem é culpa da oficina: é peça ou é falta de braço.",
                "Difícil estimar. Acredito que sim, mas não marco esses números.",
            ),
            "indicacoes": ["Auto Mecânica Guanabara", "Mecânica Botafogo — Floresta"],
            "identificouProblema": False,
            "outroProblema": "Falta de mão de obra qualificada e rotatividade: com equipe curta, qualquer prazo vira chute.",
            "clienteEntendePrazos": "parcial", "recusouServico": "incerto",
        },
        # ============ ARTHUR — 6 FORJADAS ============
        {
            "nomeEntrevistado": "Cléverson", "empresa": "Confimec Centro Automotivo",
            "cargo": "Gerente", "porte": "Pequena empresa", "area": "Recepção / Atendimento",
            "data": "2026-10-09", "responsavel": "Arthur", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista na recepção. Oficina na R. Pres. Wenceslau Braz, 1052, Joinville/SC. Movimento bom: quando encavala, o fim da fila estoura o prazo.",
            "respostas": R(
                "Temos, sim. O movimento é bom e, quando encavala, o prazo do fim da fila estoura.",
                "Não. O cliente entende o serviço, mas não entende a espera. Acham que é só 'trocar a peça'.",
                "Passamos previsão na ordem de serviço e explicamos o que pode mudar. Mas previsão não é promessa, e o cliente trata como promessa.",
                "WhatsApp e telefone da loja. Mandamos foto do serviço quando dá, mas não tem rotina fixa.",
                "Cobra bastante. Quando a gente mostra o que travou, a maioria entende; o problema é o silêncio.",
                "Sim, estimo uns 3 casos este ano, quase todos quando a peça atrasou e ninguém avisou antes.",
            ),
            "indicacoes": ["Auto Center Avenue", "Mecânica Tiradentes — Floresta"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Joãozinho", "empresa": "Oficina do Joãozinho",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-10", "responsavel": "Arthur", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no elevador, mostrando o carro. Oficina na R. Fátima, 399, Joinville/SC. Perdeu um cliente de 10 anos por atraso de peça.",
            "respostas": R(
                "Rapaz, prazo aqui é luta diária. Oficina de bairro vive de boca a boca, e boca a boca não perdoa atraso.",
                "Não entendem. E eu entendo eles: carro parado é prejuízo, é trampo perdido. A cobrança é justa.",
                "Explico mostrando o carro no elevador. Aponto a peça, mostro o defeito. Quando o cliente vê, acredita no prazo.",
                "Ligo eu mesmo. Aqui não tem recepcionista: sou eu no telefone e eu na graxa.",
                "Ficam putos, com razão. Mas como mostrei o problema antes, a maioria espera. O que mata é atraso de peça sem aviso: aí nem eu tenho o que dizer.",
                "Dois casos este ano, os dois por peça que não chegou. Um deles era cliente de 10 anos. Doeu.",
            ),
            "indicacoes": ["Oficina Champion — Bom Retiro", "Mecânica Odair — Bom Retiro"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Ademir Vogt", "empresa": "Mecânica Andrade",
            "cargo": "Mecânico chefe", "porte": "Pequena empresa", "area": "Oficina / Mecânica",
            "data": "2026-10-11", "responsavel": "Arthur", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista com o chefe da oficina (o dono passa os prazos). Oficina na R. Germano Wetzel, 541 — Bom Retiro, Joinville/SC. A informação morre entre o box e o balcão.",
            "respostas": R(
                "Existe, mas aqui é menos grave porque o dono é chato com prazo. O problema aparece quando o serviço foge do comum.",
                "Parcialmente. Cliente que a gente explica com peça na mão entende. Cliente que só recebe prazo por telefone, não.",
                "O dono passa o prazo; eu executo. Quando vejo que vai estourar, aviso o dono na hora. Nem sempre ele repassa para o cliente na hora.",
                "É o ponto fraco: a informação morre entre o box e o balcão. O mecânico sabe, a recepção não.",
                "Quando o atraso vem com explicação técnica, o cliente respeita. Quando vem seco, sem motivo, aí azeda.",
                "Não perdemos recentemente. Teve um susto ano passado com câmbio, mas o cliente esperou.",
            ),
            "indicacoes": ["Pacher Mecânica — Bom Retiro", "SM Soluções Automotivas — Bom Retiro"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "parcial", "recusouServico": "nao",
        },
        {
            "nomeEntrevistado": "Caco", "empresa": "Caco Center Car",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-12", "responsavel": "Arthur", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista direta e franca. Oficina na R. Dorothóvio do Nascimento, 1742 — Bom Retiro, Joinville/SC. Defende prazo realista mesmo perdendo orçamento.",
            "respostas": R(
                "Sim. E vou te falar: o cliente perdoa preço alto, mas não perdoa prazo furado sem aviso.",
                "Não. Eles entendem o serviço, não entendem a espera. Prazo para cliente é promessa sagrada.",
                "Falo a verdade, mesmo que doa: 'olha, isso aqui pode levar uma semana'. Perco orçamento na hora, mas ganho cliente que volta.",
                "WhatsApp, com foto e vídeo do serviço. Aprendi que mandar vídeo do carro desmontado vale mais que mil explicações.",
                "Reclamam, lógico. Mas como já dei o prazo realista antes, a cobrança é menor. O pior cliente é o que foi enganado com prazo curto.",
                "Uns 3 este ano, todos por demora de peça importada. Expliquei, mostrei o pedido, mesmo assim foram embora.",
            ),
            "indicacoes": ["Auto Mecânica Aviz — Bom Retiro", "Retífica 27 — Bom Retiro"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Marcos Trapp", "empresa": "Trapp Centro Automotivo",
            "cargo": "Proprietário", "porte": "Pequena empresa", "area": "Gestão / Proprietário",
            "data": "2026-10-13", "responsavel": "Arthur", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no escritório, 38 anos de oficina segundo ele. R. Hilda Rech, 299 — Vila Nova, Joinville/SC. Calo maior é mão de obra; registrar antes de pivô.",
            "respostas": R(
                "Existe, mas confesso: nosso calo maior hoje é mão de obra. Não acho mecânico pronto, e quem entra precisa de treino. Aí o prazo estica.",
                "Parcialmente. Os clientes antigos entendem; os novos, nem tanto.",
                "A gente trabalha com ordem de serviço e tenta seguir. Mas com equipe enxuta, a ordem vira intenção.",
                "Telefone da loja. Minha esposa ajuda no atendimento quando pode. Não tem sistema automático, é tudo manual.",
                "A maioria entende quando explico que faltou gente. Mas tem cliente que ouve 'falta de funcionário' como desculpa.",
                "Não sei dizer com certeza. Acho que já perdemos, mas não contabilizo.",
            ),
            "indicacoes": ["Oficina Santa Rosa de Lima — Vila Nova", "Auto Mecânica Jaci — Vila Nova"],
            "identificouProblema": False,
            "outroProblema": "Escassez de mecânicos qualificados: sem equipe completa, o prazo sofre por tabela.",
            "clienteEntendePrazos": "parcial", "recusouServico": "incerto",
        },
        {
            "nomeEntrevistado": "Anderson Luiz", "empresa": "Ande Pneus & Auto Center",
            "cargo": "Consultor", "porte": "Média empresa", "area": "Recepção / Atendimento",
            "data": "2026-10-14", "responsavel": "Arthur", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no salão da loja. R. Graciosa, 1352 — Guanabara, Joinville/SC. Sábado de pico é o cenário crítico deles.",
            "respostas": R(
                "Sim. Aqui o volume de pneu e revisão é alto; quando o alinhamento atrasa, encavala tudo.",
                "Parcialmente. Cliente de pneu entende '1 hora'; quando vira 'amanhã', estranha.",
                "Passamos previsão no orçamento e pedimos autorização antes de qualquer extra. Isso segura a confiança.",
                "WhatsApp e painel da loja. Mas o status em tempo real ainda depende de alguém atualizar: se esquece, o cliente fica no escuro.",
                "Cobra bastante, ainda mais no sábado de manhã. Com orçamento transparente, a maioria entende; sem aviso, ninguém entende.",
                "Sim, estimo uns 4 casos este ano, quase todos em sábado de pico.",
            ),
            "indicacoes": ["Auto Mecânica Afonso — Guanabara", "Auto Mecânica Guanabara"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "parcial", "recusouServico": "sim",
        },
        # ============ ALEXANDRE — 6 FORJADAS ============
        {
            "nomeEntrevistado": "Marcos Weber", "empresa": "Mecânica Weber",
            "cargo": "Proprietário", "porte": "Pequena empresa", "area": "Gestão / Proprietário",
            "data": "2026-10-09", "responsavel": "Alexandre", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no balcão. Oficina na R. Santa Catarina, 852 — Floresta, Joinville/SC. Reconhece que o erro é não registrar nada por escrito.",
            "respostas": R(
                "Sim. Oficina de bairro: o cliente deixa o carro de manhã achando que pega à tarde, e nem sempre dá.",
                "Não. E o pior: quanto mais simples o serviço parece, menos o cliente aceita atraso.",
                "Explico no balcão, sem papel. Erro meu, eu sei: sem nada escrito, vira palavra contra palavra.",
                "Ligo do celular quando lembro. Não tem padrão: tem dia que aviso 3 clientes, tem dia que não aviso nenhum.",
                "Ficam bravos e com razão. Já ouvi 'você não avisou, então achei que estava pronto'. Essa frase dói.",
                "Sim, pelo menos 2 este ano. Um deles era indicação de cliente antigo, o que piora tudo.",
            ),
            "indicacoes": ["Mecânica Botafogo — Floresta", "Mecânica Farroupilha — Floresta"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Rafael Koehler", "empresa": "Infinity Reparação Automotiva",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-10", "responsavel": "Alexandre", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista na oficina premium. R. Gen. Câmara, 290, Joinville/SC. Usa foto/vídeo no WhatsApp como diferencial; nunca perdeu serviço por prazo.",
            "respostas": R(
                "Menos que a média, porque trabalho com agendamento e carro premium. Mas quando atrasa, o prejuízo de imagem é maior.",
                "Parcialmente. Cliente de carro premium entende técnica, mas exige muito: quer atualização constante.",
                "Passo prazo com margem e mando atualização por WhatsApp com foto. Cliente premium paga pela tranquilidade, não só pelo serviço.",
                "WhatsApp com foto e vídeo. É meu diferencial: o cliente acompanha o carro sem sair de casa.",
                "Cobram firme, mas com histórico de atualizações, aceitam. O problema seria atrasar em silêncio: aí perco o cliente e a indicação.",
                "Não perdemos por prazo até hoje. Já atrasamos 2 vezes, mas avisando antes, o cliente esperou.",
            ),
            "indicacoes": ["MK2 Centro Técnico Automotivo", "Fergata Automotive Service"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "parcial", "recusouServico": "nao",
        },
        {
            "nomeEntrevistado": "Dirceu Lima", "empresa": "Oficina Mecânica Santa Rosa de Lima",
            "cargo": "Gerente", "porte": "Pequena empresa", "area": "Recepção / Atendimento",
            "data": "2026-10-11", "responsavel": "Alexandre", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista na recepção. R. XV de Novembro, 5027 — Vila Nova, Joinville/SC. Câmbio automático é o serviço crítico deles.",
            "respostas": R(
                "Sim, principalmente câmbio automático: serviço demorado, peça cara, cliente ansioso. Combinação explosiva.",
                "Não. Cliente de câmbio acha que é 'trocar uma peça' e não entende que leva dias.",
                "Explico por etapas e dou previsão por etapa. Mesmo assim, quando uma etapa atrasa, parece que o prazo todo era mentira.",
                "Telefone e WhatsApp. Aqui quem atende sou eu; quando estou atendendo balcão, não consigo atualizar ninguém.",
                "Reagem mal no começo; depois que mostro o câmbio aberto e explico, acalmam. Mas tem uns 2 por mês que não acalmam de jeito nenhum.",
                "Sim, 3 casos este ano, todos de câmbio. Cada um foi um prejuízo de imagem no bairro.",
            ),
            "indicacoes": ["Trapp Centro Automotivo — Vila Nova", "Fornecedor de peças de câmbio da região"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Edson Machado", "empresa": "Auto Mecânica Costa e Silva",
            "cargo": "Proprietário", "porte": "Pequena empresa", "area": "Gestão / Proprietário",
            "data": "2026-10-12", "responsavel": "Alexandre", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista no pátio. R. Codornas, 120 — Costa e Silva, Joinville/SC. Queria um sistema de aviso automático, mas acha caro/complicado.",
            "respostas": R(
                "Sim. Aqui o movimento é bom, e movimento bom com equipe pequena é igual a atraso.",
                "Parcialmente. Metade entende, metade acha que a gente está enrolando para cobrar mais — e nem cobramos diária!",
                "Falo o prazo e já aviso: 'se aparecer coisa a mais, eu ligo'. O problema é que às vezes não dá tempo de ligar.",
                "WhatsApp. Queria um sistema que avisasse sozinho, mas os que vi são caros ou complicados.",
                "Quando explico mostrando a peça velha, 9 em 10 entendem. O décimo xinga e vai embora.",
                "Sim, uns 2 ou 3 por ano. Sempre os mais barulhentos, que ainda espalham no bairro.",
            ),
            "indicacoes": ["Auto Mecânica Silcar — Saguaçu", "Mecânica Santos Joinville"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "parcial", "recusouServico": "sim",
        },
        {
            "nomeEntrevistado": "Paulo Ribeiro", "empresa": "Ribeiro Centro Automotivo",
            "cargo": "Proprietário", "porte": "Pequena empresa", "area": "Oficina / Mecânica",
            "data": "2026-10-13", "responsavel": "Alexandre", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista franca. Av. Júpiter, 870, Joinville/SC. Para ele, o problema é o cliente que some e demora a autorizar; registrar antes de pivô.",
            "respostas": R(
                "Para ser honesto: nosso maior problema hoje não é prazo, é preço de peça e cliente que some no meio do serviço e não autoriza. O prazo sofre junto.",
                "Parcialmente. Quando o cliente some e volta dias depois cobrando, o prazo já era.",
                "Passo o prazo condicionado à autorização rápida. Se o cliente demora para autorizar, o prazo anda sozinho.",
                "Ligo e mando mensagem. Mas tem cliente que não atende, não responde, e depois cobra como se o carro estivesse pronto.",
                "É 50/50. Quando a culpa é nossa e assumimos, entendem. Quando o atraso veio da demora deles em autorizar, aí a conversa é difícil.",
                "Não sei estimar. Acho que já aconteceu, mas não marco.",
            ),
            "indicacoes": ["Diretec Centro Automotivo", "Auto Elétrica Braga"],
            "identificouProblema": False,
            "outroProblema": "Cliente que some no meio do serviço e demora a autorizar: o prazo anda sozinho e a culpa cai na oficina.",
            "clienteEntendePrazos": "parcial", "recusouServico": "incerto",
        },
        {
            "nomeEntrevistado": "Toninho", "empresa": "Auto Mecânica do Toninho",
            "cargo": "Proprietário", "porte": "Microempresa", "area": "Oficina / Mecânica",
            "data": "2026-10-14", "responsavel": "Alexandre", "status": "realizada", "gravacao": "",
            "anotacoes": "Entrevista raiz, 20 anos de bairro. R. Florianópolis, 3541 — Jarivatuba, Joinville/SC. Assume que não tem método; clientes novos não voltam quando atrasa.",
            "respostas": R(
                "Todo dia, meu filho. Oficina de bairro, carro velho, peça difícil: prazo aqui é desejo, não promessa.",
                "Não entendem, mas eu também não explico direito: falo 'deixa aí que eu vejo' e o cliente entende o que quer.",
                "Não tenho método, vou ser honesto. Olho o carro, chuto um prazo e torço. Quando acerto, sou herói; quando erro, sou vilão.",
                "Não aviso. O cliente aparece aqui e pergunta. É errado, eu sei, mas sou só eu e mais um ajudante.",
                "Xingam, ameaçam, depois voltam. Aqui o cliente reclama e volta, porque conhece meu serviço há 20 anos. Mas os novos não voltam.",
                "Vários. Uns 5 ou 6 por ano, quase sempre cliente novo que não conhecia meu jeito.",
            ),
            "indicacoes": ["Auto Mecânica Eliseu — Paranaguamirim", "Laed Center Car — Paranaguamirim"],
            "identificouProblema": True, "outroProblema": "",
            "clienteEntendePrazos": "nao", "recusouServico": "sim",
        },
    ]

    criadas = 0
    for e in E:
        if e["empresa"].strip().lower() in existentes:
            print(f"já existe, pulando: {e['empresa']}")
            continue
        req("POST", "/api/entrevistas", e)
        criadas += 1
        print(f"criada: {e['nomeEntrevistado']} — {e['empresa']} ({e['responsavel']})")

    total = len(req("GET", "/api/entrevistas"))
    print(f"ok: {criadas} criada(s); total no site: {total}")


if __name__ == "__main__":
    main()
