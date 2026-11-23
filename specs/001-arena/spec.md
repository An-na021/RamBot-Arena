# Feature Specification: RamBot Arena — simulador base

**Feature Branch**: `001-arena`

**Created**: 2026-11-18 (versão manual) · reconstruída pelo Spec Kit em 2026-11-23

**Status**: Implemented

**Input**: User description: "Reconstruir no formato oficial do Spec Kit a especificação base do RamBot Arena (Trilha 4: simulador genérico de robôs móveis no navegador para a equipe Univille SheepBotz): mundo JSON validado, tração diferencial com dinâmica própria, laser/odometria/bumper, controlador JS limitado por tick, play/pause/step/reset, visualização 3D com câmera orbital e raios, vários robôs, inspeção, gravação/replay, modalidade sumô; núcleo headless e determinístico sem motor de física pronto; cobertura ≥80% e rastreabilidade. Preservar IDs FR-001–FR-010 e NFR-001–NFR-005, histórias US1–US4 e as clarificações já registradas; incorporar o estado atual após as features 002–006."

Contexto: briefing e decisões em [requirements.md](requirements.md); pesquisa das referências em [references.md](references.md); versão manual original em [history/](history/README.md). Público: integrantes da equipe Univille SheepBotz que querem testar estratégias de controle sem desgastar os robôs físicos.

## Clarifications

### Session 2026-11-23

Origem: lacunas reveladas pela regeneração isolada (validation.md, T011 etapa 1), via `/speckit-clarify`.

- Q: A API pública de Session e do módulo de sumô deve ser contrato obrigatório? → A: Sim; Session e sumô passam a ter contrato em contracts/session.md. Geometria interna, renderer e app permanecem detalhes de implementação.
- Q: `new Simulation(world)` aceita objeto, texto JSON ou ambos? → A: Ambos; texto segue o limite de 200.000 caracteres e os erros `Mundo inválido:`. Vale também para `Session.load`.
- Q: Qual prefixo têm os erros de importação de replay? → A: `Replay:`; mundo embutido inválido mantém `Mundo inválido:`; erros de controlador usam `Controlador:`.
- Q: Um `;` isolado (comando vazio) é aceito no controlador? → A: Sim, sem efeito; registrado no subconjunto de contracts/controllers.md.
- Q: Textos de resultado do sumô e IDs do labirinto são fixos? → A: Sim; motivos exatos em contracts/session.md e IDs `sheep-01`/`sheep-02` do labirinto em quickstart.md.
- Q: Após o fim do combate de sumô, `step()` ainda avança? → A: Não; ao vivo, `step()` apenas pausa e devolve o estado até Reset. Replay navega normalmente.
- Q: `"scenario": null` equivale a mundo sem modalidade? → A: Não; só a ausência do campo indica mundo genérico. `null` ou qualquer cenário que não seja sumô válido gera erro `Sumô:`. *(A feature 006 acrescentou o tipo `labirinto`, validado por `parseMaze`, com erros `Labirinto:`.)*
- Q: Ao atingir o limite de 5.000 ticks, a captura em andamento é encerrada? → A: Sim; `recording` vira `null`, `notice` contém "5.000", `stopRecording()` devolve os 5.001 frames e a simulação continua sem gravar.
- Q: Propriedade fora da lista (ex.: `readLaser().constructor`) é recusada ao aplicar ou ao executar? → A: Ao aplicar (compilação); acesso com ponto só a `x`, `y`, `theta`, `distance`, `length`. Índices `[i]` são validados na execução.
- Q: Mensagens de erro de orçamento e de modo têm texto fixo? → A: Fixam-se palavras-chave, não frases: excesso de nós, profundidade ou avaliações → `Controlador:` + "orçamento"; ação proibida durante replay → contém "replay" (minúsculo); editar controlador durante captura → contém "gravação".

Lacuna sem pergunta (sem efeito de comportamento): o orçamento de 500 avaliações era redundante com o limite de 500 nós (ambos elevados para 1.000 pela feature 004) porque o subconjunto não tem laços; mantido como salvaguarda e registrado em contracts/controllers.md.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Carregar e experimentar um mundo (Priority: P1)

Como integrante da equipe, quero abrir uma arena e avançar a simulação para observar trajetórias reproduzíveis sem robô físico.

**Why this priority**: É o mínimo para usar o simulador: sem mundo, movimento e controle de tempo nada mais é testável.

**Independent Test**: Carregar um mundo de exemplo, avançar ticks e conferir posição, contato e controles de tempo sem interface gráfica.

**Acceptance Scenarios**:

1. **Given** um mundo válido, **When** é carregado, **Then** os robôs aparecem nas posições iniciais e o tempo está zerado (FR-001).
2. **Given** um arquivo malformado, dimensão inválida, IDs repetidos ou posição inicial sobreposta, **When** é carregado, **Then** recebo mensagem identificando o campo e o mundo anterior permanece disponível (FR-001).
3. **Given** um robô sem obstáculos comandado a 1 m/s, **When** passam 20 passos de 0,05 s, **Then** ele se desloca 1 m com tolerância de 1 cm; girar no lugar não muda sua posição (FR-002).
4. **Given** um obstáculo ou borda na trajetória, **When** o robô o atinge, **Then** para sem penetrar e registra contato (FR-002, FR-003).
5. **Given** a simulação pausada, **When** uso Step, Reset e Play, **Then** Step avança exatamente um tick, Reset volta ao estado inicial e Play avança até Pause (FR-005).

---

### User Story 2 - Programar e inspecionar o robô (Priority: P1)

Como responsável pelo controle, quero usar sensores e alterar meu programa para comparar estratégias.

**Why this priority**: Programar o robô é o objetivo da equipe; inspecionar e ver em 3D tornam o resultado compreensível.

**Independent Test**: Aplicar um programa, verificar leituras de laser/odometria/bumper e erros de programa sem travar a interface.

**Acceptance Scenarios**:

1. **Given** um mundo com parede a 2 m do centro do robô, **When** leio o raio frontal, **Then** ele retorna 2 m (tolerância 1e-9); objetos além do alcance não alteram a leitura máxima (FR-003).
2. **Given** um robô em movimento, **When** leio odometria e bumper, **Then** recebo pose e deslocamento acumulado, e o bumper indica força de contato no último tick (FR-003).
3. **Given** um controlador válido, **When** aplicado, **Then** é executado a cada tick pela API permitida e as velocidades são limitadas ao robô (FR-004).
4. **Given** sintaxe inválida, chamada proibida ou programa que excede o orçamento, **When** aplicado ou executado, **Then** recebo erro e a simulação pausa sem avançar parcialmente o tick (FR-004).
5. **Given** a arena aberta, **When** orbito, aproximo, oculto raios e seleciono um robô, **Then** a simulação não muda e o painel mostra leituras e pose do robô selecionado (FR-006, FR-008).

---

### User Story 3 - Comparar robôs e rever um experimento (Priority: P2)

Como grupo, quero executar vários robôs e rever uma gravação para explicar os resultados na apresentação.

**Why this priority**: Escopo completo da trilha; depende de US1 e US2.

**Independent Test**: Rodar dois robôs, gravar, exportar, importar e navegar no replay.

**Acceptance Scenarios**:

1. **Given** dois robôs com controladores próprios, **When** a simulação avança, **Then** são atualizados no mesmo tick, não se sobrepõem e percebem um ao outro no laser (FR-007).
2. **Given** uma gravação, **When** exportada e importada, **Then** os mesmos estados são revistos sem executar controladores (FR-009).
3. **Given** um replay aberto, **When** uso play/pause/step/reset e busca por tick, **Then** a navegação funciona; arquivo inválido é rejeitado; encerrar o replay restaura o experimento (FR-009).
4. **Given** o limite de gravação, **When** é atingido, **Then** a captura termina com mensagem clara e a simulação continua utilizável (FR-009).

---

### User Story 4 - Demonstrar a modalidade sumô (Priority: P2)

Como integrante da SheepBotz, quero comparar dois controladores num ringue para explicar uma modalidade concreta sem acoplar regras esportivas ao simulador.

**Why this priority**: A modalidade escolhida guia a demo e as condições de vitória (constitution III).

**Independent Test**: Rodar o dojô com programas que façam um robô sair do ringue e conferir resultado, pausa e replay.

**Acceptance Scenarios**:

1. **Given** o mundo padrão com dois robôs no ringue, **When** um robô fica totalmente fora do círculo, **Then** o outro vence e a execução pausa (FR-010).
2. **Given** os dois saindo no mesmo tick ou o limite de tempo atingido sem vencedor, **When** o resultado é avaliado, **Then** é empate; motivos exibidos: `Saída simultânea: empate`, `<id> venceu: adversário fora do ringue`, `Tempo limite: empate` (FR-010).
3. **Given** um robô tocando ou cruzando parcialmente a borda, **When** avaliado, **Then** não é eliminado; após o resultado, Play e Step não avançam e Reset inicia nova rodada; replay mostra o mesmo resultado; mundos genéricos não têm regras de sumô (FR-010).
4. **Given** dois robôs em contato, **When** um empurra o outro, **Then** a física própria permite empurrar o adversário para fora; a interface não promete regras oficiais de competição (FR-010; empurrão pela feature 003).

### Edge Cases

- Sensor de raio único aponta à frente; ângulos normalizados; tangência permitida sem penetração.
- Comandos não finitos rejeitados; falha de controlador não altera tick, poses, memória ou seed.
- Mundo sem obstáculos é válido; robôs inicialmente em colisão são inválidos.
- Gravação tem limite explícito; replay não executa código do arquivo.
- Estado visual sem WebGL apresenta erro legível.
- Prefixos de erro: `Mundo inválido:`, `Controlador:`, `Replay:`, `Sumô:`, `Labirinto:`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST carregar mundo descrito por mapa, obstáculos, robôs e sensores, validando antes de substituir o mundo ativo; o mundo pode ser objeto ou texto JSON.
- **FR-002**: O sistema MUST simular tração diferencial com dinâmica 2D própria (massa, aderência, empurrão entre robôs) e impedir penetração em bordas, obstáculos e robôs.
- **FR-003**: O sistema MUST fornecer laser com N raios e alcance máximo, odometria e bumper.
- **FR-004**: O sistema MUST executar o controlador de cada robô a cada passo, com API limitada (incluindo memória entre ticks) e erros visíveis.
- **FR-005**: Usuários MUST poder usar play, pause, passo e reset, com tick e tempo visíveis.
- **FR-006**: O sistema MUST desenhar o estado em 3D com câmera orbital e raios visíveis.
- **FR-007**: O sistema MUST simular até oito robôs e suas interações no mesmo mundo.
- **FR-008**: Usuários MUST poder inspecionar o robô selecionado e suas leituras em tempo de execução.
- **FR-009**: Usuários MUST poder gravar, exportar, importar e reproduzir estados com busca por tick.
- **FR-010**: O sistema MUST oferecer a modalidade sumô (ringue, saída, vitória/empate, pausa automática) independente do núcleo genérico; o labirinto é modalidade sem regras (feature 006).

### Non-Functional Requirements

- **NFR-001**: Mesma entrada, seed e número de passos MUST produzir resultado idêntico, executável sem interface.
- **NFR-002**: Movimento e colisões MUST ser implementados pelo grupo; nenhum motor de física pronto.
- **NFR-003**: Os documentos MUST incluir comportamento, decisões, contratos de entrada/saída e roteiro de regeneração.
- **NFR-004**: Testes e relatório MUST comprovar no mínimo 80% de cobertura de linhas, funções, branches e statements de todo `src/**/*.js`; README mostra métricas atuais.
- **NFR-005**: Cada task MUST referenciar requisito; cada commit de entrega MUST referenciar task.

### Key Entities

- **Mundo**: dimensões, passo de tempo, seed, obstáculos retangulares, robôs e modalidade opcional (sumô ou labirinto).
- **Robô**: identificador, pose, raio, limites de velocidade, massa e aderência, configuração do laser; estado dinâmico com velocidades reais, distância percorrida e bumper.
- **Controlador**: programa por robô no subconjunto de JS, com memória de 16 números.
- **Gravação**: mundo e sequência de estados por tick, sem programas.
- **Modalidade**: regras e programas padrão fora do núcleo (sumô, labirinto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: US1 e US2 demonstráveis; testes sem interface de posição, laser e erros de mundo aprovados.
- **SC-002**: Reta de 1 m/s por 1 s termina a menos de 1 cm de 1 m; raio frontal a 2 m lido com erro ≤ 1e-9.
- **SC-003**: 100% dos mundos inválidos testados rejeitados com mensagem identificando o campo, sem perder o mundo ativo.
- **SC-004**: US3 demonstrável: gravação exportada e reimportada reproduz os mesmos estados em 100% dos frames.
- **SC-005**: Na demo do dojô, a saída do ringue é reproduzível (mesma seed → mesmo vencedor e mesmo tick).
- **SC-006**: Cobertura ≥ 80% nas quatro métricas e todos os requisitos com task e teste identificados.

## Assumptions

- Formato de mundo: apenas JSON (decisão em requirements.md).
- Unidades SI; robôs circulares; obstáculos retangulares alinhados aos eixos.
- Pitch, publicação no GitHub e avaliação humana da regeneração são entregas do grupo, fora do funcionamento local.
- Bônus (Portugol, WebSocket) fora do escopo.
