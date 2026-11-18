<!-- metrics:start -->
**92 testes · 100% de cobertura de linhas**
<!-- metrics:end -->

# SheepBotz Arena

PoC da Trilha 4, Trabalho Final de Spec-Driven Development. Simulador genérico de robôs de tração diferencial, com núcleo 2D headless e visualização 3D. Modalidade da demo: **sumô simplificado**. Framework: **GitHub SpecKit**. Assistente: Codex.

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

Sumô: derrota ao sair **completamente** do ringue; empate por saída simultânea ou 60 s sem vencedor. O círculo é marcação da modalidade, separada do mapa físico. Contatos bloqueiam movimento, **sem forças ou empurrões**. Esta PoC permite testar aproximação, contato e permanência; não reproduz a dinâmica de sumô físico. A estratégia padrão é desvio genérico, não estratégia competitiva. O roteiro do pitch inclui saída e vitória demonstráveis.

## Documentos que recriam o produto

- [Extração e decisões](specs/001-arena/requirements.md)
- [Constitution](.specify/memory/constitution.md)
- [Spec: histórias e aceites](specs/001-arena/spec.md)
- [Plan: arquitetura e algoritmos](specs/001-arena/plan.md)
- [Tasks](specs/001-arena/tasks.md) e [matriz de rastreabilidade](specs/001-arena/traceability.md)
- [Mundo](specs/001-arena/contracts/world.md), [controladores](specs/001-arena/contracts/controllers.md) e [replay](specs/001-arena/contracts/replay.md)
- [Pesquisa das oito referências](specs/001-arena/references.md)
- [Quickstart e protocolo de regeneração](specs/001-arena/quickstart.md)
- [Validação e limitações](specs/001-arena/validation.md)
- [Roteiro do pitch, até 10 minutos](docs/pitch.md)

Templates oficiais do SpecKit preservados com licença em `.specify/templates/`; fluxo documental conduzido pelo assistente, sem execução da CLI `specify`. Documentos foram escritos antes da implementação e atualizados após esclarecimentos. Nenhum motor de física ou código do ecossistema meuPiá foi modificado. Sem bônus Portugol/WebSocket/BMAD nesta entrega.

## Testes e cobertura

V8 mede **todos os arquivos JS de src**, incluindo modalidade, interface e renderer; thresholds de linhas/statements/funções/branches ≥80%. Testes do render usam driver WebGL substituído, com cena Three.js real: cobertura não comprova pixels/GPU. QA de navegador e limites em validation.md. Os testes de aceite locais não são a suíte oculta da disciplina.

Relatórios versionados em [resumo de cobertura](coverage/coverage-summary.json), [LCOV](coverage/lcov.info) e [resultados de testes](coverage/tests.json). HTML gerado por `npm run test:coverage` em coverage/index.html. Atualize métricas antes de cada entrega e inclua README/relatórios no commit. CI executa verificações e publica relatório como artifact.

## Grupo e GitHub

**Anna, William e Sandriely** (trio informado pelo usuário). URL GitHub: **pendente**.

Commits usam `Txxx: descrição`; cada task aponta para FR/NFR. Repositório Git local inicializado; publicação exige destino/conta GitHub do grupo. Depois de definir remoto, publique a branch `001-arena` e confira CI. T010/T011/T012 ficam abertas até publicação, regeneração independente e apresentação efetivas.
