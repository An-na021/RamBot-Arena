# Evidências e limites da entrega local

Data: 2026-11-18. Grupo: Anna, William e Sandriely. Ambiente: Windows, Node 22.21.0, npm 10.9.4. Branch local `001-arena`.

## Testes automatizados

Suíte atual: **92 testes** em quatro arquivos, todos aprovados. Cobertura V8 de todo `src/**/*.js`: **100% linhas, 100% statements, 100% funções e pelo menos 98% branches**. Números exatos da última execução em coverage/coverage-summary.json; README é atualizado automaticamente. HTML gerado localmente. Não interpretar cobertura como prova de ausência de defeitos ou de fidelidade a hardware real.

Aceites analíticos: reta de 1 m em 20 ticks a 1 m/s; arco de quarto de círculo; giro estacionário; laser em parede a 2 m; bordas/range/paralelismo; parede fina com subpassos; contato simultâneo; isolamento de tick/PRNG quando segundo robô falha; reset e seed zero; labirinto por 300 ticks sem penetração; captura/replay/seek/limite de 5.000 ticks; saída/tangência/empate no sumô. UI testada em jsdom com sessões reais; driver WebGL e OrbitControls substituídos nos testes do adaptador gráfico.

`npm run check` é o comando de entrega: testes, thresholds, métricas no README, build e rastreabilidade. CLI headless executada com `worlds/livre.json 20`: tick20, time1, x2,65 (controlador padrão a 0,65 m/s), y4,5, sem interface. O teste analítico de 1 m/s usa comando próprio, não a estratégia padrão.

Histórico local organizado em commits com prefixos T001–T009/T013; os 15 requisitos FR/NFR têm tasks. O verificador também rejeita spec sem IDs e ignora commits de merge gerados pelo GitHub para verificar commits de implementação em PRs.

Build de produção concluído com Vite. O bundle de Three.js produz aviso de tamanho acima de 500 KB; a aplicação estática continua funcionando. Auditoria das dependências de execução: zero vulnerabilidades reportadas pelo npm na consulta desta entrega. Dependências de desenvolvimento não fazem parte dessa afirmação.

## QA no navegador

Navegador in-app com WebGL real: cena 3D com dois robôs, círculo e laser renderizados; passo avança de 0 para 0,05 s; controle e seleção atualizam telemetria. Teste de sumô: sheep-01 recua a 1 m/s e sheep-02 permanece parado. Resultado observado: **sheep-02 vence no tick52, tempo2,60 s**, com saída completa do adversário. Gravação exportada por download, reimportada pela UI; slider até tick52 recupera tempo2,60 e posição x2,200/y4,500 de sheep-01. Screenshot da arena em docs/assets/arena.jpg.

Falhas encontradas e corrigidas: estilo sobrescrevia atributo hidden do botão de sair do replay; resultado final precisava aparecer também no modo replay; IDs semelhantes a propriedades de protótipo exigiam checagem de propriedade própria. Nova execução de testes após correções. Um erro transitório de HMR ocorreu durante inclusão do elemento de aviso antes de atualização do HTML; validação final usa recarga completa da página.

QA manual não é teste de desempenho, de todos os navegadores, da responsividade em aparelhos físicos ou de física real. Câmera usa OrbitControls e Three.js; núcleo não depende deles. Gravações são estruturalmente validadas e não representam registro antifraude.

## SDD e pesquisa

Constitution/spec/plan/tasks escritos antes da implementação; escolha provisória de labirinto substituída pelo sumô confirmado pelo usuário. Oito fontes pesquisadas e mapeadas em references.md. O leitor web não acessou Projeto Thayane; inspeção da interface no navegador confirmou editor, controle, câmera, reset e opções Python/meuPiá. `/home` do Gazebo falhou no leitor, usando documentação oficial de GUI/sensores como fonte.

Sete slides editáveis sem código preparados no chat e renderizados para revisão visual. Roteiro de nove minutos em docs/pitch.md, com divisão sugerida entre os três integrantes. O grupo ainda precisa ensaiar e apresentar. Não alegar inspeção no PowerPoint nem apresentação já realizada.

## Pendências externas, sem evidência inventada

1. Destino informado pelo usuário: https://github.com/An-na021/RamBot-Arena. Repositório remoto inicialmente vazio; publicação na main e verificação do CI em andamento (T010). A branch local 001-arena preserva o baseline anterior à publicação.
2. Regeneração independente a partir somente dos documentos não executada (T011). Protocolo em quickstart.md. Suíte oculta da disciplina não disponível.
3. Revisão humana formal, ensaio e pitch ao vivo pendentes (T012).
4. Sumô simplificado usa contatos bloqueantes. Forças/empurrões, Portugol/Maker, WebSocket e BMAD não implementados.
