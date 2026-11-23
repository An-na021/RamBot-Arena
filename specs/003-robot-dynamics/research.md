# Research — 003-robot-dynamics

Data: 2026-11-23. Protótipo isolado (fora de `src/`) reaproveitando `parseWorld`, `laser` e o interpretador de controlador; mundo `worlds/sumo.json`.

## R1. Modelo de movimento

- **Decision**: velocidade real por robô (vx, vy, ω). Por subpasso h: motor longitudinal persegue `v` com força limitada por aderência `grip·m·g` e por curva de torque de motor CC (força de tração cai linearmente até zero em 2×`maxLinear`; frenagem/inversão usa força cheia); atrito lateral das rodas leva a velocidade lateral a zero com força até `lateralGrip·m·g`; ω persegue `w` com aceleração angular até 200 rad/s². Paredes/obstáculos rígidos (massa infinita).
- **Rationale**: com aderência padrão 6 (robô de sumô com ímã), a reta 1 m/s × 20 ticks termina em 0,9934 m (erro 6,6 mm < 1 cm, SC-008); arco analítico difere < 1 mm. A curva de torque é o que faz o empurrão frontal contra robô freado travar: sem ela, os dois seguiam juntos a 0,4 m/s indefinidamente (forças iguais, momento conservado).
- **Alternatives considered**: servo de velocidade sem curva de torque (empurrador sempre vence robô freado — irreal); aceleração realista 1 g (erro 6 cm na reta — rejeitada pelo usuário, Clarification); motor de física pronto (proibido pelo briefing).

## R2. Contato e solver

- **Decision**: solver iterativo de impulsos sequenciais (10 iterações por subpasso, ordem fixa), resolvendo juntos motor longitudinal, atrito lateral e restrições de não penetração robô–robô e robô–parede, com contato especulativo (folga 0,05 m: permite aproximar até encostar no subpasso). Depois da integração, correção posicional de sobreposição residual dividida pelo inverso das massas. Subpassos: no mínimo 10 por tick e deslocamento ≤ raio mínimo/4.
- **Rationale**: resolver motor e contato em sequência simples gerava empurrão indevido; o solver iterativo produz travamento exato com forças iguais (SC-002: robôs parados a 5,72/6,28 m) e respeita limites de força. Determinístico: só aritmética, ordem fixa de corpos e iterações.
- **Alternatives considered**: impulso único por par (sem limites de força) e correção posicional pura (cinemática disfarçada).

## R3. Medições do protótipo

| Critério | Resultado |
| --- | --- |
| SC-001 empurrão lateral, mesma massa | vitória no tick 111 (5,6 s) |
| SC-002 frente a frente, mesmo comando | parados no ponto de encontro (Δ < 1 mm) por 7 s |
| Frontal contra robô freado | trava: deslocamento 2,9 cm |
| SC-003 massa 1 vs 2, empurrão lateral 3 s | 0,546 m vs 0,027 m |
| Parede de 1 mm a 2 m/s | para em x = 5,75 (contato exato), bumper |
| SC-008 reta 1 m/s × 20 ticks | 0,9934 m |
| SC-004 estratégia padrão, 10 seeds | **0 vitórias** em todas as variantes testadas |

## R4. SC-004 não atingido — causas e opções

- **Achado**: com dinâmica real, robôs iguais e programas iguais se equilibram, como no sumô físico. Foram testadas 15+ variantes (recuo aleatório, pivô, flanco por "personalidade" com mão diferente por robô, pressão com raios laterais, borda só sem contato). Houve lutas com empurrões de mais de 1 m, mas nenhum robô saiu do ringue: a distância máxima ao centro ficou em ~2 m (ringue 3,5 m).
- **Causas**: (1) corpos circulares — empurrar círculo com círculo é instável, o adversário escorrega para o lado e sai do raio frontal; robôs reais têm frente reta/rampa; (2) o controlador não guarda estado entre ticks, impedindo táticas de várias etapas; (3) o limite de 500 nós barra o rastreamento com vários raios (variante com 4 raios extras excedeu o orçamento).
- **Decision**: implementar a física (todos os demais SC) e a estratégia padrão revisada para lutas com empurrão contínuo (ataque a 1 m/s; regra de borda só sem contato). SC-004 fica registrado como não atendido e volta ao usuário com as opções: frente reta no robô, memória no controlador, ou rebaixar SC-004.

## Atualização — feature 004 (2026-11-23)

SC-004 fechado pela feature 004-controller-memory: com memória no controlador e limite de 1.000 nós, a estratégia padrão com fases obtém 6/10 seeds com vencedor por empurrão.
