# Contrato — bumper v3

Substitui a frase de bumper em `specs/003-robot-dynamics/contracts/dynamics.md` e reafirma `specs/001-arena/contracts/world.md`:

> Bumper é `true` se houve **força de contato** no último tick — bater, empurrar, ser empurrado ou travar contra parede, obstáculo ou robô — ou correção de sobreposição maior que 1e-6 m. Apenas encostar (girar no lugar, andar paralelo sem pressionar) não liga o bumper.

`readBumper()` continua devolvendo o bumper do tick anterior.
