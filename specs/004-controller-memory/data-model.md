# Data Model — 004-controller-memory

## Memória do robô

| Campo | Tipo / restrição | Inicial | Regra |
| --- | --- | --- | --- |
| `posição` | inteiro 0–15 | — | fora disso: erro `Controlador:` |
| `valor` | número finito | 0 | não numérico ou não finito: erro `Controlador:` |

Um vetor de 16 valores por robô, mantido pela Simulation (`memory[id]`).

## Ciclo de vida

1. Construção da Simulation / `reset()` → todos os vetores zerados.
2. `setController(id, fonte)` válido → vetor daquele robô zerado; fonte inválida não altera nada.
3. `step()` sem erro → cópia de trabalho vira oficial; com erro → cópia descartada.
4. `Session.load` cria nova Simulation (memória zerada). Replay não usa memória.
