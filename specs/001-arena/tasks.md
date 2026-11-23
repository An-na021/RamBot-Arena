---

description: "Task list for 001-arena"
---

# Tasks: RamBot Arena — simulador base

**Input**: Design documents from `/specs/001-arena/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: incluídos — exigidos pela constitution (Princípio V) e pelo briefing. Nomes de teste contêm os IDs FR/NFR; matriz em traceability.md.

**Organization**: por história de usuário. IDs T001–T014 preservados da versão de 2026-11-18 (commits `Txxx: descrição` do repositório usam esses IDs); a ordem abaixo segue as dependências. Formato de commit: `Txxx: descrição`.

## Format: `[ID] [P?] [Story] [Requisitos] Description`

---

## Phase 1: Setup

- [x] T001 [NFR-003, NFR-005] Extrair briefing e decisões (specs/001-arena/requirements.md), constitution, spec, plan, contratos (specs/001-arena/contracts/), templates do Spec Kit, scripts/traceability.mjs e roteiro de regeneração (specs/001-arena/quickstart.md)

---

## Phase 2: User Story 1 - Carregar e experimentar um mundo (Priority: P1) 🎯 MVP

**Goal**: mundo validado, movimento, contato e sensores no núcleo headless.

**Independent Test**: carregar worlds/livre.json, avançar ticks e conferir posição, contato e erros de mundo em tests/core.test.js.

- [x] T002 [US1] [FR-001] Validar mundo JSON e importação atômica em src/core/world.js, com data-model.md `Mundo.name`, `Mundo.width`, `Mundo.height`, `Mundo.dt`, `Mundo.seed`, `Mundo.obstacles`, `Mundo.robots`, `Mundo.scenario` e `Robô.id`, `Robô.x`, `Robô.y`, `Robô.theta`, `Robô.radius`, `Robô.maxLinear`, `Robô.maxAngular`, `Robô.mass`, `Robô.grip`, `Robô.lateralGrip`, `Robô.laser` (restrições em contracts/world.md); exemplos em worlds/; testes de campos, limites, IDs e sobreposição em tests/core.test.js
- [x] T003 [US1] [FR-002, FR-003, NFR-001, NFR-002] Movimento, colisão e sensores em src/core/simulation.js e src/core/geometry.js, produzindo data-model.md `Estado do robô` (pose, velocidades reais, `distance`, `bumper`, `scan`); runner scripts/headless.mjs; testes analíticos e de determinismo em tests/core.test.js. Depende de T002

**Checkpoint**: núcleo headless aceita mundos e simula sem interface.

---

## Phase 3: User Story 2 - Programar e inspecionar o robô (Priority: P1)

**Goal**: controlador limitado, transporte, 3D e inspeção.

**Independent Test**: aplicar programa, ver erros e leituras; jsdom em tests/app.test.js e tests/renderer.test.js.

- [x] T004 [US2] [FR-004] Interpretar o subconjunto de JS em src/core/controller.js (data-model.md `Controlador.fonte` e `Controlador.memória`, 16 posições), executar por tick e mostrar erros; testes de isolamento, limite e atomicidade em tests/core.test.js. Depende de T003
- [x] T005 [US1/US2] [FR-005, FR-006, FR-008] Play/pause/step/reset em src/core/session.js, arena 3D orbital em src/renderer.js, inspeção e seleção em src/app.js e index.html; testes em tests/app.test.js e tests/renderer.test.js; QA no navegador. Depende de T004

**Checkpoint**: escopo mínimo do briefing demonstrável.

---

## Phase 4: User Story 3 - Comparar robôs e rever um experimento (Priority: P2)

**Goal**: múltiplos robôs e gravação/replay.

**Independent Test**: dois robôs, gravar, exportar, importar e buscar tick em tests/core.test.js e tests/app.test.js.

- [x] T006 [P] [US3] [FR-007] Múltiplos robôs, comandos independentes, colisão e percepção mútua em src/core/simulation.js; testes simultâneos em tests/core.test.js. Depende de T004
- [x] T007 [US3] [FR-009] Captura, download/importação, replay, busca e limite em src/core/recording.js e src/core/session.js, conforme data-model.md `Gravação.version`, `Gravação.world`, `Gravação.frames` (até 5.001); testes de round-trip e entradas inválidas em tests/core.test.js e tests/app.test.js. Depende de T005/T006

**Checkpoint**: escopo completo do briefing demonstrável.

---

## Phase 5: User Story 4 - Demonstrar a modalidade sumô (Priority: P2)

**Goal**: ringue, vitória/empate e pausa fora do núcleo.

**Independent Test**: tests/sumo.test.js com saída, tangência, empate, pausa, reset e replay.

- [x] T013 [US4] [FR-010] Demo de sumô em src/modes/sumo.js e worlds/sumo.json: ringue, regra separada de vitória/empate, pausa e replay; testes em tests/sumo.test.js; fonte Roboton em references.md. Depende de T005/T006/T007

**Checkpoint**: modalidade escolhida pelo usuário demonstrável.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T008 [NFR-004, NFR-003, NFR-005] Cobertura de todo src ≥ 80% nas quatro métricas (vite.config.js), relatório versionado em coverage/, README gerado por scripts/report.mjs, CI em .github/workflows/ci.yml e testes de processo em tests/process.test.js. Depende de T002–T007
- [x] T009 [NFR-003] Roteiro de pitch sem código (docs/pitch.md), relatório de validação (specs/001-arena/validation.md) e checklist de entrega. Depende de T008. Slides versionados e cronometragem ficam em T012
- [x] T014 [P] [FR-006, NFR-003] Adotar o nome público RamBot Arena em index.html, package.json e documentos; preservar SheepBotz como equipe atendida

---

## Phase 7: Ações externas do grupo

- [x] T010 [NFR-005] Publicar em https://github.com/An-na021/RamBot-Arena na branch main e verificar workflow remoto. Integrantes: Anna Heloísa Malschitzky, William Fagundes e Sandriely Maciel. Publicação confirmada; GitHub Actions aprovado em https://github.com/An-na021/RamBot-Arena/actions/runs/44381741565
- [ ] T011 [NFR-003] Recriar a implementação em checkout separado usando somente documentos; registrar fração dos testes de aceitação que passa, sem alegar uso da suíte oculta da disciplina. Etapa 1 (regeneração por assistente isolado via Spec Kit) executada em 2026-11-23: 42/95 testes originais e todos os aceites headless do briefing; após `/speckit-clarify`, segunda regeneração com 63/95; ver validation.md. Falta avaliação humana
- [ ] T012 [NFR-003] Ensaiar em grupo e apresentar pitch/demo em até dez minutos, com slides sem código versionados em docs/

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005; T006 depende de T004; T007 de T005/T006; T013 de T005–T007; T008 de T002–T007; T009 de T008; T014 independente.
- Features posteriores (002–006) estendem estas tasks sem alterá-las; ver specs/00X-*/tasks.md.

## Parallel Opportunities

```text
Após T004: T005 e T006 (arquivos distintos: session/renderer/app versus simulation).
T014 em paralelo a qualquer fase (só textos e metadados).
```

## Implementation Strategy

1. MVP: T001–T005 (US1 + US2) — escopo mínimo do briefing.
2. Incremento: T006–T007 (US3) — escopo completo.
3. Modalidade: T013 (US4).
4. Fechamento: T008, T009, T014; ações externas T010–T012.
