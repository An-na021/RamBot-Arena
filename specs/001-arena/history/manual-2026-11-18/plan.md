# Implementation Plan — 001-arena

Data: 2026-11-18. Spec: spec.md. Framework: GitHub SpecKit. Artefatos da baseline escritos manualmente com templates oficiais; em 2026-11-23 a CLI `specify` 1.4.4 foi instalada e inicializada (`--integration claude`), sem regenerar spec/plan/tasks.

## Summary / Technical Context

SPA local e estática: JavaScript ESM, Vite 6, Three.js 0.180, Acorn 8, Vitest 3 com V8 e jsdom; Node 22. JSON é o formato do mundo. Versões exatas no package-lock. Sem banco, serviços remotos ou motor de física.

## Constitution Check

Antes de implementar: documentos escritos primeiro; core sem DOM/Three; JS interpretado com orçamento; todos os arquivos de src entram na cobertura; sem bônus antes do completo. Depois: executar `npm run check`, registrar resultado em validation.md, revisar tasks e rastreabilidade. Qualquer falha mantém task aberta.

## Project Structure

`src/core/world.js` valida/normaliza entradas; `geometry.js` interseções; `controller.js` interpreta JS limitado; `simulation.js` atualiza estado; `recording.js` valida gravações; `session.js` controla modos; `src/renderer.js` desenha snapshots com Three; `src/app.js` liga DOM à sessão. `worlds/` contém exemplos; `tests/` contém aceite/core e adaptadores; `scripts/` executa headless, métricas e verificação de IDs. Nenhum módulo core importa renderer ou app.

`src/modes/sumo.js` contém validação do cenário e função pura de resultado (API e motivos exatos em contracts/session.md); Session orquestra essa regra, Simulation desconhece modalidades. Cenário `{type:'sumo', x:6, y:4.5, radius:3.5, maxTicks:1200}`. Exatamente dois robôs devem começar inteiramente dentro do círculo. Saída quando distância do centro do robô ao centro do ringue menos raio do robô > raio do ringue + 1e-10. Ambos fora → empate; um fora → outro vence; caso contrário tick ≥ maxTicks → empate. A marcação não interfere no laser/colisão; bordas externas do mapa continuam sólidas. Contatos bloqueantes: sem empurrões. Mundo padrão sumo.json; labirinto/livre comprovam generalidade.

## Referências que fundamentam as escolhas

Pesquisa rastreável em references.md: Stage → núcleo leve; Gazebo → cena/inspector/transporte/laser; Webots → mundo/controlador e determinismo; Roboton → modalidade; Gears/Open Roberta/sBotics/Thayane → fluxo educacional, editor, mundos e observação. Restrições do briefing prevalecem sobre as referências: nenhum motor de física, ruído não semeado ou importação de código dessas plataformas.

## Algoritmo e determinismo

Unidades SI. Plano x/y, theta anti-horário, zero aponta +x. Render mapeia (x,y) para (x,altura,-y). dt ∈[0,001;0,1], default 0,05. Robôs circulares; obstáculos AABB. Tração: para w≈0, x+=v cos(theta)dt; y+=v sin(theta)dt; caso contrário arco exato: x+=(v/w)(sin(theta+w dt)-sin(theta)), y-=(v/w)(cos(theta+w dt)-cos(theta)). Theta normalizado por atan2(sin,cos).

Controladores recebem snapshot do início do tick. PRNG xorshift32 usa seed unsigned 32; seed zero normalizada para 1. Velocidades comandadas limitadas por maxLinear/maxAngular. **Desde a feature 003 (constitution 2.0.0)** o movimento é dinâmico: `setSpeed` é velocidade-alvo; motor com aderência e curva de torque, atrito lateral, impulso entre robôs e paredes rígidas, resolvidos por solver iterativo em subpassos fixos — algoritmo e constantes em specs/003-robot-dynamics/research.md e contracts/dynamics.md. Bumper indica qualquer contato no tick; odometria acumula o caminho efetivamente percorrido.

Laser sai do centro; N raios igualmente espaçados no FOV, de -FOV/2 a +FOV/2; raio único em theta. Inclui bordas, retângulos e outros círculos; menor distância não negativa, limitada ao range. Laser/odometria/bumper finais recalculados após movimento. Erro de controlador aborta tick atomicamente, inclusive PRNG.

## Controle, gravação e interface

Interpretador Acorn: ver contrato controllers.md; proibir qualquer AST fora da lista e limitar tamanho/expressões. Sem eval. `Session` possui modos live/replay, running boolean, seleção, gravação limitada a 5.000 ticks. Frames são clones; replay valida formato e não avalia programas. dt fixo; RAF acumula tempo com teto de 0,25 s por frame para recuperação estável, nunca dt variável.

Layout escuro de laboratório, arena central, mundos/programa à esquerda, inspeção à direita, controles e timeline abaixo. Formulários acessíveis e responsivos, entrada JSON via arquivo ou editor, controlador por robô, erros em aria-live. Renderer atualiza pose/laser e descarta recursos ao reconstruir a arena. Gravação exportada por download local.

## Validação / riscos

Testes analíticos de reta/arco/laser, parede fina, colisão simultânea, atomicidade, PRNG, reset, replay corrompido; jsdom para eventos e render adaptado com driver WebGL substituído em teste. Cobertura inclui UI e renderer, mas testes do renderer não provam pixels reais. Fazer QA de navegador se infraestrutura disponível e registrar limites. Relatórios de V8: linhas/branches/funções/statements ≥80%. `npm run test:coverage` atualiza README; CI compara métricas rastreadas.

Não prometer equivalência com robô real nem reconstrução provada até executar experimento de regeneração independente. GitHub depende da conta/destino do grupo. Não inventar commits remotos ou aprovação humana.
