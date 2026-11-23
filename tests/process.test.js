import {it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import config from '../vite.config.js';

const read=p=>readFileSync(p,'utf8');

it('NFR-003 documentos de regeneração existem e referenciam contratos',()=>{
  for(const p of ['.specify/memory/constitution.md','specs/001-arena/spec.md','specs/001-arena/plan.md','specs/001-arena/tasks.md','specs/001-arena/quickstart.md','specs/001-arena/contracts/world.md','specs/001-arena/contracts/controllers.md','specs/001-arena/contracts/replay.md'])expect(existsSync(p)).toBe(true);
  expect(read('specs/001-arena/quickstart.md')).toContain('Recriar em pasta vazia');
});
it('NFR-004 thresholds de cobertura ≥80% nas quatro métricas sobre todo src',()=>{
  const c=config.test.coverage;expect(c.include).toEqual(['src/**/*.js']);
  for(const m of ['lines','statements','branches','functions'])expect(c.thresholds[m]).toBeGreaterThanOrEqual(80);
});
it('NFR-005 todo FR/NFR da spec tem task e toda task cita requisito',()=>{
  const spec=read('specs/001-arena/spec.md'),tasks=read('specs/001-arena/tasks.md');
  const ids=[...new Set([...spec.matchAll(/\*\*((?:FR|NFR)-\d+):?\*\*/g)].map(m=>m[1]))];
  expect(ids.length).toBe(15);for(const id of ids)expect(tasks).toContain(id);
  for(const l of tasks.split('\n').filter(s=>/^- \[[ x]\] T/.test(s)))expect(l).toMatch(/\[[^\]]*(?:FR|NFR)-\d+[^\]]*\]/);
});
