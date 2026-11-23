# Data Model — 003-robot-dynamics

## Robô (campos novos no mundo, opcionais)

| Campo | Tipo / restrição | Default | Significado |
| --- | --- | --- | --- |
| `mass` | número finito, 0,1 a 10 kg | 1 | massa do corpo |
| `grip` | número finito, 0,1 a 10 | 6 | aderência longitudinal (×m·g): limita força de motor/frenagem |
| `lateralGrip` | número finito, 0,1 a 10 | 3 | aderência lateral (×m·g): resistência a ser empurrado de lado |

Valores fora do intervalo ou não numéricos → `Mundo inválido: robots[i].<campo> ...`. Campos existentes (raio, `maxLinear`, `maxAngular`, laser) inalterados.

## Estado dinâmico do robô (snapshot)

| Campo | Regra |
| --- | --- |
| `x`, `y`, `theta` | pose após o tick |
| `vx`, `vy` | velocidade real no plano (m/s), finita |
| `omega` | velocidade angular real (rad/s), finita |
| `v`, `w` | último comando (velocidade-alvo) após limite por `maxLinear`/`maxAngular` |
| `distance` | caminho efetivamente percorrido, inclusive empurrado |
| `bumper` | houve força de contato com parede, obstáculo ou robô no tick (regra corrigida pela feature 005: encostar sem força não liga) |
| `scan` | laser após o tick |

Reset zera `vx`, `vy`, `omega`, `v`, `w`, `distance`.

## Constantes do modelo (não configuráveis nesta versão)

g = 9,81 m/s²; aceleração angular máx. 200 rad/s²; velocidade sem carga do motor = 2×`maxLinear`; folga de contato 0,05 m; 10 iterações de solver; subpassos ≥ 10 e deslocamento ≤ raio mínimo/4.
