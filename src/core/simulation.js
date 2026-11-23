import { parseWorld } from './world.js';
import { laser, clamp, angle } from './geometry.js';
import { compileController, DEFAULT_CONTROLLER } from './controller.js';

// Dinâmica 2D própria (feature 003, constitution 2.0.0). Ver specs/003-robot-dynamics/research.md R1–R2.
const G = 9.81, ALPHA = 200, ITERATIONS = 10, MARGIN = 0.05, MIN_SUBSTEPS = 10, CORRECTION_PASSES = 6;

// Contatos de um robô com bordas do mapa e obstáculos: normal aponta para fora do corpo fixo.
function staticContacts(r, world, out) {
  const add = (nx, ny, gap) => { if (gap < MARGIN) out.push({ a: null, b: r, nx, ny, gap, acc: 0 }); };
  add(1, 0, r.x - r.radius); add(-1, 0, world.width - r.radius - r.x);
  add(0, 1, r.y - r.radius); add(0, -1, world.height - r.radius - r.y);
  for (const o of world.obstacles) {
    const cx = clamp(r.x, o.x, o.x + o.width), cy = clamp(r.y, o.y, o.y + o.height), dx = r.x - cx, dy = r.y - cy, d = Math.hypot(dx, dy);
    if (d > 1e-12) add(dx / d, dy / d, d - r.radius);
    else {
      const left = r.x - o.x, right = o.x + o.width - r.x, bottom = r.y - o.y, top = o.y + o.height - r.y, m = Math.min(left, right, bottom, top);
      add(...(m === left ? [-1, 0] : m === right ? [1, 0] : m === bottom ? [0, -1] : [0, 1]), -m - r.radius);
    }
  }
}

function contacts(robots, world) {
  const out = [];
  for (let i = 0; i < robots.length; i++) for (let j = i + 1; j < robots.length; j++) {
    const a = robots[i], b = robots[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), gap = d - a.radius - b.radius;
    if (gap < MARGIN) out.push({ a, b, nx: d > 1e-12 ? dx / d : 1, ny: d > 1e-12 ? dy / d : 0, gap, acc: 0 });
  }
  robots.forEach(r => staticContacts(r, world, out));
  return out;
}

function substep(robots, world, h) {
  for (const r of robots) {
    r.omega += clamp(r.w - r.omega, -ALPHA * h, ALPHA * h);
    r.c = Math.cos(r.theta); r.s = Math.sin(r.theta); r.vf0 = r.vx * r.c + r.vy * r.s; r.aL = 0; r.aT = 0;
    const accelerating = (r.v > r.vf0 && r.vf0 >= 0) || (r.v < r.vf0 && r.vf0 <= 0);
    const torque = accelerating ? Math.max(0, 1 - Math.abs(r.vf0) / (2 * r.maxLinear)) : 1; // curva de torque do motor CC
    r.limL = r.grip * r.mass * G * h * torque; r.limT = r.lateralGrip * r.mass * G * h;
  }
  const cs = contacts(robots, world);
  for (let it = 0; it < ITERATIONS; it++) {
    for (const r of robots) {
      const vf = r.vx * r.c + r.vy * r.s, nl = clamp(r.aL + r.mass * (r.v - vf), -r.limL, r.limL), dl = (nl - r.aL) / r.mass; r.aL = nl;
      r.vx += dl * r.c; r.vy += dl * r.s;
      const vt = r.vy * r.c - r.vx * r.s, nt = clamp(r.aT - r.mass * vt, -r.limT, r.limT), dt = (nt - r.aT) / r.mass; r.aT = nt;
      r.vx -= dt * r.s; r.vy += dt * r.c;
    }
    for (const k of cs) {
      const ib = 1 / k.b.mass, ia = k.a ? 1 / k.a.mass : 0;
      const u = (k.b.vx - (k.a ? k.a.vx : 0)) * k.nx + (k.b.vy - (k.a ? k.a.vy : 0)) * k.ny;
      const next = Math.max(k.acc + (-Math.max(k.gap, 0) / h - u) / (ia + ib), 0), d = next - k.acc; k.acc = next;
      k.b.vx += d * ib * k.nx; k.b.vy += d * ib * k.ny;
      if (k.a) { k.a.vx -= d * ia * k.nx; k.a.vy -= d * ia * k.ny; }
    }
  }
  for (const k of cs) if (k.acc > 1e-9) { k.b.bumper = true; // 005: só com força de contato
    if (k.a) k.a.bumper = true; }
  for (const r of robots) { r.pinned = false; r.px = r.x; r.py = r.y; r.x += r.vx * h; r.y += r.vy * h; r.theta = angle(r.theta + r.omega * h); }
  for (let pass = 0; pass < CORRECTION_PASSES; pass++) for (const k of contacts(robots, world)) if (k.gap < 0) {
    // robô encostado em parede/obstáculo é tratado como imóvel ao se separar de outro robô
    let ib = k.b.pinned && k.a ? 0 : 1 / k.b.mass, ia = k.a && !k.a.pinned ? 1 / k.a.mass : 0;
    if (ia + ib === 0) { ia = 1 / k.a.mass; ib = 1 / k.b.mass; }
    const p = -k.gap / (ia + ib);
    if (!k.a) k.b.pinned = true;
    k.b.x += k.nx * p * ib; k.b.y += k.ny * p * ib; if (-k.gap > 1e-6) k.b.bumper = true;
    if (k.a) { k.a.x -= k.nx * p * ia; k.a.y -= k.ny * p * ia; if (-k.gap > 1e-6) k.a.bumper = true; }
  }
  for (const r of robots) r.distance += Math.hypot(r.x - r.px, r.y - r.py);
}

export class Simulation {
  constructor(input, sources = {}) {
    this.world = parseWorld(input);
    this.sources = Object.fromEntries(this.world.robots.map(r => [r.id, Object.hasOwn(sources,r.id) ? sources[r.id] : DEFAULT_CONTROLLER]));
    this.controllers = Object.fromEntries(Object.entries(this.sources).map(([id, code]) => [id, compileController(code)]));
    this.reset();
  }
  reset() {
    this.tick = 0; this.seed = this.world.seed || 1;
    this.memory = Object.fromEntries(this.world.robots.map(r => [r.id, new Array(16).fill(0)])); // feature 004
    this.robots = this.world.robots.map(r => ({ ...structuredClone(r), distance: 0, bumper: false, v: 0, w: 0, vx: 0, vy: 0, omega: 0 }));
    this.updateSensors();
  }
  updateSensors() { this.robots.forEach(r => { r.scan = laser(r, this.robots, this.world); }); }
  setController(id, source) {
    if (!Object.hasOwn(this.controllers,id)) throw new Error('Robô desconhecido');
    const fn = compileController(source); this.controllers[id] = fn; this.sources[id] = source; this.memory[id] = new Array(16).fill(0);
  }
  snapshot() { return structuredClone({ tick: this.tick, time: this.tick * this.world.dt, robots: this.robots }); }
  step() {
    let seed = this.seed;
    const mem = Object.fromEntries(Object.entries(this.memory).map(([id, m]) => [id, [...m]])); // cópia de trabalho (atômica)
    const slot = i => { if (!Number.isInteger(i) || i < 0 || i > 15) throw new Error('Controlador: posição de memória deve ser inteiro de 0 a 15'); return i; };
    const commands = this.robots.map(r => {
      let v = 0, w = 0;
      this.controllers[r.id]({
        readLaser: () => [...r.scan], readOdometry: () => ({ x:r.x, y:r.y, theta:r.theta, distance:r.distance }), readBumper: () => r.bumper,
        memory: i => mem[r.id][slot(i)],
        remember: (i, value) => { if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Controlador: memória aceita apenas números finitos'); mem[r.id][slot(i)] = value; },
        random: () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; },
        setSpeed: (linear, angular) => {
          if (!Number.isFinite(linear) || !Number.isFinite(angular)) throw new Error('Controlador: setSpeed exige dois números finitos');
          v = clamp(linear, -r.maxLinear, r.maxLinear); w = clamp(angular, -r.maxAngular, r.maxAngular);
        }
      });
      return { v, w };
    });
    const robots = this.robots.map((r, i) => ({ ...r, ...commands[i], bumper: false }));
    const dt = this.world.dt;
    const speed = Math.max(...robots.map(r => Math.max(Math.hypot(r.vx, r.vy), Math.abs(r.v)) + r.grip * G * dt));
    const n = Math.max(MIN_SUBSTEPS, Math.ceil(speed * dt / (Math.min(...robots.map(r => r.radius)) / 4)));
    for (let k = 0; k < n; k++) substep(robots, this.world, dt / n);
    for (const r of robots) for (const key of ['c', 's', 'vf0', 'aL', 'aT', 'limL', 'limT', 'px', 'py', 'pinned']) delete r[key];
    this.memory = mem; this.seed = seed; this.robots = robots; this.tick++; this.updateSensors();
    return this.snapshot();
  }
}
