# Contrato de Session e modalidade sumô v1

FR-005/008/009/010. Esclarecimento de 2026-11-23 (spec.md, Clarifications). Session orquestra Simulation, gravação/replay e a regra de modalidade; Simulation continua sem conhecer modalidades. Geometria interna, renderer e app são detalhes de implementação, sem contrato de nomes.

## `src/core/session.js` — `class Session`

| Membro | Contrato |
| --- | --- |
| `new Session(world)` | Igual a `load(world)`. |
| `load(world)` | Objeto ou texto JSON. Valida mundo e cenário antes de trocar; falha não altera a sessão ativa. Com cenário de sumô, todo robô recebe `sumoController(scenario)` (feature 002); sem cenário, o programa padrão genérico. Zera gravação/replay, pausa e seleciona o primeiro robô. |
| `world` (getter) | Mundo normalizado ativo; inclui `scenario` normalizado quando houver. Em replay, o mundo da gravação. |
| `state` (getter) | Clone do snapshot atual (`{tick,time,robots}`); em replay, o frame do cursor. |
| `result` (getter) | `null` sem cenário; senão `sumoResult(scenario, state)`. |
| `running`, `selected`, `replay`, `cursor`, `recording`, `notice` | Estado observável: execução, ID do robô selecionado, gravação importada ou `null`, índice do frame, captura em andamento ou `null`, última mensagem de limite/resultado. |
| `play()` / `pause()` | Liga/desliga `running`. `play` não liga se o resultado ao vivo já terminou. |
| `step()` | Ao vivo: se o resultado já terminou, apenas pausa e retorna `state` sem avançar; senão um tick de Simulation; grava frame se capturando; pausa ao terminar o sumô; erro de controlador pausa e propaga sem avançar. Em replay: próximo frame, pausa no último. Retorna `state`. |
| `reset()` | Pausa; ao vivo reinicia Simulation; em replay volta ao frame 0; cancela captura em andamento. |
| `startRecording()` | Erro em replay (mensagem contém "replay"). Reseta e grava frame 0. No limite de 5.000 ticks a captura termina: `recording` vira `null`, `notice` contém "5.000" e a gravação concluída fica disponível para `stopRecording()`; a simulação continua sem gravar. |
| `stopRecording()` | Finaliza captura e retorna clone `{version:1,world,frames}` ou `null` sem gravação. |
| `importReplay(input)` | Objeto ou texto; valida (contracts/replay.md) e o cenário antes de entrar em replay. |
| `seek(tick)` | Inteiro dentro dos frames; senão `Replay: tick fora da gravação`. Pausa. |
| `exitReplay()` | Sai do replay e reseta a simulação original. |
| `applyController(source)` | Compila para o robô `selected`; erro em replay (mensagem contém "replay") ou durante captura (contém "gravação"). Erro de compilação preserva o programa anterior. |

## Modalidade labirinto

`scenario.type === 'labirinto'` é despachado para `src/modes/maze.js` (specs/006-maze-wall-follow/contracts/maze.md): robôs recebem `mazeController()`, `result` é `null`, sem pausa automática. Demais valores seguem `parseSumo`.

## `src/modes/sumo.js`

- `parseSumo(config, world)` → `null` somente se `config === undefined` (campo ausente); `null`, outro `type` ou valores inválidos lançam erro; senão `{type:'sumo',x,y,radius,maxTicks}`. Erros começam com `Sumô:`: tipo, exatamente dois robôs, círculo dentro do mapa, `maxTicks` inteiro de 1 a 10.000, robôs iniciando inteiramente no ringue.
- `sumoController(scenario)` → texto do programa padrão de sumô (contrato em specs/002-sumo-default-strategy/contracts/default-controller.md).
- `sumoResult(scenario, state)` → `null` sem cenário; senão `{finished, winner, reason}`. Ordem de avaliação e motivos exatos:
  1. Os dois fora: `{finished:true, winner:null, reason:'Saída simultânea: empate'}`.
  2. Um fora: `{finished:true, winner:<id do outro>, reason:'<id> venceu: adversário fora do ringue'}`.
  3. `tick >= maxTicks`: `{finished:true, winner:null, reason:'Tempo limite: empate'}`.
  4. Caso contrário: `{finished:false, winner:null, reason:'Combate em andamento'}`.

"Fora" = distância do centro do robô ao centro do ringue menos raio do robô > raio do ringue + 1e-10.
