# Feature Specification: Estratégia padrão de sumô

**Feature Branch**: `002-sumo-default-strategy`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Estratégia padrão de sumô: no mundo com cenário de sumô, cada robô sem programa próprio deve iniciar com um controlador padrão específico da modalidade, em vez do controlador genérico de desvio. Esse controlador usa só a API existente (readLaser, readOdometry, readBumper, setSpeed, random) e o subconjunto de JS já contratado. Objetivos: (1) permanecer dentro do ringue — ao se aproximar da borda virado para fora, girar de volta para o centro; (2) procurar o adversário girando/arqueando; (3) avançar contra o adversário quando o laser frontal detectar algo dentro do ringue (leituras que batem fora do ringue, como as bordas do mapa, não contam). Sem empurrão físico (Princípio III continua): o confronto pode terminar em empate por tempo. Mundos genéricos continuam com o controlador de desvio. Motivação: na demo, com o controlador genérico os robôs saem do ringue sozinhos, o que não parece sumô."

Relação com a feature 001-arena: amplia o controlador padrão (FR-004 de 001) e a demonstração de sumô (FR-010 de 001) sem alterar núcleo, física, API do controlador ou regras de vitória/empate.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Robôs de sumô permanecem no ringue (Priority: P1)

Como integrante da SheepBotz, ao abrir o dojô de sumô e apertar Iniciar sem programar nada, quero ver os dois robôs se comportando como competidores de sumô — sem sair sozinhos do ringue — para que a demonstração pareça uma luta e não um erro.

**Why this priority**: É a queixa observada na demo: com o controlador genérico os robôs saem sozinhos do ringue. Sem isso, a demonstração da modalidade perde credibilidade.

**Independent Test**: Carregar o mundo de sumô padrão, não alterar programas, executar até o limite de tempo e verificar que nenhum robô saiu do ringue.

**Acceptance Scenarios**:

1. **Given** o mundo de sumô padrão com os programas padrão, **When** a simulação roda até o limite de tempo do cenário, **Then** nenhum robô fica totalmente fora do ringue e o resultado é empate por tempo limite.
2. **Given** um robô com o programa padrão de sumô posicionado perto da borda e virado para fora, **When** a simulação avança, **Then** o robô gira de volta e não sai do ringue.
3. **Given** a mesma seed, mundo e programas, **When** a rodada é repetida ou reiniciada com Reset, **Then** as trajetórias e o resultado são idênticos.

---

### User Story 2 - Robôs procuram e enfrentam o adversário (Priority: P2)

Como integrante da equipe, quero que os robôs com o programa padrão procurem o adversário e avancem contra ele, para mostrar contato e bumper durante a demo.

**Why this priority**: Dá vida à luta e demonstra laser e bumper; depende de P1 para não terminar com saída do ringue.

**Independent Test**: No mundo de sumô padrão, executar e verificar que os robôs entram em contato (bumper acionado) dentro de um tempo definido.

**Acceptance Scenarios**:

1. **Given** o mundo de sumô padrão, **When** a simulação roda, **Then** os dois robôs registram contato (bumper) em até 30 s de simulação.
2. **Given** um robô cujo laser frontal só alcança a borda do mapa fora do ringue, **When** a simulação avança, **Then** ele não trata essa leitura como adversário e continua procurando.
3. **Given** um robô que perdeu o adversário de vista, **When** a simulação avança, **Then** ele volta a girar ou arquear dentro do ringue para procurá-lo.

---

### User Story 3 - Mundos genéricos e programas próprios inalterados (Priority: P3)

Como usuário, quero que labirinto e campo livre continuem com o controlador genérico de desvio e que um programa aplicado por mim substitua o padrão, para que a mudança fique restrita ao sumô.

**Why this priority**: Protege o comportamento já aceito na feature 001-arena e a generalidade do núcleo.

**Independent Test**: Comparar trajetórias de labirinto e campo livre antes e depois da mudança; aplicar programa próprio no sumô e verificar que ele é executado.

**Acceptance Scenarios**:

1. **Given** os mundos labirinto e campo livre, **When** executados com os programas padrão por 300 ticks, **Then** as trajetórias são idênticas às da versão anterior.
2. **Given** o mundo de sumô, **When** o usuário aplica um programa próprio a um robô, **Then** esse robô executa o programa do usuário e o outro mantém o padrão de sumô.
3. **Given** o mundo de sumô carregado, **When** o usuário seleciona um robô, **Then** o editor mostra o texto do programa padrão de sumô, que pode ser lido e editado.

### Edge Cases

- Ringue com centro ou raio diferentes do mundo padrão: o programa padrão usa os valores do cenário carregado.
- Laser com 1 raio, número par de raios ou campo de visão estreito: o programa padrão continua válido e usa o raio mais próximo da frente.
- Robôs em contato bloqueante e de frente: sem empurrão, o confronto pode durar até o limite e terminar em empate por tempo; isso é esperado. *(Revisado: desde a feature 003 há empurrão real e, desde a 004, a estratégia padrão usa memória e termina com vencedor em parte das seeds.)*
- Robô iniciado já próximo da borda: deve priorizar voltar para dentro antes de procurar o adversário.
- O programa padrão deve respeitar os limites do controlador (tamanho, nós, profundidade e orçamento) e nunca gerar erro de execução.
- Replay de rodada com o programa padrão reproduz o mesmo resultado, sem executar programa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em mundo com cenário de sumô, todo robô sem programa próprio MUST iniciar com o programa padrão de sumô; em mundo sem cenário, MUST continuar com o programa padrão genérico de desvio.
- **FR-002**: O programa padrão de sumô MUST ser escrito no mesmo subconjunto e com a mesma API de controlador da feature 001-arena, visível e editável pelo usuário como qualquer outro programa.
- **FR-003**: O programa padrão de sumô MUST manter o robô dentro do ringue: perto da borda e com movimento apontando para fora, ele gira de volta em vez de avançar.
- **FR-004**: O programa padrão de sumô MUST avançar quando a leitura frontal do laser indicar um objeto cujo ponto atingido está dentro do ringue, e MUST ignorar leituras cujo ponto atingido está fora do ringue.
- **FR-005**: Sem adversário detectado, o programa padrão de sumô MUST procurar girando ou arqueando dentro do ringue.
- **FR-006**: O programa padrão de sumô MUST usar o centro e o raio do cenário carregado, não valores fixos do mundo padrão.
- **FR-007**: A mudança MUST NOT alterar o núcleo de simulação, a física bloqueante, a API do controlador, as regras de vitória/empate nem o comportamento dos mundos genéricos.

### Key Entities

- **Programa padrão de sumô**: texto de controlador gerado para o cenário carregado (centro e raio do ringue); atribuído a cada robô sem programa próprio em mundo de sumô.
- **Programa padrão genérico**: estratégia de desvio já existente; continua valendo para mundos sem cenário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No dojô de sumô padrão com os programas padrão, 0 robôs saem do ringue em 1.200 ticks (60 s); o resultado é empate por tempo limite. *(Revisado pela feature 003: com empurrão real o resultado pode variar; a exigência que permanece é não sair do ringue por iniciativa própria.)*
- **SC-002**: Os dois robôs registram contato com o adversário em até 600 ticks (30 s) no dojô padrão.
- **SC-003**: Um robô com o programa padrão colocado a 0,3 m da borda e virado para fora permanece dentro do ringue nos 200 ticks seguintes.
- **SC-004**: Labirinto e campo livre produzem trajetórias idênticas às da versão anterior em 300 ticks.
- **SC-005**: A suíte existente continua 100% aprovada e a cobertura mantém ≥80% nas quatro métricas.

## Assumptions

- O ringue continua sem sensor próprio; o programa padrão estima a posição em relação à borda pela odometria ideal, que é exata nesta PoC.
- O subconjunto de JS não tem funções trigonométricas; a direção do robô pode ser estimada por aproximação aritmética, com erro pequeno suficiente para as decisões de borda.
- Sem empurrão físico, empate por tempo é o desfecho esperado entre dois programas padrão; vitória continua demonstrável com programas próprios (roteiro do pitch).
- A estratégia é demonstrativa, não um competidor otimizado.
- Princípio III da constitution permanece inalterado: nenhuma emenda é necessária.
