import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const spec=readFileSync('specs/001-arena/spec.md','utf8'),tasks=readFileSync('specs/001-arena/tasks.md','utf8');
const allTasks=readdirSync('specs').map(d=>`specs/${d}/tasks.md`).filter(existsSync).map(p=>readFileSync(p,'utf8')).join('\n');
const ids=[...new Set([...spec.matchAll(/\*\*((?:FR|NFR)-\d+):?\*\*/g)].map(m=>m[1]))];
if(ids.length===0)throw new Error('Nenhum requisito identificado: revisar formato da spec');
for(const id of ids)if(!tasks.includes(id))throw new Error(`Requisito sem task: ${id}`);
for(const line of tasks.split('\n').filter(s=>/^- \[[ x]\] T/.test(s)))if(!/\[(?:[^\]]*(?:FR|NFR)-\d+)[^\]]*\]/.test(line))throw new Error(`Task sem requisito: ${line}`);
let log='';try{log=execFileSync('git',['log','--no-merges','--format=%s'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});}catch{}
const commits=log.trim()?log.trim().split('\n'):[];
for(const commit of commits){const id=commit.match(/^T\d{3}(?=:)/)?.[0];if(!id||!allTasks.includes(id))throw new Error(`Commit sem task conhecida: ${commit}`);}
// Features 002+ (Spec Kit): todo FR/NFR da spec aparece no tasks.md da feature e em ao menos um teste com o número da feature.
const testNames=readdirSync('tests').filter(f=>f.endsWith('.test.js')).flatMap(f=>[...readFileSync(`tests/${f}`,'utf8').matchAll(/it(?:\.each\([^)]*\))?\(\s*'([^']*)'/g)].map(m=>m[1]));
let featureIds=0;
for(const dir of readdirSync('specs').filter(d=>/^\d{3}-/.test(d)&&!d.startsWith('001-'))){
  const n=dir.slice(0,3),fspec=readFileSync(`specs/${dir}/spec.md`,'utf8'),ftasks=readFileSync(`specs/${dir}/tasks.md`,'utf8');
  for(const id of new Set([...fspec.matchAll(/\*\*((?:FR|NFR)-\d+)\*\*/g)].map(m=>m[1]))){
    featureIds++;
    if(!ftasks.includes(id))throw new Error(`${dir}: requisito sem task: ${id}`);
    if(!testNames.some(t=>t.startsWith(n)&&t.split(/\s+/).includes(id)))throw new Error(`${dir}: requisito sem teste com ID: ${id}`);
  }
}
console.log(`${ids.length} requisitos com tasks; ${featureIds} requisitos das features 002+ com task e teste; ${commits.length} commits verificados.`);
