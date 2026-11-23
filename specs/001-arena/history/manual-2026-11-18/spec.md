# Feature Specification: RamBot Arena

Feature: `001-arena` · criada em 2026-11-18 · status: baseline da PoC.
Entrada: requirements.md. Público: integrantes da equipe Univille SheepBotz que querem testar controle sem desgaste físico.

## Clarifications

### Session 2026-11-23

Origem: lacunas reveladas pela regeneração isolada (validation.md, T011 etapa 1), via `/speckit-clarify`.

- Q: A API pública de Session e do módulo de sumô deve ser contrato obrigatório? → A: Sim; Session e sumô passam a ter contrato em contracts/session.md. Geometria interna, renderer e app permanecem detalhes de implementação.
- Q: `new Simulation(world)` aceita objeto, texto JSON ou ambos? → A: Ambos; texto segue o limite de 200.000 caracteres e os erros `Mundo inválido:`. Vale também para `Session.load`.
- Q: Qual prefixo têm os erros de importação de replay? → A: `Replay:`; mundo embutido inválido mantém `Mundo inválido:`; erros de controlador usam `Controlador:`.
- Q: Um `;` isolado (comando vazio) é aceito no controlador? → A: Sim, sem efeito; registrado no subconjunto de contracts/controllers.md.
- Q: Textos de resultado do sumô e IDs do labirinto são fixos? → A: Sim; motivos exatos em contracts/session.md e IDs `sheep-01`/`sheep-02` do labirinto em quickstart.md.
- Q: Após o fim do combate de sumô, `step()` ainda avança? → A: Não; ao vivo, `step()` apenas pausa e devolve o estado até Reset. Replay navega normalmente.
- Q: `"scenario": null` equivale a mundo sem modalidade? → A: Não; só a ausência do campo indica mundo genérico. `null` ou qualquer cenário que não seja sumô válido gera erro `Sumô:`.
- Q: Ao atingir o limite de 5.000 ticks, a captura em andamento é encerrada? → A: Sim; `recording` vira `null`, `notice` contém "5.000", `stopRecording()` devolve os 5.001 frames e a simulação continua sem gravar.
- Q: Propriedade fora da lista (ex.: `readLaser().constructor`) é recusada ao aplicar ou ao executar? → A: Ao aplicar (compilação); acesso com ponto só a `x`, `y`, `theta`, `distance`, `length`. Índices `[i]` são validados na execução.
- Q: Mensagens de erro de orçamento e de modo têm texto fixo? → A: Fixam-se palavras-chave, não frases: excesso de nós, profundidade ou avaliações → `Controlador:` + "orçamento"; ação proibida durante replay → contém "replay" (minúsculo); editar controlador durante captura → contém "gravação".

Lacuna sem pergunta (sem efeito de comportamento): o orçamento de 500 avaliações era redundante com o limite de 500 nós (ambos elevados para 1.000 pela feature 004) porque o subconjunto não tem laços; mantido como salvaguarda e registrado em contracts/controllers.md.

## User Scenarios & Testing

### US1 — Carregar e experimentar um mundo (P1)
Como integrante da equipe, quero abrir uma arena e avançar a simulação para observar trajetórias reproduzíveis sem robô físico.

**Aceite independente:**
1. Dado um mundo válido, ao carregar, os robôs aparecem nas posições iniciais e o tempo está zerado (FR-001).
2. Dado um arquivo malformado, dimensão inválida, IDs repetidos ou posição inicial sobreposta, ao carregar, recebo mensagem identificando o campo e o mundo anterior permanece disponível (FR-001).
3. Dado um robô sem obstáculos comandado a 1 m/s, após 20 passos de 0,05 s, desloca-se 1 m, tolerância 1 cm (dinâmica com aceleração finita, feature 003); girar no lugar não muda sua posição (FR-002).
4. Dado um obstáculo ou borda na trajetória, o robô para sem penetrar e registra contato (FR-002/003).
5. Pausado, o estado permanece; Step avança exatamente um tick; Reset volta ao estado inicial; Play avança até Pause (FR-005).

### US2 — Programar e inspecionar o robô (P1)
Como responsável pelo controle, quero usar sensores e alterar meu programa para comparar estratégias.

**Aceite independente:**
1. Em mundo simples com parede a 2 m do centro, o raio frontal retorna 2 m (tolerância 1e-9); objetos além do alcance não alteram a leitura máxima (FR-003).
2. Odometria informa pose e deslocamento acumulado; bumper informa contato do último tick (FR-003).
3. Ao aplicar um controlador válido, o programa é executado a cada tick pela API permitida; velocidades são limitadas ao robô (FR-004).
4. Sintaxe inválida, chamada proibida ou expressão excedendo o orçamento gera erro e pausa, sem congelar a interface nem avançar parcialmente o tick (FR-004).
5. A arena é apresentada em 3D; orbitar/zoom não altera a simulação; raios podem ser exibidos/ocultados; o painel mostra leituras e pose do robô selecionado (FR-006/008).

### US3 — Comparar robôs e rever um experimento (P2)
Como grupo, quero executar vários robôs e rever uma gravação para explicar os resultados na apresentação.

**Aceite independente:**
1. Dois robôs com controladores próprios são atualizados no mesmo tick; não se sobrepõem e percebem um ao outro no laser (FR-007).
2. Ao gravar, os estados inicial e subsequentes são preservados; exportar/importar permite rever os mesmos estados sem executar controladores (FR-009).
3. Reprodução permite play/pause/step/reset e busca por tick; arquivo inválido é rejeitado; encerrar replay restaura o experimento inicial (FR-009).
4. No limite de gravação, a captura termina com mensagem clara e a simulação continua utilizável (FR-009).

### US4 — Demonstrar sumô simplificado (P2)
Como integrante da SheepBotz, quero comparar dois controladores num ringue para explicar uma modalidade concreta sem acoplar regras esportivas ao simulador.

1. O mundo padrão contém dois robôs dentro de um ringue visível. Se um robô ficar totalmente fora do círculo, o outro vence e a execução pausa (FR-010).
2. Se os dois saírem no mesmo tick ou o limite de tempo for atingido sem vencedor, o resultado é empate (FR-010). Motivos exibidos: `Saída simultânea: empate`, `<id> venceu: adversário fora do ringue`, `Tempo limite: empate`.
3. Tocar ou cruzar parcialmente a borda não elimina. Após o resultado, Play e Step não avançam o tempo; Reset inicia nova rodada. Replay mostra o mesmo resultado. Mundos genéricos não têm regras de sumô (FR-010).
4. A interface informa que contatos bloqueiam movimentos: esta PoC não modela forças/empurrões nem promete regras oficiais de competição (FR-010).

## Functional Requirements

- **FR-001:** Carregar mundo descrito por mapa, obstáculos, robôs e configuração de sensores, com validação antes de substituir o mundo ativo; o núcleo aceita o mundo como objeto ou texto JSON.
- **FR-002:** Simular tração diferencial com dinâmica 2D própria (massa, aderência, empurrão entre robôs; feature 003, constitution 2.0.0) e impedir penetração em bordas/obstáculos/robôs.
- **FR-003:** Fornecer laser com N raios e alcance máximo, odometria e bumper.
- **FR-004:** Executar controlador de cada robô a cada passo, com API limitada e erros visíveis.
- **FR-005:** Oferecer play, pause, passo e reset, com tick e tempo visíveis.
- **FR-006:** Desenhar estado em 3D com câmera orbital e raios visíveis.
- **FR-007:** Simular até oito robôs e suas interações no mesmo mundo.
- **FR-008:** Inspecionar robô selecionado e suas leituras em tempo de execução.
- **FR-009:** Gravar, exportar, importar e reproduzir estados com busca por tick.
- **FR-010:** Oferecer demonstração de sumô simplificado com ringue, saída, vitória/empate e pausa automática, independente do núcleo genérico.

## Non-functional Requirements

- **NFR-001:** Resultado idêntico para mesma entrada/seed/passos, executável sem interface.
- **NFR-002:** Movimento e colisões próprios; nenhum motor de física.
- **NFR-003:** Documentos incluem comportamento, decisões, contrato de entrada/saída e roteiro de regeneração.
- **NFR-004:** Testes e relatório comprovam no mínimo 80% de cobertura de linhas, funções, branches e statements de todo `src/**/*.js`; README mostra métricas atuais.
- **NFR-005:** Cada task referencia requisito; cada commit de entrega referencia task.

## Edge Cases

Sensor de raio único aponta à frente; ângulos normalizados; tangência permitida sem penetração; comandos não finitos rejeitados. Mundo sem obstáculos é válido. Robôs inicialmente em colisão são inválidos. Falha de controlador não altera tick, poses ou seed. Gravação tem limite explícito. Estado visual sem WebGL apresenta erro legível. Replay não executa código do arquivo. Prefixos de erro: `Mundo inválido:`, `Controlador:`, `Replay:`, `Sumô:`.

## Success Criteria

Mínimo: US1 e US2 demonstráveis, testes headless de posição/laser/erros passando e cobertura exigida. Completo: US3 demonstrável. Demo escolhida: sumô com resultado reproduzível de saída do ringue; colisões bloqueantes sem penetração. US4 define a adaptação simplificada; labirinto continua teste genérico de 300 ticks. Pitch e GitHub são entregas humanas externas ao funcionamento local. Bônus não incluídos.
