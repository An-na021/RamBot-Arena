# Contrato — programa padrão de sumô v1

Complementa `specs/001-arena/contracts/controllers.md` e `specs/001-arena/contracts/session.md`.

## `src/modes/sumo.js`

- `sumoController(scenario)` → `string`. Recebe o cenário normalizado por `parseSumo`. Devolve o texto de um programa válido no subconjunto do controlador, sem erro de compilação nem de execução para qualquer cenário válido e qualquer laser válido (1 a 64 raios).

Comportamento por tick, em ordem de prioridade (θ estimado por aproximação aritmética, ver research.md R1):

1. **Borda**: distância² do robô ao centro > (raio − 0,6)² e direção com componente radial > 0 → `setSpeed(0, 2.5)`.
2. **Ataque**: ponto atingido pelo raio frontal com distância² ao centro < (raio − 0,05)² → `setSpeed(0.8, 0)`.
3. **Busca**: caso contrário → `setSpeed(0.25, 1.4)`.

Raio frontal: índice `(n − 1)/2` se n ímpar, `n/2` se par. Velocidades são limitadas por `maxLinear`/`maxAngular` do robô como qualquer programa.

## `src/core/session.js` — mudança em `load(world)`

- Com cenário de sumô: todo robô recebe `sumoController(scenario)` como programa.
- Sem cenário: programas padrão genéricos (`DEFAULT_CONTROLLER`), como antes.
- Demais membros de Session inalterados.

## Inalterados (FR-007)

`Simulation`, geometria, colisão, API do controlador, `parseSumo`, `sumoResult`, contrato de replay e de mundo.
