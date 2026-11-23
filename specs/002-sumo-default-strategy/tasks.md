---

description: "Task list for 002-sumo-default-strategy"
---

# Tasks: Estratégia padrão de sumô

**Input**: Design documents from `/specs/002-sumo-default-strategy/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/default-controller.md, quickstart.md

**Tests**: incluídos — a constitution (Princípio V) exige testes de aceite com IDs. Nomes de teste começam com `002` seguido de FR/SC desta feature.

**Organization**: tarefas agrupadas por história de usuário. IDs começam em T101 para não colidir com as tasks T001–T014 da feature 001-arena na convenção de commits `Txxx: descrição`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: história atendida (US1, US2, US3)

## Phase 1: Setup

- [X] T101 Confirmar baseline: `npm run check` aprovado e registrar trajetórias de 300 ticks de `worlds/labirinto.json` e `worlds/livre.json` como referência em tests/sumo-strategy.test.js (fixture inline) para SC-004

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T102 Implementar `sumoController(scenario)` em src/modes/sumo.js conforme contracts/default-controller.md e research.md R1–R3, embutindo data-model.md `Programa padrão de sumô.centro x, y`, `Programa padrão de sumô.limiar de borda` e `Programa padrão de sumô.limiar de adversário` como literais numéricos; texto deve respeitar data-model.md `Programa padrão de sumô.texto`
- [X] T103 Atribuir `sumoController(scenario)` a todos os robôs em `Session.load` quando houver cenário de sumô, em src/core/session.js (data-model.md, Ciclo de vida 1 e 4); sem cenário, manter `DEFAULT_CONTROLLER`

**Checkpoint**: programa padrão gerado e atribuído; histórias podem ser validadas.

---

## Phase 3: User Story 1 - Robôs de sumô permanecem no ringue (Priority: P1) 🎯 MVP

**Goal**: com os programas padrão, ninguém sai do ringue.

**Independent Test**: dojô padrão por 1.200 ticks sem saída e empate por tempo.

- [X] T104 [P] [US1] Teste `002 SC-001 FR-001` em tests/sumo-strategy.test.js: Session com worlds/sumo.json, 1.200 passos, nenhum robô fora, `result.reason === 'Tempo limite: empate'`
- [X] T105 [P] [US1] Teste `002 SC-003 FR-003` em tests/sumo-strategy.test.js: robô a 0,3 m da borda virado para fora em ângulos 0, 0,5, −1 e 2,5 rad permanece no ringue por 200 ticks
- [X] T106 [P] [US1] Teste `002 FR-001 determinismo` em tests/sumo-strategy.test.js: duas rodadas e uma após Reset produzem snapshots idênticos
- [X] T107 [P] [US1] Teste `002 FR-006` em tests/sumo-strategy.test.js: ringue com centro/raio diferentes (x 5, raio 3) não sai do ringue e o texto gerado contém os valores do cenário

**Checkpoint**: US1 validada; demo não termina mais com saída espontânea.

---

## Phase 4: User Story 2 - Robôs procuram e enfrentam o adversário (Priority: P2)

**Goal**: contato com o adversário e borda do mapa ignorada.

**Independent Test**: bumper dos dois robôs acionado em até 600 ticks no dojô padrão.

- [X] T108 [P] [US2] Teste `002 SC-002 FR-004` em tests/sumo-strategy.test.js: os dois robôs registram bumper em até 600 ticks
- [X] T109 [P] [US2] Teste `002 FR-004 FR-005` em tests/sumo-strategy.test.js: robô sozinho (adversário fora do alcance frontal) não avança reto contra a borda do mapa e executa busca em arco (`w` ≠ 0)
- [X] T110 [P] [US2] Teste `002 FR-002` em tests/sumo-strategy.test.js: `sumoController` compila com `compileController` para lasers de 1, 8, 9 e 64 raios e executa 1.200 ticks sem erro

**Checkpoint**: US1 e US2 funcionam independentemente.

---

## Phase 5: User Story 3 - Mundos genéricos e programas próprios inalterados (Priority: P3)

**Goal**: mudança restrita ao sumô.

**Independent Test**: trajetórias genéricas idênticas e programa próprio respeitado.

- [X] T111 [P] [US3] Teste `002 SC-004 FR-007` em tests/sumo-strategy.test.js: labirinto e campo livre por 300 ticks iguais à referência de T101
- [X] T112 [P] [US3] Teste `002 FR-001 FR-002` em tests/sumo-strategy.test.js: `applyController` em sheep-01 troca só o programa dele; sheep-02 mantém o padrão de sumô; `session.sim.sources` expõe o texto padrão para o editor
- [X] T113 [US3] Verificar em tests/app.test.js e tests/sumo.test.js que expectativas da 001 continuam válidas; ajustar apenas testes que dependiam do programa genérico no sumô, registrando o motivo

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T114 [P] Atualizar specs/001-arena/contracts/controllers.md (programa padrão por modalidade) e specs/001-arena/contracts/session.md (`load` atribui programa de sumô)
- [X] T115 [P] Atualizar README.md (seção Sumô) e docs/pitch.md (passo 2 do roteiro: programa padrão de sumô)
- [X] T116 Executar `npm run check` (SC-005), atualizar métricas do README e registrar resultado em specs/001-arena/validation.md
- [X] T117 Validar no navegador conforme quickstart.md (passos manuais 2–6)
- [X] T118 [P] Estender scripts/traceability.mjs para aceitar IDs de task de todas as features (`specs/*/tasks.md`), senão commits `T1xx:` desta feature falham na verificação do CI

---

## Dependencies & Execution Order

- T101 → T102 → T103 → histórias.
- US1 (T104–T107), US2 (T108–T110) e US3 (T111–T112) dependem apenas de T103; entre si são independentes.
- T113 depende de T103. T114–T115 podem rodar a qualquer momento após T103. T116 depois de todos os testes; T117 por último.

## Parallel Example

```text
Após T103: T104, T105, T106, T107, T108, T109, T110, T111, T112 escrevem casos no mesmo arquivo de teste,
mas são independentes; T114 e T115 tocam documentos distintos.
```

## Implementation Strategy

1. MVP: T101–T107 (US1) — demo deixa de terminar com saída espontânea.
2. Incremento: US2 (contato) e US3 (não regressão).
3. Fechamento: documentação, `npm run check`, navegador.
