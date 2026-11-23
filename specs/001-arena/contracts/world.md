# Contrato de mundo JSON v1

Referências: FR-001/002/003/007, NFR-001. Ler junto do algoritmo em plan.md.

| Campo | Tipo / restrição | Default |
| --- | --- | --- |
| name | string, exibida com até 80 caracteres | Arena |
| width, height | número finito, 1 a 50 metros | obrigatório |
| dt | número finito, 0,001 a 0,1 segundos | 0,05 |
| seed | inteiro unsigned 32 (0 a 4.294.967.295); 0 vira 1 no PRNG | 42 |
| obstacles | array de 0 a 100 retângulos | obrigatório |
| obstacles[].x/y | canto inferior esquerdo dentro do mapa | obrigatório |
| obstacles[].width/height | número ≥0,001; retângulo inteiro dentro do mapa | obrigatório |
| robots | array de 1 a 8 robôs | obrigatório |
| robots[].id | único, regex `^[a-zA-Z0-9_-]{1,24}$` | obrigatório |
| robots[].x/y | centro do robô, inteiramente dentro do mapa | obrigatório |
| robots[].theta | número finito, -π a π rad | 0 |
| robots[].radius | 0,1 a 1 m | 0,25 |
| robots[].maxLinear | 0,01 a 3 m/s, módulo de v limitado por este valor | 1 |
| robots[].maxAngular | 0,01 a 10 rad/s, módulo de w limitado por este valor | 3 |
| robots[].mass | 0,1 a 10 kg (feature 003) | 1 |
| robots[].grip | 0,1 a 10, aderência longitudinal ×m·g (feature 003) | 6 |
| robots[].lateralGrip | 0,1 a 10, aderência lateral ×m·g (feature 003) | 3 |
| robots[].laser.rays | inteiro 1 a 64 | obrigatório |
| robots[].laser.range | 0,1 a 50 m | obrigatório |
| robots[].laser.fov | 0 a 2π rad | obrigatório |
| scenario | opcional (omitir = mundo genérico; `null` é inválido), interpretado pela sessão; núcleo ignora. Tipos: `sumo` (regras de ringue) e `labirinto` (feature 006: programa de seguir parede, sem regras) | nenhum |

Exemplos completos versionados: `worlds/sumo.json`, `worlds/labirinto.json`, `worlds/livre.json`. O sumô exige exatamente dois robôs e `scenario: {type:"sumo",x:6,y:4.5,radius:3.5,maxTicks:1200}`. Círculo deve caber no mapa e robôs iniciar inteiramente nele. Sem cenário, não há vitória/empate automático.

Robôs não podem sobrepor obstáculos, bordas ou outros robôs inicialmente. Tangência é permitida. Campos desconhecidos do mundo/robô são ignorados. Importação textual até 200.000 caracteres; UI também verifica 200.000 bytes de arquivo. Valores NaN/Infinity e números como strings são inválidos. Erros começam com `Mundo inválido:` e identificam campo/posição da lista. Arquivo inválido não substitui sessão ativa. Erros da modalidade começam com `Sumô:`.

Laser sai do centro, inclusive para obstáculos e outros robôs, e não da carenagem. Array em ordem de -FOV/2 a +FOV/2, incluindo extremidades; N=1 é frontal. Ringue pintado não é objeto físico nem é detectado pelo laser. Odometria é ideal, sem deriva: pose absoluta e distância acumulada pelo caminho aceito. Bumper é true se houve movimento bloqueado — força de contato com parede, obstáculo ou robô — em qualquer subpasso do último tick; apenas encostar não liga (specs/005-bumper-contact-fix/contracts/bumper.md).

Convenções numéricas: saída do ringue usa epsilon 1e-10; direções de raio com componente absoluta <1e-12 são paralelas ao respectivo eixo. Desde a feature 003 há massa, aderência e empurrão entre robôs; paredes e obstáculos são rígidos; ao fim do tick não há sobreposição maior que 1e-6 m. Aceite de posição em movimento livre: tolerância 1 cm. Detalhes em specs/003-robot-dynamics/contracts/dynamics.md.

## Contrato headless

`new Simulation(world, sourcesPorId?)`, com `world` objeto ou texto JSON (mesmo limite e erros da importação textual); `step()` avança exatamente dt e retorna snapshot; `reset()` zera tick/seed/distância/contato preservando programas; `setController(id, source)` valida antes de substituir; `snapshot()` retorna clone `{tick,time,robots}`. `time=tick*dt`. Cada robô do snapshot contém os campos normalizados do mundo mais `{distance,bumper,v,w,scan}`. Poses e leituras são pós-movimento. Sem comando no tick, velocidade zero. Subpassos por tick: no mínimo 10, com deslocamento ≤ raio mínimo/4 (feature 003).

Não usar propriedades internas mutáveis de Simulation como API de controlador. Runner CLI recebe caminho de mundo e N ticks, imprime snapshot JSON, erro legível com exit 1 se entrada inválida. Regras esportivas são da Session (contracts/session.md); runner Simulation executa núcleo genérico.
