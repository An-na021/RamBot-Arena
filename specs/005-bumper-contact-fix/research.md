# Research — 005-bumper-contact-fix

Data: 2026-11-23. Protótipo em cópia isolada de `src/core/simulation.js` (scratchpad).

## R1. Causa

Na 003, o bumper liga se o contato teve impulso (`acc > 0`) **ou** se a folga é ≤ 1e-9 m (encostado), e também em qualquer correção de sobreposição. Robô encostado girando no lugar mantém folga zero → bumper sempre ligado → programa genérico (`readBumper() → setSpeed(0, 1.6)`) gira para sempre. Rastreamento no campo livre: a partir do tick ~350 o robô fica em x = 11,720 com velocidade 0 e bumper ligado até o fim.

## R2. Decisão

- **Decision**: bumper liga somente quando (a) o impulso acumulado do contato no subpasso é > 1e-9 N·s (houve força), ou (b) a correção posicional remove sobreposição > 1e-6 m. Encostar sem força não liga.
- **Rationale**: corresponde a "movimento bloqueado"/"bater, empurrar, ser empurrado" (FR-001/002); os limiares descartam ruído numérico (FR-003).
- **Alternatives considered**: bumper por "velocidade normal negativa antes do solver" — equivalente na maioria dos casos, mas não captura ser empurrado estando parado.

## R3. Medições do protótipo (60 s, programas padrão)

| Mundo | Antes | Depois |
| --- | --- | --- |
| Campo livre: distância / parado / bumper | 10,2 m / 74% / 73% | 36,4 m / 7% / 1% |
| Labirinto sheep-01: distância / parado | 1,7 m / 96% | 34,5 m / 12% |
| Labirinto sheep-02: distância / parado | 4,4 m / 89% | 34,5 m / 12% |
| Sumô seeds 1–10 com vencedor | 6/10 | 6/10 |
| Penetração máx. em 5.000 ticks de labirinto | — | 6,7e-16 m |
