<!-- metrics:start -->
**138 testes · 99.31% de cobertura de linhas**
<!-- metrics:end -->

# RamBot Arena

PoC da Trilha 4, Trabalho Final de Spec-Driven Development. Simulador genérico de robôs de tração diferencial, com núcleo 2D headless e visualização 3D. Modalidade da demo: **sumô simplificado**. Framework: **GitHub SpecKit** (CLI `specify` 1.4.4 com integração Claude desde 2026-11-23). Assistentes: Codex (baseline) e Claude Code.

## Executar

Requisitos: Node.js 22+ e npm. No PowerShell, substitua `npm` por `npm.cmd` caso npm.ps1 seja bloqueado.

```sh
npm ci
npm run dev
```

Abra a URL Local impressa pelo Vite. Para validar toda a entrega:

```sh
npm run check
npm run headless -- worlds/livre.json 20
```

`check` executa testes/cobertura, atualiza este cabeçalho, gera build e verifica rastreabilidade. `npm run build` gera dist; `npm run preview` serve essa versão. O núcleo funciona sem navegador/GPU. A visualização exige WebGL. Fontes web são opcionais, com fallback local; após instalar dependências, a aplicação não depende de backend.

## Experimentar

1. O mundo padrão é Dojô de sumô com dois robôs. Arraste a cena para orbitar; use scroll para zoom.
2. Play/Pause controla execução; Passo avança um tick de 0,05 s; Reset repete a condição inicial.
3. Selecione o robô e aplique controlador JS usando a ajuda disponível. O programa roda a cada tick pela API limitada.
4. Observe laser, odometria e bumper. Mundo pode ser editado/importado como JSON; há exemplos de labirinto e campo livre.
5. Gravar inicia no tick zero. Finalize e exporte. Abrir replay permite reproduzir e buscar ticks sem executar código do arquivo.

Sumô: derrota ao sair **completamente** do ringue; empate por saída simultânea ou 60 s sem vencedor. O círculo é marcação da modalidade, separada do mapa físico. **Física própria (feature 003)**: cada robô tem massa, aderência e motor com curva de torque; robôs se empurram, paredes são rígidas. De frente, robôs iguais travam; de lado, um empurra o outro para fora. No dojô, os robôs começam com a estratégia padrão de sumô, que usa a **memória do controlador** (feature 004: `memory(i)`/`remember(i, v)`, 16 posições) para abrir em curva, empurrar, recuar quando travada e contornar; em 6 de 10 seeds a luta padrão termina com vencedor; no labirinto, os robôs seguem a parede pela direita (feature 006) e percorrem todos os corredores em cerca de 1 minuto; o campo livre usa a estratégia genérica de desvio. Física plana simplificada, sem equivalência com robôs reais.

## Documentos que recriam o produto

- [Extração e decisões](specs/001-arena/requirements.md)
- [Constitution](.specify/memory/constitution.md)
- [Spec: histórias e aceites](specs/001-arena/spec.md)
- [Plan: arquitetura e algoritmos](specs/001-arena/plan.md)
- [Tasks](specs/001-arena/tasks.md) e [matriz de rastreabilidade](specs/001-arena/traceability.md)
- [Mundo](specs/001-arena/contracts/world.md), [controladores](specs/001-arena/contracts/controllers.md), [replay](specs/001-arena/contracts/replay.md) e [sessão/sumô](specs/001-arena/contracts/session.md)
- [Pesquisa das oito referências](specs/001-arena/references.md)
- [Quickstart e protocolo de regeneração](specs/001-arena/quickstart.md)
- [Validação e limitações](specs/001-arena/validation.md)
- [Feature 002: estratégia padrão de sumô](specs/002-sumo-default-strategy/spec.md) — [plan](specs/002-sumo-default-strategy/plan.md) e [tasks](specs/002-sumo-default-strategy/tasks.md)
- [Feature 005: correção do bumper](specs/005-bumper-contact-fix/spec.md) e [Feature 006: estratégia de labirinto](specs/006-maze-wall-follow/spec.md)
- [Feature 004: memória no controlador](specs/004-controller-memory/spec.md) — [plan](specs/004-controller-memory/plan.md), [research](specs/004-controller-memory/research.md) e [tasks](specs/004-controller-memory/tasks.md)
- [Feature 003: física real dos robôs](specs/003-robot-dynamics/spec.md) — [plan](specs/003-robot-dynamics/plan.md), [research](specs/003-robot-dynamics/research.md) e [tasks](specs/003-robot-dynamics/tasks.md)
- [Roteiro do pitch, até 10 minutos](docs/pitch.md)

Templates oficiais do SpecKit preservados com licença em `.specify/templates/`. A baseline documental foi escrita manualmente sobre esses templates; em 2026-11-23 a CLI `specify` foi instalada e inicializada (`specify init --here --integration claude`), disponibilizando os comandos `/speckit-*` em `.claude/skills/`. A primeira execução via CLI foi `/speckit-analyze`, cujas correções estão registradas em [validação](specs/001-arena/validation.md). Documentos foram escritos antes da implementação e atualizados após esclarecimentos. Nenhum motor de física pronto é usado (dinâmica própria); nenhum código do ecossistema meuPiá foi modificado. Sem bônus Portugol/WebSocket/BMAD nesta entrega.

## Testes e cobertura

V8 mede **todos os arquivos JS de src**, incluindo modalidade, interface e renderer; thresholds de linhas/statements/funções/branches ≥80%. Testes do render usam driver WebGL substituído, com cena Three.js real: cobertura não comprova pixels/GPU. QA de navegador e limites em validation.md. Os testes de aceite locais não são a suíte oculta da disciplina.

Relatórios versionados em [resumo de cobertura](coverage/coverage-summary.json), [LCOV](coverage/lcov.info) e [resultados de testes](coverage/tests.json). HTML gerado por `npm run test:coverage` em coverage/index.html. Atualize métricas antes de cada entrega e inclua README/relatórios no commit. CI executa verificações e publica relatório como artifact.

## Grupo e GitHub

**Anna Heloísa Malschitzky, William Fagundes e Sandriely Maciel** (trio). Repositório: [An-na021/RamBot-Arena](https://github.com/An-na021/RamBot-Arena).

Commits usam `Txxx: descrição`; cada task aponta para FR/NFR. A entrega usa a branch principal `main`; o desenvolvimento inicial está preservado na branch local `001-arena`. [Acompanhar testes e cobertura no GitHub Actions](https://github.com/An-na021/RamBot-Arena/actions). T011/T012 permanecem abertas até regeneração independente e apresentação efetivas.
