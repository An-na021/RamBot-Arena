import {it,expect} from 'vitest';
import {Session} from '../src/core/session.js';
import {Simulation} from '../src/core/simulation.js';
import {compileController,DEFAULT_CONTROLLER} from '../src/core/controller.js';
import {sumoController,sumoResult} from '../src/modes/sumo.js';
import sumo from '../worlds/sumo.json';
import maze from '../worlds/labirinto.json';
import empty from '../worlds/livre.json';

// T101: trajetórias de referência (300 ticks) capturadas antes da feature 002.
const baseline={labirinto:[['sheep-01',1.576870365,8.711724092,-3.083185307,8.19],['sheep-02',6.76551804,1.533000206,-1.541592654,8.97]],livre:[['sheep-01',11.371399662,4.664623963,0.8,9.425]]};
const outside=(sc,r)=>Math.hypot(r.x-sc.x,r.y-sc.y)-r.radius>sc.radius+1e-10;
const run=(s,n)=>{const seen=[];for(let i=0;i<n;i++){s.step();seen.push(s.state);}return seen;};

// SC-001 revisado pela 003/004: com empurrão real, o dojô pode terminar com vencedor; ninguém sai sem contato recente.
it('002 SC-001 FR-001 dojô padrão: ninguém sai do ringue por iniciativa própria',()=>{
  const s=new Session(sumo);s.play();const states=run(s,1200);
  const exit=states.findIndex(st=>st.robots.some(r=>outside(sumo.scenario,r)));
  if(exit>=0)expect(states.slice(Math.max(0,exit-20),exit+1).some(st=>st.robots.some(r=>r.bumper))).toBe(true);
  expect(s.result.finished).toBe(true);expect(s.running).toBe(false);
});
it.each([0,.5,-1,2.5])('002 SC-003 FR-003 robô perto da borda virado para fora volta, ângulo %s',ang=>{
  const w=structuredClone(sumo),d=sumo.scenario.radius-.3;
  w.robots[0]={...w.robots[0],x:6+d*Math.cos(ang),y:4.5+d*Math.sin(ang),theta:ang};w.robots[1]={...w.robots[1],x:6,y:4.5};
  const s=new Session(w);s.selected='sheep-02';s.applyController('setSpeed(0,0);');
  const states=run(s,200);expect(states.every(st=>!outside(sumo.scenario,st.robots[0]))).toBe(true);
});
it('002 FR-001 rodada determinística, inclusive após Reset',()=>{
  const a=new Session(sumo),b=new Session(sumo);const ra=run(a,300),rb=run(b,300);expect(ra).toEqual(rb);
  a.reset();expect(run(a,300)).toEqual(ra);
});
it('002 FR-006 usa centro e raio do cenário carregado',()=>{
  const w=structuredClone(sumo);w.scenario={type:'sumo',x:5,y:4.5,radius:3,maxTicks:1200};w.robots[0].x=3.8;w.robots[1].x=6.2;
  const s=new Session(w);expect(s.sim.sources['sheep-01']).toContain('o.x - 5');expect(s.sim.sources['sheep-01']).toContain('raio 3');
  const states=run(s,1200);expect(states.every(st=>st.robots.every(r=>!outside(w.scenario,r)))).toBe(true);
});
it('002 SC-002 FR-004 os dois robôs fazem contato em até 600 ticks',()=>{
  const s=new Session(sumo),hit={};run(s,600).forEach(st=>st.robots.forEach(r=>{if(r.bumper)hit[r.id]=true;}));
  expect(hit).toEqual({'sheep-01':true,'sheep-02':true});
});
it('002 FR-004 FR-005 sem adversário à frente procura em arco e ignora a borda do mapa',()=>{
  const w=structuredClone(sumo);w.robots[0]={...w.robots[0],x:6,y:4.5,theta:Math.PI/2};w.robots[1]={...w.robots[1],x:6,y:2.5,theta:0};
  const sim=new Simulation(w,{'sheep-01':sumoController(sumo.scenario),'sheep-02':'setSpeed(0,0);'});
  for(let i=0;i<12;i++)sim.step();expect(sim.robots[0].w).toBe(1.4);expect(sim.robots[0].v).toBe(.25); /* 004: busca após a abertura */
  const toward=structuredClone(w);toward.robots[0].theta=-Math.PI/2;
  const sim2=new Simulation(toward,{'sheep-01':sumoController(sumo.scenario),'sheep-02':'setSpeed(0,0);'});sim2.step();expect(sim2.robots[0].v).toBe(1); /* 003: ataque a 1 m/s */
});
it.each([1,8,9,64])('002 FR-002 programa válido no subconjunto com laser de %s raios',rays=>{
  expect(()=>compileController(sumoController(sumo.scenario))).not.toThrow();
  const w=structuredClone(sumo);w.robots.forEach(r=>{r.laser.rays=rays;});
  const s=new Session(w);expect(()=>run(s,1200)).not.toThrow();
});
// 003 T213: a física dinâmica (constitution 2.0.0) muda trajetórias de todos os mundos; a referência cinemática da 002
// deixa de valer. Mantém-se o objetivo do aceite: mundos genéricos usam o programa genérico e se repetem exatamente.
// 006: o labirinto virou modalidade com programa de seguir parede; o aceite da 002 (não afetar mundos fora do sumô
// com a estratégia de sumô) continua: nenhum robô fora do dojô recebe o programa de sumô; o campo livre segue genérico.
it.each([['labirinto',maze],['livre',empty]])('002 SC-004 FR-007 mundo %s sem estratégia de sumô e reproduzível',(name,world)=>{
  const s=new Session(world);expect(Object.values(s.sim.sources).some(src=>src.includes('sumô'))).toBe(false);
  if(name==='livre')expect(Object.values(s.sim.sources).every(src=>src===DEFAULT_CONTROLLER)).toBe(true);
  const a=run(s,300),b=run(new Session(world),300);expect(a).toEqual(b);expect(baseline[name].length).toBe(world.robots.length);
});
it('002 FR-001 FR-002 programa próprio substitui só o robô selecionado e o padrão fica visível',()=>{
  const s=new Session(sumo);const original=s.sim.sources['sheep-02'];expect(original).toContain('Estratégia padrão de sumô');
  s.selected='sheep-01';s.applyController('setSpeed(-1,0);');expect(s.sim.sources['sheep-01']).toBe('setSpeed(-1,0);');expect(s.sim.sources['sheep-02']).toBe(original);
  run(s,100);expect(sumoResult(sumo.scenario,s.state).winner).toBe('sheep-02');
});
