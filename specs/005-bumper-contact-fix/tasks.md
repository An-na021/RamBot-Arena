---

description: "Task list for 005-bumper-contact-fix"
---

# Tasks: Correção do bumper

**Input**: Design documents from `/specs/005-bumper-contact-fix/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/bumper.md, quickstart.md

**Tests**: incluídos (constitution V). Nomes começam com `005`. IDs a partir de T401.

## Phase 1: Setup

- [X] T401 Confirmar baseline `npm run check` (131 testes)

## Phase 2: Foundational

- [X] T402 Alterar a regra de data-model.md `Estado dinâmico do robô.bumper` em `substep` de src/core/simulation.js: impulso > 1e-9 ou correção de sobreposição > 1e-6 m (contracts/bumper.md)

## Phase 3: User Story 1 - Robôs não ficam presos girando na parede (Priority: P1) 🎯 MVP

- [X] T403 [P] [US1] Teste `005 SC-001 FR-002` em tests/bumper.test.js: campo livre 60 s, parado < 20% e > 25 m
- [X] T404 [P] [US1] Teste `005 SC-002 FR-002` em tests/bumper.test.js: labirinto 60 s, cada robô parado < 20%; robô encostado girando no lugar tem bumper desligado

## Phase 4: User Story 2 - Bumper continua mostrando choques reais (Priority: P2)

- [X] T405 [P] [US2] Teste `005 FR-001 FR-003 FR-004` em tests/bumper.test.js: choque em parede, travamento frente a frente e robô empurrado ligam bumper
- [X] T406 [US2] Rodar suíte e ajustar testes da 003/004 que dependiam do bumper "encostado", mantendo o objetivo

## Phase 5: Polish

- [X] T407 [P] Atualizar specs/003-robot-dynamics/contracts/dynamics.md e data-model.md e specs/001-arena/contracts/world.md com a regra de contracts/bumper.md
- [X] T408 Executar `npm run check` (SC-003, SC-004) e registrar em specs/001-arena/validation.md

## Dependencies

T401 → T402 → T403–T405 (paralelos) → T406 → T407/T408.
