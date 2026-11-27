import fs from 'fs';
import {criticasDe} from '../cuentas/lib/criticas.js';
globalThis.window={};
new Function('window',fs.readFileSync(new URL('../games.js',import.meta.url),'utf8'))(globalThis.window);
const solo=process.argv.slice(2);
const out=fs.existsSync('criticas.json')?JSON.parse(fs.readFileSync('criticas.json','utf8')):{};
for(const g of window.GAMES){
  if(solo.length&&!solo.includes(g.slug))continue;
  const r=await criticasDe(g.slug,g.title);
  console.log(g.slug.padEnd(48),r.vacio?'SIN DATOS':[r.mc,r.plat,r.total].join(' '));
  if(!r.vacio)out[g.slug]=r;
}
fs.writeFileSync('criticas.json',JSON.stringify(out));
console.log('guardado',Object.keys(out).length);
