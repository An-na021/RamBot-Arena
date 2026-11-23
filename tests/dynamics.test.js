import {it,expect} from 'vitest';
import {Simulation} from '../src/core/simulation.js';
import {Session} from '../src/core/session.js';
import {parseWorld} from '../src/core/world.js';
import {compileController} from '../src/core/controller.js';
import {sumoController,sumoResult} from '../src/modes/sumo.js';
import sumo from '../worlds/sumo.json';
import maze from '../worlds/labirinto.json';

const sc=sumo.scenario;
const arena=(robots,extra={})=>({width:12,height:9,dt:.05,seed:3,obstacles:[],robots,...extra});
const bot=(id,x,y,theta=0,extra={})=>({id,x,y,theta,radius:.28,laser:{rays:9,range:4,fov:Math.PI},...extra});
const fight=(world,src,n)=>{const s=new Simulation(world,src);let res=null;for(let i=0;i<n;i++){s.step();res=sumoResult(sc,s.snapshot());if(res.finished)break;}return {s,res};};
const overlap=st=>{let worst=0;const W=st.world,R=st.robots;
  for(let i=0;i<R.length;i++){const r=R[i];worst=Math.max(worst,r.radius-r.x,r.radius-r.y,r.x+r.radius-W.width,r.y+r.radius-W.height);
    for(const o of W.obstacles){const cx=Math.max(o.x,Math.min(r.x,o.x+o.width)),cy=Math.max(o.y,Math.min(r.y,o.y+o.height));worst=Math.max(worst,r.radius-Math.hypot(r.x-cx,r.y-cy));}
    for(let j=i+1;j<R.length;j++)worst=Math.max(worst,r.radius+R[j].radius-Math.hypot(r.x-R[j].x,r.y-R[j].y));}
  return worst;};

it('003 SC-001 FR-003 FR-004 FR-008 empurrão lateral tira o adversário do ringue',()=>{
  const w=structuredClone(sumo);w.robots[1].theta=Math.PI/2;
  const {s,res}=fight(w,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0,0);'},200);
  expect(res.winner).toBe('sheep-01');expect(s.tick).toBeLessThan(200);
});
it('003 SC-002 FR-003 frente a frente trava; robô freado resiste de frente',()=>{
  const both=new Simulation(sumo,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0.8,0);'});
  for(let i=0;i<40;i++)both.step();const meet=both.robots.map(r=>r.x);for(let i=0;i<100;i++)both.step();
  both.robots.forEach((r,i)=>expect(Math.abs(r.x-meet[i])).toBeLessThan(.05));expect(both.robots[0].bumper).toBe(true);
  const {s}=fight(sumo,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0,0);'},200);
  expect(s.robots[1].x-7.2).toBeLessThan(.1);
});
it('003 FR-009 programa padrão de sumô empurra e roda 1.200 ticks sem erro',()=>{
  expect(()=>compileController(sumoController(sc))).not.toThrow();
  const s=new Session(sumo);let contact=0;for(let i=0;i<1200&&!s.result.finished;i++){s.step();if(s.state.robots[0].bumper)contact++;}
  expect(contact).toBeGreaterThan(0);expect(s.state.robots.every(r=>[r.x,r.y,r.vx,r.vy,r.omega].every(Number.isFinite))).toBe(true);
  expect(sumoController(sc)).toContain('const touch = readBumper();'); /* 004: borda só sem contato (ordem dos ramos) */
});
it('003 SC-008 FR-002 reta a menos de 1 cm, aceleração sem salto e frenagem sem inversão',()=>{
  const sim=new Simulation(arena([bot('r1',2,4.5,0,{maxLinear:2})]),{r1:'setSpeed(1,0);'});
  for(let i=0;i<20;i++)sim.step();expect(Math.abs(sim.robots[0].x-3)).toBeLessThan(.01);
  const a=new Simulation(arena([bot('r1',2,4.5)]),{r1:'setSpeed(1,0);'});a.step();expect(a.robots[0].vx).toBeGreaterThan(0);expect(a.robots[0].vx).toBeLessThanOrEqual(1+1e-9);
  a.setController('r1','setSpeed(0,0);');const xs=[];for(let i=0;i<5;i++){a.step();xs.push(a.robots[0].vx);}
  expect(xs.every(v=>v>=-1e-12)).toBe(true);expect(xs.at(-1)).toBeCloseTo(0,9);
});
it('003 SC-003 FR-001 massa dobrada desloca no máximo metade; parâmetros validados',()=>{
  const push=m=>{const w=structuredClone(sumo);w.robots[1].theta=Math.PI/2;w.robots[1].mass=m;const s=new Simulation(w,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0,0);'});for(let i=0;i<60;i++)s.step();return s.robots[1].x-7.2;};
  const light=push(1),heavy=push(2);expect(light).toBeGreaterThan(.2);expect(heavy).toBeLessThanOrEqual(light/2);
  const p=parseWorld(arena([bot('r1',2,4.5)]));expect(p.robots[0]).toMatchObject({mass:1,grip:6,lateralGrip:3});
  for(const [k,v] of [['mass',0],['grip',11],['lateralGrip','3'],['mass',NaN]])expect(()=>parseWorld(arena([bot('r1',2,4.5,0,{[k]:v})]))).toThrow(`Mundo inválido: robots[0].${k}`);
});
it('003 SC-005 FR-005 parede fina e 5.000 ticks sem penetração',()=>{
  const thin=new Simulation(arena([bot('r1',2,4.5,0,{maxLinear:3})],{obstacles:[{x:4,y:0,width:.001,height:9}]}),{r1:'setSpeed(3,0);'});
  for(let i=0;i<60;i++)thin.step();expect(thin.robots[0].x).toBeLessThanOrEqual(4-.28+1e-6);expect(thin.robots[0].bumper).toBe(true);
  for(const [world,src] of [[maze,{}],[sumo,{'sheep-01':sumoController(sc),'sheep-02':sumoController(sc)}]]){
    const s=new Simulation(world,src);let worst=0;for(let i=0;i<5000;i++){s.step();if(i%25===0)worst=Math.max(worst,overlap(s));}
    expect(worst).toBeLessThan(1e-6);expect(s.robots.every(r=>[r.x,r.y,r.vx,r.vy,r.omega,r.distance].every(Number.isFinite))).toBe(true);
  }
},60000);
it('003 SC-005 FR-005 robô espremido contra a parede não atravessa',()=>{
  const s=new Simulation(arena([bot('a',1.5,4.5,Math.PI),bot('b',2.2,4.5,Math.PI,{mass:3})]),{a:'setSpeed(0,0);',b:'setSpeed(1,0);'});
  for(let i=0;i<100;i++)s.step();expect(overlap(s)).toBeLessThan(1e-6);expect(s.robots[0].x).toBeGreaterThanOrEqual(.28-1e-6);
});
it('003 SC-006 FR-006 determinismo, reset e replay com estado dinâmico',()=>{
  const src={'sheep-01':sumoController(sc),'sheep-02':'setSpeed(random(),random()*4-2);'};
  const a=new Simulation(sumo,src),b=new Simulation(sumo,src);for(let i=0;i<300;i++){a.step();b.step();}expect(a.snapshot()).toEqual(b.snapshot());
  const end=a.snapshot();a.reset();for(let i=0;i<300;i++)a.step();expect(a.snapshot()).toEqual(end);
  const s=new Session(sumo);s.startRecording();for(let i=0;i<120;i++)s.step();const live=s.state;const data=s.stopRecording();
  s.importReplay(JSON.stringify(data));s.seek(data.frames.length-1);expect(s.state).toEqual(live);
  const old=structuredClone(data);old.frames.forEach(f=>f.robots.forEach(r=>{delete r.vx;delete r.vy;delete r.omega;}));expect(()=>s.importReplay(JSON.stringify(old))).not.toThrow();
  const bad=structuredClone(data);bad.frames[1].robots[0].vx='x';expect(()=>s.importReplay(JSON.stringify(bad))).toThrow('Replay');
});
it('003 FR-007 bumper em contato robô–robô e parede; odometria conta empurrão',()=>{
  const w=structuredClone(sumo);w.robots[1].theta=Math.PI/2;const s=new Simulation(w,{'sheep-01':'setSpeed(0.8,0);','sheep-02':'setSpeed(0,0);'});
  for(let i=0;i<60;i++)s.step();expect(s.robots[1].bumper).toBe(true);expect(s.robots[1].distance).toBeGreaterThan(.2);
  const wall=new Simulation(arena([bot('r1',11,4.5)]),{r1:'setSpeed(1,0);'});for(let i=0;i<30;i++)wall.step();expect(wall.robots[0].bumper).toBe(true);
});
