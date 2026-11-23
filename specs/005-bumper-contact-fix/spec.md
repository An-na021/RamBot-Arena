# Feature Specification: Correção do bumper

**Feature Branch**: `005-bumper-contact-fix`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Correção do bumper (regressão da feature 003): o bumper deve indicar contato com força — o robô empurrando ou sendo empurrado por parede, obstáculo ou outro robô, ou entrando na parede — e não apenas estar encostado. Hoje, encostado e girando no lugar, o bumper fica ligado para sempre e o programa genérico de desvio gira indefinidamente: no labirinto os robôs ficam 89–96% do tempo parados girando, no campo livre 74%. Deve restaurar o significado do contrato 001 ('movimento bloqueado') sem quebrar empurrão, travamento e as lutas de sumô (6/10 com vencedor)."

Relação: corrige FR-007 da 003-robot-dynamics; restaura o significado de bumper de `specs/001-arena/contracts/world.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Robôs não ficam presos girando na parede (Priority: P1)

Como usuário, ao rodar o campo livre ou o labirinto com o programa padrão, quero que o robô bata, gire e siga em frente, em vez de ficar girando para sempre encostado na parede.

**Why this priority**: É a regressão observada; deixa labirinto e campo livre inutilizáveis.

**Independent Test**: Rodar campo livre e labirinto por 60 s e medir tempo parado e distância percorrida.

**Acceptance Scenarios**:

1. **Given** o campo livre com o programa padrão, **When** roda 60 s, **Then** o robô fica parado menos de 20% do tempo e percorre mais de 25 m.
2. **Given** o labirinto com os programas padrão, **When** roda 60 s, **Then** cada robô fica parado menos de 20% do tempo.
3. **Given** um robô encostado na parede girando no lugar sem empurrá-la, **When** passa um tick, **Then** o bumper fica desligado.

---

### User Story 2 - Bumper continua mostrando choques reais (Priority: P2)

Como responsável pelo controle, quero que o bumper ligue quando o robô bate, empurra ou é empurrado, para que minhas estratégias reajam a contato.

**Why this priority**: Preserva o sensor e as lutas de sumô.

**Independent Test**: Choque contra parede, empurrão entre robôs e travamento frente a frente ligam o bumper.

**Acceptance Scenarios**:

1. **Given** um robô andando contra uma parede, **When** bate, **Then** o bumper liga.
2. **Given** dois robôs se empurrando frente a frente, **When** estão travados, **Then** os dois têm bumper ligado.
3. **Given** um robô parado sendo empurrado por outro, **When** o empurrão acontece, **Then** o bumper do empurrado liga.

### Edge Cases

- Robô espremido entre parede e outro robô: bumper ligado enquanto houver força.
- Robô encostado lateralmente andando paralelo à parede sem pressioná-la: bumper desligado.
- Correção de sobreposição mínima (arredondamento numérico) não liga o bumper.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O bumper MUST ligar no tick em que houve força de contato entre o robô e parede, obstáculo ou outro robô (bater, empurrar, ser empurrado, travar).
- **FR-002**: O bumper MUST ficar desligado quando o robô apenas encosta, sem força de contato (ex.: girando no lugar ou andando paralelo).
- **FR-003**: Sobreposição corrigida maior que um limite mínimo MUST ligar o bumper; correções da ordem de arredondamento numérico MUST NOT ligá-lo.
- **FR-004**: Empurrão, travamento, determinismo, ausência de penetração e regras de sumô MUST permanecer como na 003/004.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Campo livre, 60 s: robô parado < 20% do tempo e > 25 m percorridos (antes: 74% e 10 m).
- **SC-002**: Labirinto, 60 s: cada robô parado < 20% do tempo (antes: 89–96%).
- **SC-003**: Lutas de sumô padrão: continua ≥ 3 de 10 seeds com vencedor.
- **SC-004**: Suíte automatizada 100% aprovada e cobertura ≥ 80%.

## Assumptions

- "Parado" = deslocamento menor que 5 mm no tick.
- O programa genérico de desvio não muda nesta feature; atravessar o labirinto é tratado na feature 006.
