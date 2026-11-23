import {it,expect} from 'vitest';
import {Session} from '../src/core/session.js';
import {Simulation} from '../src/core/simulation.js';
import {compileController,DEFAULT_CONTROLLER} from '../src/core/controller.js';
import {parseMaze,mazeController} from '../src/modes/maze.js';
import maze from '../worlds/labirinto.json';
import empty from '../worlds/livre.json';
import sumo from '../worlds/sumo.json';

const corridor=x=>x<3?0:x<6.35?1:x<9?2:3;
const program=mazeController();

it('006 SC-001 FR-002 FR-003 cada robô passa pelos 4 corredores em até 120 s',()=>{
  const s=new Session(maze);const seen=maze.robots.map(()=>new Set());
  for(let i=0;i<2400;i++){s.step();s.state.robots.forEach((r,j)=>seen[j].add(corridor(r.x)));}
  seen.forEach(z=>expect(z.size).toBe(4));
},30000);
it('006 SC-002 SC-003 5.000 ticks sem ficar parado mais de 5 s e sem penetrar paredes',()=>{
  const s=new Simulation(maze,{'sheep-01':program,'sheep-02':program});let prev=s.snapshot(),worst=0;const run=[0,0],max=[0,0];
  for(let i=0;i<5000;i++){s.step();const st=s.snapshot();st.robots.forEach((r,j)=>{
    if(Math.hypot(r.x-prev.robots[j].x,r.y-prev.robots[j].y)<.005){run[j]++;max[j]=Math.max(max[j],run[j]);}else run[j]=0;
    for(const o of maze.obstacles){const cx=Math.max(o.x,Math.min(r.x,o.x+o.width)),cy=Math.max(o.y,Math.min(r.y,o.y+o.height));worst=Math.max(worst,r.radius-Math.hypot(r.x-cx,r.y-cy));}});prev=st;}
  max.forEach(m=>expect(m).toBeLessThanOrEqual(100));expect(worst).toBeLessThan(1e-6);
},60000);
it('006 FR-001 FR-004 FR-005 FR-006 modalidade no mundo, programa válido no subconjunto e ausência de regras',()=>{
  expect(parseMaze({type:'labirinto',extra:1})).toEqual({type:'labirinto'});expect(()=>parseMaze({type:'x'})).toThrow('Labirinto:');expect(()=>parseMaze(null)).toThrow('Labirinto:');
  expect(()=>compileController(program)).not.toThrow();
  const s=new Session(maze);expect(Object.values(s.sim.sources).every(src=>src===program)).toBe(true);
  expect(s.world.scenario).toEqual({type:'labirinto'});expect(s.result).toBeNull();
  s.play();for(let i=0;i<50;i++)s.step();expect(s.running).toBe(true);
  s.selected='sheep-01';s.applyController('setSpeed(0,0);');expect(s.sim.sources['sheep-02']).toBe(program);
  expect(new Session(empty).sim.sources['sheep-01']).toBe(DEFAULT_CONTROLLER);
  expect(new Session(sumo).sim.sources['sheep-01']).toContain('sumô');
  const keep=new Session(maze);keep.step();expect(()=>keep.load({...maze,scenario:{type:'outro'}})).toThrow();expect(keep.state.tick).toBe(1);
  const again=new Session(JSON.stringify(keep.world));expect(again.world.scenario).toEqual({type:'labirinto'});expect(again.sim.sources['sheep-01']).toBe(program);
  keep.startRecording();for(let i=0;i<5;i++)keep.step();const rec=keep.stopRecording();keep.importReplay(JSON.stringify(rec));
  expect(keep.replay.scenario).toEqual({type:'labirinto'});expect(keep.result).toBeNull();
  const few=structuredClone(maze);few.robots.forEach(r=>{r.laser.rays=1;r.laser.fov=0;});const f=new Simulation(few,{'sheep-01':program,'sheep-02':program});expect(()=>{for(let i=0;i<200;i++)f.step();}).not.toThrow();
});
