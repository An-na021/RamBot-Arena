# Contrato — modalidade labirinto v1

Complementa `specs/001-arena/contracts/world.md` e `specs/001-arena/contracts/session.md`.

## `src/modes/maze.js`

- `parseMaze(config)` → `{type: 'labirinto'}` quando `config.type === 'labirinto'`; senão erro `Labirinto: modalidade inválida`.
- `mazeController()` → texto do programa de seguir parede pela direita (research.md R1), válido no subconjunto e nos limites do controlador.

## Session

- `load(world)` / `importReplay(input)`: `scenario.type === 'labirinto'` → `parseMaze`; caso contrário, `parseSumo` (inalterado).
- Labirinto: todo robô recebe `mazeController()`; `result` = `null`; sem pausa automática.
- `world` inclui `scenario: {type: 'labirinto'}`, então Editar JSON e gravações preservam a modalidade.

## Interface

Ringue e aviso de contatos aparecem somente quando `scenario.type === 'sumo'`.

## Mundo de exemplo

`worlds/labirinto.json` ganha `"scenario": {"type": "labirinto"}`.
