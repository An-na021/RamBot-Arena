# Implementation Plan: Física real dos robôs

**Branch**: `003-robot-dynamics` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-robot-dynamics/spec.md`

## Summary

Substituir o passo cinemático com bloqueio por dinâmica 2D própria: velocidade real por robô, motor com aderência e curva de torque, atrito lateral, solver iterativo de impulsos para motor + contatos, correção posicional e subpassos fixos. Novos campos opcionais `mass`, `grip`, `lateralGrip`. Replay passa a carregar `vx`, `vy`, `omega`. Estratégia de sumô revisada para luta com empurrão. Protótipo (research.md) atende SC-001, 002, 003, 005, 008; SC-004 não atingido e escalado ao usuário.

## Technical Context

**Language/Version**: JavaScript ESM, Node 22+

**Primary Dependencies**: nenhuma nova; sem motor de física (briefing)

**Storage**: N/A

**Testing**: Vitest 3 + V8 + jsdom

**Target Platform**: navegador com WebGL e Node headless

**Project Type**: SPA estática com núcleo headless

**Performance Goals**: 1 tick com 8 robôs e 100 obstáculos em tempo real a 20 ticks/s no navegador (≥10 subpassos × 10 iterações)

**Constraints**: determinismo bit a bit; sem sobreposição ao fim do tick; API do controlador inalterada; erro de controlador atômico

**Scale/Scope**: reescrita de `Simulation.step`, campos de mundo, validação de replay, estratégia de sumô, revisão de testes da 001/002

## Constitution Check

| Princípio | Verificação | Pré | Pós |
| --- | --- | --- | --- |
| I. Especificação primeiro | constitution 2.0.0 emendada antes; spec/plan/tasks antes do código; contratos 001 atualizados | ✅ | ✅ |
| II. Núcleo independente e reproduzível | dinâmica própria, só aritmética, ordem fixa, sem DOM; renderer só lê snapshot | ✅ | ✅ |
| III. PoC pequena e honesta (2.0.0) | dinâmica 2D com empurrão em todos os mundos; paredes rígidas; regras de sumô no módulo; limites declarados (círculos, sem 3D) | ✅ | ✅ |
| IV. Stack e limites | sem dependência nova | ✅ | ✅ |
| V. Aceite e rastreabilidade | testes `003` com FR/SC; cobertura ≥80%; README regenerado | ✅ | ✅ (SC-004 declarado não atendido, sem mascarar) |
| VI. Entrega em grupo | sem impacto | ✅ | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/003-robot-dynamics/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md · tasks.md
├── contracts/dynamics.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/core/
├── world.js        # mass, grip, lateralGrip
├── simulation.js   # novo step dinâmico (solver, subpassos)
├── recording.js    # vx, vy, omega opcionais nos frames
src/modes/sumo.js   # sumoController revisado
tests/
├── dynamics.test.js         # testes 003
├── core.test.js · sumo-strategy.test.js · sumo.test.js · app.test.js  # revisão
```

**Structure Decision**: projeto único; mudança concentrada em `simulation.js`, mantendo `geometry.js` para laser e utilidades.

## Complexity Tracking

| Violação | Por que necessária | Alternativa mais simples rejeitada |
| --- | --- | --- |
| Solver iterativo (10 iterações × ≥10 subpassos) | travamento correto com forças iguais e limites de força | impulso único gerava empurrão indevido (research R2) |
