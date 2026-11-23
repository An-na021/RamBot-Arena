# Research — 001-arena

Consolidação das decisões técnicas da feature base (antes espalhadas em requirements.md, plan.md manual e references.md), no formato do `/speckit-plan`. Estado atual após as features 002–006.

## R1. Formato do mundo

- **Decision**: JSON apenas, validado e normalizado antes de substituir o mundo ativo; contrato em contracts/world.md.
- **Rationale**: uma opção satisfaz o briefing ("YAML ou JSON") e simplifica validação e mensagens de erro por campo.
- **Alternatives considered**: YAML (exigiria dependência extra de parsing sem ganho para o aceite).

## R2. Unidades, eixos e formas

- **Decision**: SI; plano x/y, θ anti-horário com zero em +x; robôs circulares; obstáculos retangulares alinhados aos eixos. Render mapeia (x, y) → (x, altura, −y).
- **Rationale**: colisão e raycast verificáveis analiticamente; escopo de PoC.

## R3. Movimento e colisão

- **Decision**: dinâmica 2D própria (feature 003): `setSpeed` é velocidade-alvo; motor com aderência e curva de torque, atrito lateral, impulso entre robôs, paredes rígidas; solver iterativo em ≥ 10 subpassos por tick. Detalhes em specs/003-robot-dynamics/research.md.
- **Rationale**: briefing exige cinemática e colisão próprias, sem motor pronto; a constitution 2.0.0 adotou empurrão a pedido do usuário. Movimento livre fica a < 1 cm da cinemática ideal (aceite do briefing).
- **Alternatives considered**: cinemática com contato bloqueante (versão de 2026-11-18, em history/); motor de física pronto (proibido).

## R4. Sensores

- **Decision**: laser sai do centro; N raios de −FOV/2 a +FOV/2 (raio único à frente), contra bordas, retângulos e outros robôs, limitado ao alcance; odometria ideal; bumper = força de contato no tick (feature 005). Leituras do estado do início do tick para todos os controladores.
- **Rationale**: remove dependência da ordem dos controladores; leituras verificáveis analiticamente.

## R5. Controlador

- **Decision**: subconjunto de JS interpretado por AST (Acorn) com lista de nós permitidos, sem eval, laços ou funções do usuário; API `readLaser`, `readOdometry`, `readBumper`, `setSpeed`, `random` (PRNG xorshift32 semeado), `memory`/`remember` (feature 004); limites 8.000 caracteres, 1.000 nós, profundidade 40, 1.000 avaliações. Erro aborta o tick inteiro (poses, tick, PRNG, memória).
- **Rationale**: programa defeituoso não trava o navegador; determinismo garantido.
- **Alternatives considered**: `new Function`/eval (inseguro e não limitável); Web Worker com timeout (não determinístico).

## R6. Tempo real versus passo

- **Decision**: dt fixo (padrão 0,05 s); a interface só agenda ticks, acumulando tempo de quadro com teto de 0,25 s.
- **Rationale**: FPS não altera a física; reprodutibilidade.

## R7. Gravação e replay

- **Decision**: captura começa no frame 0 após reset; até 5.000 ticks; exportação/importação JSON validada estruturalmente; replay não executa programas. Contrato em contracts/replay.md.

## R8. Modalidades

- **Decision**: regras e programas padrão ficam em `src/modes/` (sumô: ringue, vitória/empate, estratégia com memória; labirinto: seguir parede, sem regras); `Simulation` desconhece modalidades.
- **Rationale**: constitution II/III — núcleo genérico.

## R9. Referências

Oito referências pesquisadas em references.md (Stage → núcleo leve; Gazebo → cena e inspeção; Webots → mundo/controlador e determinismo; Roboton → sumô; Gears, Open Roberta, sBotics, Thayane → fluxo educacional). Nenhum código ou motor dessas plataformas é usado.

## R10. Limites da PoC

Até 8 robôs, 100 obstáculos, 64 raios por robô, 5.000 ticks gravados, replay até 100.000.000 bytes, mundo até 200.000 caracteres.
