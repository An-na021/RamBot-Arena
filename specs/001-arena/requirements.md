# Extração do briefing — antes da spec

Data: 2026-11-18. Fonte: enunciado fornecido pelo usuário, Trilha 4 — SheepBotz Arena. Este documento foi escrito antes da implementação.

| Origem no briefing | Requisito derivado | Prioridade |
| --- | --- | --- |
| Mundo YAML ou JSON: mapa, obstáculos, robôs, sensores | FR-001 importar e validar JSON | mínima |
| Tração diferencial, velocidades linear/angular, colisão simples | FR-002 movimento e contato sem penetração | mínima |
| Laser ou sonar, odometria e bumper | FR-003 três leituras observáveis | mínima |
| Controlador JS, API limitada, a cada tick | FR-004 programa de controle por robô | mínima |
| Play, pause, step e reset | FR-005 controle temporal | mínima |
| Visual 3D, câmera orbital e raios | FR-006 visualização fiel | mínima |
| Headless determinístico com seed e passo fixos | NFR-001 reprodução independente da UI | restrição |
| Sem motor de física | NFR-002 geometria própria | restrição |
| Vários robôs, painel, gravação/replay | FR-007/008/009 | completo |
| Spec capaz de recriar o sistema | NFR-003 contratos e critérios verificáveis | universal |
| Cobertura ≥80%, relatório e README atualizado | NFR-004 evidência automatizada | universal |
| Commits → tasks → requisitos | NFR-005 rastreabilidade | universal |

## Lacunas e decisões

| Pergunta que o briefing deixa aberta | Decisão provisória do grupo/assistente | Justificativa |
| --- | --- | --- |
| Qual modalidade? | **Sumô**, confirmado pelo usuário; substitui hipótese inicial de labirinto | Ringue e condições de vitória orientam demo; módulo separado mantém núcleo genérico |
| YAML ou JSON? | JSON apenas | Uma opção satisfaz o mínimo e simplifica validação |
| Formas, unidades e eixos? | Metros/radianos, x/y no plano, robô circular, obstáculos retangulares alinhados | Colisão verificável e escopo reduzido |
| Quando medir os sensores? | Todos leem o mesmo estado anterior ao movimento; leituras finais atualizadas após cada tick | Remove dependência da ordem dos controladores |
| Colisão robô–robô? | Bloquear ambos quando propostas de movimento colidirem | Regra simples e determinística |
| Colisão em alta velocidade? | Subpassos limitam deslocamento a metade do menor raio | Evita atravessar paredes finas |
| JS arbitrário e laços? | Subconjunto documentado, sem laços; rejeitar sintaxe fora dele com erro claro | Programa defeituoso não trava o navegador |
| Tempo real versus passo? | dt fixo 0,05 s por padrão; UI só agenda ticks | FPS não altera a física |
| Limites da PoC? | Até 8 robôs, 100 obstáculos, 64 raios/robô, 5.000 ticks gravados; arquivo replay até 100 MB | Limites finitos para uso no navegador |
| Reset preserva o quê? | Mesmo mundo/controladores/seed; zera tick e replay | Comparação reproduzível |
| Bônus? | Fora do escopo | Priorizar documentação e aceite |

## Pendências externas
Grupo informado: Anna, William e Sandriely. Pendências: definir/criar URL GitHub e publicar; ensaiar e apresentar pitch. Modalidade confirmada: sumô.

## Complemento após esclarecimento

FR-010: sumô com dois robôs, ringue circular, saída completa como derrota, saída simultânea/tempo como empate, pausa ao terminar. Ringue é marcação visual e regra de modalidade; não é obstáculo do laser. Sem empurrão físico nesta PoC. O usuário também exigiu desenvolvimento baseado nas oito referências do briefing; pesquisa e decisões em references.md.
