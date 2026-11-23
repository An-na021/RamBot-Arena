import {it,expect} from 'vitest';
import {Simulation} from '../src/core/simulation.js';
import {Session} from '../src/core/session.js';
import {compileController} from '../src/core/controller.js';
import {sumoController,sumoResult} from '../src/modes/sumo.js';
import sumo from '../worlds/sumo.json';
import empty from '../worlds/livre.json';

const sc=sumo.scenario;
const counter='remember(0, memory(0) + 1); setSpeed(0, 0);';
const fight=seed=>{const code=sumoController(sc);const s=new Simulation({...sumo,seed},{'sheep-01':code,'sheep-02':code});let r,last=-99;
  for(let i=0;i<1200;i++){s.step();if(s.robots.some(x=>x.bumper))last=s.tick;r=sumoResult(sc,s.snapshot());if(r.finished)break;}return {s,r,last};};

it('004 SC-001 SC-002 FR-006 programas padrão iguais: ≥3 de 10 seeds com vencedor por empurrão',()=>{
  let wins=0;
  for(let seed=1;seed<=10;seed++){const {s,r,last}=fight(seed);if(r.winner){wins++;expect(s.tick-last).toBeLessThanOrEqual(20);}}
  expect(wins).toBeGreaterThanOrEqual(3);
},60000);
it('004 FR-006 FR-007 travado muda de fase; mesma seed e Reset repetem a luta',()=>{
  // US1 cenário 2: começam encostados de frente; em até 10 ticks (0,5 s) ambos mudam para recuo e se afastam
  const code=sumoController(sc);const w=structuredClone(sumo);w.robots[0].x=5.72;w.robots[1].x=6.28;
  const s=new Simulation(w,{'sheep-01':code,'sheep-02':code});for(let i=0;i<10;i++)s.step();
  expect(s.memory['sheep-01'][0]).toBe(1);expect(s.memory['sheep-02'][0]).toBe(1);expect(s.robots.every(r=>r.v<0)).toBe(true);
  for(let i=0;i<4;i++)s.step();expect(s.robots[1].x-s.robots[0].x).toBeGreaterThan(.6);
  const a=fight(5),b=fight(5);expect(a.s.snapshot()).toEqual(b.s.snapshot());expect(a.r).toEqual(b.r);
  const end=a.s.snapshot();a.s.reset();for(let i=0;i<end.tick;i++)a.s.step();expect(a.s.snapshot()).toEqual(end);
  expect(compileController(code)).toBeTypeOf('function');
},60000);
it('004 SC-003 FR-001 FR-003 contador persiste e zera em Reset, carga e novo programa',()=>{
  const sim=new Simulation(empty,{'sheep-01':counter});expect(sim.memory['sheep-01']).toEqual(new Array(16).fill(0));
  for(let i=0;i<10;i++)sim.step();expect(sim.memory['sheep-01'][0]).toBe(10);
  sim.reset();expect(sim.memory['sheep-01'][0]).toBe(0);
  for(let i=0;i<3;i++)sim.step();sim.setController('sheep-01',counter);expect(sim.memory['sheep-01'][0]).toBe(0);
  expect(()=>sim.setController('sheep-01','while(true){}')).toThrow();
  const s=new Session(empty);s.applyController(counter);for(let i=0;i<4;i++)s.step();expect(s.sim.memory['sheep-01'][0]).toBe(4);
  s.load(empty);expect(s.sim.memory['sheep-01'][0]).toBe(0);
  const last=new Simulation(empty,{'sheep-01':'remember(3, 1); remember(3, 7); setSpeed(memory(9), 0);'});last.step();
  expect(last.memory['sheep-01'][3]).toBe(7);expect(last.robots[0].v).toBe(0);
});
it('004 FR-001 FR-004 memória isolada por robô e descartada em tick com erro',()=>{
  const w={width:6,height:6,dt:.05,seed:9,obstacles:[],robots:[{id:'a',x:1,y:1,laser:{rays:1,range:2,fov:0}},{id:'b',x:4,y:4,laser:{rays:1,range:2,fov:0}}]};
  const sim=new Simulation(w,{a:'remember(0, memory(0) + 1); setSpeed(random(), 0);',b:'remember(0, memory(0) + 5); setSpeed(0, 0);'});
  sim.step();expect(sim.memory.a[0]).toBe(1);expect(sim.memory.b[0]).toBe(5);
  sim.setController('b','remember(0, 99); remember(1, 99); setSpeed(1, 1, 1); const z = readLaser()[7];');
  const before=structuredClone({mem:sim.memory,seed:sim.seed,tick:sim.tick,robots:sim.robots});
  expect(()=>sim.step()).toThrow('Controlador');
  expect({mem:sim.memory,seed:sim.seed,tick:sim.tick,robots:sim.robots}).toEqual(before);expect(sim.memory.a[0]).toBe(1);
});
it.each([['memory(-1)','posição'],['memory(16)','posição'],['memory(1.5)','posição'],['remember(16, 1)','posição'],['remember(0, 1 / 0)','finitos'],['remember(0, readLaser())','finitos']])('004 SC-004 FR-005 %s gera erro claro sem avançar',(expr,msg)=>{
  const sim=new Simulation(empty,{'sheep-01':`const x = ${expr}; setSpeed(0, 0);`});
  expect(()=>sim.step()).toThrow(`Controlador: `);expect(()=>new Simulation(empty,{'sheep-01':`const x = ${expr}; setSpeed(0, 0);`}).step()).toThrow(msg);expect(sim.tick).toBe(0);
});
it('004 FR-005 nomes reservados e limite de 1.000 nós',()=>{
  expect(()=>compileController('const memory = 1;')).toThrow('reservado');expect(()=>compileController('const remember = 1;')).toThrow('reservado');
  const nodes=k=>'setSpeed(0, 0);'+' 1;'.repeat(k);
  expect(()=>compileController(nodes(490))).not.toThrow();expect(()=>compileController(nodes(500))).toThrow('orçamento');
});
it('004 FR-002 memória só por chamadas da API, sem nova sintaxe',()=>{
  for(const src of ['memory = 1;','const x = 1; x = 2;'])expect(()=>compileController(src)).toThrow('Controlador'); // atribuição: recusada ao aplicar
  for(const src of ['memory[0];','const m = memory;','remember.x;'])expect(()=>new Simulation(empty,{'sheep-01':src}).step()).toThrow('Controlador'); // uso como valor: recusado na execução, como as demais funções da API
  expect(()=>compileController('remember(0, memory(0) + 1);')).not.toThrow();
});
