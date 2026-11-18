# Quickstart e regeneração

## Executar entrega

Node 22+, npm 10+. No PowerShell, usar `npm.cmd` se a política bloquear npm.ps1.

1. `npm ci`
2. `npm run check` (testes, cobertura, README, build e verificação de rastreabilidade)
3. `npm run dev`; abrir URL Local impressa pelo Vite.
4. `npm run headless -- worlds/livre.json 20`; executa Simulation sem DOM.
5. Relatório HTML em coverage/index.html; LCOV e resumo JSON versionados.

## Recriar em pasta vazia a partir da spec

Entregar ao assistente somente `.specify/memory/constitution.md`, `specs/001-arena/` (excluir validation.md para evitar enviesar resultados), `.specify/templates/` e licença. Não entregar src/tests/lockfile. Prompt:

> Recrie a PoC descrita nesses documentos, respeitando a constitution e todos os FR/NFR. Use requirements como contexto, spec como comportamento, plan/contratos como decisões técnicas e tasks como ordem. Implemente mundos de exemplo a partir dos valores documentados, controladores limitados e núcleo headless. Não use motor de física. Gere testes verificáveis e reporte limitações. Identifique qualquer ambiguidade antes de assumir. Não consulte a implementação original.

Sequência: validar requisitos e checklist → gerar plano compatível → executar T002–T007/T013 com testes → medir cobertura → build → QA → pitch. Recriar worlds/livre com mapa 12×9, dt0,05 seed42 e robô sheep-01 (2;4,5), theta0, raio0,28, laser9/range5/FOVπ. Sumo: mapa12×9, cenário circular centro(6;4,5), raio3,5, limite1200; robôs raio0,28 em (4,8;4,5), theta0, e (7,2;4,5), thetaπ, IDs sheep-01/02, laser9/range4/FOVπ. Labirinto opcional: mapa12×9, obstáculos (3;0;0,35;5,4), (6;3;0,35;6), (9;0;0,35;5,4), (4,2;6,8;0,8;0,8); robôs (1,5;2;0) e (10,5;7;π), raio0,28, laser9/range3,5/FOVπ.

Depois de gerar, uma pessoa independente aplica os critérios de aceite e registra resultado, ambiguidades e diferenças. A suíte oculta da disciplina é desconhecida; passar testes locais não prova aprovação nela. T011 permanece aberta até esse experimento ser executado. Não executar um segundo desenvolvimento apenas para simular evidência.
