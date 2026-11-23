# Contrato — memória do controlador v1

Complementa `specs/001-arena/contracts/controllers.md`.

| API | Retorno / efeito |
| --- | --- |
| `memory(i)` | número guardado na posição `i` do próprio robô (0 se nunca gravado neste ciclo) |
| `remember(i, valor)` | grava `valor` na posição `i`; última gravação do tick prevalece |

- `i` MUST ser inteiro de 0 a 15; senão `Controlador: posição de memória deve ser inteiro de 0 a 15`.
- `valor` MUST ser número finito; senão `Controlador: memória aceita apenas números finitos`.
- `memory`/`remember` são nomes reservados como as demais funções da API.
- Limites do programa: 8.000 caracteres, **1.000 nós**, profundidade 40, **orçamento de 1.000 avaliações** (antes 500/500).
- Gravações de um tick com erro são descartadas (atomicidade do tick).
- Zerada no Reset, ao carregar mundo e ao aplicar novo programa ao robô.

## Estratégia padrão de sumô

`sumoController(scenario)` passa a usar as posições 0–8 conforme research.md R4. Continua gerada a partir do centro/raio do cenário e editável no app.
