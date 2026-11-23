# Evidências e limites da entrega local

Data: 2026-11-18. Grupo: Anna Heloísa Malschitzky, William Fagundes e Sandriely Maciel. Ambiente local: Windows, Node 22.21.0, npm 10.9.4. Entrega publicada em `main`; branch local inicial `001-arena` preservada.

## Testes automatizados

Suíte atual: **95 testes** em cinco arquivos, todos aprovados (2026-11-23, após incluir tests/process.test.js com IDs NFR-003/004/005). Cobertura V8 de todo `src/**/*.js`: **100% linhas, 100% statements, 100% funções e pelo menos 98% branches**. Números exatos da última execução em coverage/coverage-summary.json; README é atualizado automaticamente. HTML gerado localmente. Não interpretar cobertura como prova de ausência de defeitos ou de fidelidade a hardware real.

Aceites analíticos: reta de 1 m em 20 ticks a 1 m/s; arco de quarto de círculo; giro estacionário; laser em parede a 2 m; bordas/range/paralelismo; parede fina com subpassos; contato simultâneo; isolamento de tick/PRNG quando segundo robô falha; reset e seed zero; labirinto por 300 ticks sem penetração; captura/replay/seek/limite de 5.000 ticks; saída/tangência/empate no sumô. UI testada em jsdom com sessões reais; driver WebGL e OrbitControls substituídos nos testes do adaptador gráfico.

`npm run check` é o comando de entrega: testes, thresholds, métricas no README, build e rastreabilidade. CLI headless executada com `worlds/livre.json 20`: tick20, time1, x2,65 (controlador padrão a 0,65 m/s), y4,5, sem interface. O teste analítico de 1 m/s usa comando próprio, não a estratégia padrão.

Histórico organizado em commits com IDs das tasks; os 15 requisitos FR/NFR têm tasks. O verificador também rejeita spec sem IDs e ignora commits de merge gerados pelo GitHub para verificar commits de implementação em PRs.

## Revisão /speckit-analyze (2026-11-23)

CLI Spec Kit 1.4.4 instalada e inicializada com integração Claude. `/speckit-analyze` apontou 12 achados; aplicados: testes com IDs NFR-003/004/005, constitution 1.1.1 (IA utilizada, FR-008 como mínimo, `maxTicks`), plan/PROVENANCE atualizados, US4 movida para User Scenarios, NFR-004 detalhada, T009 delimitada e unidade do limite de replay. Execução local de `npm run check` com Node 22: 95 testes, 100% linhas/statements/funções, 98,89% branches, build e rastreabilidade aprovados. Cópia local sem `.git`: verificação de commits retornou 0 commits; vale apenas no repositório remoto. Pendentes: T011 e T012; formato de tasks por fases e SC numerados não aplicados.

## Regeneração por assistente isolado — T011, etapa 1 (2026-11-23)

Protocolo de quickstart.md: pasta separada contendo apenas constitution, `specs/001-arena/` sem validation.md, `.specify/templates/` e LICENSE; sem src, tests, worlds ou lockfile. Tasks T002–T009/T013/T014 desmarcadas na cópia. Spec Kit 1.4.4 inicializado na pasta (`specify init --integration claude`); um agente Claude novo, sem acesso à implementação original, seguiu o fluxo de `/speckit-implement` com o prompt do quickstart. O gate de checklist do Spec Kit acusou os 2 itens humanos abertos; o agente prosseguiu por instrução e registrou o fato.

Resultado da implementação regenerada: suíte própria de 168 testes aprovados; cobertura 100% linhas/statements/funções e 98,66% branches; build aprovado; Node 24.14.0. Nada testado em navegador real.

Medição contra a implementação original:
- Aceites do briefing pelo contrato headless (`new Simulation(world, sources)`, `step()`, `snapshot()`): reta 1 m/s × 20 ticks, arco analítico, laser frontal a 2 m e bordas, determinismo com `random()`, parada em parede com bumper e cinco mundos inválidos com mensagem `Mundo inválido:` — **todos aprovados**, mesmos valores numéricos da original.
- Equivalência: livre, labirinto e sumô por 300 ticks com controlador padrão produziram poses e bumpers **idênticos** (6 casas) nas duas implementações.
- Suíte original de 95 testes executada sobre o src regenerado: **42/95 (44%) aprovados**. As falhas vêm de nomes internos não contratados (`integrate`, `blocked`, `rayBox`, `parseSumo`, `sumoResult`, `mount`, `createRenderer`, `Session.applyController/stopRecording`, `sim.robots`) e de detalhes não especificados, não de divergência de comportamento medida no contrato headless.

Lacunas dos documentos reveladas pela regeneração — **fechadas em 2026-11-23 via `/speckit-clarify`** (spec.md, Clarifications; novo contracts/session.md; ajustes em world/controllers/replay/quickstart). A regeneração acima usou os documentos anteriores ao fechamento:
1. API pública de Session, sumô, renderer e app não está em contrato; só Simulation tem contrato headless.
2. Simulation aceitar texto JSON além de objeto não está especificado (a regenerada aceita apenas objeto).
3. Prefixo de erro de replay (`Replay:` na original, `Gravação inválida:` na regenerada) não está no contrato.
4. `EmptyStatement` (`;` isolado) não consta do subconjunto em controllers.md; a original aceita, a regenerada rejeita.
5. Texto do motivo de empate por tempo e nomes/IDs dos robôs do labirinto não são especificados.
6. Orçamento de 500 avaliações é inalcançável com o limite de 500 nós sem laços.

### Segunda regeneração, após `/speckit-clarify` (2026-11-23)

Mesmo protocolo, nova pasta isolada com os documentos atualizados (Clarifications e contracts/session.md) e novo agente sem acesso à original. Suíte própria: 219 testes aprovados; 100% linhas/statements, 99,06% funções, 98,63% branches; build aprovado. Aceites headless do briefing: todos aprovados. Equivalência de 300 ticks em livre/labirinto/sumô: idêntica.

Suíte original sobre o src regenerado: **63/95 (66%)**, contra 42/95 (44%) na primeira rodada. Sumô passou de 0/12 para 10/12 e core de 39/70 para 50/70.

Das 32 falhas restantes, 26 são esperadas pela decisão da Clarification 1 (nomes fora de contrato): app/`mount` (8), renderer/`createRenderer` (2), geometria interna `integrate`/`blocked`/`laser`/`rayBox`/`rayCircle`/`overlaps` (8), forma de retorno de `compileController` (2) e nome do módulo de gravação `parseRecording` (6).

As 6 restantes indicavam lacunas nos documentos — **itens 1–5 fechados em 2026-11-23 por segundo `/speckit-clarify`** (spec.md, Clarifications; contracts/session.md, controllers.md, world.md):
1. Após o fim do sumô, `step()` deve ou não avançar? O contrato só proíbe `play()`; a original não avança.
2. `parseSumo(null, world)`: `null` conta como "ausente"? A original rejeita; só `undefined` é ausência.
3. Após o limite de 5.000 ticks, `recording` deve virar `null` (captura encerrada) com a gravação disponível para `stopRecording()`.
4. Propriedade de protótipo (`readLaser().constructor`) deve ser rejeitada já na compilação, não só na execução.
5. Textos de erro de orçamento/complexidade e de gravar durante replay não são fixos.
6. (Repetida das anteriores, sem impacto) mensagens auxiliares sem prefixo definido, como seleção de robô desconhecido.

**T011 permanece aberta:** falta a etapa 2 do protocolo — uma pessoa independente do grupo aplicar os critérios de aceite à implementação regenerada e registrar resultado, ambiguidades e diferenças. A suíte oculta da disciplina continua desconhecida.

## Feature 002 — estratégia padrão de sumô (2026-11-23)

Motivação: na demo, com o controlador genérico de desvio, os robôs saíam sozinhos do ringue. Fluxo completo do Spec Kit: `/speckit-specify` → `/speckit-plan` (research, data-model, contrato, quickstart) → `/speckit-tasks` (T101–T118) → `/speckit-implement`. Artefatos em specs/002-sumo-default-strategy/.

Implementação: `sumoController(scenario)` em src/modes/sumo.js e atribuição em `Session.load`; Simulation, física, API e regras inalteradas. `npm run check`: **111 testes** aprovados (16 novos em tests/sumo-strategy.test.js), 100% linhas/statements/funções, 98,91% branches, build e rastreabilidade aprovados; nenhum teste da 001 precisou de ajuste. Resultados: dojô padrão sem saída em 1.200 ticks e "Tempo limite: empate" (SC-001); contato dos dois robôs no tick 24 (SC-002); robô a 0,3 m da borda virado para fora não sai em 200 ticks, 4 ângulos (SC-003); labirinto e campo livre idênticos à referência (SC-004). Navegador: editor mostra a estratégia; robôs se encontram no centro com bumper "CONTATO" sem sair do ringue. `scripts/traceability.mjs` passou a aceitar IDs de task de todas as features.

Limite declarado: sem empurrão (Princípio III), dois programas padrão ficam frente a frente até o empate por tempo.

## Feature 003 — física real dos robôs (2026-11-23)

Pedido do usuário: robôs "iam de frente e ficavam parados" ao se bater. Constitution emendada para 2.0.0 (`/speckit-constitution`, Princípio III); fluxo `/speckit-specify` (1 clarificação: motor forte com aderência alta) → `/speckit-plan` (protótipo em research.md) → `/speckit-tasks` (T201–T217) → `/speckit-implement`.

Implementação: `Simulation.step` reescrito com dinâmica 2D própria (motor com aderência e curva de torque CC, atrito lateral, solver iterativo de impulsos, contato especulativo, correção posicional, ≥10 subpassos); campos `mass`, `grip`, `lateralGrip`; replay com `vx`, `vy`, `omega`; estratégia de sumô empurra a 1 m/s e só recua da borda sem contato. `npm run check`: **120 testes** aprovados, linhas 99,21%, statements 99,22%, funções 100%, branches 98,03%; build e rastreabilidade aprovados. Ajustes em testes antigos (T213): reta com tolerância 1 cm (antes 1e-10), duas asserções de 2,05 m com 1 casa, trajetórias de referência da 002 substituídas por verificação de reprodutibilidade, velocidade de ataque 0,8 → 1.

Resultados: empurrão lateral vence em < 200 ticks; frente a frente trava (< 5 cm em 5 s); frontal contra robô freado desloca < 10 cm; massa 2 desloca ≤ metade; parede de 1 mm a 3 m/s não é atravessada; 5.000 ticks de labirinto e dojô sem sobreposição > 1e-6 m; determinismo e replay idênticos; reta 1 m/s × 1 s a < 1 cm; demo do pitch inalterada (sheep-02 vence no tick 52).

**SC-004 não atendido**: com programas padrão iguais, 0 de 10 seeds terminam com vencedor — robôs iguais se equilibram. Causas (research.md R4): corpos circulares, controlador sem memória entre ticks e limite de 500 nós. Opções levadas ao usuário.

## Feature 004 — memória no controlador (2026-11-23)

Pedido do usuário após a 003: robôs iguais ainda travavam de frente. Fluxo `/speckit-specify` → `/speckit-plan` (protótipo isolado, research.md) → `/speckit-tasks` (T301–T313) → `/speckit-implement`.

Implementação: API `memory(i)`/`remember(i, v)` (16 posições por robô, cópia de trabalho atômica por tick, zerada em reset/carga/novo programa); limites do programa 500 → 1.000 nós e avaliações (justificado em plan.md); estratégia padrão de sumô reescrita com fases (abertura em curva sorteada, empurrão, travamento detectado pela odometria, recuo, flanco, rastreamento lateral). `npm run check`: **131 testes** aprovados, linhas 99,27%, statements 99,28%, funções 100%, branches 98,08%; build e rastreabilidade aprovados. Ajustes em testes antigos (T310): limite de nós (260 → 510 repetições), busca em arco verificada após a abertura, regra de borda verificada pela ordem dos ramos.

Resultados: seeds 1–10 com programas padrão iguais → **6/10 com vencedor** (ambos os robôs vencem em seeds diferentes), todas com contato no último segundo; robôs encostados de frente entram em recuo em 9 ticks (0,45 s) e se afastam; contador na memória e zeragens corretos; erros de posição/valor rejeitados sem alterar estado. SC-004 da 003 fechado.

Seed de demonstração do dojô: 42 terminava em empate por tempo; trocada para 3 (sheep-01 vence por empurrão aos 14,1 s) para a demo mostrar uma luta decidida. Escolha deliberada e registrada; outras seeds variam (6/10 com vencedor) e podem ser trocadas no editor JSON.

## Feature 005 — correção do bumper (2026-11-23)

Regressão encontrada ao testar labirinto e campo livre: desde a 003 o bumper ficava ligado com o robô apenas encostado; o programa genérico de desvio girava no lugar para sempre (labirinto 89–96% do tempo parado, campo livre 74%). Fluxo Spec Kit completo (specs/005-bumper-contact-fix, T401–T408). Regra nova: bumper só com força de contato (impulso > 1e-9) ou sobreposição corrigida > 1e-6 m. `npm run check`: **134 testes** aprovados, linhas 99,27%, branches 98,08%, funções 100%, statements 99,28%. Campo livre: > 25 m e < 20% parado em 60 s; labirinto: < 20% parado; sumô continua ≥3/10 com vencedor. Nenhum teste antigo precisou de ajuste.

## Feature 006 — estratégia de labirinto (2026-11-23)

Limitação antiga (também na versão cinemática): com o desvio genérico, em 250 s sheep-01 nunca saía do 1º corredor e sheep-02 só percorria os dois últimos. Fluxo Spec Kit completo (specs/006-maze-wall-follow, T501–T512). Labirinto vira modalidade `scenario: {type: "labirinto"}` com programa padrão de seguir parede pela direita (src/modes/maze.js); sem regras de vitória. `npm run check`: **137 testes** aprovados, linhas 99,31%, branches 98,16%, funções 100%, statements 99,32%. Resultados: cada robô passa pelos 4 corredores em 53 s e 46 s (≤ 120 s); em 5.000 ticks nenhum robô parado > 5 s e nenhuma penetração; também funciona em labirinto espelhado e com paredes em outras posições (44–59 s). Navegador: sheep-01 de x = 0,9 a x = 10,1 em 60 s. Teste da 002 ajustado: o labirinto deixa de usar o programa genérico; mantido o objetivo de não aplicar a estratégia de sumô fora do dojô.

## Revisão de consistência dos artefatos (2026-11-23)

Inventário: constitution e specs 001–006 com spec/plan/tasks (002–006 também research, data-model, contratos, quickstart e checklist); 13 pontos de contrato conferidos contra o código. Correções: constitution 2.0.1 (rascunho do Spec Kit removido; Princípio III esclarecido sobre o labirinto); notas de limite 500 → 1.000 nós na 001/002; edge case da 002 marcado como revisado; FR-002 (004) e FR-004 (006) com tasks e testes nomeados; `scripts/traceability.mjs` passa a verificar as features 002+ (33 requisitos com task e teste) e `traceability.md` ganhou a tabela das features. `npm run check`: **138 testes**, linhas 99,31%, branches 98,16%, funções 100%, statements 99,32%.

## Reconstrução da 001 pelo Spec Kit (2026-11-23)

A versão manual de 2026-11-18 (spec, plan, tasks, quickstart) foi preservada em `history/manual-2026-11-18/` e a feature foi reconstruída por `/speckit-specify`, `/speckit-plan` (research.md, data-model.md) e `/speckit-tasks` no formato oficial dos templates, com mesmos IDs FR/NFR e T001–T014. `/speckit-analyze`: 0 críticos; 3 ajustes aplicados (citações de campos do data-model nas tasks T002/T003/T004/T007; seed 3 e modalidade labirinto no roteiro de regeneração; nota sobre o tipo `labirinto` na clarificação de cenário). `npm run check`: 138 testes, linhas 99,31%, branches 98,16%; rastreabilidade aprovada.

## Publicação e CI remoto

Repositório público: https://github.com/An-na021/RamBot-Arena, branch `main`. Primeiro envio confirmado do commit `3534a69f92f8f4c3a55ec67ce42167fc95d9c028`, com o nome RamBot Arena. Workflow **Aceite e cobertura** concluído com **success**: https://github.com/An-na021/RamBot-Arena/actions/runs/44381741565. O runner Ubuntu executou instalação pelo lockfile, testes/cobertura/build/rastreabilidade, verificação das métricas do README e upload do relatório. Resultado local da mesma entrega: 92 testes, 100% linhas e 98,89% branches.

Build de produção concluído com Vite. O bundle de Three.js produz aviso de tamanho acima de 500 KB; a aplicação estática continua funcionando. Auditoria das dependências de execução: zero vulnerabilidades reportadas pelo npm na consulta desta entrega. Dependências de desenvolvimento não fazem parte dessa afirmação.

## QA no navegador

Navegador in-app com WebGL real: cena 3D com dois robôs, círculo e laser renderizados; passo avança de 0 para 0,05 s; controle e seleção atualizam telemetria. Teste de sumô: sheep-01 recua a 1 m/s e sheep-02 permanece parado. Resultado observado: **sheep-02 vence no tick52, tempo2,60 s**, com saída completa do adversário. Gravação exportada por download, reimportada pela UI; slider até tick52 recupera tempo2,60 e posição x2,200/y4,500 de sheep-01. Screenshot da arena em docs/assets/arena.jpg.

Falhas encontradas e corrigidas: estilo sobrescrevia atributo hidden do botão de sair do replay; resultado final precisava aparecer também no modo replay; IDs semelhantes a propriedades de protótipo exigiam checagem de propriedade própria. Nova execução de testes após correções. Um erro transitório de HMR ocorreu durante inclusão do elemento de aviso antes de atualização do HTML; validação final usa recarga completa da página.

QA manual não é teste de desempenho, de todos os navegadores, da responsividade em aparelhos físicos ou de física real. Câmera usa OrbitControls e Three.js; núcleo não depende deles. Gravações são estruturalmente validadas e não representam registro antifraude.

## SDD e pesquisa

Constitution/spec/plan/tasks escritos antes da implementação; escolha provisória de labirinto substituída pelo sumô confirmado pelo usuário. Oito fontes pesquisadas e mapeadas em references.md. O leitor web não acessou Projeto Thayane; inspeção da interface no navegador confirmou editor, controle, câmera, reset e opções Python/meuPiá. `/home` do Gazebo falhou no leitor, usando documentação oficial de GUI/sensores como fonte.

Sete slides editáveis sem código preparados no chat e renderizados para revisão visual. Roteiro de nove minutos em docs/pitch.md, com divisão sugerida entre os três integrantes. O grupo ainda precisa ensaiar e apresentar. Não alegar inspeção no PowerPoint nem apresentação já realizada.

## Pendências externas, sem evidência inventada

1. Regeneração por assistente isolado executada (seção acima); avaliação humana independente pendente (T011). Protocolo em quickstart.md. Suíte oculta da disciplina não disponível.
2. Revisão humana formal, ensaio e pitch ao vivo pendentes (T012).
3. Sumô simplificado usa contatos bloqueantes. Forças/empurrões, Portugol/Maker, WebSocket e BMAD não implementados.
