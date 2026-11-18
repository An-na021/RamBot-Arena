# Pitch e demo — duração alvo 9 minutos

Sem código nos slides. Grupo: **Anna, William e Sandriely**. Sugestão de fala: Anna apresenta problema/SDD, William conduz demo, Sandriely apresenta evidências/limites. Slides e demo devem mostrar comportamento e evidências, sem prometer equivalência física. IA: Codex; framework: GitHub SpecKit.

| Tempo | Conteúdo | Evidência ao vivo |
| --- | --- | --- |
| 0:00–0:45 | Problema: testar estratégias sem desgaste dos robôs SheepBotz | Público e tarefa |
| 0:45–1:30 | Proposta: arena no navegador; lógica plana, observação 3D; sumô como foco | Abrir Dojô, mostrar dois robôs e ringue |
| 1:30–2:30 | SDD: briefing incompleto, perguntas, constitution, spec/plan/tasks e rastreabilidade | Mostrar índice documental, sem exibir código nos slides |
| 2:30–3:15 | Referências: Stage/Gazebo e Roboton; fluxo educacional das demais | Explicar decisões em references.md |
| 3:15–6:45 | Demo: passo/pose, câmera, laser, controlador e contato; saída/vitória; gravar/replay/reset | Roteiro abaixo |
| 6:45–7:45 | Evidências: número de testes e quatro métricas de cobertura, testes headless | README e relatório HTML, gerados antes da aula |
| 7:45–9:00 | Limites, valor e próximos passos | Contatos bloqueantes, sem empurrão físico; API JS limitada; Portugol/WS/BMAD futuros |

## Preparação

Executar `npm ci`, `npm run check` e `npm run dev` antes de apresentar. Abrir a URL Local no navegador com WebGL. Manter relatório HTML e README abertos. Ensaiar com o mesmo notebook; nenhum serviço externo é necessário depois da instalação. Fontes têm fallback. Exportar um replay de reserva; não apresentar replay como demo ao vivo.

## Roteiro de demo (3 min 30 s)

1. Mundo Dojô padrão, mostrar que os dois robôs estão no círculo. Avançar Passo; tempo aumenta 0,05 s. Mostrar x/y e laser central detectando adversário. Orbitar e ocultar/mostrar raios. Reset.
2. Executar ambos com programa padrão por alguns segundos. Pausar e selecionar segundo robô. Explicar contato bloqueante e bumper; não há força de empurrão. Reset permite repetir estado.
3. Para garantir final curto e reproduzível, configurar sheep-01 para recuar (comando `setSpeed(-1,0);`) e sheep-02 parado (`setSpeed(0,0);`). Aplicar cada programa pelo editor ao vivo, **fora dos slides**. Clicar Gravar e Iniciar. Sheep-01 sai completamente pela esquerda em aproximadamente 2,6 s de simulação. Execução pausa e sheep-02 vence.
4. Finalizar/exportar gravação; abrir o arquivo exportado; mover slider ao tick final e conferir resultado/pose iguais. Reset do replay volta ao primeiro frame. Sair do replay retorna à rodada inicial. Demonstrar erro de mundo inválido somente se houver tempo.
5. Mostrar campo livre ou labirinto rapidamente para evidenciar que o núcleo não depende do sumô.

## Respostas preparadas

- Por que deterministicamente? Comparar estratégias e reproduzir falhas sob o mesmo mundo, seed e número de passos.
- A IA escreveu tudo? Assistente acelerou artefatos e implementação; grupo revisa decisões, entende limites e executa apresentação. Não inventar revisão já realizada.
- Por que sem empurrão? Escopo reduzido de PoC com cinemática e colisão simples exigidas; empurrão cinemático/físico seria novo requisito com seus próprios aceites. Limite declarado na constitution e na interface.
- Como provar que spec recria? Protocolo em quickstart.md; regeneração independente ainda exige execução e registro (T011). Não confundir cobertura com essa prova.
- Por que não engine pronta? Restrição explícita da trilha. Three.js apenas desenha estado; core pode rodar no Node.
- Nota máxima? Escopo completo local inclui multi-robôs, inspeção, gravação/replay; nota depende da avaliação dos documentos, pitch e regeneração. Bônus não reivindicados.
