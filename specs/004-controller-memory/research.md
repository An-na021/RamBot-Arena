# Research — 004-controller-memory

Data: 2026-11-23. Protótipo em cópia isolada do interpretador e da Simulation (fora de `src/`), dojô padrão, seeds 1–10, dinâmica da feature 003.

## R1. Forma da API de memória

- **Decision**: duas funções novas na API: `memory(i)` devolve o número guardado na posição `i`; `remember(i, valor)` grava. `i` inteiro de 0 a 15; valor número finito. Memória começa em 0.
- **Rationale**: o subconjunto não tem atribuição nem strings (FR-002); chamadas de função já são aceitas pelo validador de AST, então nada muda na gramática. Índices numéricos evitam strings.
- **Alternatives considered**: objeto `mem.x` (exigiria atribuição a propriedade); variáveis persistentes `let` (mudaria a semântica de escopo por tick do contrato 001); chaves por texto (strings proibidas).

## R2. Atomicidade e ciclo de vida

- **Decision**: a cada tick, a Simulation trabalha numa cópia da memória de todos os robôs; só substitui a memória oficial se todos os controladores terminarem sem erro (mesmo mecanismo do PRNG). `reset()` e construção zeram tudo; `setController(id)` zera só aquele robô. Memória não entra em snapshot, mundo nem replay.
- **Rationale**: FR-003/FR-004; reaproveita a regra existente "erro aborta tick inteiro sem alterar poses, tick ou PRNG".

## R3. Limites do programa

- **Decision**: elevar o limite de nós da AST de 500 para 1.000 e o orçamento de avaliações de 500 para 1.000; manter 8.000 caracteres e profundidade 40.
- **Rationale**: a estratégia com fases (abertura, ataque, recuo, flanco, rastreamento) tem ~1.850 caracteres e excede 500 nós. Sem laços, cada nó é avaliado no máximo uma vez, então o custo por tick continua limitado e previsível; 1.000 nós ainda é ordem de microssegundos por robô.
- **Alternatives considered**: manter 500 e simplificar a estratégia — testado: versões que cabem em 500 nós chegaram a no máximo 1/10 vitórias.

## R4. Estratégia padrão de sumô com memória

Posições usadas: 0 fase, 1 contador da fase, 2 ticks travado, 3 lado do flanco, 4 duração do recuo, 5 odometria anterior, 6 idade da luta, 7 lado da abertura, 8 duração da abertura.

- **Decision** (ordem de prioridade):
  1. Abertura: no 1º tick sorteia lado e duração (3 + até 6 ticks); enquanto dura e sem contato, avança em curva (v 1, w ±3) para chegar de lado.
  2. Recuo (fase 1): ré a 0,8 m/s pela duração sorteada (4 + até 10 ticks); depois flanco.
  3. Flanco (fase 2): 8 ticks em curva (v 0,9, w ±2,2) para o lado sorteado.
  4. Travado: contato + adversário à frente + menos de 1 cm de avanço no tick por mais de 8 ticks → sorteia lado e duração e entra em recuo. Empurrão que avança não conta como travado.
  5. Adversário à frente dentro do ringue → empurra a 1 m/s.
  6. Contato ou leitura lateral < 1 m → gira para o lado com a menor leitura lateral (v 0,3, w ±3).
  7. Livre, perto da borda e virado para fora → gira de volta.
  8. Busca em arco.
- **Rationale**: robôs iguais partem simétricos em relação ao centro; só `random()` quebra a simetria, e por isso os sorteios definem tempos e lados. Detectar travamento pela odometria evita abandonar um empurrão que está funcionando.
- **Resultados do protótipo** (seeds 1–10, programas iguais): **6/10 com vencedor** (ticks 264–830), todas com contato no último segundo (SC-001, SC-002). Variações vizinhas: 2–4/10. Sem memória (feature 003): 0/10.
