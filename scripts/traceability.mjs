import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const spec=readFileSync('specs/001-arena/spec.md','utf8'),tasks=readFileSync('specs/001-arena/tasks.md','utf8');
const ids=[...new Set([...spec.matchAll(/\*\*((?:FR|NFR)-\d+):?\*\*/g)].map(m=>m[1]))];
if(ids.length===0)throw new Error('Nenhum requisito identificado: revisar formato da spec');
for(const id of ids)if(!tasks.includes(id))throw new Error(`Requisito sem task: ${id}`);
for(const line of tasks.split('\n').filter(s=>/^- \[[ x]\] T/.test(s)))if(!/\[(?:[^\]]*(?:FR|NFR)-\d+)[^\]]*\]/.test(line))throw new Error(`Task sem requisito: ${line}`);
let log='';try{log=execFileSync('git',['log','--format=%s'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});}catch{}
const commits=log.trim()?log.trim().split('\n'):[];
for(const commit of commits){const id=commit.match(/^T\d{3}(?=:)/)?.[0];if(!id||!tasks.includes(id))throw new Error(`Commit sem task conhecida: ${commit}`);}
console.log(`${ids.length} requisitos com tasks; ${commits.length} commits verificados.`);
