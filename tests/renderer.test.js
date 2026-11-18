// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {Simulation} from '../src/core/simulation.js';
import sumo from '../worlds/sumo.json';
import maze from '../worlds/labirinto.json';
import {createRenderer} from '../src/renderer.js';

const capture=vi.hoisted(()=>({scene:null,camera:null,disposed:false}));
vi.mock('three',async original=>({...await original(),WebGLRenderer:class{
  constructor(){this.domElement=document.createElement('canvas');this.shadowMap={};}
  setPixelRatio(){} setSize(){} render(scene,camera){capture.scene=scene;capture.camera=camera;} dispose(){capture.disposed=true;}
}}));
vi.mock('three/addons/controls/OrbitControls.js',async()=>{const {Vector3}=await vi.importActual('three');return {OrbitControls:class{constructor(){this.target=new Vector3();}update(){}dispose(){}}};});

it('FR-006 adapta estado 2D para cena 3D, desenha ringue, raios e descarta recursos',()=>{
  const container=document.createElement('div');document.body.append(container);const view=createRenderer(container);
  const sim=new Simulation(sumo);view.setWorld(sumo);view.draw(sim.snapshot(),'sheep-01');expect(container.querySelector('canvas')).not.toBeNull();
  const root=capture.scene.children.find(o=>o.type==='Group');expect(root.children.filter(o=>o.geometry?.type==='CircleGeometry')).toHaveLength(1);
  const body=root.children.find(o=>o.type==='Group');expect(body.position.x).toBe(4.8);expect(body.position.z).toBe(-4.5);expect(body.scale.x).toBe(1.03);
  const beams=root.children.filter(o=>o.type==='LineSegments');expect(beams[0].geometry.attributes.position.array[0]).toBeCloseTo(4.8);
  view.setRays(false);view.draw(sim.snapshot(),'sheep-02');expect(beams[0].visible).toBe(false);
  Object.defineProperties(container,{clientWidth:{value:1000},clientHeight:{value:500}});view.draw(sim.snapshot(),'sheep-01');expect(capture.camera.aspect).toBe(2);
  const disposable=root.children.find(o=>o.material);disposable.material=[disposable.material];root.add(new (capture.camera.constructor)());
  view.setWorld(maze);view.draw(new Simulation(maze).snapshot(),'sheep-01');view.dispose();expect(capture.disposed).toBe(true);expect(container.querySelector('canvas')).toBeNull();
});
it('FR-006 raio único é desenhado à frente',()=>{const w=structuredClone(sumo);delete w.scenario;w.robots=[{...w.robots[0],laser:{rays:1,range:2,fov:0}}];const view=createRenderer(document.createElement('div'));view.setWorld(w);view.draw(new Simulation(w).snapshot(),'none');view.dispose();});
