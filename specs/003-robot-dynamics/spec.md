# Feature Specification: Física real dos robôs

**Feature Branch**: `003-robot-dynamics`

**Created**: 2026-11-23

**Status**: Implemented (SC-004 atendido pela feature 004)

**Input**: User description: "Física real dos robôs (constitution 2.0.0, Princípio III): substituir o movimento cinemático com contatos bloqueantes por dinâmica 2D própria em todos os mundos. Cada robô tem massa, inércia, força máxima de motor e atrito com o chão; setSpeed(v, w) passa a ser a velocidade-alvo que os motores perseguem com aceleração finita. Contato robô–robô troca impulso: o robô com mais força, mais velocidade ou que acerta de lado empurra o outro; de frente com forças iguais eles travam. Paredes e obstáculos continuam rígidos. No sumô, empurrar o adversário para fora do ringue deve ser possível e a estratégia padrão deve conseguir vencer em alguns casos. Núcleo continua determinístico, headless e sem motor de física pronto. Motivação do usuário: 'os robôs vão de frente e ficam parados de frente pro outro quando se batem; preciso que seja real e como um ring de verdade'."

## Clarifications

### Session 2026-11-23

- Q: No movimento livre, a posição após N ticks deve ficar próxima da cinemática ideal v·t ou seguir aceleração realista? → A: Motor forte com aderência alta (como robôs de sumô com ímã): sem contato, a velocidade pedida é atingida em até 1 tick e a reta de 1 m/s por 1 s fica a menos de 1 cm de v·t; no contato, força e aderência limitadas tornam empurrão, travamento e massa realistas.

Relação com features anteriores: redefine FR-002 da 001-arena (movimento e contato) conforme a constitution 2.0.0; revisa a 002-sumo-default-strategy, cujo desfecho esperado deixa de ser sempre empate por tempo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Empurrar no ringue (Priority: P1)

Como integrante da SheepBotz, quero que um robô consiga empurrar o outro para fora do ringue, como num sumô de verdade, para que a demonstração mostre uma luta e não dois robôs parados.

**Why this priority**: É o pedido central do usuário; sem empurrão o sumô não parece real.

**Independent Test**: Um robô avança contra a lateral de outro parado no dojô e o empurra até a saída do ringue; o resultado mostra a vitória do empurrador.

**Acceptance Scenarios**:

1. **Given** um robô parado e outro avançando contra a lateral dele, **When** se tocam, **Then** o parado é deslocado no sentido do empurrão e acaba fora do ringue; o empurrador vence.
2. **Given** dois robôs iguais avançando de frente um contra o outro com o mesmo comando, **When** se tocam, **Then** ficam travados sem que nenhum avance, até um mudar de ângulo ou de força.
3. **Given** um robô que acerta o adversário pelo lado, **When** empurra, **Then** o adversário é deslocado de lado com mais facilidade do que de frente.
4. **Given** dois robôs com programas padrão de sumô, **When** a rodada roda, **Then** em pelo menos uma das seeds de teste há um vencedor por empurrão antes do limite de tempo.

---

### User Story 2 - Movimento com inércia (Priority: P2)

Como responsável pelo controle, quero que o robô acelere e freie de forma gradual e que um robô mais pesado seja mais difícil de empurrar, para testar estratégias com efeitos parecidos com os do robô físico.

**Why this priority**: Dá realismo ao controle e torna os parâmetros do robô relevantes; depende do modelo de P1.

**Independent Test**: Comandar velocidade a partir do repouso e medir a velocidade dentro do tick; repetir o empurrão com massas diferentes.

**Acceptance Scenarios**:

1. **Given** um robô parado, **When** recebe comando de velocidade, **Then** a velocidade cresce de forma contínua (sem salto instantâneo), atinge o valor pedido em até 1 tick e não o ultrapassa.
2. **Given** um robô em movimento, **When** recebe comando zero, **Then** desacelera continuamente até parar, sem inverter o sentido.
3. **Given** dois empurrões iguais contra robôs de massas diferentes, **When** comparados, **Then** o robô mais pesado se desloca menos.

---

### User Story 3 - Mundos, sensores e repetição continuam confiáveis (Priority: P3)

Como grupo, quero que paredes e obstáculos continuem sólidos, que os sensores continuem corretos e que a mesma seed produza a mesma rodada, para manter os testes e a demonstração reproduzíveis.

**Why this priority**: Preserva os princípios II e V e os aceites do briefing.

**Independent Test**: Rodar labirinto e paredes finas em alta velocidade sem penetração; repetir rodadas e comparar.

**Acceptance Scenarios**:

1. **Given** um robô em alta velocidade contra parede ou obstáculo fino, **When** colide, **Then** não atravessa nem penetra e o bumper registra o contato.
2. **Given** mesmo mundo, seed, programas e número de ticks, **When** executado duas vezes ou após Reset, **Then** os estados são idênticos.
3. **Given** um robô sem obstáculos com comando constante, **When** passam N ticks, **Then** a posição final segue a regra documentada de aceleração dentro da tolerância publicada.
4. **Given** laser, odometria e bumper, **When** robôs se empurram, **Then** as leituras refletem as posições e contatos reais do tick.

### Edge Cases

- Robô empurrado contra parede: fica preso entre parede e empurrador sem atravessar a parede.
- Três ou mais robôs em contato simultâneo (até oito): sem sobreposição persistente e sem valores não finitos.
- Comando de velocidade acima do limite do robô: limitado como antes.
- Robô girando no lugar encostado no adversário: não "atravessa" o adversário.
- Rodada longa (5.000 ticks) com contato contínuo: estado continua finito e determinístico.
- Replay de rodada com empurrões reproduz exatamente as posições gravadas.
- Mundo antigo sem parâmetros físicos: carrega com valores padrão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada robô MUST ter massa, força máxima de motor e atrito com o chão; mundos sem esses campos MUST usar valores padrão documentados, e valores inválidos MUST ser rejeitados com erro `Mundo inválido:`.
- **FR-002**: O comando de velocidade MUST ser tratado como velocidade-alvo alcançada com aceleração finita, limitada pela força do motor e pelo atrito; no movimento livre (sem contato), a velocidade pedida MUST ser atingida em até 1 tick, de modo que a reta de 1 m/s por 20 ticks de 0,05 s fique a menos de 1 cm de 1 m.
- **FR-003**: Contato entre robôs MUST trocar movimento conforme massa e força, permitindo que um robô empurre outro; com forças e massas iguais em sentidos opostos, nenhum avança.
- **FR-004**: Um robô empurrado MUST poder ser deslocado lateralmente com menos força do que no sentido de suas rodas.
- **FR-005**: Paredes e obstáculos MUST continuar rígidos e imóveis; nenhum robô MUST atravessá-los ou permanecer sobreposto a eles ou a outro robô após o tick.
- **FR-006**: A simulação MUST continuar determinística, headless e sem motor de física pronto; mesma entrada produz o mesmo estado.
- **FR-007**: Bumper MUST indicar contato com parede, obstáculo ou outro robô no último tick; odometria MUST acumular o caminho efetivamente percorrido, inclusive quando empurrado.
- **FR-008**: As regras de sumô (saída, vitória, empate) MUST permanecer inalteradas; empurrar o adversário para fora MUST resultar em vitória do empurrador.
- **FR-009**: A estratégia padrão de sumô MUST ser revisada para empurrar e tentar contornar o adversário, de modo que rodadas padrão possam terminar com vencedor.

### Key Entities

- **Parâmetros físicos do robô**: massa, força máxima de motor, atrito com o chão; opcionais no mundo, com padrões.
- **Estado dinâmico do robô**: posição, orientação, velocidade linear e angular reais (podem diferir do comando).
- **Contato**: par de corpos em toque num tick, com troca de movimento entre robôs ou bloqueio por parede/obstáculo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um robô avançando contra a lateral de outro parado de mesma massa no dojô o empurra para fora do ringue em menos de 10 s de simulação.
- **SC-008**: Sem contato, a reta de 1 m/s por 20 ticks de 0,05 s termina a menos de 1 cm de 1 m.
- **SC-002**: Dois robôs iguais de frente com o mesmo comando ficam a menos de 5 cm do ponto de encontro por 5 s.
- **SC-003**: Com o mesmo empurrão, um robô com o dobro da massa se desloca no máximo metade da distância do robô leve.
- **SC-004**: Em 10 seeds do dojô com programas padrão, pelo menos 3 terminam com vencedor antes do limite de tempo.
- **SC-005**: Nenhuma penetração em paredes, obstáculos (inclusive finos) ou robôs em 5.000 ticks de labirinto e de dojô.
- **SC-006**: Mesma entrada repetida 2 vezes produz estados idênticos em 100% dos casos testados.
- **SC-007**: Suíte automatizada 100% aprovada e cobertura ≥80% nas quatro métricas.

## Assumptions

- Física plana simplificada: corpos circulares rígidos, sem deformação, sem tombamento, sem 3D; não promete equivalência com robôs reais (constitution III).
- Valores padrão de massa, força e aderência escolhidos para um robô de sumô de bancada com aderência alta (como os que usam ímãs); serão publicados no contrato de mundo.
- Um robô parado que segura posição resiste de frente com a mesma aderência de quem empurra; por isso, entre robôs iguais, vencer exige ângulo (lateral), massa maior ou adversário que não esteja segurando posição. Isso é o comportamento físico esperado, não um defeito.
- Paredes e obstáculos têm massa infinita.
- A API do controlador não muda; somente o significado de setSpeed passa a ser velocidade-alvo.
- Testes, trajetórias de referência e documentos da 001 e da 002 que dependem do movimento cinemático serão atualizados nesta feature.
