// Modalidade labirinto (feature 006): sem regra de vitória; fornece o programa padrão de seguir parede.
export function parseMaze(config) {
  if (!config || config.type !== 'labirinto') throw new Error('Labirinto: modalidade inválida');
  return { type: 'labirinto' };
}

// Seguidor de parede pela direita (regra da mão direita). Parâmetros em specs/006-maze-wall-follow/research.md R1.
export function mazeController() {
  return `// Estratégia padrão de labirinto: seguir a parede pela direita
const scan = readLaser();
const n = scan.length;
const mid = n % 2 === 1 ? (n - 1) / 2 : n / 2;
const k = n >= 5 ? 2 : 0;
const f = scan[mid];
const r = scan[0];
const rf = scan[mid - k];
const turn = (r - 0.7) * -2.5;
const w = turn > 1.5 ? 1.5 : turn < -1.5 ? -1.5 : turn;
if (f < 0.75 || rf < 0.55) {
  setSpeed(0, 2); // parede à frente: vira à esquerda
} else if (r > 1.5 && rf > 1.8) {
  setSpeed(0.35, -1.6); // perdeu a parede: contorna pela direita
} else {
  setSpeed(0.7, w); // segue a parede a ~0,7 m
}`;
}
