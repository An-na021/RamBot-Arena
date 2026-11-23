# Research — 006-maze-wall-follow

Data: 2026-11-23. Protótipo sobre o núcleo atual (dinâmica 003 + bumper corrigido 005), sem alterar `src/`.

## R1. Seguidor de parede pela direita

- **Decision**: usar o raio mais à direita do laser (`scan[0]`, −90° com FOV 180°), o raio a −45° (`scan[mid−2]`) e o frontal (`scan[mid]`). Prioridades por tick:
  1. Frontal < 0,75 m ou diagonal direita < 0,55 m → gira à esquerda no lugar (v 0, w 2).
  2. Direita > 1,5 m e diagonal > 1,8 m (perdeu a parede: fim de parede ou canto) → curva à direita (v 0,35, w −1,6).
  3. Senão segue a parede: v 0,7 e w = −2,5 × (direita − 0,7), limitado a ±1,5.
- **Rationale**: regra da mão direita clássica de micromouse; sem memória e sem coordenadas do mundo (FR-003/FR-004, edge case de labirintos diferentes). Programa com ~550 caracteres.
- **Alternatives considered**: desvio genérico (não atravessa: R3); seguidor com distância 0,6 m e limiar 1,2–1,3 m (fica preso no 1º corredor, girando entre parede e piso).

## R2. Sensibilidade

| Limiar "perdi a parede" | Labirinto padrão (s01/s02) | Espelhado | Paredes em outras posições |
| --- | --- | --- | --- |
| 1,3 m | ✗ / ✗ | ✗ / ✗ | ✗ / ✗ |
| 1,4 m (v 0,6) | 66 s / 59 s | 65 / 73 s | 57 / 56 s |
| **1,5 m (v 0,7) — escolhido** | **53 s / 46 s** | **51 / 59 s** | **44 / 44 s** |
| 1,6 m (v 0,6) | 66 s / 54 s | 65 / 69 s | 52 / 52 s |

Tempo até cada robô passar pelos 4 corredores (3 no labirinto "largo"). Distância 0,65–0,75 m não altera o resultado; o limiar é o parâmetro crítico, por isso o valor escolhido fica no meio da faixa que funciona.

## R3. Linha de base

Desvio genérico, 250 s: sheep-01 só no corredor A, sheep-02 só em C/D — igual na versão cinemática (antes da 003).

## R4. Marcação da modalidade

- **Decision**: `scenario: {"type": "labirinto"}` no mundo; módulo `src/modes/maze.js` com `parseMaze` e `mazeController`; `Session` despacha pelo `type` (`labirinto` → labirinto; demais → validação de sumô, como antes). Sem regras: `result` = `null`. Renderer desenha o ringue só para `type: "sumo"`; o aviso de sumô na interface também.
- **Rationale**: mesmo padrão do sumô (constitution II/III); mundos sem `scenario` continuam genéricos (FR-005).
