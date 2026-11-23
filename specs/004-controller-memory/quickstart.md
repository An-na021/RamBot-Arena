# Quickstart — validar 004-controller-memory

## Automatizado

`npm run check` — testes `004` cobrem SC-001 a SC-004; cobertura ≥80%; build; rastreabilidade.

## Manual (navegador)

1. `npm run dev`; dojô carregado; Iniciar sem alterar programas.
2. Esperado: os robôs abrem em curva, se chocam, recuam, contornam e se empurram; em várias seeds um deles é empurrado para fora (o dojô padrão usa seed 3: sheep-01 vence por empurrão aos ~14 s; troque `seed` no editor JSON para outras lutas).
3. Programa de teste da memória em um robô: `remember(0, memory(0) + 1); setSpeed(memory(0) > 20 ? 0 : 0.5, 0);` — anda ~1 s e para; Reset recomeça.
4. Erro: `remember(16, 1);` → mensagem `Controlador:` e simulação pausada.
