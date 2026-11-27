import {POR_DEFECTO,limpiar,construir} from './lib/pagos.js';
import fs from 'fs';
const p=limpiar({...POR_DEFECTO,miembros:POR_DEFECTO.miembros.map((m,i)=>i==3?{...m,rol:'Amigo VIP',rolColor:'#3ddc84'}:m)});
console.log(p.miembros.map(m=>m.rol+m.rolColor).join(' '));
fs.writeFileSync(process.env.TEMP+'/prev/t2.xlsx',await construir(p,[{nombre:'Administrador'},{nombre:'Amigo VIP'},{nombre:'Usuario'}]));
