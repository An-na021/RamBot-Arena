# Implementation Plan: Correção do bumper

**Branch**: `005-bumper-contact-fix` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-bumper-contact-fix/spec.md`

## Summary

Bumper passa a ligar só com força de contato (impulso > 1e-9 N·s) ou sobreposição corrigida > 1e-6 m, em `src/core/simulation.js`. Protótipo: campo livre de 10 m para 36 m em 60 s; labirinto de 96%/89% para 12% parado; sumô inalterado (6/10).

## Technical Context

**Language/Version**: JavaScript ESM, Node 22+ · **Primary Dependencies**: nenhuma nova · **Storage**: N/A · **Testing**: Vitest 3 + V8 · **Target Platform**: navegador e Node · **Project Type**: SPA com núcleo headless · **Performance Goals**: sem custo adicional · **Constraints**: determinismo, sem mudança de API · **Scale/Scope**: 2 condições em `substep`, testes e contratos

## Constitution Check

| Princípio | Pré | Pós |
| --- | --- | --- |
| I. Especificação primeiro (spec/plan/tasks antes do código; contratos 001/003 atualizados) | ✅ | ✅ |
| II. Núcleo reproduzível (mudança aritmética determinística) | ✅ | ✅ |
| III. PoC honesta (regressão registrada em validation.md) | ✅ | ✅ |
| IV. Stack (sem dependência) | ✅ | ✅ |
| V. Rastreabilidade (testes `005` com FR/SC) | ✅ | ✅ |
| VI. Grupo | ✅ | ✅ |

## Project Structure

```text
specs/005-bumper-contact-fix/ — spec, plan, research, data-model, quickstart, contracts/bumper.md, tasks
src/core/simulation.js       — regra do bumper em substep()
tests/bumper.test.js         — testes 005
```

**Structure Decision**: mudança local no núcleo; contratos 001/003 recebem referência ao contrato v3.

## Complexity Tracking

Sem violações.
