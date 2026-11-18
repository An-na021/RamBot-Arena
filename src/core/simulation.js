import { parseWorld } from './world.js';
import { blocked, overlaps, integrate, laser, clamp } from './geometry.js';
import { compileController, DEFAULT_CONTROLLER } from './controller.js';

export class Simulation {
  constructor(input, sources = {}) {
    this.world = parseWorld(input);
    this.sources = Object.fromEntries(this.world.robots.map(r => [r.id, Object.hasOwn(sources,r.id) ? sources[r.id] : DEFAULT_CONTROLLER]));
    this.controllers = Object.fromEntries(Object.entries(this.sources).map(([id, code]) => [id, compileController(code)]));
    this.reset();
  }
  reset() {
    this.tick = 0; this.seed = this.world.seed || 1;
    this.robots = this.world.robots.map(r => ({ ...structuredClone(r), distance: 0, bumper: false, v: 0, w: 0 }));
    this.updateSensors();
  }
  updateSensors() { this.robots.forEach(r => { r.scan = laser(r, this.robots, this.world); }); }
  setController(id, source) {
    if (!Object.hasOwn(this.controllers,id)) throw new Error('Robô desconhecido');
    const fn = compileController(source); this.controllers[id] = fn; this.sources[id] = source;
  }
  snapshot() { return structuredClone({ tick: this.tick, time: this.tick * this.world.dt, robots: this.robots }); }
  step() {
    let seed = this.seed;
    const commands = this.robots.map(r => {
      let v = 0, w = 0;
      this.controllers[r.id]({
        readLaser: () => [...r.scan], readOdometry: () => ({ x:r.x, y:r.y, theta:r.theta, distance:r.distance }), readBumper: () => r.bumper,
        random: () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; },
        setSpeed: (linear, angular) => {
          if (!Number.isFinite(linear) || !Number.isFinite(angular)) throw new Error('Controlador: setSpeed exige dois números finitos');
          v = clamp(linear, -r.maxLinear, r.maxLinear); w = clamp(angular, -r.maxAngular, r.maxAngular);
        }
      });
      return { v, w };
    });
    let robots = this.robots.map((r, i) => ({ ...r, ...commands[i], bumper: false }));
    const n = Math.max(1, Math.ceil(Math.max(...commands.map(c => Math.abs(c.v))) * this.world.dt / (Math.min(...robots.map(r => r.radius)) / 2)));
    for (let s = 0; s < n; s++) {
      const next = robots.map(r => integrate(r, r.v, r.w, this.world.dt / n));
      robots = next.map((r, i) => {
        const hit = blocked(r, this.world) || next.some((other,j) => i !== j && overlaps(r, other)) || robots.some((other,j) => i !== j && overlaps(r, other));
        return hit ? { ...robots[i], theta:r.theta, bumper:true } : { ...r, distance:r.distance + Math.abs(r.v) * this.world.dt / n };
      });
    }
    this.seed = seed; this.robots = robots; this.tick++; this.updateSensors();
    return this.snapshot();
  }
}
