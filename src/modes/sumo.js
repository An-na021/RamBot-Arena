export function parseSumo(config, world) {
  if (config === undefined) return null;
  if (!config || config.type !== 'sumo' || world.robots.length !== 2 ||
      !['x','y','radius','maxTicks'].every(k=>Number.isFinite(config[k])) || config.radius <= 0 ||
      config.x-config.radius < 0 || config.y-config.radius < 0 || config.x+config.radius > world.width || config.y+config.radius > world.height ||
      !Number.isInteger(config.maxTicks) || config.maxTicks < 1 || config.maxTicks > 10000) throw new Error('Sumô: ringue inválido; exige dois robôs, círculo dentro do mapa e limite de 1–10.000 ticks');
  if (world.robots.some(r=>Math.hypot(r.x-config.x,r.y-config.y)+r.radius > config.radius)) throw new Error('Sumô: robôs devem iniciar inteiramente dentro do ringue');
  return {type:'sumo',x:config.x,y:config.y,radius:config.radius,maxTicks:config.maxTicks};
}

// Programa padrão de sumô (features 002, 003 e 004): abertura em curva, empurra, detecta travamento,
// recua, flanqueia e rastreia o adversário. Memória: 0 fase, 1 contador, 2 travado, 3 lado do flanco,
// 4 duração do recuo, 5 odometria anterior, 6 idade, 7 lado da abertura, 8 duração da abertura.
// cos/sen por aproximação de Bhaskara I (specs/002 research R1); táticas em specs/004 research R4.
export function sumoController(scenario) {
  const edge = (scenario.radius - 0.6) ** 2, inside = (scenario.radius - 0.05) ** 2;
  return `// Estratégia padrão de sumô: ringue centro (${scenario.x}; ${scenario.y}), raio ${scenario.radius}
const o = readOdometry();
const t = o.theta;
const a = t < 0 ? -t : t;
const b = a > 1.5707963 ? 3.14159265 - a : a;
const cb = (9.8696044 - 4 * b * b) / (9.8696044 + b * b);
const c = a > 1.5707963 ? -cb : cb;
const e = a > 1.5707963 ? a - 1.5707963 : 1.5707963 - a;
const sa = (9.8696044 - 4 * e * e) / (9.8696044 + e * e);
const s = t < 0 ? -sa : sa;
const dx = o.x - ${scenario.x};
const dy = o.y - ${scenario.y};
const scan = readLaser();
const n = scan.length;
const mid = n % 2 === 1 ? (n - 1) / 2 : n / 2;
const f = scan[mid];
const seen = (dx + f * c) * (dx + f * c) + (dy + f * s) * (dy + f * s) < ${inside};
const side = scan[n - 1] < scan[0] ? 1 : -1;
const near = scan[n - 1] < 1 || scan[0] < 1;
const touch = readBumper();
const phase = memory(0);
const timer = memory(1) + 1;
const moved = o.distance - memory(5);
const stuck = touch && seen && moved < 0.01 ? memory(2) + 1 : 0;
const age = memory(6) + 1;
remember(1, timer);
remember(2, stuck);
remember(5, o.distance);
remember(6, age);
if (age === 1) {
  remember(7, random() < 0.5 ? 1 : -1); // abertura: sorteia lado e duração
  remember(8, 3 + random() * 6);
  setSpeed(1, 0);
} else if (age <= memory(8) && !touch) {
  setSpeed(1, memory(7) * 3); // abertura em curva para chegar de lado
} else if (phase === 1 && timer <= memory(4)) {
  setSpeed(-0.8, 0); // recuo
} else if (phase === 1) {
  remember(0, 2);
  remember(1, 0);
  setSpeed(0.9, memory(3) * 2.2);
} else if (phase === 2 && timer <= 8) {
  setSpeed(0.9, memory(3) * 2.2); // flanco
} else if (stuck > 8) {
  remember(0, 1); // travado de frente: recua e depois contorna
  remember(1, 0);
  remember(3, random() < 0.5 ? 1 : -1);
  remember(4, 4 + random() * 10);
  setSpeed(-0.8, 0);
} else if (seen) {
  remember(0, 0);
  setSpeed(1, 0); // adversário à frente dentro do ringue: empurra
} else if (touch || near) {
  remember(0, 0);
  setSpeed(0.3, side * 3); // adversário ao lado: gira para ele
} else if (dx * dx + dy * dy > ${edge} && dx * c + dy * s > 0) {
  remember(0, 0);
  setSpeed(0, 2.5); // livre, perto da borda e virado para fora: volta
} else {
  remember(0, 0);
  setSpeed(0.25, 1.4); // procura em arco
}`;
}

export function sumoResult(config, state) {
  if (!config) return null;
  const outside=state.robots.filter(r=>Math.hypot(r.x-config.x,r.y-config.y)-r.radius > config.radius+1e-10);
  if(outside.length===2)return {finished:true,winner:null,reason:'Saída simultânea: empate'};
  if(outside.length===1){const winner=state.robots.find(r=>r.id!==outside[0].id).id;return {finished:true,winner,reason:`${winner} venceu: adversário fora do ringue`};}
  if(state.tick>=config.maxTicks)return {finished:true,winner:null,reason:'Tempo limite: empate'};
  return {finished:false,winner:null,reason:'Combate em andamento'};
}
