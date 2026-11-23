# Implementation Plan: Estratégia padrão de sumô

**Branch**: `002-sumo-default-strategy` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-sumo-default-strategy/spec.md`

## Summary

No mundo com cenário de sumô, os robôs passam a iniciar com um programa padrão de sumô gerado a partir do cenário: gira de volta perto da borda quando virado para fora, avança quando o raio frontal atinge algo dentro do ringue, e procura em arco no restante. A direção é estimada por aproximação aritmética (Bhaskara I) dentro do subconjunto já contratado. A geração fica em `src/modes/sumo.js` e a atribuição em `Session.load`; núcleo, física, API e regras não mudam. Protótipo validou SC-001 a SC-003 (research.md).

## Technical Context

**Language/Version**: JavaScript ESM, Node 22+ (igual à 001-arena)

**Primary Dependencies**: nenhuma nova; Acorn (interpretação do controlador) e Three.js inalterados

**Storage**: N/A

**Testing**: Vitest 3 com V8 e jsdom (igual à 001-arena)

**Target Platform**: navegador com WebGL e Node headless

**Project Type**: SPA estática com núcleo headless

**Performance Goals**: programa padrão dentro dos limites do controlador (≤ 8.000 caracteres, ≤ 500 nós, profundidade ≤ 40, orçamento 500 avaliações — limites da época; 1.000 desde a feature 004); protótipo: 783 caracteres

**Constraints**: sem mudança em `Simulation`, geometria, API do controlador, `parseSumo`/`sumoResult`; mundos genéricos com trajetórias idênticas

**Scale/Scope**: 1 função nova, 1 mudança pontual em `Session.load`, testes e documentos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Pré-design | Pós-design |
| --- | --- | --- | --- |
| I. Especificação primeiro | spec → plan → tasks antes do código; contratos de 001 atualizados junto | ✅ | ✅ |
| II. Núcleo independente e reproduzível | `Simulation` intacta; programa determinístico (sem `random()`), mesma seed → mesma rodada | ✅ | ✅ |
| III. PoC pequena e honesta | regra de modalidade continua no módulo de sumô; sem empurrão; empate por tempo declarado | ✅ | ✅ |
| IV. Stack e limites | sem dependência nova; programa no subconjunto, sem eval | ✅ | ✅ |
| V. Aceite e rastreabilidade | testes com ID `002` + FR/SC; cobertura ≥80%; README regenerado | ✅ | ✅ |
| VI. Entrega em grupo | sem impacto | ✅ | ✅ |

Nenhuma violação; Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/002-sumo-default-strategy/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── default-controller.md
├── checklists/
│   └── requirements.md
└── tasks.md            # /speckit-tasks
```

Também atualizados: `specs/001-arena/contracts/controllers.md` (programa padrão por modalidade) e `specs/001-arena/contracts/session.md` (`load` atribui programa de sumô).

### Source Code (repository root)

```text
src/
├── core/
│   └── session.js      # load(): atribui sumoController(scenario) quando há cenário
└── modes/
    └── sumo.js         # nova exportação sumoController(scenario)

tests/
└── sumo-strategy.test.js   # testes 002 (SC-001..SC-005, FR-001..FR-007)
```

**Structure Decision**: projeto único existente; mudança restrita ao módulo de modalidade e ao orquestrador de sessão.

## Complexity Tracking

Sem violações a justificar.
