import { describe,it,expect } from 'vitest';
import { parseWorld } from '../src/core/world.js';
import { integrate, rayBox, rayCircle, blocked, overlaps, laser } from '../src/core/geometry.js';
import { Simulation } from '../src/core/simulation.js';
import { compileController } from '../src/core/controller.js';
import { Session } from '../src/core/session.js';
import { parseRecording, MAX_TICKS } from '../src/core/recording.js';
import maze from '../worlds/labirinto.json';

const robot = (extra={}) => ({id:'r1',x:2,y:2,theta:0,radius:.25,laser:{rays:1,range:10,fov:0},...extra});
const world = (extra={}) => ({width:12,height:10,dt:.05,seed:42,obstacles:[],robots:[robot()],...extra});
const straight = {'r1':'setSpeed(1, 0);'};

describe('FR-001 mundo',()=>{
  it('normaliza defaults e copia entrada',()=>{const w=world();delete w.dt;delete w.seed;delete w.robots[0].theta;delete w.robots[0].radius;const p=parseWorld(JSON.stringify(w));expect(p.dt).toBe(.05);expect(p.seed).toBe(42);expect(p.name).toBe('Arena');expect(p.robots[0].radius).toBe(.25);});
  it.each([null,[],5,'{', ' '.repeat(200001)])('rejeita raiz inválida, caso %#',input=>expect(()=>parseWorld(input)).toThrow('Mundo inválido'));
  it.each([
    {width:0},{height:Infinity},{seed:1.2},{obstacles:null},{obstacles:Array(101).fill({})},{obstacles:[null]},
    {obstacles:[{x:11,y:0,width:2,height:1}]},{robots:[]},{robots:Array(9).fill(robot())},{robots:[null]},
    {robots:[robot({id:'<img>'})]},{robots:[robot(),robot()]},{robots:[robot({laser:null})]},
    {robots:[robot({laser:{rays:1.5,range:1,fov:0}})]},{robots:[robot({x:0})]},
    {robots:[robot(),robot({id:'r2',x:2.1})]},
    {obstacles:[{x:1,y:1,width:2,height:2}]}
  ])('identifica campo inválido %j',change=>expect(()=>parseWorld(world(change))).toThrow('Mundo inválido'));
  it('importação falha sem substituir experimento',()=>{const s=new Session(world());s.step();expect(()=>s.load('{}')).toThrow();expect(s.state.tick).toBe(1);});
});
describe('FR-002 FR-003 NFR-002 geometria própria',()=>{
  it('reta após N ticks e odometria (tolerância 1 cm, dinâmica 003)',()=>{const sim=new Simulation(world(),straight);for(let i=0;i<20;i++)sim.step();expect(Math.abs(sim.snapshot().robots[0].x-3)).toBeLessThan(.01);expect(Math.abs(sim.robots[0].distance-1)).toBeLessThan(.01);expect(sim.snapshot().time).toBe(1);});
  it('arco analítico e giro estacionário',()=>{const r=integrate(robot(),1,1,Math.PI/2);expect(r.x).toBeCloseTo(3,10);expect(r.y).toBeCloseTo(3,10);const spin=integrate(robot(),0,2,2);expect(spin.x).toBe(2);expect(spin.y).toBe(2);expect(spin.theta).toBeCloseTo(4-2*Math.PI);});
  it('contato com parede fina e bumper',()=>{const sim=new Simulation(world({dt:.1,obstacles:[{x:2.4,y:1,width:.001,height:2}]}),{'r1':'setSpeed(3,0);'});for(let i=0;i<20;i++)sim.step();expect(sim.robots[0].x).toBeLessThanOrEqual(2.15+1e-10);expect(sim.robots[0].bumper).toBe(true);expect(blocked(sim.robots[0],sim.world)).toBe(false);});
  it('bordas bloqueiam e tangência é permitida',()=>{expect(blocked(robot({x:.25}),parseWorld(world()))).toBe(false);expect(blocked(robot({x:.2}),parseWorld(world()))).toBe(true);const sim=new Simulation(world({robots:[robot({x:11.75})]}),straight);sim.step();expect(sim.robots[0].bumper).toBe(true);expect(sim.robots[0].x).toBe(11.75);});
  it('raycast frontal com parede a dois metros',()=>{const sim=new Simulation(world({obstacles:[{x:4,y:1,width:1,height:2}]}));expect(sim.robots[0].scan[0]).toBe(2);});
  it('laser N raios e alcance máximo',()=>{const w=parseWorld(world({robots:[robot({laser:{rays:3,range:3,fov:Math.PI}})]}));expect(laser(w.robots[0],w.robots,w)).toEqual([2,3,3]);});
  it('rayBox paralelos, interior e atrás',()=>{const box={x:1,y:1,width:2,height:2};expect(rayBox(0,0,1,0,box)).toBe(Infinity);expect(rayBox(2,2,1,0,box)).toBe(1);expect(rayBox(4,2,1,0,box)).toBe(Infinity);});
  it('rayCircle interseção, interior, tangência e ausência',()=>{const c={x:3,y:0,radius:1};expect(rayCircle(0,0,1,0,c)).toBe(2);expect(rayCircle(3,0,1,0,c)).toBe(1);expect(rayCircle(5,0,1,0,c)).toBe(Infinity);expect(rayCircle(0,2,1,0,c)).toBe(Infinity);expect(rayCircle(0,1,1,0,c)).toBe(3);});
});
describe('FR-004 controlador limitado',()=>{
  it.each(['while(true) {}','for(;;) {}','fetch(1)','readLaser.constructor(1)','const x = readLaser().constructor;','const x = 2 ** 2;','const x = typeof 1;','const x = "texto";','const random = 1;','setSpeed('])('rejeita %s',code=>expect(()=>compileController(code)).toThrow('Controlador'));
  it('limita tamanho, número de nós e profundidade',()=>{expect(()=>compileController(null)).toThrow();expect(()=>compileController(' '.repeat(8001))).toThrow();expect(()=>compileController('1;'.repeat(510))).toThrow('orçamento'); /* 004: limite 1.000 nós */expect(()=>compileController('!'.repeat(50)+'1;')).toThrow('orçamento');});
  it('condições, curto circuito, ternário e leituras',()=>{const source='const scan=readLaser(); const odom=readOdometry(); let unused; ; if (!readBumper() && odom.x >= 2) { setSpeed(scan.length === 1 ? +1 : -1, 0); } else {setSpeed(0, 1);}';const sim=new Simulation(world(),{r1:source});sim.step();expect(sim.robots[0].x).toBeCloseTo(2.05,1);});
  it('operações aritméticas e comparações',()=>{for(const expr of ['1+2','3-2','2*2','4/2','5%2','1<2','2>1','1<=2','2>=1','1===1','1!==2']){let result;compileController(`setSpeed(${expr},0);`)({setSpeed:v=>result=v});expect(result).toBeTruthy();}});
  it('ramos alternativos e ||',()=>{const sim=new Simulation(world(),{r1:'if (false) setSpeed(1,0); else setSpeed(0, 1 || missing);'});sim.step();expect(sim.robots[0].w).toBe(1);});
  it.each(['setSpeed(missing,0);','setSpeed(readLaser()[9],0);','setSpeed(1/0,0);','const a=1; setSpeed(a[0],0);','const a=readOdometry(); setSpeed(a[1],0);'])('falha sem corromper tick: %s',code=>{const sim=new Simulation(world(),{r1:code});const before=sim.snapshot();expect(()=>sim.step()).toThrow();expect(sim.snapshot()).toEqual(before);});
  it('limita velocidade e comando ausente para',()=>{const sim=new Simulation(world(),{r1:'setSpeed(100,-100);'});sim.step();expect(sim.robots[0].v).toBe(1);expect(sim.robots[0].w).toBe(-3);sim.setController('r1',';');sim.step();expect(sim.robots[0].v).toBe(0);expect(()=>sim.setController('absent',';')).toThrow('desconhecido');});
  it('erro de compilação preserva controlador anterior',()=>{const sim=new Simulation(world(),straight);expect(()=>sim.setController('r1','while(true){}')).toThrow();sim.step();expect(sim.robots[0].x).toBeCloseTo(2.05,1);});
  it('IDs que coincidem com protótipos não acessam propriedades herdadas',()=>{const sim=new Simulation(world({robots:[robot({id:'constructor'})]}));sim.step();expect(sim.tick).toBe(1);expect(()=>sim.setController('toString',';')).toThrow('desconhecido');});
  it('todos os sensores podem comandar velocidade',()=>{const sim=new Simulation(world(),{r1:'const o=readOdometry(); setSpeed(o.distance + o.y - o.theta, readBumper() ? 1 : 0);'});sim.step();expect(sim.robots[0].v).toBe(1);});
});
describe('NFR-001 FR-007 determinismo e múltiplos robôs',()=>{
  it('seed, reset e clone reproduzem execução',()=>{const w=world({seed:0}), sources={r1:'setSpeed(random(), random());'};const a=new Simulation(w,sources),b=new Simulation(w,sources);for(let i=0;i<50;i++){a.step();b.step();}expect(a.snapshot()).toEqual(b.snapshot());const result=a.snapshot();a.reset();for(let i=0;i<50;i++)a.step();expect(a.snapshot()).toEqual(result);const copy=a.snapshot();copy.robots[0].x=999;expect(a.robots[0].x).not.toBe(999);});
  it('robôs colidem, têm comandos independentes e laser mútuo',()=>{const sim=new Simulation(world({robots:[robot(),robot({id:'r2',x:3,theta:Math.PI})]}),{r1:'setSpeed(1,0);',r2:'setSpeed(1,0);'});expect(sim.robots[0].scan[0]).toBe(.75);for(let i=0;i<20;i++)sim.step();expect(overlaps(...sim.robots)).toBe(false);expect(sim.robots.every(r=>r.bumper)).toBe(true);});
  it('falha do segundo controlador preserva seed e todos os robôs',()=>{const sim=new Simulation(world({robots:[robot(),robot({id:'r2',x:5})]}),{r1:'setSpeed(random(),0);',r2:'setSpeed(unknown,0);'});const before=sim.snapshot(),seed=sim.seed;expect(()=>sim.step()).toThrow();expect(sim.seed).toBe(seed);expect(sim.snapshot()).toEqual(before);});
  it('demo labirinto roda 300 ticks sem penetração e repete',()=>{const a=new Simulation(maze),b=new Simulation(maze);for(let i=0;i<300;i++){a.step();b.step();expect(a.robots.every(r=>!blocked(r,a.world))).toBe(true);}expect(a.snapshot()).toEqual(b.snapshot());});
});
describe('FR-005 FR-009 sessão e replay',()=>{
  it('play pause step reset e troca de programa',()=>{const s=new Session(world());s.play();expect(s.running).toBe(true);s.pause();expect(s.running).toBe(false);s.applyController('setSpeed(1,0)');s.step();expect(s.state.tick).toBe(1);s.reset();expect(s.state.tick).toBe(0);});
  it('erro pausa sessão',()=>{const s=new Session(world());s.applyController('setSpeed(unknown,0);');s.play();expect(()=>s.step()).toThrow();expect(s.running).toBe(false);});
  it('captura round trip, seek, reset, fim e retorno live',()=>{const s=new Session(world());s.startRecording();expect(()=>s.applyController(';')).toThrow('gravação');s.step();s.step();const expected=s.state,data=s.stopRecording();expect(s.stopRecording()).toEqual(data);s.importReplay(JSON.stringify(data));expect(s.state.tick).toBe(0);expect(()=>s.startRecording()).toThrow('replay');expect(()=>s.applyController(';')).toThrow('replay');s.play();s.step();s.step();expect(s.state).toEqual(expected);expect(s.running).toBe(false);s.seek(1);expect(s.cursor).toBe(1);s.reset();expect(s.cursor).toBe(0);s.exitReplay();expect(s.state.tick).toBe(0);expect(s.replay).toBeNull();});
  it('limite finaliza captura e continua simulação',()=>{const s=new Session(world());s.applyController(';');s.startRecording();for(let i=0;i<MAX_TICKS;i++)s.step();expect(s.recording).toBeNull();expect(s.notice).toContain('5.000');expect(s.stopRecording().frames).toHaveLength(5001);s.step();expect(s.state.tick).toBe(5001);},60000); /* 5.000 ticks com dinâmica (feature 003) */
  it('stop vazio e seek inválido',()=>{const s=new Session(world());expect(s.stopRecording()).toBeNull();expect(()=>s.seek(0)).toThrow();s.startRecording();s.step();s.importReplay(s.stopRecording());for(const n of [-1,2,0.5])expect(()=>s.seek(n)).toThrow('fora');});
  it.each([null,'{',' '.repeat(100000001),{version:2,frames:[]},{version:1,frames:Array(5002).fill({})}])('rejeita gravação inválida, caso %#',data=>expect(()=>parseRecording(data)).toThrow('Replay'));
  it('rejeita frames, sensores e poses inválidas atomicamente',()=>{const s=new Session(world());s.startRecording();s.step();const data=s.stopRecording();for(const mutate of [d=>d.frames[0].tick=3,d=>d.frames[0].time=1,d=>d.frames[0].robots=[],d=>d.frames[0].robots[0].x=-1,d=>d.frames[0].robots[0].scan=[NaN],d=>d.frames[0].robots[0].bumper=1]){const corrupt=structuredClone(data);mutate(corrupt);expect(()=>s.importReplay(corrupt)).toThrow('Replay');expect(s.replay).toBeNull();}expect(parseRecording(data).frames).toHaveLength(2);});
});
