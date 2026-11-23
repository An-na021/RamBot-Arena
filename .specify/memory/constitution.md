# RamBot Arena — Constitution

Versão 2.0.1 · ratificada em 2026-11-18 · emendada em 2026-11-23 · ciclo greenfield · framework GitHub SpecKit.

## I. A especificação é o produto principal
Antes do código: extrair briefing → registrar perguntas/decisões → constitution → spec (o quê/por quê) → plan (como) → tasks → implementação → evidências. Mudanças de comportamento exigem atualização desses artefatos. Os documentos e contratos devem permitir recriação em checkout vazio.

## II. Núcleo independente e reproduzível
Simulação headless, sem DOM, WebGL, relógio de parede, aleatoriedade não semeada ou motor de física pronto. Mesmo mundo, seed, controladores e quantidade de ticks produzem o mesmo estado. O renderizador só consome snapshots. Geometria, dinâmica, colisão e contato são implementadas pelo grupo, com subpassos fixos e somente aritmética determinística.

## III. PoC pequena e honesta
Modalidade de demonstração: **sumô**, escolhida explicitamente pelo usuário. Dois robôs num ringue circular; derrota ao sair completamente, empate por saída simultânea ou por `maxTicks` (padrão 1.200 ticks = 60 s com dt 0,05) sem vencedor. Regras pertencem ao módulo de modalidade, sem competição/placar no núcleo. O núcleo simula dinâmica 2D própria em todos os mundos: cada robô tem massa, inércia, força de motor limitada e atrito com o chão; `setSpeed` define a velocidade que os motores perseguem dentro desses limites; contato entre robôs troca impulso e permite empurrar. Paredes e obstáculos permanecem rígidos e imóveis. No sumô, empurrar o adversário para fora do ringue é a forma principal de vitória. A física é simplificada (corpos circulares, sem deformação, sem 3D) e não promete equivalência com robôs reais. O núcleo permanece genérico: o labirinto é modalidade sem regra de vitória, com programa padrão de seguir parede, e o campo livre não tem modalidade. Mínimo obrigatório precede multi-robôs/replay. Portugol, WebSocket e BMAD fora da entrega; não reivindicar bônus.

## IV. Stack e limites explícitos
JavaScript ESM, Node 22+, Vite, Three.js/OrbitControls exclusivamente para desenho, Acorn para interpretar um subconjunto limitado de JS, Vitest/V8 e jsdom. JSON para mundos. Sem backend, login ou persistência remota. Dependências fixadas no lockfile. API de controlador sem eval/new Function, acesso à rede ou DOM; laços e funções do usuário não fazem parte do subconjunto.

## V. Aceite e rastreabilidade
IDs FR/NFR → tasks Txxx → testes com IDs → commits com task no título. Cobertura de linhas, funções, branches e statements de todo `src/**/*.js` ≥80%, exigida pelo runner. README inicia com quantidade de testes e cobertura geradas pela execução. Relatórios JSON e LCOV versionados; HTML reproduzível. Testes headless verificam posição, sensores e erros de entrada.

## VI. Entrega em grupo
Trio: Anna Heloísa Malschitzky, William Fagundes e Sandriely Maciel, conforme esclarecimento explícito do usuário. Repositório do grupo: https://github.com/An-na021/RamBot-Arena, informado pelo usuário. Nome do produto: RamBot Arena; equipe atendida: Univille SheepBotz. Pitch até 10 minutos, sem código nos slides. IA utilizada: Codex (baseline) e Claude Code com CLI Spec Kit a partir de 2026-11-23; decisões e validação são responsabilidade do grupo.

## Governança
Alterações registram data, motivo e impacto; revisar spec/plan/tasks antes de implementar. Incrementar major para princípio incompatível, minor para princípio adicional e patch para esclarecimento.

1.1.0 (2026-11-18): escolha explícita do usuário substitui a hipótese de labirinto por sumô; acrescentados FR-010/T013, módulo de modalidade, mundo, aceites e pitch. Pesquisa das oito referências registrada em references.md. Princípios de determinismo e independência preservados.

2026-11-18: nome público RamBot Arena e repositório definidos pelo usuário; atualização editorial sem alteração dos princípios.

2.0.0 (2026-11-23): MAJOR. Princípio III redefinido a pedido do usuário: contatos bloqueantes sem força substituídos por dinâmica 2D própria (massa, inércia, força de motor, atrito, impulso robô–robô) em todos os mundos; Princípio II esclarecido (dinâmica própria, subpassos fixos). Impacto: FR-002 e contratos de mundo/controlador da 001 e as features 002/003 precisam ser revisados; trajetórias de referência mudam.

1.1.1 (2026-11-23): registro da instalação da CLI Spec Kit 1.4.4 e do uso de Claude Code; FR-008 (inspeção) reclassificado como mínimo, conforme US2/P1; empate por tempo expresso em `maxTicks`. Correções apontadas por /speckit-analyze; princípios inalterados.

2.0.1 (2026-11-23): PATCH. Princípio III esclarecido após a feature 006 (labirinto como modalidade sem regras); remoção do relatório de rascunho do Spec Kit. Princípios inalterados.

2026-11-23: nomes completos do trio registrados (Anna Heloísa Malschitzky, William Fagundes e Sandriely Maciel); atualização editorial sem alteração dos princípios.
