// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import page from '../index.html?raw';
import {Session} from '../src/core/session.js';
import sumo from '../worlds/sumo.json';
const mock=vi.hoisted(()=>({fail:false,view:{setWorld:vi.fn(),draw:vi.fn(),setRays:vi.fn(),dispose:vi.fn()}}));
vi.mock('../src/renderer.js',()=>({createRenderer:()=>{if(mock.fail)throw new Error('no GPU');return mock.view;}}));
let app,raf;
const $=id=>document.getElementById(id);
const click=async id=>{await $(id).onclick();};
const change=async(id,value)=>{$(id).value=value;await $(id).onchange();};
beforeEach(async()=>{
  document.body.innerHTML=page.split('<body>')[1].split('<script')[0];
  vi.stubGlobal('requestAnimationFrame',vi.fn(fn=>{raf=fn;return 1;}));vi.stubGlobal('cancelAnimationFrame',vi.fn());
  HTMLDialogElement.prototype.showModal=vi.fn();HTMLDialogElement.prototype.close=vi.fn();
  URL.createObjectURL=vi.fn(()=>'blob:test');URL.revokeObjectURL=vi.fn();HTMLAnchorElement.prototype.click=vi.fn();
  const {mount}=await import('../src/app.js');app=mount();
});
afterEach(()=>{app?.destroy();mock.fail=false;vi.unstubAllGlobals();});
it('FR-005 FR-008 interface mostra tempo, seleção, passo, pause e reset',async()=>{
  expect($('robot-name').textContent).toBe('sheep-01');expect($('laser-readings').children).toHaveLength(9);
  await click('play');expect(app.session.running).toBe(true);raf(100);expect(app.session.state.tick).toBe(2);await click('play');expect(app.session.running).toBe(false);raf(110);await click('step');expect($('tick').textContent).toBe('00003');
  await change('robot-select','sheep-02');expect($('robot-name').textContent).toBe('sheep-02');await click('reset');expect($('tick').textContent).toBe('00000');
  $('rays').checked=false;$('rays').onchange();expect(mock.view.setRays).toHaveBeenCalledWith(false);
});
it('FR-001 importa editor JSON e preserva estado em erro',async()=>{
  $('edit-world').onclick();expect($('world-json').value).toContain('sumo');expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  $('world-json').value='{}';await click('load-world');expect($('message').classList.contains('error')).toBe(true);
  $('world-json').value=JSON.stringify(sumo);await click('load-world');expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  await change('world-select','livre');expect(app.session.state.robots).toHaveLength(1);await change('world-select','labirinto');expect(app.session.world.obstacles.length).toBeGreaterThan(0);await change('world-select','sumo');expect(app.session.result).not.toBeNull();
});
it('FR-004 erros de programa na aplicação e execução ficam visíveis',async()=>{
  $('controller').value='while(true){}';await click('apply');expect($('message').textContent).toContain('não permitida');
  $('controller').value='setSpeed(unknown,0);';await click('apply');await click('play');raf(100);expect($('message').textContent).toContain('desconhecida');expect(app.session.running).toBe(false);
  $('controller').value='setSpeed(0,0);';await click('apply');expect($('message').classList.contains('error')).toBe(false);
});
it('FR-009 grava, exporta, importa, busca e sai do replay',async()=>{
  vi.useFakeTimers();await click('export');expect($('message').textContent).toContain('Grave');await click('record');await click('step');await click('record');await click('export');expect(URL.createObjectURL).toHaveBeenCalled();vi.runAllTimers();expect(URL.revokeObjectURL).toHaveBeenCalled();vi.useRealTimers();
  const s=new Session(sumo);s.startRecording();s.step();const data=JSON.stringify(s.stopRecording());
  Object.defineProperty($('replay-file'),'files',{configurable:true,value:[{size:data.length,text:async()=>data}]});await $('replay-file').onchange();expect($('exit-replay').hidden).toBe(false);expect($('controller').disabled).toBe(true);
  $('timeline').value='1';await $('timeline').oninput();expect(app.session.cursor).toBe(1);raf(200);await click('exit-replay');expect(app.session.replay).toBeNull();
});
it('FR-001 FR-009 importação de arquivos valida tamanho e ausência de seleção',async()=>{
  for(const id of ['world-file','replay-file']){
    Object.defineProperty($(id),'files',{configurable:true,value:[]});await $(id).onchange();
    Object.defineProperty($(id),'files',{configurable:true,value:[{size:110000000}]});await $(id).onchange();expect($('message').textContent).toContain('limite');
  }
  Object.defineProperty($('world-file'),'files',{configurable:true,value:[{size:100,text:async()=>JSON.stringify(sumo)}]});await $('world-file').onchange();expect($('message').textContent).toContain('importado');
});
it('FR-005 FR-010 fim de combate mostra vencedor e aviso',async()=>{
  app.session.load({...sumo,scenario:{...sumo.scenario,maxTicks:1}});await click('play');raf(100);expect($('mode').textContent).toContain('empate');expect($('message').textContent).toContain('Tempo limite');
  app.session.startRecording();app.session.step();app.session.importReplay(app.session.stopRecording());app.session.seek(1);app.render();expect($('mode').textContent).toContain('REPLAY');expect($('mode').textContent).toContain('empate');
});
it('FR-003 bumper visível após contato',async()=>{app.session.load({...sumo,scenario:undefined,robots:[{...sumo.robots[0],x:.28,theta:Math.PI}]});app.session.applyController('setSpeed(1,0);');await click('step');expect($('bumper').textContent).toBe('CONTATO');});
it('FR-006 indisponibilidade de WebGL mostra mensagem clara',async()=>{app.destroy();mock.fail=true;const {mount}=await import('../src/app.js');app=mount();expect($('viewport').textContent).toContain('Não foi possível iniciar WebGL');await click('step');expect(app.session.state.tick).toBe(1);});
