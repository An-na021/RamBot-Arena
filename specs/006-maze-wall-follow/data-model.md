# Data Model — 006-maze-wall-follow

## Modalidade labirinto (campo `scenario` do mundo)

| Campo | Regra |
| --- | --- |
| `scenario.type` | `"labirinto"` |
| outros campos | ignorados |

Sem regra de vitória, pausa ou placar. Ausência de `scenario` continua significando mundo genérico; `null` e outros tipos seguem as regras já contratadas (erro `Sumô:` para tipos inválidos).

## Programa padrão de labirinto

Texto fixo gerado por `mazeController()`; parâmetros em research.md R1 (distância 0,7 m, limiar 1,5 m, v 0,7 m/s). Atribuído a todos os robôs na carga do mundo; editável.
