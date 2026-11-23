# Data Model — 005-bumper-contact-fix

Sem entidades novas. Muda apenas a regra do campo existente:

| Campo | Regra |
| --- | --- |
| `Estado dinâmico do robô.bumper` | `true` se, em algum subpasso do tick, houve impulso de contato > 1e-9 N·s com parede, obstáculo ou robô, ou correção de sobreposição > 1e-6 m; `false` caso contrário (inclusive apenas encostado) |
