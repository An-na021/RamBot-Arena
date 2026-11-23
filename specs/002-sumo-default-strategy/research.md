# Research — 002-sumo-default-strategy

Data: 2026-11-23. Protótipo executado sobre o núcleo atual (sem alterá-lo), com o mundo `worlds/sumo.json`.

## R1. Como saber se o robô está "virado para fora" sem trigonometria

- **Decision**: estimar cos(θ) e sen(θ) com a aproximação de Bhaskara I, só com aritmética e ternários: para x ∈ [0, π/2], cos(x) ≈ (π² − 4x²)/(π² + x²); para |θ| > π/2 usa-se cos(θ) = −cos(π − |θ|); sen(θ) = sinal(θ)·cos(|π/2 − |θ||). "Para fora" = produto escalar entre (dx, dy) do centro do ringue ao robô e (cos θ, sen θ) maior que zero.
- **Rationale**: o subconjunto do controlador não tem `Math`, funções nem laços; a aproximação tem erro máximo ≈ 0,002, desprezível para decidir borda. Não muda a API (FR-007).
- **Alternatives considered**: nova função de API (`readHeading`/`readRing`) — rejeitada por alterar o contrato do controlador; sensor de linha — fora do escopo escolhido pelo usuário; série de Taylor — mais nós e pior erro perto de π/2.

## R2. Distinguir adversário de borda do mapa no laser

- **Decision**: usar o raio frontal (índice central; para número par, o primeiro após o centro). Calcular o ponto atingido (dx + f·cos θ, dy + f·sen θ) em relação ao centro do ringue; é adversário se a distância ao centro for menor que (raio − 0,05). Comparação feita com quadrados, sem raiz.
- **Rationale**: as bordas do mapa ficam fora do ringue em todos os mundos válidos de sumô (o ringue cabe no mapa); leitura no alcance máximo sem obstáculo também cai fora ou é tratada como "não visto".
- **Alternatives considered**: limiar fixo de distância — falha porque a parede pode estar a menos de 1 m do ringue no eixo y do dojô padrão.

## R3. Regras de decisão e parâmetros

- **Decision**, em ordem de prioridade:
  1. Se distância² ao centro > (R − 0,6)² e virado para fora → girar no lugar (v = 0, w = 2,5).
  2. Senão, se adversário visto à frente → avançar (v = 0,8, w = 0).
  3. Senão → procurar em arco (v = 0,25, w = 1,4).
- **Rationale**: no protótipo, dojô padrão por 1.200 ticks: nenhum robô sai, contato no tick 24 (1,2 s) para os dois, resultado "Tempo limite: empate" (SC-001, SC-002). Robô a 0,3 m da borda virado para fora em 4 ângulos (0; 0,5; −1; 2,5 rad): não sai em 200 ticks (SC-003). Ringue de raio 3 e lasers de 1 e 8 raios: sem saída, empate por tempo. Fonte com 783 caracteres, compila dentro dos limites de nós e profundidade.
- **Alternatives considered**: recuar ao sentir o bumper com ângulo aleatório (`random()`) — testado: ~900 batidas de 1 tick e robôs "tremendo" no centro, sem ganho de realismo; rejeitado. Margem de borda 0,3 m — menos folga para o arco de giro.

## R4. Onde o programa é gerado e atribuído

- **Decision**: `src/modes/sumo.js` exporta `sumoController(scenario)` que devolve o texto do programa com centro e limiares do cenário embutidos como literais numéricos. `Session.load` atribui esse texto a todos os robôs quando há cenário de sumô (na carga ainda não existe programa próprio). `Simulation` não muda.
- **Rationale**: mantém regras da modalidade fora do núcleo (Princípio II/III); o texto aparece no editor e pode ser editado (FR-002); Reset preserva programas, como já contratado.
- **Alternatives considered**: guardar o programa em `worlds/sumo.json` — o contrato de mundo não tem campo de programa; constante única com valores fixos — viola FR-006.

## R5. Sem empurrão

- **Decision**: manter colisão bloqueante; o confronto padrão termina em empate por tempo, documentado como esperado.
- **Rationale**: Princípio III; vitória continua demonstrável com programas próprios (roteiro do pitch).
