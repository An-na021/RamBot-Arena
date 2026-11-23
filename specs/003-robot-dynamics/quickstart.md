# Quickstart — validar 003-robot-dynamics

## Automatizado

1. `npm run check` — suíte completa (testes `003` cobrem SC-001..SC-003, SC-005, SC-006, SC-008), cobertura ≥80%, build, rastreabilidade.
2. `npm run headless -- worlds/livre.json 20` — continua funcionando; pose difere da cinemática ideal em milímetros.

## Manual (navegador)

1. `npm run dev`; dojô carregado.
2. Iniciar: os robôs avançam, se chocam, se empurram e circulam; o adversário pode ser deslocado.
3. sheep-01 `setSpeed(0.8,0);` e sheep-02 com theta virado de lado (editar JSON: `"theta": 1.5708`) e `setSpeed(0,0);`: sheep-01 empurra sheep-02 para fora (~5 s).
4. Ambos `setSpeed(0.8,0);` de frente: travam no centro.
5. Labirinto: robôs não atravessam paredes.
