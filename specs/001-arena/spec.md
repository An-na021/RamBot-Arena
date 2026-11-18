# Feature Specification: RamBot Arena

Feature: `001-arena` · criada em 2026-11-18 · status: baseline da PoC.
Entrada: requirements.md. Público: integrantes da equipe Univille SheepBotz que querem testar controle sem desgaste físico.

## User Scenarios & Testing

### US1 — Carregar e experimentar um mundo (P1)
Como integrante da equipe, quero abrir uma arena e avançar a simulação para observar trajetórias reproduzíveis sem robô físico.

**Aceite independente:**
1. Dado um mundo válido, ao carregar, os robôs aparecem nas posições iniciais e o tempo está zerado (FR-001).
2. Dado um arquivo malformado, dimensão inválida, IDs repetidos ou posição inicial sobreposta, ao carregar, recebo mensagem identificando o campo e o mundo anterior permanece disponível (FR-001).
3. Dado um robô sem obstáculos comandado a 1 m/s, após 20 passos de 0,05 s, desloca-se 1 m, tolerância 1e-9 m; girar no lugar não muda sua posição (FR-002).
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

## Functional Requirements

### US4 — Demonstrar sumô simplificado (P2)
Como integrante da SheepBotz, quero comparar dois controladores num ringue para explicar uma modalidade concreta sem acoplar regras esportivas ao simulador.

1. O mundo padrão contém dois robôs dentro de um ringue visível. Se um robô ficar totalmente fora do círculo, o outro vence e a execução pausa (FR-010).
2. Se os dois saírem no mesmo tick ou o limite de tempo for atingido sem vencedor, o resultado é empate (FR-010).
3. Tocar ou cruzar parcialmente a borda não elimina. Reset inicia nova rodada. Replay mostra o mesmo resultado. Mundos genéricos não têm regras de sumô (FR-010).
4. A interface informa que contatos bloqueiam movimentos: esta PoC não modela forças/empurrões nem promete regras oficiais de competição (FR-010).

- **FR-001:** Carregar mundo descrito por mapa, obstáculos, robôs e configuração de sensores, com validação antes de substituir o mundo ativo.
- **FR-002:** Simular tração diferencial e impedir penetração em bordas/obstáculos/robôs.
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
- **NFR-004:** Testes e relatório comprovam no mínimo 80% de cobertura; README mostra métricas atuais.
- **NFR-005:** Cada task referencia requisito; cada commit de entrega referencia task.

## Edge Cases

Sensor de raio único aponta à frente; ângulos normalizados; tangência permitida sem penetração; comandos não finitos rejeitados. Mundo sem obstáculos é válido. Robôs inicialmente em colisão são inválidos. Falha de controlador não altera tick, poses ou seed. Gravação tem limite explícito. Estado visual sem WebGL apresenta erro legível. Replay não executa código do arquivo.

## Success Criteria

Mínimo: US1 e US2 demonstráveis, testes headless de posição/laser/erros passando e cobertura exigida. Completo: US3 demonstrável. Demo escolhida: sumô com resultado reproduzível de saída do ringue; colisões bloqueantes sem penetração. US4 define a adaptação simplificada; labirinto continua teste genérico de 300 ticks. Pitch e GitHub são entregas humanas externas ao funcionamento local. Bônus não incluídos.
