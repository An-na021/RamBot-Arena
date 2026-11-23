# Contrato de dinâmica v2

Substitui, na 001-arena, a regra de colisão bloqueante (`plan.md` "Algoritmo e determinismo", `contracts/world.md` convenções de contato) conforme constitution 2.0.0.

## Mundo (`specs/001-arena/contracts/world.md`)

Novos campos opcionais por robô: `mass`, `grip`, `lateralGrip` (ver data-model.md). Mundos antigos continuam válidos.

## Controlador (`specs/001-arena/contracts/controllers.md`)

API inalterada. `setSpeed(v, w)` define velocidade-alvo; a velocidade real pode ser menor (empurrado, travado, acelerando). `readOdometry()` continua devolvendo pose e `distance`.

## Simulation (headless)

- `new Simulation(world, sources?)`, `step()`, `reset()`, `snapshot()`, `setController()` inalterados.
- Por tick: controladores leem o estado do início do tick; comandos aplicados; n subpassos do modelo de R1/R2 (research.md); sensores recalculados ao fim.
- Garantias: sem sobreposição robô–parede/obstáculo/robô maior que 1e-6 m ao fim do tick; valores finitos; determinismo bit a bit para mesma entrada.
- Erro de controlador continua abortando o tick inteiro sem alterar estado ou PRNG.

## Replay (`specs/001-arena/contracts/replay.md`)

Frames aceitam `vx`, `vy`, `omega` numéricos finitos opcionais (0 se ausentes), para que replay e execução ao vivo exibam estados idênticos. Gravações antigas continuam válidas.

## Bumper

Regra vigente em specs/005-bumper-contact-fix/contracts/bumper.md: liga com força de contato ou sobreposição corrigida > 1e-6 m; encostar sem força não liga.

## Sumô

Regras e `sumoResult` inalterados. `sumoController` revisado: ataca a 1 m/s quando vê o adversário dentro do ringue; a regra de voltar da borda só vale sem contato.
