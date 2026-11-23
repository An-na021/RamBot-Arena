# RamBot Arena — pitch e demo de 9 minutos

Sem código nos slides. Grupo: **Anna Heloísa Malschitzky, William Fagundes e Sandriely Maciel**. Sugestão de fala: Anna Heloísa apresenta problema/SDD, William conduz a demo, Sandriely apresenta evidências e limites. Slides e demo devem mostrar comportamento e evidências, sem prometer equivalência física. IA: Codex (baseline) e Claude Code; framework: GitHub SpecKit (CLI `specify` com integração Claude desde 2026-11-23).

| Tempo | Conteúdo | Evidência ao vivo |
| --- | --- | --- |
| 0:00–0:45 | Problema: testar estratégias sem desgaste dos robôs SheepBotz | Público e tarefa |
| 0:45–1:30 | Proposta: arena no navegador; lógica plana, observação 3D; sumô como foco | Abrir Dojô, mostrar dois robôs e ringue |
| 1:30–2:30 | SDD: briefing incompleto, perguntas, constitution, spec/plan/tasks e rastreabilidade | Mostrar índice documental, sem exibir código nos slides |
| 2:30–3:15 | Referências: Stage/Gazebo e Roboton; fluxo educacional das demais | Explicar decisões em references.md |
| 3:15–6:45 | Demo: passo/pose, câmera, laser, controlador e contato; saída/vitória; gravar/replay/reset | Roteiro abaixo |
| 6:45–7:45 | Evidências: número de testes e quatro métricas de cobertura, testes headless | README e relatório HTML, gerados antes da aula |
| 7:45–9:00 | Limites, valor e próximos passos | Física plana própria (massa, aderência, empurrão), sem equivalência com robôs reais; API JS limitada (sem laços), com memória de 16 números por robô; Portugol/WS/BMAD futuros |

## Preparação

Executar `npm ci`, `npm run check` e `npm run dev` antes de apresentar. Abrir a URL Local no navegador com WebGL. Manter relatório HTML e README abertos. Ensaiar com o mesmo notebook; nenhum serviço externo é necessário depois da instalação. Fontes têm fallback. Exportar um replay de reserva; não apresentar replay como demo ao vivo.

## Roteiro de demo (3 min 30 s)

1. Mundo Dojô padrão, mostrar que os dois robôs estão no círculo. Avançar Passo; tempo aumenta 0,05 s. Mostrar x/y e laser central detectando adversário. Orbitar e ocultar/mostrar raios. Reset.
2. Executar ambos com o programa padrão de sumô: abrem em curva, se chocam, recuam quando travam, contornam e se empurram; em várias seeds um empurra o outro para fora. Mostrar no editor as fases guardadas na memória. Reset repete exatamente a mesma luta.
3. Para garantir final curto e reproduzível, configurar sheep-01 para recuar (comando `setSpeed(-1,0);`) e sheep-02 parado (`setSpeed(0,0);`). Aplicar cada programa pelo editor ao vivo, **fora dos slides**. Clicar Gravar e Iniciar. Sheep-01 sai completamente pela esquerda em aproximadamente 2,6 s de simulação. Execução pausa e sheep-02 vence.
4. Finalizar/exportar gravação; abrir o arquivo exportado; mover slider ao tick final e conferir resultado/pose iguais. Reset do replay volta ao primeiro frame. Sair do replay retorna à rodada inicial. Demonstrar erro de mundo inválido somente se houver tempo.
5. Mostrar o labirinto: os robôs seguem a parede pela direita e passam por todos os corredores; evidencia que o núcleo é genérico e que cada modalidade traz sua estratégia.

## Respostas preparadas

- Por que deterministicamente? Comparar estratégias e reproduzir falhas sob o mesmo mundo, seed e número de passos.
- A IA escreveu tudo? Assistente acelerou artefatos e implementação; grupo revisa decisões, entende limites e executa apresentação. Não inventar revisão já realizada.
- A física é real? É dinâmica 2D própria (massa, aderência, curva de torque, impulso no contato), sem motor pronto, determinística; simplificada: corpos circulares, sem 3D. Por isso, robôs iguais de frente travam, como no sumô físico.
- Como provar que spec recria? Protocolo em quickstart.md; regeneração independente ainda exige execução e registro (T011). Não confundir cobertura com essa prova.
- Por que não engine pronta? Restrição explícita da trilha. Three.js apenas desenha estado; core pode rodar no Node.
- Nota máxima? Escopo completo local inclui multi-robôs, inspeção, gravação/replay; nota depende da avaliação dos documentos, pitch e regeneração. Bônus não reivindicados.
