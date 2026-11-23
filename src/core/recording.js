import { parseWorld } from './world.js';
export const MAX_TICKS = 5000;

export function parseRecording(input) {
  let data = input;
  if (typeof input === 'string') {
    if (input.length > 100000000) throw new Error('Replay: arquivo excede 100 MB');
    try { data = JSON.parse(input); } catch { throw new Error('Replay: JSON inválido'); }
  }
  if (!data || data.version !== 1 || !Array.isArray(data.frames) || data.frames.length < 1 || data.frames.length > MAX_TICKS + 1) throw new Error('Replay: versão ou quantidade de frames inválida');
  const world = parseWorld(data.world);
  const frames = data.frames.map((f, i) => {
    if (!f || f.tick !== i || f.time !== i * world.dt || !Array.isArray(f.robots) || f.robots.length !== world.robots.length) throw new Error(`Replay: frame ${i} inválido`);
    const robots = f.robots.map((r,j) => {
      const initial = world.robots[j];
      if (!r || r.id !== initial.id || !['x','y','theta','distance','v','w'].every(k => typeof r[k] === 'number' && Number.isFinite(r[k])) ||
        r.x < initial.radius-1e-10 || r.x > world.width - initial.radius+1e-10 || r.y < initial.radius-1e-10 || r.y > world.height - initial.radius+1e-10 || r.distance < 0 || typeof r.bumper !== 'boolean' ||
        !Array.isArray(r.scan) || r.scan.length !== initial.laser.rays || !r.scan.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= initial.laser.range)) throw new Error(`Replay: robô no frame ${i} inválido`);
      const dyn = {};
      for (const k of ['vx', 'vy', 'omega']) {
        if (r[k] !== undefined && (typeof r[k] !== 'number' || !Number.isFinite(r[k]))) throw new Error(`Replay: robô no frame ${i} inválido`);
        dyn[k] = r[k] ?? 0;
      }
      return { ...initial, x:r.x, y:r.y, theta:r.theta, distance:r.distance, v:r.v, w:r.w, bumper:r.bumper, scan:[...r.scan], ...dyn };
    });
    return { tick:i, time:f.time, robots };
  });
  return { version:1, world, frames };
}
