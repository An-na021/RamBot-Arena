# Feature Specification: Estratégia de labirinto

**Feature Branch**: `006-maze-wall-follow`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Estratégia de labirinto: no mundo labirinto, cada robô sem programa próprio deve iniciar com um programa padrão de seguir parede (regra da mão direita), no lugar do desvio genérico, para atravessar os corredores. Hoje, em 250 s, sheep-01 nunca sai do primeiro corredor e sheep-02 só percorre os dois últimos (o mesmo acontecia antes da física nova). O labirinto passa a ser uma modalidade identificada no mundo (como o sumô), sem regra de vitória nesta feature; campo livre e outros mundos continuam com o desvio genérico; usa só a API e o subconjunto existentes (memória permitida). Critério: em tempo limitado, cada robô deve passar por todos os corredores do labirinto sem ficar preso."

Relação: segue o padrão da modalidade sumô (001 FR-010, 002); depende da correção do bumper (005).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Robôs atravessam o labirinto (Priority: P1)

Como integrante da SheepBotz, ao abrir o labirinto e apertar Iniciar sem programar nada, quero ver os robôs percorrendo todos os corredores, como um robô de labirinto real que segue a parede.

**Why this priority**: É a limitação observada: os robôs nunca saem do corredor inicial.

**Independent Test**: Rodar o labirinto padrão e registrar por quais corredores cada robô passa.

**Acceptance Scenarios**:

1. **Given** o labirinto padrão com os programas padrão, **When** a simulação roda por 120 s, **Then** cada robô passa pelos 4 corredores.
2. **Given** um robô seguindo a parede, **When** chega ao fim de uma parede, **Then** contorna a ponta e continua do outro lado.
3. **Given** um robô de frente para uma parede, **When** a alcança, **Then** vira e segue ao longo dela, sem ficar preso.

---

### User Story 2 - Modalidade identificada no mundo (Priority: P2)

Como usuário, quero que o mundo diga que é um labirinto, para que o simulador escolha o programa certo, enquanto campo livre e mundos sem modalidade continuam como antes.

**Why this priority**: Mantém o núcleo genérico e as regras fora dele (constitution II/III).

**Independent Test**: Carregar labirinto, campo livre e sumô e verificar o programa padrão de cada um.

**Acceptance Scenarios**:

1. **Given** o labirinto, **When** carregado, **Then** cada robô recebe o programa de seguir parede, visível e editável.
2. **Given** o campo livre, **When** carregado, **Then** o robô continua com o desvio genérico.
3. **Given** um mundo com modalidade desconhecida ou mal formada, **When** carregado, **Then** recebe erro claro e o mundo anterior permanece.

### Edge Cases

- Labirinto com outras paredes ou tamanhos: o programa segue a parede sem depender das coordenadas do mundo padrão.
- Dois robôs se encontrando num corredor: não ficam presos um no outro por mais de 5 s.
- Programa próprio aplicado a um robô substitui o padrão só desse robô.
- Laser com poucos raios: o programa continua válido e sem erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O mundo MUST poder declarar a modalidade labirinto; a declaração é validada antes de trocar o mundo ativo e erros identificam o campo.
- **FR-002**: Em mundo labirinto, todo robô sem programa próprio MUST iniciar com o programa padrão de seguir parede pela direita.
- **FR-003**: O programa MUST manter a parede à direita a uma distância aproximadamente constante, virar à esquerda diante de parede à frente e contornar pela direita o fim de uma parede.
- **FR-004**: O programa MUST usar apenas a API e o subconjunto do controlador já existentes e respeitar seus limites.
- **FR-005**: Campo livre e mundos sem modalidade MUST continuar com o programa genérico de desvio; o sumô continua com sua estratégia.
- **FR-006**: A modalidade labirinto nesta feature MUST NOT ter regra de vitória, pausa automática ou placar.

### Key Entities

- **Modalidade labirinto**: marcação do mundo que identifica o cenário de labirinto; sem parâmetros obrigatórios.
- **Programa padrão de labirinto**: seguidor de parede pela direita atribuído aos robôs sem programa próprio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No labirinto padrão, cada robô passa pelos 4 corredores em até 120 s de simulação.
- **SC-002**: Nenhum robô fica parado (deslocamento < 5 mm por tick) por mais de 5 s seguidos em 250 s.
- **SC-003**: Nenhuma penetração em paredes em 5.000 ticks.
- **SC-004**: Campo livre e sumô mantêm seus comportamentos (testes existentes aprovados).
- **SC-005**: Suíte 100% aprovada e cobertura ≥ 80%.

## Assumptions

- Corredores do labirinto padrão: à esquerda da parede em x = 3; entre x = 3 e x = 6; entre x = 6 e x = 9; à direita de x = 9.
- O laser padrão do labirinto (9 raios, 180°) é suficiente para seguir parede.
- Regra de chegada/vitória no labirinto fica para outra feature.
