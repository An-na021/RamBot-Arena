import './style.css';
import { Session } from './core/session.js';
import { createRenderer } from './renderer.js';
import maze from '../worlds/labirinto.json';
import empty from '../worlds/livre.json';
import sumo from '../worlds/sumo.json';

const $ = id => document.getElementById(id);
export function mount() {
  const session = new Session(sumo); let view;
  const message = (text, error=false) => { $('message').textContent=text; $('message').classList.toggle('error',error); };
  try { view=createRenderer($('viewport')); } catch { const p=document.createElement('p'); p.className='renderer-error'; p.textContent='Não foi possível iniciar WebGL. Habilite aceleração gráfica para visualizar a arena. O núcleo headless continua disponível via npm run headless.'; $('viewport').append(p); }
  function refreshWorld() {
    view?.setWorld(session.world); $('dimensions').textContent=`${session.world.width} × ${session.world.height} METROS`;
    $('robot-select').replaceChildren(...session.world.robots.map(r => { const o=document.createElement('option');o.value=r.id;o.textContent=r.id;return o; }));
    $('robot-select').value=session.selected; $('controller').value=session.sim.sources[session.selected] ?? '';
  }
  function render() {
    const state=session.state, robot=state.robots.find(r=>r.id===session.selected);
    view?.draw(state,session.selected);
    $('play').innerHTML=session.running?'Ⅱ <span>Pausar</span>':'▶ <span>Iniciar</span>';
    $('mode').textContent=session.replay?(session.result?.finished?`REPLAY · ${session.result.reason}`:'REPRODUÇÃO DE GRAVAÇÃO'):session.result?.finished?session.result.reason:session.running?'SIMULAÇÃO EM EXECUÇÃO':'SIMULAÇÃO PAUSADA';
    $('scenario-note').hidden=!session.world.scenario;
    $('time').textContent=state.time.toFixed(2).padStart(5,'0'); $('tick').textContent=String(state.tick).padStart(5,'0');
    $('robot-name').textContent=robot.id;
    for(const [id,key] of [['pos-x','x'],['pos-y','y'],['theta','theta'],['distance','distance']]) $(id).textContent=robot[key].toFixed(3);
    $('laser-meta').textContent=`${robot.scan.length} RAIOS / ${robot.laser.range} m`;
    $('laser-readings').replaceChildren(...robot.scan.map((n,i)=>{
      const row=document.createElement('div');row.className='laser-row';
      row.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><div class="laser-track"><div class="laser-fill" style="width:${n/robot.laser.range*100}%"></div></div><strong>${n.toFixed(2)}</strong>`;return row;
    }));
    $('bumper').textContent=robot.bumper?'CONTATO':'LIVRE';$('bumper').classList.toggle('hit',robot.bumper);
    $('dt').textContent=`${session.world.dt} s`;$('seed').textContent=session.world.seed;$('robot-count').textContent=state.robots.length;
    $('record').innerHTML=`<span class="record-dot"></span> ${session.recording?'Finalizar gravação':'Gravar'}`;
    $('exit-replay').hidden=!session.replay;$('timeline').disabled=!session.replay;$('timeline').max=session.replay?session.replay.frames.length-1:0;$('timeline').value=session.cursor;
    $('apply').disabled=!!session.replay;$('controller').disabled=!!session.replay;
  }
  const safe=fn=>async()=>{try{await fn();render();}catch(e){message(e.message,true);render();}};
  function download(data) { const blob=new Blob([JSON.stringify(data)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sheepbotz-replay.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  $('play').onclick=safe(()=>session.running?session.pause():session.play());
  $('step').onclick=safe(()=>{session.pause();session.step();});$('reset').onclick=safe(()=>{session.reset();message('Experimento reiniciado com a mesma seed.');});
  $('apply').onclick=safe(()=>{session.applyController($('controller').value);message('Controlador aplicado. Inicie ou avance um passo.');});
  $('world-select').onchange=safe(()=>{session.load(({livre:empty,labirinto:maze,sumo})[$('world-select').value]);refreshWorld();message('Mundo carregado.');});
  $('robot-select').onchange=safe(()=>{session.selected=$('robot-select').value;$('controller').value=session.sim.sources[session.selected]??'';});
  $('rays').onchange=()=>view?.setRays($('rays').checked);
  $('edit-world').onclick=()=>{$('world-json').value=JSON.stringify(session.world,null,2);$('world-dialog').showModal();};
  $('load-world').onclick=safe(()=>{session.load($('world-json').value);refreshWorld();$('world-dialog').close();message('Mundo JSON carregado.');});
  $('world-file').onchange=safe(async()=>{const file=$('world-file').files[0];if(!file)return;if(file.size>200000)throw new Error('Mundo: limite de 200 KB');session.load(await file.text());refreshWorld();message('Mundo importado.');});
  $('record').onclick=safe(()=>{if(session.recording){session.stopRecording();message('Gravação pronta para exportar.');}else{session.startRecording();message('Gravação iniciada do tick zero.');}});
  $('export').onclick=safe(()=>{const data=session.stopRecording();if(!data)throw new Error('Grave um experimento antes de exportar');download(data);message('Replay exportado.');});
  $('replay-file').onchange=safe(async()=>{const file=$('replay-file').files[0];if(!file)return;if(file.size>100000000)throw new Error('Replay: limite de 100 MB');session.importReplay(await file.text());refreshWorld();message('Replay aberto. Os controladores não são executados.');});
  $('exit-replay').onclick=safe(()=>{session.exitReplay();refreshWorld();message('Retorno ao experimento original.');});
  $('timeline').oninput=safe(()=>session.seek(Number($('timeline').value)));
  let last=0,acc=0,frame;
  function animate(now) {
    const elapsed=Math.min((now-last)/1000,.25);last=now;
    if(session.running){acc+=elapsed;try{while(acc>=session.world.dt&&session.running){session.step();acc-=session.world.dt;}if(session.notice){message(session.notice);session.notice='';}}catch(e){message(e.message,true);}}else acc=0;
    render();frame=requestAnimationFrame(animate);
  }
  refreshWorld();render();frame=requestAnimationFrame(animate);
  return {session,render,destroy:()=>{cancelAnimationFrame(frame);view?.dispose();}};
}
if(document.getElementById('viewport')) mount();
