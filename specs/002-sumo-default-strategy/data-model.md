# Data Model — 002-sumo-default-strategy

Sem entidades persistidas novas. Esta feature define um valor derivado.

## Programa padrão de sumô

| Campo | Origem | Regra |
| --- | --- | --- |
| centro x, y | `scenario.x`, `scenario.y` do mundo carregado | embutidos como literais numéricos no texto |
| limiar de borda | `(scenario.radius − 0,6)²` | robô além dele e virado para fora gira de volta |
| limiar de adversário | `(scenario.radius − 0,05)²` | ponto atingido pelo raio frontal dentro dele = adversário |
| texto | gerado por `sumoController(scenario)` | subconjunto e API de `specs/001-arena/contracts/controllers.md`; ≤ 8.000 caracteres, ≤ 500 nós (1.000 desde a feature 004), profundidade ≤ 40 |

## Ciclo de vida

1. `Session.load(mundo)` com cenário de sumô válido → cada robô recebe o programa padrão de sumô.
2. `applyController(fonte)` → substitui apenas o programa do robô selecionado.
3. `reset()` → preserva os programas atuais (contrato 001).
4. Carregar outro mundo → programas voltam ao padrão do novo mundo (sumô ou genérico).
5. Replay → não executa programas; nada muda.
