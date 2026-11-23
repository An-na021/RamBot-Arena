# Quickstart — validar 002-sumo-default-strategy

Pré-requisitos: Node 22+, `npm ci` executado.

## Automatizado

1. `npm run check` — suíte completa, cobertura ≥80% nas quatro métricas, build e rastreabilidade.
2. Os testes da feature têm `002` no nome e verificam SC-001 a SC-005 (ver spec.md).

## Manual (navegador)

1. `npm run dev` e abrir a URL local.
2. Dojô de sumô carregado por padrão. Selecionar cada robô: o editor mostra o programa padrão de sumô (com centro do ringue).
3. Clicar Iniciar sem alterar nada. Esperado: os robôs giram, se encontram em ~1 s e ficam frente a frente; nenhum sai do ringue; aos 60 s, "Tempo limite: empate".
4. Reset e Iniciar de novo: mesma trajetória.
5. Roteiro do pitch (sheep-01 `setSpeed(-1,0);`, sheep-02 `setSpeed(0,0);`): vitória de sheep-02 no tick 52 continua igual.
6. Trocar para Labirinto/Campo livre: robôs com o programa de desvio de antes.
