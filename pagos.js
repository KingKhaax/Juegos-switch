(()=>{
const API="https://juegos-switch-cuentas.vercel.app/api/cuenta";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const COIN='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>';
const METODOS=["Bizum","Transferencia","Efectivo","PayPal","Otro"];
const eur=n=>(Math.round(n*100)/100).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
const ahora=()=>{const d=new Date(),z=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate())+"T"+z(d.getHours())+":"+z(d.getMinutes())};
const ses=()=>{for(const k of ["juegos-switch-cuenta","juegos-switch-cuenta-novia"]){try{const v=JSON.parse(localStorage.getItem(k));if(v&&v.admin&&v.token)return v}catch(e){}}return null};
let tm=0,sav=false,dlg=null,P=null,info={correo:false,correoMask:""},msg="",mk="",busy=false,dirty=false;
async function call(a,opt){
const s=ses();if(!s)throw new Error("sin_sesion");
const r=await fetch(API+"?a="+a,Object.assign({headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token}},opt||{}));
let j={};try{j=await r.json()}catch(e){}
return {ok:r.ok,status:r.status,j};
}
const rol=m=>m.rol==="Administrador"?'<span class="rol rol-admin"><i aria-hidden="true"></i><span>Administrador</span></span>':'<span class="rol rol-usuario"><i aria-hidden="true"></i><span>Miembro</span></span>';
function resumen(){
const n=P.miembros.length,pg=P.miembros.filter(m=>m.pagado).length,pct=n?Math.round(pg/n*100):0;
return `<div class="pg-stats"><div class="pg-st"><small>Cuota por persona</small><label class="pg-in"><input type="number" min="0" max="999" step="0.01" inputmode="decimal" value="${esc(P.cuota)}" data-cuota aria-label="Cuota por persona en euros"><span>€</span></label></div><div class="pg-st"><small>Renovación</small><input class="pg-date" type="datetime-local" value="${esc(P.renovacion)}" data-reno aria-label="Fecha de renovación"></div><div class="pg-st ok"><small>Pagados</small><b data-pg>${pg} / ${n}</b></div><div class="pg-st ok"><small>Recaudado</small><b data-rec>${eur(pg*P.cuota)}</b></div><div class="pg-st bad"><small>Falta por cobrar</small><b data-falta>${eur((n-pg)*P.cuota)}</b></div></div><div class="pg-bar" role="img" aria-label="${pct}% cobrado"><i data-bar style="width:${pct}%"></i><span data-pct>${pct}% cobrado</span></div>`;
}
function fila(m,i){
return `<li class="pg-r${m.pagado?" paid":""}${m.rol==="Administrador"?" adm":""}" data-i="${i}"><span class="pg-n">${i+1}</span><input class="pg-nm" type="text" value="${esc(m.nombre)}" maxlength="40" data-f="nombre" aria-label="Nombre del miembro ${i+1}"><button type="button" class="pg-rol" data-rol aria-label="Cambiar rol de ${esc(m.nombre)}">${rol(m)}</button><button type="button" class="pg-est ${m.pagado?"si":"no"}" data-est aria-pressed="${m.pagado}">${m.pagado?"✔ Pagado":"✘ Pendiente"}</button><div class="pg-fs"><label class="pg-f"><span>Fecha y hora de pago</span><input type="datetime-local" value="${esc(m.fecha.length>10?m.fecha:m.fecha?m.fecha+"T00:00":"")}" data-f="fecha"></label><label class="pg-f"><span>Método</span><select data-f="metodo"><option value="">—</option>${METODOS.map(x=>`<option${m.metodo===x?" selected":""}>${x}</option>`).join("")}</select></label><label class="pg-f"><span>Contacto</span><input type="text" value="${esc(m.contacto)}" maxlength="60" data-f="contacto"></label><label class="pg-f"><span>Notas</span><input type="text" value="${esc(m.notas)}" maxlength="120" data-f="notas"></label></div><button type="button" class="pg-x" data-del aria-label="Quitar a ${esc(m.nombre)}"${P.miembros.length<=1?" disabled":""}>×</button></li>`;
}
function render(){
if(!dlg)return;
const cuerpo=busy&&!P?'<div class="pg-load" role="status" aria-label="Cargando los pagos"><i></i><i></i><i></i></div>':!P?"":`${resumen()}<ul class="pg-list">${P.miembros.map(fila).join("")}</ul><div class="pg-add"><button type="button" class="pg-addb" data-add${P.miembros.length>=16?" disabled":""}>+ Añadir miembro</button></div><label class="pg-auto"><input type="checkbox" data-auto${P.auto?" checked":""}><span><b>Enviarme el Excel a mi Gmail cada vez que guarde</b><small>${info.correo?"Se manda a "+esc(info.correoMask):"Aún no tienes un correo vinculado: añádelo en tu cuenta para poder recibirlo."}</small></span></label><div class="pg-acts"><button type="button" class="adm-save pg-save" data-save${dirty?"":" disabled"}>Guardar</button><button type="button" class="pg-b" data-dl>Descargar Excel</button><button type="button" class="pg-b" data-mail${info.correo?"":" disabled"}>Enviar a mi Gmail</button></div>`;
const out=dlg.querySelector(".pg-body");
if(out){out.innerHTML=cuerpo;const e=dlg.querySelector("#pagmsg");e.textContent=msg;e.className="amsg "+mk;return}
dlg.innerHTML=`<div class="awin adm-win pg-win"><div class="nso-aur adm-aur" aria-hidden="true"></div><div class="fhead"><h3 class="adm-title"><span class="adm-crown">${COIN}</span>Pagos Switch Online</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div><p class="adesc">Solo lo ves tú, porque eres <mark class="m-go">administrador</mark>. Aquí llevas quién ha pagado su parte del plan familiar y puedes pasarlo a Excel.</p><div class="pg-body">${cuerpo}</div><p class="amsg ${mk}" id="pagmsg" role="status">${esc(msg)}</p></div>`;
}
function prog(ms){clearTimeout(tm);tm=setTimeout(auto,ms==null?800:ms)}
async function auto(){
clearTimeout(tm);
if(!P||!dirty)return;
if(sav||busy){prog(600);return}
sav=true;
const mia=JSON.stringify(P);
try{
const r=await call("pagos_set",{method:"POST",keepalive:true,body:JSON.stringify({pagos:P,correo:false})});
if(!r.ok)throw new Error(r.status);
if(JSON.stringify(P)===mia){dirty=false;const sb=dlg&&dlg.querySelector("[data-save]");if(sb)sb.disabled=true;aviso("Guardado en tu cuenta.","ok")}else prog(200);
}catch(e){aviso("No se ha podido guardar. Sigo intentándolo…","bad");prog(4000)}
sav=false;
}
function aviso(t,k){msg=t;mk=k||"ok";const e=dlg&&dlg.querySelector("#pagmsg");if(e){e.textContent=t;e.className="amsg "+mk}}
function marcar(){dirty=true;prog();const b=dlg.querySelector("[data-save]");if(b)b.disabled=false;aviso("","")}
function totales(){
const n=P.miembros.length,pg=P.miembros.filter(m=>m.pagado).length,pct=n?Math.round(pg/n*100):0;
const q=s=>dlg.querySelector(s);
q("[data-pg]").textContent=pg+" / "+n;q("[data-rec]").textContent=eur(pg*P.cuota);q("[data-falta]").textContent=eur((n-pg)*P.cuota);
q("[data-bar]").style.width=pct+"%";q("[data-pct]").textContent=pct+"% cobrado";
}
async function cargar(){
busy=true;P=null;render();
try{
const r=await call("pagos_get");
if(!r.ok)throw new Error(r.status);
P=r.j.pagos;info={correo:!!r.j.correo,correoMask:r.j.correoMask||""};dirty=false;msg="";mk="";
}catch(e){P=null;msg="No se han podido cargar los pagos. Comprueba que tienes la sesión iniciada y vuelve a intentarlo.";mk="bad"}
busy=false;render();
}
async function guardar(){
if(busy)return;busy=true;aviso("Guardando…","");
try{
const r=await call("pagos_set",{method:"POST",body:JSON.stringify({pagos:P})});
if(!r.ok)throw new Error(r.status);
dirty=false;busy=false;
let t="Guardado en tu cuenta.";
if(r.j.enviado)t+=" Te he mandado el Excel a tu Gmail.";
else if(r.j.fallo)t+=" No he podido mandarte el correo ("+(r.j.fallo==="sin_correo"?"no tienes correo vinculado":"error al enviar")+").";
render();aviso(t,r.j.fallo?"bad":"ok");
}catch(e){busy=false;aviso("No se ha podido guardar. Inténtalo de nuevo.","bad")}
}
async function descargar(){
if(busy)return;busy=true;aviso("Preparando el Excel…","");
try{
if(dirty){const g=await call("pagos_set",{method:"POST",body:JSON.stringify({pagos:Object.assign({},P,{auto:false})})});if(!g.ok)throw new Error("g");dirty=false;const sb=dlg.querySelector("[data-save]");if(sb)sb.disabled=true}
const r=await call("pagos_xlsx");
if(!r.ok)throw new Error(r.status);
const bin=atob(r.j.base64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([u],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));a.download=r.j.nombre||"Pagos-Switch-Online.xlsx";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
busy=false;aviso("Excel descargado: Pagos-Switch-Online.xlsx","ok");
}catch(e){busy=false;aviso("No se ha podido crear el Excel.","bad")}
}
async function mandar(){
if(busy)return;busy=true;aviso("Enviando a tu Gmail…","");
try{
if(dirty){const g=await call("pagos_set",{method:"POST",body:JSON.stringify({pagos:Object.assign({},P,{auto:false})})});if(!g.ok)throw new Error("g");dirty=false;const sb=dlg.querySelector("[data-save]");if(sb)sb.disabled=true}
const r=await call("pagos_mail",{method:"POST",body:"{}"});
busy=false;
if(r.ok)aviso("Enviado a "+(r.j.a||"tu Gmail")+". Mira tu bandeja de entrada.","ok");
else aviso(r.j.error==="sin_correo"?"No tienes un correo vinculado a tu cuenta.":"No se ha podido enviar el correo.","bad");
}catch(e){busy=false;aviso("No se ha podido enviar el correo.","bad")}
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");dlg.id="pagdlg";dlg.setAttribute("aria-label","Pagos Switch Online");
document.body.appendChild(dlg);
window.JS&&window.JS.watchDialogs&&window.JS.watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
if(!P)return;
const li=e.target.closest(".pg-r"),i=li?+li.dataset.i:-1,m=P.miembros[i];
if(e.target.closest("[data-est]")&&m){m.pagado=!m.pagado;m.fecha=m.pagado?ahora():"";dirty=true;prog();render();return}
if(e.target.closest("[data-rol]")&&m){m.rol=m.rol==="Administrador"?"Miembro":"Administrador";dirty=true;prog();render();return}
if(e.target.closest("[data-del]")&&m&&P.miembros.length>1){P.miembros.splice(i,1);dirty=true;prog();render();return}
if(e.target.closest("[data-add]")&&P.miembros.length<16){P.miembros.push({nombre:"Nuevo miembro",rol:"Miembro",pagado:false,fecha:"",metodo:"",contacto:"",notas:""});dirty=true;prog();render();const l=dlg.querySelectorAll(".pg-nm");const x=l[l.length-1];if(x){x.focus();x.select()}return}
if(e.target.closest("[data-save]")){guardar();return}
if(e.target.closest("[data-dl]")){descargar();return}
if(e.target.closest("[data-mail]")){mandar();return}
});
const edit=e=>{
const t=e.target;if(!P)return;
if(t.dataset.cuota!==undefined){const v=Math.round(Number(t.value)*100)/100;if(v>=0&&v<1000){P.cuota=v;marcar();totales()}return}
if(t.dataset.reno!==undefined){P.renovacion=t.value;marcar();return}
if(t.dataset.auto!==undefined){P.auto=t.checked;marcar();return}
const li=t.closest(".pg-r");if(!li||!t.dataset.f)return;
P.miembros[+li.dataset.i][t.dataset.f]=t.value;marcar();
};
dlg.addEventListener("close",()=>auto());addEventListener("pagehide",()=>{if(dirty)auto()});dlg.addEventListener("input",edit);dlg.addEventListener("change",edit);
}
function open(){
ensure();msg="";mk="";
dlg.classList.add("fx-open");setTimeout(()=>dlg.classList.remove("fx-open"),1300);
if(!dlg.open)dlg.showModal();
cargar();
}
const nav=document.querySelector(".apartados");
const b=document.createElement("button");
b.type="button";b.id="bpag";b.className="ap";b.textContent="Pagos Switch Online";b.hidden=true;
b.insertAdjacentHTML("afterbegin",COIN);
if(nav){const a=document.getElementById("badm");a&&a.nextSibling?nav.insertBefore(b,a.nextSibling):nav.appendChild(b)}
b.addEventListener("click",open);
const check=()=>{b.hidden=!ses()};
check();
setInterval(check,1500);
window.addEventListener("storage",check);
})();
