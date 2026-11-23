---

description: "Task list for 006-maze-wall-follow"
---

# Tasks: Estratégia de labirinto

**Input**: Design documents from `/specs/006-maze-wall-follow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/maze.md, quickstart.md

**Tests**: incluídos (constitution V). Nomes começam com `006`. IDs a partir de T501.

## Phase 1: Setup

- [X] T501 Confirmar baseline `npm run check` (134 testes)

## Phase 2: Foundational

- [X] T502 [P] [FR-004] Criar src/modes/maze.js com `parseMaze` e `mazeController` (contracts/maze.md; parâmetros de research.md R1; data-model.md `Modalidade labirinto.scenario.type`)
- [X] T503 Despachar a modalidade em `load` e `importReplay` de src/core/session.js, atribuir `mazeController()` e limitar `result` ao sumô
- [X] T504 [P] Desenhar ringue apenas para `scenario.type === 'sumo'` em src/renderer.js e mostrar o aviso de sumô apenas no sumô em src/app.js
- [X] T505 Adicionar `"scenario": {"type": "labirinto"}` a worlds/labirinto.json

## Phase 3: User Story 1 - Robôs atravessam o labirinto (Priority: P1) 🎯 MVP

- [X] T506 [P] [US1] Teste `006 SC-001 FR-002 FR-003` em tests/maze.test.js: cada robô passa pelos 4 corredores em até 2.400 ticks
- [X] T507 [P] [US1] Teste `006 SC-002 SC-003` em tests/maze.test.js: em 5.000 ticks nenhum robô parado > 100 ticks seguidos e nenhuma penetração > 1e-6 m

## Phase 4: User Story 2 - Modalidade identificada no mundo (Priority: P2)

- [X] T508 [P] [US2] Teste `006 FR-001 FR-005 FR-006` em tests/maze.test.js: labirinto recebe `mazeController`, `result` nulo e sem pausa; campo livre mantém `DEFAULT_CONTROLLER`; tipo inválido gera erro e preserva o mundo; Editar JSON/gravação preservam a modalidade; programa próprio substitui só um robô
- [X] T509 [US2] Rodar suíte e ajustar testes existentes afetados (renderer/app/sumo), mantendo o objetivo

## Phase 5: Polish

- [X] T510 [P] Atualizar specs/001-arena/contracts/world.md e session.md, README.md e docs/pitch.md
- [X] T511 Executar `npm run check` (SC-004, SC-005) e registrar em specs/001-arena/validation.md
- [X] T512 Validar no navegador conforme quickstart.md

## Dependencies

T501 → T502 → T503 → T504/T505 → T506–T508 → T509 → T510–T512.
