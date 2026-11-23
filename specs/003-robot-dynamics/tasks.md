---

description: "Task list for 003-robot-dynamics"
---

# Tasks: Física real dos robôs

**Input**: Design documents from `/specs/003-robot-dynamics/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/dynamics.md, quickstart.md

**Tests**: incluídos (constitution V). Nomes de teste começam com `003`.

**Organization**: por história. IDs a partir de T201 para não colidir com 001 (T001–T014) e 002 (T101–T118).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T201 Registrar o estado atual: `npm run check` aprovado antes da mudança (baseline de 111 testes)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T202 Adicionar data-model.md `Robô.mass`, `Robô.grip` e `Robô.lateralGrip` à validação e normalização em src/core/world.js, com erros `Mundo inválido:`
- [X] T203 Reescrever `Simulation.step` e `reset` em src/core/simulation.js com o modelo de research.md R1–R2 (motor com aderência e curva de torque, atrito lateral, solver iterativo de impulsos, contato especulativo, correção posicional, subpassos), mantendo leitura de sensores no início do tick, atomicidade de erro do controlador e campos de data-model.md `Estado dinâmico do robô.vx`, `.vy`, `.omega`, `.distance`, `.bumper`
- [X] T204 Aceitar `vx`, `vy`, `omega` opcionais nos frames de replay em src/core/recording.js (contracts/dynamics.md, Replay)

**Checkpoint**: núcleo dinâmico funcionando; histórias podem ser validadas.

---

## Phase 3: User Story 1 - Empurrar no ringue (Priority: P1) 🎯 MVP

**Goal**: empurrão realista no sumô.

**Independent Test**: empurrão lateral tira o adversário do ringue; frente a frente trava.

- [X] T205 [P] [US1] Teste `003 SC-001 FR-003 FR-004 FR-008` em tests/dynamics.test.js: empurrão lateral de mesma massa vence em < 200 ticks
- [X] T206 [P] [US1] Teste `003 SC-002 FR-003` em tests/dynamics.test.js: frente a frente com mesmo comando fica a < 5 cm do ponto de encontro por 100 ticks; frontal contra robô freado desloca < 10 cm
- [X] T207 [US1] Revisar `sumoController` em src/modes/sumo.js (contracts/dynamics.md, Sumô): ataque a 1 m/s e regra de borda só sem contato; teste `003 FR-009` em tests/dynamics.test.js: programa padrão compila, há contato e não há erro em 1.200 ticks

---

## Phase 4: User Story 2 - Movimento com inércia (Priority: P2)

**Goal**: aceleração finita e massa relevante.

**Independent Test**: velocidade sobe sem salto; robô pesado se desloca menos.

- [X] T208 [P] [US2] Teste `003 SC-008 FR-002` em tests/dynamics.test.js: reta 1 m/s × 20 ticks a < 1 cm de 1 m; velocidade após 1 tick ≤ alvo; frenagem não inverte sentido
- [X] T209 [P] [US2] Teste `003 SC-003 FR-001` em tests/dynamics.test.js: massa 2 desloca ≤ metade da massa 1 no mesmo empurrão lateral; campos inválidos geram `Mundo inválido:`

---

## Phase 5: User Story 3 - Mundos, sensores e repetição confiáveis (Priority: P3)

**Goal**: rigidez, determinismo e sensores corretos.

**Independent Test**: sem penetração em 5.000 ticks; repetição idêntica.

- [X] T210 [P] [US3] Teste `003 SC-005 FR-005` em tests/dynamics.test.js: parede de 1 mm a 2 m/s não é atravessada; labirinto e dojô por 5.000 ticks sem sobreposição > 1e-6 m e com valores finitos
- [X] T211 [P] [US3] Teste `003 SC-006 FR-006` em tests/dynamics.test.js: duas execuções e uma após Reset idênticas; replay exportado/importado reproduz estados (inclui vx/vy/omega)
- [X] T212 [P] [US3] Teste `003 FR-007` em tests/dynamics.test.js: bumper em contato robô–robô e parede; odometria acumula deslocamento ao ser empurrado
- [X] T213 [US3] Revisar testes da 001/002 que assumiam bloqueio cinemático (tests/core.test.js, tests/sumo-strategy.test.js, tests/sumo.test.js, tests/app.test.js), mantendo o objetivo de cada aceite e registrando cada ajuste

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T214 [P] Atualizar specs/001-arena/plan.md (algoritmo), specs/001-arena/contracts/world.md, controllers.md e replay.md, specs/001-arena/spec.md (FR-002) e specs/002-sumo-default-strategy (SC-001 obsoleto) conforme contracts/dynamics.md
- [X] T215 [P] Atualizar README.md e docs/pitch.md (física com empurrão, roteiro da demo)
- [X] T216 Executar `npm run check`, registrar em specs/001-arena/validation.md, incluindo SC-004 não atendido
- [X] T217 Validar no navegador conforme quickstart.md

---

## Dependencies & Execution Order

- T201 → T202 → T203 → T204 → histórias.
- T205–T212 dependem de T203/T204 e são independentes entre si; T207 altera src/modes/sumo.js.
- T213 depois de T203/T207. T214–T215 a qualquer momento após T203. T216 após todos os testes; T217 por último.

## Parallel Example

```text
Após T204: T205, T206, T208, T209, T210, T211, T212 (casos independentes em tests/dynamics.test.js); T214 e T215 em documentos distintos.
```

## Implementation Strategy

1. MVP: T201–T206 — empurrão e travamento reais.
2. Incremento: inércia/massa (US2), robustez (US3).
3. Fechamento: revisão de testes antigos, documentação, check e navegador.
