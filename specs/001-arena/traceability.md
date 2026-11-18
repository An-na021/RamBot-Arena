# Matriz requisito → task → evidência

Commits seguem `Txxx: descrição`; consultar `git log --oneline`. `node scripts/traceability.mjs` verifica IDs do spec/tasks e títulos do histórico.

| Requisito | Tasks | Implementação / teste de aceite |
| --- | --- | --- |
| FR-001 mundo | T002 | world.js; core.test.js `FR-001 mundo`; app.test.js importação/editor |
| FR-002 movimento/colisão | T003 | geometry.js/simulation.js; reta, arco, tangência, parede fina |
| FR-003 sensores | T003/T005 | geometria e snapshot; raycasts analíticos, odometria, bumper e painel |
| FR-004 controlador | T004 | controller.js; sintaxe proibida, API, clamp, orçamento/complexidade e atomicidade |
| FR-005 transporte | T005 | session.js/app.js; play, pause, step, reset e agendamento RAF |
| FR-006 render | T005 | renderer.js; projeção x/y, raios, seleção, descarte e fallback WebGL; QA real |
| FR-007 multi-robô | T006 | simulation.js; colisão simultânea, sensores mútuos, falha atômica |
| FR-008 inspeção | T005 | app.js; mudança de robô, pose/laser/bumper ao vivo |
| FR-009 replay | T007 | recording.js/session.js; captura/round-trip/seek/limite/rejeição e UI |
| FR-010 sumô | T013 | modes/sumo.js; sumo.test.js saída/tangência/empate/pausa/reset/replay |
| NFR-001 determinismo | T003 | PRNG semeado/reset; comparação de 50 ticks e labirinto de 300 ticks |
| NFR-002 física própria | T003 | geometria própria; core sem imports de motor/DOM/WebGL |
| NFR-003 regeneração/documentos | T001/T009/T011/T012 | contracts/quickstart/references/checklist/pitch; experimento de regeneração e apresentação pendentes |
| NFR-004 cobertura | T008 | vite.config.js, cobertura V8, scripts/report.mjs, README e CI |
| NFR-005 rastreabilidade | T001/T010 | tasks, histórico local e script; repositório remoto pendente |

T006 compartilha implementação genérica de colisão da T003; o commit de T006 deve acrescentar o aceite multi-robô. T009 reúne documentação de entrega. Publicação/CI remoto, revisão humana, regeneração independente e apresentação não são comprovadas por testes unitários.
