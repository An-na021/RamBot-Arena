# Contrato de gravação/replay v1

FR-009. Arquivo JSON `{version:1,world:<mundo>,frames:[<snapshot>]}`. Captura inicia após reset e contém frame zero. Até 5.001 frames (estado inicial + 5.000 ticks). Ao atingir limite, para de capturar, guarda gravação e informa usuário; execução permanece disponível. Exportar finaliza captura. Sem captura anterior, erro.

Cada frame tem tick inteiro igual ao índice, time igual a tick*dt e robôs na ordem/IDs do mundo. Campos numéricos x/y/theta/distance/v/w finitos; x/y dentro do mapa com raio; distance ≥0; bumper boolean; scan com mesmo número de raios e valores entre zero e range. Normalizar robô com configuração do mundo e copiar somente campos de estado conhecidos. Rejeitar versão, cardinalidade, sequência temporal e leituras inválidas antes de trocar modo. Limite de importação: 100.000.000 caracteres/bytes na UI. Com limites de robôs/raios/ticks, exportação produz arquivos compatíveis com esse teto.

Programa do controlador não é parte do replay. Ler arquivo nunca executa código. Replay avança por snapshots; play/pause/step/reset e slider operam frames. Step no último frame mantém estado e pausa; reset retorna ao frame zero. Seek exige inteiro no intervalo. Modo replay preserva simulação original para retorno com reset ao encerrar. Gravação de sumô inclui scenario no mundo; Session valida a modalidade antes de importar e resultado deriva dos frames.

Gravação é uma captura de estados, não formato antifraude: validação estrutural não prova que frames obedecem à cinemática ou que sensores correspondem às poses. Não retomar simulação a partir de replay. Novo mundo limpa gravação anterior. Reset cancela captura em andamento; gravação concluída pode continuar disponível até carregar novo mundo ou iniciar nova captura.
