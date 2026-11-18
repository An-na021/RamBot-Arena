# Contrato do controlador v1

FR-004. Programa é o corpo executado uma vez por tick, não uma função declarada pelo usuário. Cada robô tem sua fonte própria; variáveis reiniciam por tick. Sem fonte fornecida, usar estratégia de desvio: raio 4 para scan de nove raios, senão raio 0; se bumper ou leitura <0,9 m, v=0/w=1,6; senão v=0,65/w=0. Essa estratégia é genérica, não um competidor otimizado de sumô.

| API | Retorno / efeito |
| --- | --- |
| readLaser() | cópia do array numérico de leituras do início do tick |
| readOdometry() | objeto `{x,y,theta,distance}` do início do tick |
| readBumper() | boolean do contato do tick anterior |
| setSpeed(v,w) | ambos números finitos; clamp por maxLinear/maxAngular; última chamada no tick prevalece |
| random() | PRNG xorshift32 determinístico, [0,1); compartilhado na ordem dos robôs do arquivo |

Subconjunto de JavaScript aceito: comentários; const/let/var com identificadores e inicializadores opcionais; expressões; blocos; if/else; operador ternário; literais number/boolean; operadores + - * / %, < > <= >= === !==, && || e unários ! + -. Leitura por índice inteiro válido em array e `.length`; objeto de odometria expõe x/y/theta/distance. Nomes de API reservados. Sem suporte a funções, atribuições posteriores, strings, null, objetos/arrays literais, loops, classes, imports, propriedades de protótipo, chamadas fora da lista ou operadores adicionais.

Acorn ecmaVersion 2022 gera AST validada por allowlist. Limites: fonte 8.000 caracteres; até 500 nós; profundidade 40; orçamento 500 avaliações. Números não finitos vindos de expressões são rejeitados por setSpeed. Sem execução de strings/eval ou acesso a globais de rede, tempo, DOM, Math.random ou arquivos. Falha de qualquer robô aborta tick inteiro sem alterar poses, tick ou PRNG; Session pausa e UI mostra mensagem. Erro de compilação ao aplicar preserva programa anterior. Durante gravação/replay não se altera programa.

Sem escopo lexical completo de JS: ambiente de variáveis único por execução do tick, inclusive para blocos. O subconjunto é intencional e exposto ao usuário; não anunciar execução de JavaScript irrestrito. A proteção é feita por interpretação de AST, não sandbox de execução de JS arbitrário.
