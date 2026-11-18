import {readFileSync} from 'node:fs';
import {Simulation} from '../src/core/simulation.js';
try {
  const ticks=Number(process.argv[3]??20);
  if(!Number.isInteger(ticks)||ticks<0||ticks>100000)throw new Error('ticks deve ser inteiro de 0 a 100.000');
  const sim=new Simulation(readFileSync(process.argv[2]??'worlds/livre.json','utf8'));
  for(let i=0;i<ticks;i++)sim.step();
  console.log(JSON.stringify(sim.snapshot(),null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
