# Implementation Plan: Estratégia de labirinto

**Branch**: `006-maze-wall-follow` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-maze-wall-follow/spec.md`

## Summary

Nova modalidade `scenario: {type: "labirinto"}` com módulo `src/modes/maze.js` (validação e programa de seguir parede pela direita). Session despacha a modalidade, atribui o programa e não aplica regras; renderer/app só desenham ringue para sumô. Protótipo: robôs passam pelos 4 corredores em 53 s e 46 s (antes: nunca).

## Technical Context

**Language/Version**: JavaScript ESM, Node 22+ · **Primary Dependencies**: nenhuma nova · **Storage**: N/A · **Testing**: Vitest 3 + V8 + jsdom · **Target Platform**: navegador e Node · **Project Type**: SPA com núcleo headless · **Performance Goals**: programa ~550 caracteres · **Constraints**: núcleo sem conhecer modalidades; API do controlador inalterada · **Scale/Scope**: 1 módulo novo, Session, renderer/app (condição de sumô), mundo de exemplo, testes, contratos

## Constitution Check

| Princípio | Pré | Pós |
| --- | --- | --- |
| I. Especificação primeiro | ✅ | ✅ |
| II. Núcleo independente (Simulation não importa modalidades) | ✅ | ✅ |
| III. Regras/estratégias no módulo de modalidade; sem vitória nesta feature, declarado | ✅ | ✅ |
| IV. Stack e subconjunto inalterados | ✅ | ✅ |
| V. Testes `006` com FR/SC; cobertura ≥80% | ✅ | ✅ |
| VI. Grupo | ✅ | ✅ |

## Project Structure

```text
specs/006-maze-wall-follow/ — spec, plan, research, data-model, quickstart, contracts/maze.md, tasks
src/modes/maze.js      — parseMaze, mazeController
src/core/session.js    — despacho da modalidade em load/importReplay; result só para sumô
src/renderer.js        — ringue só para sumô
src/app.js             — aviso de sumô só para sumô
worlds/labirinto.json  — scenario labirinto
tests/maze.test.js     — testes 006
```

**Structure Decision**: segue o padrão de `src/modes/sumo.js`.

## Complexity Tracking

Sem violações.
