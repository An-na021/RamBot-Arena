---

description: "Task list for 004-controller-memory"
---

# Tasks: Memória no controlador

**Input**: Design documents from `/specs/004-controller-memory/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/memory.md, quickstart.md

**Tests**: incluídos (constitution V). Nomes de teste começam com `004`.

**Organization**: por história. IDs a partir de T301 (001: T001–T014; 002: T101–T118; 003: T201–T217).

## Phase 1: Setup

- [X] T301 Confirmar baseline: `npm run check` aprovado (120 testes) antes da mudança

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T302 [FR-002] Adicionar `memory` e `remember` aos nomes da API (sem nova sintaxe) e elevar limites para 1.000 nós e 1.000 avaliações em src/core/controller.js (contracts/memory.md)
- [X] T303 Implementar a memória por robô em src/core/simulation.js: data-model.md `Memória do robô.posição` e `Memória do robô.valor` com validação, cópia de trabalho por tick confirmada só sem erro, zerar em construção/`reset()` e no robô em `setController()`

**Checkpoint**: API de memória disponível; histórias podem ser validadas.

---

## Phase 3: User Story 1 - Lutas de sumô com vencedor (Priority: P1) 🎯 MVP

**Goal**: estratégia padrão vence em parte das seeds.

**Independent Test**: 10 seeds do dojô padrão, contar vencedores.

- [X] T304 [US1] Reescrever `sumoController(scenario)` em src/modes/sumo.js com a máquina de fases de research.md R4, usando data-model.md `Memória do robô.posição` 0–8
- [X] T305 [P] [US1] Teste `004 SC-001 SC-002 FR-006` em tests/memory.test.js: seeds 1–10 com programas padrão; ≥3 vencedores antes de 1.200 ticks; cada vitória com contato nos últimos 20 ticks
- [X] T306 [P] [US1] Teste `004 FR-006 FR-007` em tests/memory.test.js: robôs travados mudam de fase em até 1 s; mesma seed e Reset reproduzem a luta

---

## Phase 4: User Story 2 - Programar táticas de várias etapas (Priority: P2)

**Goal**: memória persistente, isolada e atômica.

**Independent Test**: contador na memória.

- [X] T307 [P] [US2] Teste `004 SC-003 FR-001 FR-003` em tests/memory.test.js: contador chega a N após N ticks; zera no Reset, em `Session.load` e em `applyController`; posição nunca gravada lê 0; última gravação do tick prevalece
- [X] T308 [P] [US2] Teste `004 FR-001 FR-004` em tests/memory.test.js: memórias de robôs distintos são isoladas; gravações de tick com erro (outro robô falha) são descartadas junto com tick e PRNG

---

## Phase 5: User Story 3 - Limites claros e mensagens de erro (Priority: P3)

**Goal**: erros `Controlador:` sem alterar estado.

- [X] T309 [P] [US3] Teste `004 SC-004 FR-005` em tests/memory.test.js: posição -1, 16, 1,5 e valores não finitos geram `Controlador:` sem avançar tick; `memory`/`remember` são nomes reservados; programa de 1.000 nós compila e de 1.001 não
- [X] T310 [US3] Revisar testes existentes que fixavam limites 500 (tests/core.test.js) e da estratégia de sumô (tests/sumo-strategy.test.js, tests/dynamics.test.js), mantendo o objetivo de cada aceite

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T311 [P] Atualizar specs/001-arena/contracts/controllers.md (API, limites), specs/003-robot-dynamics/research.md (SC-004 fechado pela 004) e README.md/docs/pitch.md
- [X] T312 Executar `npm run check` e registrar em specs/001-arena/validation.md
- [X] T314 Trocar a seed de demonstração de worlds/sumo.json de 42 (empate por tempo) para 3 (vitória por empurrão aos 14,1 s), documentar a escolha e ajustar o teste 002 SC-001 ao critério revisado pela 003 (ninguém sai sem contato)
- [X] T313 Validar no navegador conforme quickstart.md

---

## Dependencies & Execution Order

- T301 → T302 → T303 → T304 → testes.
- T305–T309 independentes entre si após T304; T310 após T304; T311 a qualquer momento após T303; T312 após testes; T313 por último.

## Parallel Example

```text
Após T304: T305, T306, T307, T308, T309 (casos em tests/memory.test.js); T311 em documentos.
```

## Implementation Strategy

1. MVP: T301–T305 — lutas com vencedor.
2. Incremento: garantias da memória (US2) e erros (US3).
3. Fechamento: documentação, check e navegador.
