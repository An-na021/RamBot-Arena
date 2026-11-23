# Implementation Plan: RamBot Arena — simulador base

**Branch**: `001-arena` | **Date**: 2026-11-18 (manual) · reconstruído pelo Spec Kit em 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-arena/spec.md`

## Summary

SPA local e estática que simula robôs de tração diferencial num núcleo 2D headless e determinístico e desenha o estado em 3D. Mundo em JSON validado; dinâmica, colisão e sensores próprios; controlador em subconjunto de JS interpretado por AST; sessão com play/pause/step/reset, gravação e replay; modalidades fora do núcleo (sumô e labirinto). Decisões em [research.md](research.md); entidades em [data-model.md](data-model.md); contratos em [contracts/](contracts/).

## Technical Context

**Language/Version**: JavaScript ESM, Node 22+

**Primary Dependencies**: Three.js 0.180 com OrbitControls (somente desenho), Acorn 8 (análise do controlador), Vite 6 (dev/build)

**Storage**: N/A (sem backend, login ou persistência remota; mundos e gravações por arquivo local)

**Testing**: Vitest 3 com cobertura V8 e jsdom

**Target Platform**: navegador moderno com WebGL; Node 22+ para execução headless

**Project Type**: SPA estática com núcleo headless

**Performance Goals**: 20 ticks/s em tempo real com até 8 robôs e 100 obstáculos; dt fixo independente de FPS

**Constraints**: determinismo bit a bit; nenhum motor de física pronto; núcleo sem DOM/WebGL; controlador sem eval, laços ou funções do usuário

**Scale/Scope**: limites em research.md R10; 3 mundos de exemplo (sumô, labirinto, campo livre)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* Constitution 2.0.1.

| Princípio | Verificação | Pré | Pós |
| --- | --- | --- | --- |
| I. Especificação primeiro | briefing → constitution → spec → plan → tasks antes do código; contratos permitem regeneração | ✅ | ✅ |
| II. Núcleo independente e reproduzível | `src/core` sem DOM/Three; PRNG semeado; dinâmica própria em subpassos fixos | ✅ | ✅ |
| III. PoC pequena e honesta | sumô como modalidade; regras em `src/modes`; física simplificada declarada; bônus fora | ✅ | ✅ |
| IV. Stack e limites | ESM, Vite, Three só para desenho, Acorn, Vitest/V8/jsdom; lockfile | ✅ | ✅ |
| V. Aceite e rastreabilidade | FR/NFR → tasks → testes com IDs → commits `Txxx:`; cobertura ≥ 80%; README gerado | ✅ | ✅ |
| VI. Entrega em grupo | trio registrado; pitch e publicação como tarefas externas | ✅ | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/001-arena/
├── spec.md            # /speckit-specify
├── plan.md            # /speckit-plan (este arquivo)
├── research.md        # /speckit-plan, fase 0
├── data-model.md      # /speckit-plan, fase 1
├── quickstart.md      # /speckit-plan, fase 1 (execução e regeneração)
├── contracts/         # world, controllers, replay, session
├── tasks.md           # /speckit-tasks
├── checklists/requirements.md
├── requirements.md    # extração do briefing e lacunas
├── references.md      # pesquisa das oito referências
├── traceability.md    # matriz requisito → task → teste
├── validation.md      # evidências de execução
└── history/           # versão manual de 2026-11-18
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── world.js        # validação e normalização do mundo
│   ├── geometry.js     # interseções, laser, utilitários
│   ├── controller.js   # interpretador do subconjunto de JS
│   ├── simulation.js   # passo dinâmico, sensores, memória
│   ├── recording.js    # validação de gravações
│   └── session.js      # live/replay, transporte, gravação, modalidades
├── modes/
│   ├── sumo.js         # regras e estratégia padrão de sumô
│   └── maze.js         # estratégia padrão de labirinto
├── renderer.js         # Three.js: desenha snapshots
├── app.js              # liga DOM à sessão
└── style.css
worlds/                 # sumo.json, labirinto.json, livre.json
tests/                  # aceite headless, sessão, UI (jsdom), renderer
scripts/                # headless.mjs, report.mjs, traceability.mjs
```

**Structure Decision**: projeto único; nenhum módulo de `src/core` importa renderer, app ou modalidades, exceto `session.js`, que orquestra as modalidades.

## Complexity Tracking

| Violação | Por que necessária | Alternativa mais simples rejeitada |
| --- | --- | --- |
| Solver iterativo de contato (feature 003) | empurrão e travamento corretos com limites de força | contato bloqueante (sem empurrão) — substituído pela constitution 2.0.0 |
