import {it,expect} from 'vitest';
import {Simulation} from '../src/core/simulation.js';
import {Session} from '../src/core/session.js';
import sumo from '../worlds/sumo.json';
import maze from '../worlds/labirinto.json';
import empty from '../worlds/livre.json';

const arena=(robots,extra={})=>({width:12,height:9,dt:.05,seed:3,obstacles:[],robots,...extra});
const bot=(id,x,y,theta=0,extra={})=>({id,x,y,theta,radius:.28,laser:{rays:9,range:4,fov:Math.PI},...extra});
const still=(world,ticks=1200)=>{const s=new Session(world);let prev=s.state;const n=world.robots.map(()=>0);
  for(let i=0;i<ticks;i++){s.step();const st=s.state;st.robots.forEach((r,j)=>{if(Math.hypot(r.x-prev.robots[j].x,r.y-prev.robots[j].y)<.005)n[j]++;});prev=st;}
  return {s,frac:n.map(k=>k/ticks)};};

it('005 SC-001 FR-002 campo livre: robô não fica preso girando na parede',()=>{
  const {s,frac}=still(empty);expect(frac[0]).toBeLessThan(.2);expect(s.state.robots[0].distance).toBeGreaterThan(25);
},30000);
it('005 SC-002 FR-002 labirinto: cada robô parado menos de 20% do tempo; encostado girando não liga bumper',()=>{
  const {frac}=still(maze);frac.forEach(f=>expect(f).toBeLessThan(.2));
  const sim=new Simulation(arena([bot('r1',11.72,4.5,0)]),{r1:'setSpeed(0, 2);'});
  for(let i=0;i<20;i++)sim.step();expect(sim.robots[0].bumper).toBe(false);
  const along=new Simulation(arena([bot('r1',3,.28,0)]),{r1:'setSpeed(0.5, 0);'});for(let i=0;i<20;i++)along.step();
  expect(along.robots[0].bumper).toBe(false);expect(along.robots[0].x).toBeGreaterThan(3.4);
},30000);
it('005 FR-001 FR-003 FR-004 choques, empurrões e travamento ligam o bumper',()=>{
  const wall=new Simulation(arena([bot('r1',11,4.5)]),{r1:'setSpeed(1, 0);'});let hit=false;for(let i=0;i<30;i++){wall.step();if(wall.robots[0].bumper)hit=true;}
  expect(hit).toBe(true);expect(wall.robots[0].bumper).toBe(true); // continua empurrando a parede
  const both=new Simulation(sumo,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0.8,0);'});for(let i=0;i<80;i++)both.step();
  expect(both.robots.every(r=>r.bumper)).toBe(true);
  const w=structuredClone(sumo);w.robots[1].theta=Math.PI/2;const push=new Simulation(w,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0,0);'});
  let pushed=false;for(let i=0;i<60;i++){push.step();if(push.robots[1].bumper)pushed=true;}expect(pushed).toBe(true);
});
