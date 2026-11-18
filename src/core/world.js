import { blocked, overlaps } from './geometry.js';

const fail = (path, reason) => { throw new Error(`Mundo inválido: ${path} ${reason}`); };
function num(value, path, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(path, `deve ser número entre ${min} e ${max}`);
  return value;
}
function object(value, path) { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'deve ser objeto'); }

export function parseWorld(input) {
  let value = input;
  if (typeof input === 'string') {
    if (input.length > 200000) fail('arquivo', 'excede 200 KB');
    try { value = JSON.parse(input); } catch { fail('JSON', 'não pôde ser lido'); }
  }
  object(value, 'raiz');
  const world = { name: typeof value.name === 'string' ? value.name.slice(0, 80) : 'Arena',
    width: num(value.width, 'width', 1, 50), height: num(value.height, 'height', 1, 50),
    dt: num(value.dt ?? 0.05, 'dt', 0.001, 0.1), seed: num(value.seed ?? 42, 'seed', 0, 4294967295), obstacles: [], robots: [] };
  if (!Number.isInteger(world.seed)) fail('seed', 'deve ser inteiro');
  if (!Array.isArray(value.obstacles) || value.obstacles.length > 100) fail('obstacles', 'deve ser lista com até 100 itens');
  world.obstacles = value.obstacles.map((o, i) => {
    const p = `obstacles[${i}]`; object(o, p);
    const item = { x: num(o.x, `${p}.x`, 0, world.width), y: num(o.y, `${p}.y`, 0, world.height),
      width: num(o.width, `${p}.width`, 0.001, world.width), height: num(o.height, `${p}.height`, 0.001, world.height) };
    if (item.x + item.width > world.width || item.y + item.height > world.height) fail(p, 'ultrapassa o mapa');
    return item;
  });
  if (!Array.isArray(value.robots) || value.robots.length < 1 || value.robots.length > 8) fail('robots', 'deve conter de 1 a 8 robôs');
  const ids = new Set();
  world.robots = value.robots.map((r, i) => {
    const p = `robots[${i}]`; object(r, p);
    if (typeof r.id !== 'string' || !/^[a-zA-Z0-9_-]{1,24}$/.test(r.id) || ids.has(r.id)) fail(`${p}.id`, 'deve ser único, com 1–24 letras, números, _ ou -');
    ids.add(r.id); object(r.laser, `${p}.laser`);
    const robot = { id: r.id, x: num(r.x, `${p}.x`, 0, world.width), y: num(r.y, `${p}.y`, 0, world.height),
      theta: num(r.theta ?? 0, `${p}.theta`, -Math.PI, Math.PI), radius: num(r.radius ?? 0.25, `${p}.radius`, 0.1, 1),
      maxLinear: num(r.maxLinear ?? 1, `${p}.maxLinear`, 0.01, 3), maxAngular: num(r.maxAngular ?? 3, `${p}.maxAngular`, 0.01, 10),
      laser: { rays: num(r.laser.rays, `${p}.laser.rays`, 1, 64), range: num(r.laser.range, `${p}.laser.range`, 0.1, 50), fov: num(r.laser.fov, `${p}.laser.fov`, 0, Math.PI * 2) } };
    if (!Number.isInteger(robot.laser.rays)) fail(`${p}.laser.rays`, 'deve ser inteiro');
    if (blocked(robot, world)) fail(p, 'posição inicial colide com borda ou obstáculo');
    return robot;
  });
  world.robots.forEach((r, i) => { if (world.robots.slice(i + 1).some(other => overlaps(r, other))) fail('robots', 'posições iniciais se sobrepõem'); });
  return world;
}
