export function parseSumo(config, world) {
  if (config === undefined) return null;
  if (!config || config.type !== 'sumo' || world.robots.length !== 2 ||
      !['x','y','radius','maxTicks'].every(k=>Number.isFinite(config[k])) || config.radius <= 0 ||
      config.x-config.radius < 0 || config.y-config.radius < 0 || config.x+config.radius > world.width || config.y+config.radius > world.height ||
      !Number.isInteger(config.maxTicks) || config.maxTicks < 1 || config.maxTicks > 10000) throw new Error('Sumô: ringue inválido; exige dois robôs, círculo dentro do mapa e limite de 1–10.000 ticks');
  if (world.robots.some(r=>Math.hypot(r.x-config.x,r.y-config.y)+r.radius > config.radius)) throw new Error('Sumô: robôs devem iniciar inteiramente dentro do ringue');
  return {type:'sumo',x:config.x,y:config.y,radius:config.radius,maxTicks:config.maxTicks};
}

export function sumoResult(config, state) {
  if (!config) return null;
  const outside=state.robots.filter(r=>Math.hypot(r.x-config.x,r.y-config.y)-r.radius > config.radius+1e-10);
  if(outside.length===2)return {finished:true,winner:null,reason:'Saída simultânea: empate'};
  if(outside.length===1){const winner=state.robots.find(r=>r.id!==outside[0].id).id;return {finished:true,winner,reason:`${winner} venceu: adversário fora do ringue`};}
  if(state.tick>=config.maxTicks)return {finished:true,winner:null,reason:'Tempo limite: empate'};
  return {finished:false,winner:null,reason:'Combate em andamento'};
}
