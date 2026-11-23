# Feature Specification: Memória no controlador

**Feature Branch**: `004-controller-memory`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Memória no controlador: permitir que o programa de cada robô guarde valores numéricos entre ticks (memória por robô), para implementar táticas de várias etapas (ex.: recuar por meio segundo e atacar pelo lado). Sem mudar o resto do subconjunto (sem laços, funções, strings ou atribuições). A memória começa zerada, é reiniciada no Reset, ao carregar mundo e ao aplicar novo programa; erro de controlador descarta as escritas do tick; tudo determinístico. Com isso, a estratégia padrão de sumô deve ser reescrita para lutas com vencedor: com programas padrão iguais, pelo menos 3 de 10 seeds devem terminar com vencedor antes do limite (fecha o SC-004 da feature 003). Motivação do usuário: robôs iguais travam de frente e ninguém vence."

Relação com features anteriores: amplia o contrato do controlador (001-arena, FR-004) e substitui a estratégia padrão de sumô (002, revisada na 003); fecha o SC-004 da 003.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lutas de sumô com vencedor (Priority: P1)

Como integrante da SheepBotz, ao iniciar o dojô sem programar nada, quero ver os robôs se enfrentarem com manobras (recuar, contornar, atacar de lado) e uma luta que termine com vencedor, em vez de dois robôs travados frente a frente.

**Why this priority**: É a queixa do usuário que motivou a física real e ainda não foi resolvida.

**Independent Test**: Rodar o dojô padrão em 10 seeds e contar rodadas com vencedor antes do limite de tempo.

**Acceptance Scenarios**:

1. **Given** o dojô padrão com os programas padrão, **When** as rodadas das 10 seeds de teste são executadas, **Then** pelo menos 3 terminam com vencedor antes do limite de tempo.
2. **Given** os dois robôs travados frente a frente, **When** passa meio segundo de travamento, **Then** pelo menos um deles muda de tática (recua ou contorna) em vez de continuar empurrando.
3. **Given** a mesma seed, **When** a rodada é repetida ou reiniciada, **Then** o resultado e as trajetórias são idênticos.

---

### User Story 2 - Programar táticas de várias etapas (Priority: P2)

Como responsável pelo controle, quero guardar números entre um tick e outro (por exemplo, a fase da tática e um contador de tempo) para escrever estratégias como "recuar por 10 ticks, depois girar e atacar".

**Why this priority**: É a capacidade que torna a P1 possível e abre o simulador para estratégias reais da equipe.

**Independent Test**: Um programa que conta ticks na memória e muda de comando após N ticks.

**Acceptance Scenarios**:

1. **Given** um programa que guarda um contador e o incrementa a cada tick, **When** passam 10 ticks, **Then** o valor lido é 10.
2. **Given** um programa com memória, **When** o usuário clica Reset, carrega outro mundo ou aplica um novo programa ao robô, **Then** a memória desse robô volta a zero.
3. **Given** dois robôs, **When** cada um grava na sua memória, **Then** um não lê nem altera a memória do outro.
4. **Given** um programa que grava na memória e depois gera erro no mesmo tick, **When** o tick falha, **Then** as gravações daquele tick são descartadas, junto com o restante do tick.

---

### User Story 3 - Limites claros e mensagens de erro (Priority: P3)

Como usuário, quero mensagens claras quando uso a memória de forma errada, para corrigir o programa sem travar a simulação.

**Why this priority**: Mantém a robustez do controlador já contratada.

**Independent Test**: Programas com posição de memória inválida ou valor não numérico geram erro identificável.

**Acceptance Scenarios**:

1. **Given** um programa que usa uma posição de memória fora do intervalo permitido, **When** executa, **Then** recebe erro `Controlador:` e a simulação pausa sem avançar o tick.
2. **Given** um programa que tenta guardar valor não numérico ou não finito, **When** executa, **Then** recebe erro `Controlador:`.

### Edge Cases

- Programa que só lê a memória nunca escrita: lê zero.
- Muitas escritas na mesma posição no mesmo tick: vale a última.
- Replay: não executa programas, portanto não depende da memória.
- Memória e limites existentes do programa (tamanho, nós, profundidade, orçamento) continuam valendo.
- Programas antigos sem memória continuam funcionando sem mudança.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada robô MUST ter memória própria de 16 posições numéricas, indexadas de 0 a 15, que persiste entre ticks.
- **FR-002**: O programa MUST poder ler e gravar posições da memória usando apenas chamadas permitidas da API, sem nova sintaxe (sem atribuição, laço, função ou texto).
- **FR-003**: Toda posição MUST começar em zero e MUST voltar a zero no Reset, ao carregar um mundo e ao aplicar novo programa àquele robô.
- **FR-004**: Gravações de um tick que termina em erro de controlador MUST ser descartadas; memória, poses, tick e aleatoriedade permanecem como antes do tick.
- **FR-005**: Posição fora de 0–15 (ou não inteira) e valor não numérico ou não finito MUST gerar erro com prefixo `Controlador:`.
- **FR-006**: A estratégia padrão de sumô MUST usar a memória para táticas de várias etapas (por exemplo: detectar travamento, recuar, contornar e atacar de lado) e MUST continuar dentro dos limites do controlador.
- **FR-007**: A simulação MUST continuar determinística; mesma entrada produz mesma memória e mesmo estado.

### Key Entities

- **Memória do robô**: 16 números, um conjunto por robô; parte do estado da simulação ao vivo, não do mundo nem do replay.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com os programas padrão no dojô, pelo menos 3 de 10 seeds terminam com vencedor antes de 60 s.
- **SC-002**: Em nenhuma das 10 seeds um robô sai do ringue sem contato com o adversário no último segundo (derrota por empurrão, não por erro próprio).
- **SC-003**: Um contador na memória chega exatamente a N após N ticks e volta a 0 após Reset, em 100% dos casos testados.
- **SC-004**: Erros de memória são rejeitados sem alterar o estado da simulação em 100% dos casos testados.
- **SC-005**: Suíte automatizada 100% aprovada e cobertura ≥80% nas quatro métricas.

## Assumptions

- 16 posições bastam para estratégias de demonstração (fase, contador, direção, alvo).
- A memória não aparece no replay nem no arquivo de mundo; programas não fazem parte do replay.
- Os limites atuais do programa (8.000 caracteres, 500 nós, profundidade 40, orçamento de 500 avaliações) são mantidos; se a estratégia não couber, o plano deve justificar qualquer ajuste.
- As seeds de teste são 1 a 10 no dojô padrão.
