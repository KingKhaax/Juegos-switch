(()=>{
const API="https://juegos-switch-cuentas.vercel.app/api/cuenta";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const KNOWN=["admin","mod","usuario","invitado"];
const DEF={admin:"#ffb800",mod:"#ff5fa8",usuario:"#1f8fff",invitado:"#8a90a0"};
const PALETA=["#ffb800","#ff5fa8","#1f8fff","#3ddc84","#a678ff","#ff6a00","#00c3e3","#e60012"];
const FIJOS=["admin","usuario","invitado"];
const CROWN='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 19h14"/></svg>';
const ses=()=>{for(const k of ["juegos-switch-cuenta","juegos-switch-cuenta-novia"]){try{const v=JSON.parse(localStorage.getItem(k));if(v&&v.admin&&v.token)return v}catch(e){}}return null};
const badge=r=>{const c=(r.color||"").toLowerCase();const cls=KNOWN.includes(r.id)&&(!c||c===DEF[r.id])?"rol-"+r.id:"rol-x";return `<span class="rol ${cls}" style="--rc:${esc(r.color||"#8a90a0")}"><i aria-hidden="true"></i><span>${esc(r.nombre)}</span></span>`};
const fmt=ms=>ms?new Date(ms).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"}):"—";
const hace=ms=>{if(!ms)return "Nunca";const m=Math.round((Date.now()-ms)/60000);if(m<2)return "Ahora mismo";if(m<60)return `Hace ${m} min`;const h=Math.round(m/60);if(h<24)return `Hace ${h} h`;const d=Math.round(h/24);if(d<31)return `Hace ${d} ${d===1?"día":"días"}`;return fmt(ms)};
let dlg=null,D=null,RS=[],dirty=false,msg="",mk="",q="",busy=false;
async function call(a,opt){
const s=ses();if(!s)throw new Error("sin_sesion");
const r=await fetch(API+"?a="+a,Object.assign({headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token}},opt||{}));
let j={};try{j=await r.json()}catch(e){}
return {ok:r.ok,status:r.status,j};
}
async function cargar(){
busy=true;render();
try{
const r=await call("admin_usuarios");
if(!r.ok)throw new Error(r.status);
D=r.j;RS=D.roles.map(x=>Object.assign({},x));dirty=false;msg="";
}catch(e){D=null;msg="No se han podido cargar los usuarios. Comprueba que tienes la sesión iniciada y vuelve a intentarlo.";mk="bad"}
busy=false;render(true);
}
const roleOf=id=>(RS.find(r=>r.id===id)||(D&&D.roles.find(r=>r.id===id))||{id,nombre:id,color:"#8a90a0"});
const cuentaRol=id=>D?D.users.filter(u=>u.rol===id).length:0;
function stats(){
if(!D)return "";
const n=D.users.length,conMail=D.users.filter(u=>u.correo).length,tot=D.users.reduce((t,u)=>t+u.tengo.rafa+u.tengo.novia,0);
const t=(l,v,k)=>`<div class="adm-t" style="--k:${k}"><small>${l}</small><b data-n="${v}">0</b></div>`;
return `<div class="adm-stats">${t("Miembros",n,"#ffd96a")}${t("Con correo",conMail,"#4fe3ff")}${t("Juegos «ya los tengo»",tot,"#5df09e")}${t("Roles",RS.length,"#ff8ec2")}</div>`;
}
function rolesHtml(){
const fila=r=>`<li class="adm-r" data-rid="${esc(r.id)}" style="--rc:${esc(r.color)}"><label class="adm-sw" title="Color del rol"><input type="color" value="${esc(r.color)}" data-rc="${esc(r.id)}" aria-label="Color del rol ${esc(r.nombre)}"><span></span></label><input class="adm-rn" type="text" maxlength="24" value="${esc(r.nombre)}" data-rn="${esc(r.id)}" aria-label="Nombre del rol" spellcheck="false"><span class="adm-rv">${badge(r)}</span><small class="adm-rc">${cuentaRol(r.id)} ${cuentaRol(r.id)===1?"miembro":"miembros"}</small>${FIJOS.includes(r.id)?`<span class="adm-fijo" title="Rol del sistema: se puede renombrar pero no borrar">Fijo</span>`:`<button type="button" class="adm-x" data-rdel="${esc(r.id)}" aria-label="Borrar el rol ${esc(r.nombre)}">Borrar</button>`}</li>`;
return `<ul class="adm-roles">${RS.map(fila).join("")}</ul><div class="adm-acts"><button type="button" class="nb2" data-rnew>＋ Nuevo rol</button><button type="button" class="pri adm-save" data-rsave${dirty?"":" disabled"}>Guardar roles</button></div>`;
}
function usersHtml(){
if(!D)return "";
const f=q.trim().toLowerCase();
const lista=D.users.filter(u=>!f||u.user.includes(f)||u.nombre.toLowerCase().includes(f));
if(!lista.length)return `<p class="adm-vacio">Ningún miembro coincide con «${esc(q)}».</p>`;
const asign=RS.filter(r=>r.id!=="admin"&&r.id!=="invitado");
return `<ul class="adm-users">${lista.map((u,i)=>{
const r=roleOf(u.rol),esAdmin=u.user===D.admin;
return `<li class="adm-u" style="--rc:${esc(r.color)};--n:${i}"><span class="adm-av">${u.avatar?`<img src="img/${esc(u.avatar)}" alt="">`:`<b>${esc(u.nombre.slice(0,1).toUpperCase())}</b>`}</span><div class="adm-ub"><div class="adm-un"><b>${esc(u.nombre)}</b><small>@${esc(u.user)}</small>${badge(r)}</div><div class="adm-um"><span>Alta: ${fmt(u.creada)}</span><span>${hace(u.actividad)}</span><span>${u.tengo.rafa+u.tengo.novia} juegos tengo</span>${u.horas?`<span>${Math.round(u.horas*10)/10} h jugadas</span>`:""}<span>${u.correo?esc(u.correo):"Sin correo"}</span></div></div><div class="adm-pick" role="group" aria-label="Cambiar el rol de ${esc(u.nombre)}">${esAdmin?`<span class="adm-fijo">Fijo · eres tú</span>`:asign.map(a=>`<button type="button" class="adm-pill${a.id===u.rol?" on":""}" style="--rc:${esc(a.color)}" data-u="${esc(u.user)}" data-set="${esc(a.id)}" aria-pressed="${a.id===u.rol}">${esc(a.nombre)}</button>`).join("")}</div></li>`}).join("")}</ul>`;
}
function conteo(){
dlg.querySelectorAll(".adm-t b[data-n]").forEach(b=>{const to=+b.dataset.n,t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/800),e=1-Math.pow(1-k,3);b.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)});
}
function render(parcial){
const cuerpo=busy&&!D?`<p class="adm-vacio"><span class="adm-spin"></span>Cargando miembros…</p>`:D?`${stats()}<section class="adm-sec"><h4>Roles</h4><p class="adesc">Cambia el <mark class="m-go">nombre</mark> o el <mark class="m-pk">color</mark> de cada rol y pulsa «Guardar roles». Los roles fijos no se pueden borrar. Si borras uno, sus miembros pasan a «Usuario».</p>${rolesHtml()}</section><section class="adm-sec"><h4>Miembros</h4><label class="add-s adm-s"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input class="adm-q" type="search" placeholder="Buscar un miembro" autocomplete="off" value="${esc(q)}" aria-label="Buscar un miembro"></label><div id="admu">${usersHtml()}</div></section>`:`<p class="adm-vacio bad">${esc(msg)}</p>`;
if(parcial&&dlg.querySelector(".adm-win")){
const keep=dlg.querySelector(".adm-q");const val=keep?keep.value:"";
dlg.querySelector(".adm-body").innerHTML=cuerpo;
const nq=dlg.querySelector(".adm-q");if(nq&&document.activeElement!==nq){nq.value=val||q}
}else{
dlg.innerHTML=`<div class="awin adm-win"><div class="nso-aur adm-aur" aria-hidden="true"></div><div class="fhead"><h3 class="adm-title"><span class="adm-crown">${CROWN}</span>Gestión de usuarios</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div><p class="adesc">Solo lo ves tú, porque eres <mark class="m-go">administrador</mark>. Aquí están todos los que se han registrado en la web.</p><div class="adm-body">${cuerpo}</div><p class="amsg ${mk}" id="admmsg" role="status">${esc(msg&&D?msg:"")}</p></div>`;
}
if(D)conteo();
}
function aviso(t,k){msg=t;mk=k||"ok";const e=dlg.querySelector("#admmsg");if(e){e.textContent=t;e.className="amsg "+mk}}
async function asignar(u,r){
if(busy)return;
const us=D.users.find(x=>x.user===u);if(!us||us.rol===r)return;
const antes=us.rol;us.rol=r;render(true);
try{
const x=await call("admin_rol",{method:"POST",body:JSON.stringify({user:u,role:r})});
if(!x.ok)throw new Error(x.status);
aviso(`${us.nombre} ahora es ${roleOf(r).nombre}.`,"ok");
}catch(e){us.rol=antes;render(true);aviso("No se ha podido cambiar el rol.","bad")}
}
async function guardarRoles(){
busy=true;
try{
const x=await call("admin_roles",{method:"POST",body:JSON.stringify({roles:RS})});
if(!x.ok)throw new Error(x.status);
D.roles=x.j.roles;RS=x.j.roles.map(r=>Object.assign({},r));dirty=false;
D.users.forEach(u=>{if(!RS.some(r=>r.id===u.rol))u.rol="usuario"});
busy=false;render(true);aviso(x.j.movidos?`Roles guardados. ${x.j.movidos} miembros han pasado a Usuario.`:"Roles guardados.","ok");
}catch(e){busy=false;render(true);aviso("No se han podido guardar los roles. Revisa que ningún nombre esté vacío.","bad")}
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="admdlg";
dlg.setAttribute("aria-label","Gestión de usuarios");
document.body.appendChild(dlg);
window.JS&&window.JS.watchDialogs&&window.JS.watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const p=e.target.closest("[data-set]");if(p){asignar(p.dataset.u,p.dataset.set);return}
if(e.target.closest("[data-rnew]")){if(RS.length>=14){aviso("Ya hay 14 roles, que es el máximo.","bad");return}const n="rol"+Math.random().toString(36).slice(2,6);RS.push({id:n,nombre:"Nuevo rol",color:PALETA[RS.length%PALETA.length]});dirty=true;render(true);return}
const d=e.target.closest("[data-rdel]");if(d){RS=RS.filter(r=>r.id!==d.dataset.rdel);dirty=true;render(true);return}
if(e.target.closest("[data-rsave]")){guardarRoles()}
});
dlg.addEventListener("input",e=>{
const t=e.target;
if(t.classList.contains("adm-q")){q=t.value;const u=dlg.querySelector("#admu");if(u)u.innerHTML=usersHtml();return}
if(t.dataset.rn){const r=RS.find(x=>x.id===t.dataset.rn);if(r){r.nombre=t.value;dirty=true;const b=dlg.querySelector(".adm-save");if(b)b.disabled=false;const v=t.closest(".adm-r").querySelector(".adm-rv");if(v)v.innerHTML=badge(r)}return}
if(t.dataset.rc){const r=RS.find(x=>x.id===t.dataset.rc);if(r){r.color=t.value;dirty=true;const b=dlg.querySelector(".adm-save");if(b)b.disabled=false;const li=t.closest(".adm-r");li.style.setProperty("--rc",r.color);li.querySelector(".adm-rv").innerHTML=badge(r)}}
});
}
function open(){
ensure();
msg="";mk="";q="";
dlg.classList.add("fx-open");setTimeout(()=>dlg.classList.remove("fx-open"),1300);
if(!dlg.open)dlg.showModal();
cargar();
}
const nav=document.querySelector(".apartados");
const b=document.createElement("button");
b.type="button";b.id="badm";b.className="ap";b.textContent="Gestión de usuarios";b.hidden=true;
if(nav)nav.appendChild(b);
b.addEventListener("click",open);
const check=()=>{b.hidden=!ses()};
check();
setInterval(check,1500);
window.addEventListener("storage",check);
})();
