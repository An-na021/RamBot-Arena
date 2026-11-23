# Implementation Plan: Memória no controlador

**Branch**: `004-controller-memory` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-controller-memory/spec.md`

## Summary

Adicionar `memory(i)` e `remember(i, valor)` à API do controlador (16 posições por robô, atômicas por tick, zeradas em reset/carga/novo programa) e reescrever a estratégia padrão de sumô como máquina de fases (abertura, empurrão, recuo, flanco, rastreamento). Elevar limites do programa para 1.000 nós/avaliações. Protótipo: 6/10 seeds com vencedor por empurrão (research.md R4), contra 0/10 na feature 003.

## Technical Context

**Language/Version**: JavaScript ESM, Node 22+

**Primary Dependencies**: nenhuma nova (Acorn já usado)

**Storage**: N/A (memória só em tempo de execução)

**Testing**: Vitest 3 + V8 + jsdom

**Target Platform**: navegador e Node headless

**Project Type**: SPA estática com núcleo headless

**Performance Goals**: programa padrão (~1.850 caracteres) por robô por tick dentro de 1.000 avaliações

**Constraints**: sem nova sintaxe; determinismo; atomicidade do tick; API antiga intacta

**Scale/Scope**: controller.js (nomes e limites), simulation.js (memória), sumo.js (estratégia), testes e contratos

## Constitution Check

| Princípio | Verificação | Pré | Pós |
| --- | --- | --- | --- |
| I. Especificação primeiro | spec/plan/tasks antes do código; contrato 001 atualizado | ✅ | ✅ |
| II. Núcleo reproduzível | memória faz parte do estado da Simulation; aleatoriedade só via `random()` semeado | ✅ | ✅ |
| III. PoC honesta | estratégia demonstrativa; limites declarados (vitória em parte das seeds) | ✅ | ✅ |
| IV. Stack e limites | sem eval, laços ou funções do usuário; limites continuam finitos (1.000 nós) | ✅ | ✅ |
| V. Aceite e rastreabilidade | testes `004` com FR/SC; cobertura ≥80% | ✅ | ✅ |
| VI. Entrega em grupo | sem impacto | ✅ | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/004-controller-memory/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md · tasks.md
├── contracts/memory.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/core/controller.js   # memory/remember na lista da API; limites 1.000
src/core/simulation.js   # vetor de memória por robô, cópia por tick, reset
src/modes/sumo.js        # estratégia com fases
tests/memory.test.js     # testes 004
```

**Structure Decision**: projeto único; memória mantida na Simulation, não no interpretador, para preservar atomicidade junto com PRNG e poses.

## Complexity Tracking

| Violação | Por que necessária | Alternativa mais simples rejeitada |
| --- | --- | --- |
| Limite de nós/avaliações 500 → 1.000 | estratégia com fases não cabe em 500 nós | estratégia reduzida: no máximo 1/10 vitórias (research R3) |
