# Data Model — 001-arena

Visão consolidada; restrições detalhadas e mensagens de erro nos contratos (`contracts/world.md`, `contracts/replay.md`, `contracts/controllers.md`, `contracts/session.md`).

## Mundo

| Campo | Regra | Default |
| --- | --- | --- |
| `name` | texto exibido com até 80 caracteres | `Arena` |
| `width`, `height` | 1 a 50 m | obrigatório |
| `dt` | 0,001 a 0,1 s | 0,05 |
| `seed` | inteiro 0 a 4.294.967.295 (0 → 1 no PRNG) | 42 |
| `obstacles[]` | 0 a 100 retângulos `{x, y, width, height}` dentro do mapa | obrigatório |
| `robots[]` | 1 a 8 robôs | obrigatório |
| `scenario` | opcional: `{type: "sumo", x, y, radius, maxTicks}` ou `{type: "labirinto"}`; `null` inválido | ausente |

## Robô (entrada)

| Campo | Regra | Default |
| --- | --- | --- |
| `id` | único, `^[a-zA-Z0-9_-]{1,24}$` | obrigatório |
| `x`, `y` | centro inteiramente dentro do mapa, sem sobrepor obstáculos/robôs | obrigatório |
| `theta` | −π a π | 0 |
| `radius` | 0,1 a 1 m | 0,25 |
| `maxLinear`, `maxAngular` | 0,01–3 m/s; 0,01–10 rad/s | 1; 3 |
| `mass`, `grip`, `lateralGrip` | 0,1–10 (feature 003) | 1; 6; 3 |
| `laser` | `rays` 1–64 inteiro; `range` 0,1–50 m; `fov` 0–2π | obrigatório |

## Estado do robô (snapshot por tick)

`x`, `y`, `theta`, `vx`, `vy`, `omega`, `v`/`w` (comando), `distance`, `bumper`, `scan[]`.

## Controlador

| Campo | Regra |
| --- | --- |
| `fonte` | texto ≤ 8.000 caracteres, ≤ 1.000 nós, profundidade ≤ 40 (contracts/controllers.md) |
| `memória` | 16 números finitos por robô (feature 004), zerada em reset, carga e novo programa |

## Gravação

| Campo | Regra |
| --- | --- |
| `version` | 1 |
| `world` | mundo válido (inclui `scenario`) |
| `frames` | 1 a 5.001 frames |

Frame `i` com `tick = i`, `time = i·dt`, robôs na ordem do mundo; até 5.001 frames.

## Transições de estado da sessão

`live` ⇄ `replay`; `running` true/false; sumô `finished` pausa e bloqueia avanço até Reset; captura `recording` ativa até finalizar, limite ou reset.
