export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const angle = n => Math.atan2(Math.sin(n), Math.cos(n));

export function overlaps(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius - 1e-10;
}

export function blocked(robot, world) {
  const { x, y, radius: r } = robot;
  if (x < r - 1e-10 || y < r - 1e-10 || x > world.width - r + 1e-10 || y > world.height - r + 1e-10) return true;
  return world.obstacles.some(o => Math.hypot(x - clamp(x, o.x, o.x + o.width), y - clamp(y, o.y, o.y + o.height)) < r - 1e-10);
}

export function rayBox(x, y, dx, dy, box) {
  let near = -Infinity, far = Infinity;
  for (const [p, d, low, high] of [[x, dx, box.x, box.x + box.width], [y, dy, box.y, box.y + box.height]]) {
    if (Math.abs(d) < 1e-12) { if (p < low || p > high) return Infinity; }
    else {
      const a = (low - p) / d, b = (high - p) / d;
      near = Math.max(near, Math.min(a, b)); far = Math.min(far, Math.max(a, b));
    }
  }
  return far < Math.max(near, 0) ? Infinity : near >= 0 ? near : far;
}

export function rayCircle(x, y, dx, dy, circle) {
  const ox = x - circle.x, oy = y - circle.y;
  const b = ox * dx + oy * dy, c = ox * ox + oy * oy - circle.radius ** 2;
  const disc = b * b - c;
  if (disc < 0) return Infinity;
  const near = -b - Math.sqrt(disc), far = -b + Math.sqrt(disc);
  return near >= 0 ? near : far >= 0 ? far : Infinity;
}

export function integrate(robot, v, w, dt) {
  const t = robot.theta, next = t + w * dt;
  return { ...robot,
    x: robot.x + (Math.abs(w) < 1e-10 ? v * Math.cos(t) * dt : v / w * (Math.sin(next) - Math.sin(t))),
    y: robot.y + (Math.abs(w) < 1e-10 ? v * Math.sin(t) * dt : -v / w * (Math.cos(next) - Math.cos(t))),
    theta: angle(next)
  };
}

export function laser(robot, robots, world) {
  const { rays, range, fov } = robot.laser;
  return Array.from({ length: rays }, (_, i) => {
    const a = robot.theta + (rays === 1 ? 0 : -fov / 2 + i * fov / (rays - 1));
    const dx = Math.cos(a), dy = Math.sin(a);
    return Math.min(range,
      rayBox(robot.x, robot.y, dx, dy, { x: 0, y: 0, width: world.width, height: world.height }),
      ...world.obstacles.map(o => rayBox(robot.x, robot.y, dx, dy, o)),
      ...robots.filter(r => r.id !== robot.id).map(r => rayCircle(robot.x, robot.y, dx, dy, r)));
  });
}
