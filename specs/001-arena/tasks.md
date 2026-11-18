# Tasks — 001-arena

Formato de commit: `Txxx: descrição`. Atualizar caixas somente após verificação. IDs de teste contêm FR/NFR; matriz em traceability.md. Ordem segue dependências abaixo; cada fatia inclui teste de aceite.

- [x] T001 [NFR-003, NFR-005] Extrair briefing e decisões, constitution, spec, plan, contratos, templates SpecKit; scripts de rastreabilidade e roteiro de regeneração.
- [x] T002 [US1, FR-001] Validar mundo JSON, fornecer exemplos e importação atômica; testes de campos, limites, IDs e sobreposição.
- [x] T003 [US1, FR-002, FR-003, NFR-001, NFR-002] Cinemática, colisão, sensores e runner headless; testes analíticos e de determinismo. Depende T002.
- [x] T004 [US2, FR-004] Interpretar controlador JS limitado, executar por tick e mostrar erros; testes de isolamento, limite e atomicidade. Depende T003.
- [x] T005 [US1/US2, FR-005, FR-006, FR-008] Play/pause/step/reset, arena 3D orbital e inspeção/seleção; testes de sessão/DOM/render e QA disponível. Depende T004.
- [x] T006 [US3, FR-007] Múltiplos robôs, comandos independentes, colisão e percepção mútua; testes simultâneos. Depende T004.
- [x] T007 [US3, FR-009] Captura, download/importação, replay, seek e limite; testes de round-trip e entradas inválidas. Depende T005/T006.
- [x] T008 [NFR-004] Cobertura de todo src ≥80% nas quatro métricas; relatório versionado, README gerado e CI. Depende T002–T007.
- [x] T009 [NFR-003] Pitch sem código, demo cronometrada, relatório de validação e checklist de entrega. Depende T008.
- [x] T013 [US4, FR-010] Esclarecimento do usuário: demo de sumô, ringue, regra separada de vitória/empate, pausa e replay; testes de saída/tangência/limite e fonte Roboton. Depende T005/T006/T007. Limite explícito: sem empurrões.

## Ações externas do grupo

- [ ] T010 [NFR-005] Publicar em um repositório GitHub do grupo; verificar workflow no remoto. Integrantes preenchidos: Anna, William e Sandriely. Exige destino/conta GitHub.
- [ ] T011 [NFR-003] Recriar a implementação em checkout separado usando somente documentos; registrar fração dos testes de aceitação que passa, sem alegar uso da suíte oculta da disciplina.
- [ ] T012 [NFR-003] Ensaiar em grupo e apresentar pitch/demo em até dez minutos.
