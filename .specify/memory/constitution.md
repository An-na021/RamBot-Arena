# RamBot Arena — Constitution

Versão 1.1.0 · ratificada em 2026-11-18 · ciclo greenfield · framework GitHub SpecKit.

## I. A especificação é o produto principal
Antes do código: extrair briefing → registrar perguntas/decisões → constitution → spec (o quê/por quê) → plan (como) → tasks → implementação → evidências. Mudanças de comportamento exigem atualização desses artefatos. Os documentos e contratos devem permitir recriação em checkout vazio.

## II. Núcleo independente e reproduzível
Simulação headless, sem DOM, WebGL, relógio de parede, aleatoriedade não semeada ou motor de física. Mesmo mundo, seed, controladores e quantidade de ticks produzem o mesmo estado. O renderizador só consome snapshots. Geometria, cinemática e colisão são implementadas pelo grupo.

## III. PoC pequena e honesta
Modalidade de demonstração: **sumô**, escolhida explicitamente pelo usuário. Dois robôs num ringue circular; derrota ao sair completamente, empate por saída simultânea ou por 1.200 ticks (60 s) sem vencedor. Regras pertencem ao módulo de modalidade, sem competição/placar no núcleo. Contatos são bloqueantes, sem forças ou empurrões: sumô simplificado para estratégias de permanência e contato. Labirinto e campo livre permanecem exemplos de núcleo genérico. Mínimo obrigatório precede multi-robôs/inspeção/replay. Portugol, WebSocket e BMAD fora da entrega; não reivindicar bônus.

## IV. Stack e limites explícitos
JavaScript ESM, Node 22+, Vite, Three.js/OrbitControls exclusivamente para desenho, Acorn para interpretar um subconjunto limitado de JS, Vitest/V8 e jsdom. JSON para mundos. Sem backend, login ou persistência remota. Dependências fixadas no lockfile. API de controlador sem eval/new Function, acesso à rede ou DOM; laços e funções do usuário não fazem parte do subconjunto.

## V. Aceite e rastreabilidade
IDs FR/NFR → tasks Txxx → testes com IDs → commits com task no título. Cobertura de linhas, funções, branches e statements de todo `src/**/*.js` ≥80%, exigida pelo runner. README inicia com quantidade de testes e cobertura geradas pela execução. Relatórios JSON e LCOV versionados; HTML reproduzível. Testes headless verificam posição, sensores e erros de entrada.

## VI. Entrega em grupo
Trio: Anna, William e Sandriely, conforme esclarecimento explícito do usuário. Repositório do grupo: https://github.com/An-na021/RamBot-Arena, informado pelo usuário. Nome do produto: RamBot Arena; equipe atendida: Univille SheepBotz. Pitch até 10 minutos, sem código nos slides. IA utilizada: Codex; decisões e validação são responsabilidade do grupo.

## Governança
Alterações registram data, motivo e impacto; revisar spec/plan/tasks antes de implementar. Incrementar major para princípio incompatível, minor para princípio adicional e patch para esclarecimento.

1.1.0 (2026-11-18): escolha explícita do usuário substitui a hipótese de labirinto por sumô; acrescentados FR-010/T013, módulo de modalidade, mundo, aceites e pitch. Pesquisa das oito referências registrada em references.md. Princípios de determinismo e independência preservados.

2026-11-18: nome público RamBot Arena e repositório definidos pelo usuário; atualização editorial sem alteração dos princípios.
