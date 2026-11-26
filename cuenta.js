(()=>{
const API="https://juegos-switch-cuentas.vercel.app/api/cuenta";
const PROF=window.PERFIL==="novia"?"novia":"rafa";
const NV=PROF==="novia";
const NAME=NV?"Jueguitos Switch de Nicky":"Jueguitos Switch de Rafita";
const CK=NV?"juegos-switch-cuenta-novia":"juegos-switch-cuenta";
const FK="juegos-switch-amigo"+(NV?"-novia":"");
const fmtFc=v=>{const d=String(v).toUpperCase().replace(/^SW/,"").replace(/[^0-9]/g,"").slice(0,12);return d?"SW-"+d.match(/.{1,4}/g).join("-"):""};
const getFc=()=>{try{return localStorage.getItem(FK)||""}catch(e){return""}};
const GK="js-invitado-"+PROF;
const SKIP=/^juegos-switch-(cuenta|cuenta-novia|token|perfil|ajustes|mig1)$/;
const root=document.documentElement;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ses=()=>{try{return JSON.parse(localStorage.getItem(CK))||null}catch(e){return null}};
const setSes=v=>{try{v?localStorage.setItem(CK,JSON.stringify(v)):localStorage.removeItem(CK)}catch(e){}};
const guest=()=>{try{return sessionStorage.getItem(GK)==="1"}catch(e){return false}};
const setGuest=v=>{try{v?sessionStorage.setItem(GK,"1"):sessionStorage.removeItem(GK)}catch(e){}};
const mine=k=>k&&k.startsWith("juegos-switch-")&&!SKIP.test(k)&&(NV?k.endsWith("-novia"):!k.endsWith("-novia"));
const keys=()=>{const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(mine(k))out.push(k)}return out};
const collect=()=>Object.fromEntries(keys().sort().map(k=>[k,localStorage.getItem(k)]));
const apply=d=>{keys().forEach(k=>localStorage.removeItem(k));Object.entries(d||{}).forEach(([k,v])=>{if(mine(k)&&typeof v==="string")localStorage.setItem(k,v)})};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(Object.fromEntries(Object.entries(b||{}).sort()));
const slot=d=>(d&&d[PROF])||{};
const ROLI={invitado:{id:"invitado",nombre:"Invitado"}};
const rolDe=s=>(s&&s.rol)||ROLI.invitado;
const ROLK=["admin","mod","usuario","invitado"],ROLC={admin:"#ffb800",mod:"#ff5fa8",usuario:"#1f8fff",invitado:"#8a90a0"};
const rolHTML=r=>{const k=(r.color||"").toLowerCase(),cls=ROLK.includes(r.id)&&(!k||k===ROLC[r.id])?"rol-"+esc(r.id):"rol-x";return '<span class="rol '+cls+'" style="--rc:'+esc(r.color||"#8a90a0")+'"><i aria-hidden="true"></i><span>'+esc(r.nombre)+'</span></span>'};
const puedeEditar=()=>{const s=ses();if(!s)return false;if(!s.puede)return true;return !!s.puede[PROF]};
function lectura(){
const ro=!puedeEditar();
root.classList.toggle("solo-lectura",ro);
let b=document.getElementById("slBanner");
if(ro&&!b){b=document.createElement("p");b.id="slBanner";b.className="sl-banner";b.setAttribute("role","note");const t=document.querySelector(".tools");if(t)t.parentNode.insertBefore(b,t)}
if(b)b.innerHTML=ro?'<b>Solo lectura.</b> '+(NV?"Estás viendo la lista de Nicky: solo Nicky y el administrador pueden cambiarla.":"Estás viendo la lista de Rafita: solo él puede cambiarla."):"";
if(b)b.hidden=!ro;
}
const PERS=/^juegos-switch-(avatar|nintendo|amigo|nso)(-novia)?$/;
const hk=d=>{const t=JSON.stringify(Object.entries(d||{}).sort());let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return String(h)};
const shared=()=>Object.fromEntries(Object.entries(collect()).filter(([k])=>!PERS.test(k)));
async function publico(){
try{
const r=await call("publico&perfil="+PROF,{});
if(!r.ok||!r.j.data)return;
const d=Object.fromEntries(Object.entries(r.j.data).filter(([k,v])=>mine(k)&&!PERS.test(k)&&typeof v==="string"));
if(!Object.keys(d).length||same(shared(),d))return;
let done="";try{done=sessionStorage.getItem("js-pub-"+PROF)||""}catch(e){}
if(done===hk(d))return;
try{sessionStorage.setItem("js-pub-"+PROF,hk(d))}catch(e){}
keys().filter(k=>!PERS.test(k)).forEach(k=>localStorage.removeItem(k));
Object.entries(d).forEach(([k,v])=>localStorage.setItem(k,v));
location.reload();
}catch(e){}
}
async function call(a,opt){
const r=await fetch(API+"?a="+a,opt);
let j={};try{j=await r.json()}catch(e){}
return {ok:r.ok,status:r.status,j};
}
const ERR={correo:"Ese correo no es válido.",codigo:"El código no es correcto o ha caducado.",espera:"Espera un minuto antes de pedir otro código.",envio:"No se ha podido enviar el correo. Inténtalo más tarde.",correo_no:"El envío por correo aún no está activado.",bloqueo:"Demasiados intentos fallidos. Prueba de nuevo en 15 minutos.",bloqueo:"Demasiados intentos fallidos. Prueba de nuevo en 15 minutos.",pregunta:"Escribe una pregunta (3 a 80 letras) y una respuesta (3 o más).",respuesta:"La respuesta no es correcta.",nombre:"El nombre solo puede cambiar las mayúsculas y minúsculas del usuario.",existe:"Ese usuario ya existe. Elige otro o entra con él.",credenciales:"Usuario o contraseña incorrectos.",usuario:"Usuario no válido.",clave:"Contraseña no válida."};
const btn=document.createElement("button");
btn.type="button";
btn.id="bcuenta";
btn.className="ap";
const nav=document.querySelector(".apartados");
if(nav)nav.insertBefore(btn,nav.firstElementChild);
let state="";
const navAv=s=>{let a="";try{a=localStorage.getItem("juegos-switch-avatar"+(NV?"-novia":""))||""}catch(e){}return a?`<img src="img/${esc(a)}" alt="">`:`<b>${esc((s.nombre||s.user).slice(0,1).toUpperCase())}</b>`};
const label=()=>{const s=ses();btn.innerHTML=s?`<span class="cu-nav-av" aria-hidden="true">${navAv(s)}<i class="cu-dot ${state}"></i></span><span class="cu-nav-tx"><strong class="cu-nav-n">${esc(s.nombre||s.user)}</strong>${rolHTML(rolDe(s))}</span>`:`<span class="cu-dot" aria-hidden="true"></span><span class="cu-nav-tx"><strong class="cu-nav-n">Iniciar sesión</strong>${rolHTML(ROLI.invitado)}</span>`;btn.setAttribute("aria-label",s?`Mi cuenta: ${s.user}`:"Estás como invitado. Iniciar sesión")};
let toast=null,retryT=0;
const showToast=on=>{clearTimeout(retryT);if(!on){if(toast){toast.remove();toast=null}return}
if(!toast){toast=document.createElement("div");toast.id="cu-toast";toast.setAttribute("role","alert");toast.innerHTML='<span>No se ha podido guardar en tu cuenta. Tus cambios siguen en este navegador y se reintentará solo.</span><button type="button" class="nb2" data-retry>Reintentar</button>';toast.addEventListener("click",e=>{if(e.target.closest("[data-retry]"))push()});document.body.appendChild(toast)}
retryT=setTimeout(()=>{if(state==="err")push()},30000)};
const STT={sync:"Guardando…",ok:"Todo guardado en tu cuenta",err:"No se ha podido guardar. Se reintentará con el siguiente cambio.","":""};
const mark=s=>{state=s;showToast(s==="err");label();const d=document.getElementById("cuentaDlg");const el=d&&d.open&&d.querySelector(".cu-st");if(el){el.className="cu-st "+state;el.textContent=STT[state]||""}};
let timer=0,busy=false,again=false;
const putBody=()=>JSON.stringify({perfil:PROF,data:collect()});
async function push(){
const s=ses();if(!s)return;
if(busy){again=true;return}
busy=true;mark("sync");
try{
const r=await call("datos",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token},body:putBody()});
if(r.status===401){setSes(null);busy=false;location.reload();return}
if(r.ok){const n=ses();if(n){n.dirty=0;n.synced=r.j.updated;setSes(n)}mark("ok")}else mark("err");
}catch(e){mark("err")}
busy=false;
if(again){again=false;push()}
}
document.addEventListener("js-guardado",()=>{const s=ses();if(!s)return;s.dirty=Date.now();setSes(s);mark("sync");clearTimeout(timer);timer=setTimeout(push,1200)});
addEventListener("pagehide",()=>{const s=ses();if(s&&s.dirty){clearTimeout(timer);fetch(API+"?a=datos",{method:"PUT",keepalive:true,headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token},body:putBody()}).catch(()=>{})}});
async function sync(){
const s=ses();label();if(!s)return;
if(s.dirty){push();return}
mark("sync");
try{
const r=await call("datos",{headers:{Authorization:"Bearer "+s.token}});
if(r.status===401){setSes(null);location.reload();return}
if(!r.ok){mark("err");return}
{const se=ses();if(se&&r.j.rol&&JSON.stringify([se.rol,se.puede,se.admin])!==JSON.stringify([r.j.rol,r.j.puede,r.j.admin])){se.rol=r.j.rol;se.puede=r.j.puede;se.admin=r.j.admin;setSes(se);lectura()}if(se&&(se.q||"")!==(r.j.pregunta||"")){se.q=r.j.pregunta||"";if(r.j.nombre)se.nombre=r.j.nombre;setSes(se)}if(se&&(se.correo||"")!==(r.j.correo||"")){se.correo=r.j.correo||"";if(!se.correo)se.correoFull="";setSes(se)}}
const d=slot(r.j.data);
if(!Object.keys(d).length&&Object.keys(collect()).length){push();return}
if(!same(collect(),d)){
let done="";try{done=sessionStorage.getItem("js-sync-"+PROF)||""}catch(e){}
if(done!==hk(d)){try{sessionStorage.setItem("js-sync-"+PROF,hk(d))}catch(e){}apply(d);s.synced=r.j.updated;setSes(s);location.reload();return}
}
mark("ok");
}catch(e){mark("err")}
}
async function login(mode,user,pass){
const body={user,pass};
if(mode==="registro"){body.perfil=PROF;body.data=collect()}
const r=await call(mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
if(!r.ok)return ERR[r.j.error]||"No se ha podido conectar. Inténtalo de nuevo.";
setGuest(false);
setSes({user:r.j.user,nombre:r.j.nombre||r.j.user,token:r.j.token,synced:r.j.updated,dirty:0,rol:r.j.rol,puede:r.j.puede,admin:r.j.admin});lectura();
if(mode==="entrar"){
const d=slot(r.j.data);
if(!Object.keys(d).length){if(Object.keys(collect()).length)await push()}
else if(!same(collect(),d)){apply(d);try{sessionStorage.setItem("js-sync-"+PROF,hk(d))}catch(e){}location.reload();return ""}
}
return "";
}
const formHTML=(mode,id)=>`<div class="cu-tabs" role="tablist"><button type="button" role="tab" aria-selected="${mode==="entrar"}" data-mode="entrar">Entrar</button><button type="button" role="tab" aria-selected="${mode==="registro"}" data-mode="registro">Crear cuenta</button></div>
<form class="cu-form" novalidate data-form="${id}"><label>Usuario<input name="user" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="24" required></label><label>Contraseña<input name="pass" type="password" autocomplete="${mode==="entrar"?"current-password":"new-password"}" minlength="6" maxlength="100" required></label>
<button type="submit" class="pri big2">${mode==="entrar"?"Entrar":"Crear cuenta"}</button>${mode==="entrar"?'<button type="button" class="cu-forgot" data-forgot>¿Has olvidado la contraseña?</button>':""}</form>`;
function check(f){
const user=f.user.value.trim(),pass=f.pass.value;
if(!/^[a-z0-9._-]{3,24}$/i.test(user))return [null,"El usuario tiene que tener de 3 a 24 letras o números, sin espacios ni tildes."];
if(pass.length<6)return [null,"La contraseña tiene que tener 6 caracteres o más."];
return [[user,pass],""];
}
let gate=null,gmode="entrar",gmsg="",gk="",gstep="login";
const chosen=()=>{try{return sessionStorage.getItem("js-elegida")==="1"}catch(e){return false}};
const setChosen=()=>{try{sessionStorage.setItem("js-elegida","1")}catch(e){}};
function renderGate(){
gate.classList.toggle("g-lista",gstep==="lista");
if(gstep==="lista"){gate.innerHTML=`<div class="gate-pick" role="dialog" aria-modal="true" aria-labelledby="gateT">
<h2 id="gateT">¿Qué lista quieres ver?</h2>
<div class="gate-opts"><button type="button" class="gopt gopt-r" data-lista="rafa"><span class="gopt-ico" aria-hidden="true"><img src="img/joycon-rafa.svg?v=20261126a" width="150" height="186" alt=""></span><b>Jueguitos Switch de Rafita</b></button>
<button type="button" class="gopt gopt-n" data-lista="novia"><span class="gopt-ico" aria-hidden="true"><img src="img/joycon-nicky.svg?v=20261126a" width="150" height="186" alt=""></span><b>Jueguitos Switch de Nicky</b></button></div>
</div>`;return}
gate.innerHTML=`<div class="gate-card" role="dialog" aria-modal="true" aria-labelledby="gateT">
<button type="button" class="gate-back" data-back>‹ Elegir otra lista</button>
<div class="gate-ico" aria-hidden="true">${NV?'<img src="img/joycon-nicky.svg?v=20261126a" width="150" height="186" alt="">':'<img src="img/joycon-rafa.svg?v=20261126a" width="150" height="186" alt="">'}</div>
<h2 id="gateT">${NAME}</h2>
<p class="gate-sub">Entra con tu cuenta para guardar tu lista en la nube, o sigue como invitado.</p>
${formHTML(gmode,"gate")}
<p class="amsg ${gk}" role="status">${esc(gmsg)}</p>
<div class="gate-or"><span>o</span></div>
<button type="button" class="gate-guest" data-guest>Entrar como invitado</button>
<p class="gate-note">Como invitado, lo que cambies se queda solo en este navegador.</p>
</div>`;
}
function openGate(step){
gstep=step||"login";
root.classList.add("gate");
gate=document.createElement("div");
gate.id="gate";
document.body.appendChild(gate);
renderGate();
setTimeout(()=>(gate.querySelector("input")||gate.querySelector("button"))?.focus(),50);
gate.addEventListener("click",e=>{
const m=e.target.closest("[data-mode]");if(m){gmode=m.dataset.mode;gmsg="";renderGate();gate.querySelector("input")?.focus();return}
if(e.target.closest("[data-guest]")){setGuest(true);closeGate();label();publico()}
if(e.target.closest("[data-back]")){gstep="lista";gmsg="";renderGate();return}
const l=e.target.closest("[data-lista]");
if(l){setChosen();const p=l.dataset.lista;
if(p!==PROF){try{localStorage.setItem("juegos-switch-perfil",p);sessionStorage.setItem("js-cambio",p)}catch(x){}gate.classList.add("bye");setTimeout(()=>location.reload(),250);return}
if(ses()){closeGate();sync();return}
if(guest()){closeGate();label();publico();return}
gstep="login";gmsg="";renderGate();gate.querySelector("input")?.focus();return}
});
gate.addEventListener("submit",async e=>{
e.preventDefault();
const [v,err]=check(e.target);
if(!v){gmsg=err;gk="bad";renderGate();return}
gmsg=gmode==="entrar"?"Entrando…":"Creando la cuenta…";gk="";renderGate();
try{const err2=await login(gmode,v[0],v[1]);if(err2){gmsg=err2;gk="bad";renderGate();return}if(ses()){closeGate();mark("ok")}}
catch(x){gmsg="No se ha podido conectar. Inténtalo de nuevo.";gk="bad";renderGate()}
});
}
function closeGate(){
if(!gate)return;
gate.classList.add("bye");
root.classList.remove("gate");
setTimeout(()=>{gate&&gate.remove();gate=null},450);
}
let dlg=null,mode="entrar",msg="",msgk="";
const AVG=[["Super Mario Odyssey",["avatares/icono-001.webp","avatares/mario-cappy.webp","avatares/icono-035.webp","avatares/luna.webp","avatares/icono-102.webp","avatares/icono-113.webp","avatares/icono-128.webp","avatares/icono-130.webp","avatares/icono-132.webp","avatares/smo-001.webp","avatares/smo-002.webp","avatares/smo-003.webp","avatares/smo-004.webp","avatares/smo-005.webp","avatares/smo-006.webp","avatares/smo-007.webp","avatares/smo-008.webp","avatares/smo-009.webp","avatares/smo-010.webp","avatares/smo-011.webp","avatares/smo-012.webp","avatares/smo-013.webp","avatares/smo-014.webp","avatares/smo-015.webp","avatares/smo-016.webp","avatares/smo-017.webp","avatares/smo-018.webp","avatares/smo-019.webp","avatares/smo-020.webp","avatares/smo-021.webp","avatares/smo-022.webp","avatares/smo-023.webp","avatares/smo-025.webp","avatares/smo-026.webp","avatares/smo-027.webp","avatares/smo-028.webp","avatares/smo-029.webp","avatares/smo-030.webp","avatares/smo-031.webp","avatares/smo-032.webp","avatares/smo-033.webp","avatares/smo-034.webp","avatares/smo-036.webp","avatares/smo-037.webp","avatares/smo-038.webp","avatares/smo-039.webp","avatares/smo-040.webp","avatares/smo-041.webp","avatares/smo-043.webp","avatares/smo-044.webp","avatares/smo-045.webp","avatares/smo-046.webp","avatares/smo-047.webp","avatares/smo-048.webp","avatares/smo-049.webp","avatares/smo-050.webp","avatares/smo-051.webp","avatares/smo-052.webp","avatares/smo-053.webp","avatares/smo-054.webp","avatares/smo-055.webp","avatares/smo-056.webp","avatares/smo-057.webp","avatares/smo-058.webp","avatares/smo-060.webp","avatares/smo-061.webp","avatares/smo-062.webp","avatares/smo-063.webp","avatares/smo-064.webp","avatares/smo-065.webp","avatares/smo-066.webp","avatares/smo-068.webp","avatares/smo-069.webp","avatares/smo-070.webp","avatares/smo-071.webp","avatares/smo-072.webp","avatares/smo-073.webp","avatares/smo-074.webp"]],["Super Mario 3D World + Bowser's Fury",["avatares/sm3dw-001.webp","avatares/sm3dw-002.webp","avatares/sm3dw-003.webp","avatares/sm3dw-004.webp","avatares/sm3dw-005.webp","avatares/sm3dw-006.webp","avatares/sm3dw-007.webp","avatares/sm3dw-008.webp","avatares/sm3dw-009.webp","avatares/sm3dw-010.webp","avatares/sm3dw-011.webp","avatares/sm3dw-012.webp","avatares/sm3dw-013.webp","avatares/sm3dw-014.webp","avatares/sm3dw-015.webp","avatares/sm3dw-016.webp","avatares/sm3dw-017.webp","avatares/sm3dw-018.webp","avatares/sm3dw-019.webp","avatares/sm3dw-020.webp","avatares/sm3dw-021.webp","avatares/sm3dw-022.webp","avatares/sm3dw-023.webp","avatares/sm3dw-024.webp","avatares/sm3dw-025.webp","avatares/sm3dw-026.webp","avatares/sm3dw-027.webp","avatares/sm3dw-028.webp","avatares/sm3dw-029.webp","avatares/sm3dw-030.webp","avatares/sm3dw-031.webp","avatares/sm3dw-032.webp","avatares/sm3dw-033.webp","avatares/sm3dw-034.webp","avatares/sm3dw-035.webp","avatares/sm3dw-036.webp","avatares/sm3dw-037.webp","avatares/sm3dw-038.webp","avatares/sm3dw-039.webp","avatares/sm3dw-040.webp","avatares/sm3dw-041.webp","avatares/sm3dw-042.webp","avatares/sm3dw-043.webp","avatares/sm3dw-044.webp","avatares/sm3dw-045.webp","avatares/sm3dw-046.webp","avatares/sm3dw-047.webp","avatares/sm3dw-048.webp","avatares/sm3dw-049.webp","avatares/sm3dw-050.webp","avatares/sm3dw-051.webp","avatares/sm3dw-052.webp","avatares/sm3dw-053.webp","avatares/sm3dw-054.webp","avatares/sm3dw-055.webp","avatares/sm3dw-056.webp","avatares/sm3dw-057.webp","avatares/sm3dw-058.webp","avatares/sm3dw-059.webp"]],["Super Mario",["avatares/icono-006.webp","avatares/peach.webp","avatares/caparazon-verde.webp","avatares/luigi.webp","avatares/icono-024.webp","avatares/icono-027.webp","avatares/champinon.webp","avatares/icono-033.webp","avatares/icono-038.webp","avatares/mario-gato.webp","avatares/icono-044.webp","avatares/icono-048.webp","avatares/icono-056.webp","avatares/icono-060.webp","avatares/bowser.webp","avatares/icono-065.webp","avatares/icono-067.webp","avatares/superestrella.webp","avatares/icono-081.webp","avatares/icono-082.webp","avatares/mario.webp","avatares/icono-089.webp","avatares/bloque-interrogante.webp","avatares/icono-100.webp","avatares/supercorona.webp","avatares/icono-109.webp","avatares/icono-110.webp","avatares/icono-124.webp","avatares/icono-131.webp","avatares/flor-de-fuego.webp"]],["Super Mario Party",["avatares/mario-saludando.webp","avatares/icono-028.webp","avatares/icono-049.webp","avatares/yoshi.webp","avatares/icono-095.webp","avatares/icono-136.webp","avatares/icono-146.webp"]],["Mario Kart 8 Deluxe",["avatares/mk8d-005.webp","avatares/mk8d-009.webp","avatares/mk8d-010.webp","avatares/mk8d-011.webp","avatares/mk8d-012.webp","avatares/mk8d-013.webp","avatares/mk8d-014.webp","avatares/mk8d-015.webp","avatares/mk8d-016.webp","avatares/mk8d-017.webp","avatares/mk8d-018.webp","avatares/mk8d-019.webp","avatares/mk8d-024.webp","avatares/mk8d-025.webp","avatares/mk8d-026.webp","avatares/mk8d-027.webp","avatares/mk8d-028.webp","avatares/mk8d-029.webp","avatares/mk8d-030.webp","avatares/mk8d-031.webp","avatares/mk8d-032.webp","avatares/mk8d-033.webp","avatares/mk8d-035.webp","avatares/mk8d-036.webp","avatares/mk8d-043.webp","avatares/mk8d-044.webp","avatares/mk8d-045.webp","avatares/mk8d-046.webp","avatares/mk8d-047.webp","avatares/mk8d-049.webp","avatares/mk8d-051.webp","avatares/mk8d-053.webp","avatares/mk8d-054.webp","avatares/mk8d-055.webp","avatares/mk8d-056.webp","avatares/mk8d-057.webp","avatares/mk8d-062.webp","avatares/mk8d-063.webp","avatares/mk8d-064.webp","avatares/mk8d-065.webp","avatares/mk8d-066.webp","avatares/mk8d-068.webp","avatares/mk8d-070.webp","avatares/mk8d-071.webp","avatares/mk8d-073.webp","avatares/mk8d-074.webp","avatares/mk8d-075.webp","avatares/mk8d-076.webp","avatares/mk8d-081.webp","avatares/mk8d-082.webp","avatares/mk8d-083.webp","avatares/mk8d-084.webp","avatares/mk8d-086.webp","avatares/mk8d-087.webp","avatares/mk8d-089.webp","avatares/mk8d-090.webp","avatares/mk8d-091.webp","avatares/mk8d-092.webp","avatares/mk8d-093.webp","avatares/mk8d-095.webp"]],["Mario Kart World",["avatares/mkworld-01.webp","avatares/mkworld-02.webp","avatares/mkworld-03.webp","avatares/mkworld-04.webp","avatares/mkworld-05.webp","avatares/mkworld-06.webp","avatares/mkworld-07.webp","avatares/mkworld-08.webp","avatares/mkworld-09.webp","avatares/mkworld-10.webp","avatares/mkworld-11.webp","avatares/mkworld-12.webp","avatares/mkworld-13.webp","avatares/mkworld-14.webp","avatares/mkworld-15.webp","avatares/mkworld-16.webp","avatares/mkworld-17.webp","avatares/mkworld-18.webp","avatares/mkworld-19.webp","avatares/mkworld-20.webp","avatares/mkworld-21.webp","avatares/mkworld-22.webp","avatares/mkworld-23.webp","avatares/mkworld-24.webp","avatares/mkworld-25.webp"]],["Super Mario Kart",["avatares/smk-1.webp","avatares/smk-2.webp","avatares/smk-3.webp","avatares/smk-4.webp","avatares/smk-5.webp","avatares/smk-6.webp","avatares/smk-7.webp"]],["Mario Strikers: Battle League",["avatares/strikers-001.webp","avatares/strikers-002.webp","avatares/strikers-003.webp","avatares/strikers-004.webp","avatares/strikers-005.webp","avatares/strikers-006.webp","avatares/strikers-007.webp","avatares/strikers-008.webp","avatares/strikers-009.webp","avatares/strikers-010.webp","avatares/strikers-011.webp","avatares/strikers-012.webp","avatares/strikers-013.webp","avatares/strikers-014.webp","avatares/strikers-015.webp","avatares/strikers-016.webp","avatares/strikers-017.webp","avatares/strikers-018.webp","avatares/strikers-019.webp","avatares/strikers-020.webp","avatares/strikers-021.webp","avatares/strikers-022.webp","avatares/strikers-023.webp","avatares/strikers-024.webp","avatares/strikers-025.webp","avatares/strikers-026.webp","avatares/strikers-027.webp","avatares/strikers-028.webp","avatares/strikers-029.webp","avatares/strikers-030.webp","avatares/strikers-031.webp","avatares/strikers-032.webp","avatares/strikers-033.webp","avatares/strikers-034.webp"]],["Mario vs. Donkey Kong",["avatares/mvdk-001.webp","avatares/mvdk-002.webp","avatares/mvdk-003.webp","avatares/mvdk-004.webp","avatares/mvdk-005.webp","avatares/mvdk-006.webp","avatares/mvdk-007.webp","avatares/mvdk-008.webp","avatares/mvdk-009.webp","avatares/mvdk-010.webp","avatares/mvdk-011.webp","avatares/mvdk-012.webp","avatares/mvdk-013.webp","avatares/mvdk-014.webp","avatares/mvdk-015.webp","avatares/mvdk-016.webp","avatares/mvdk-017.webp","avatares/mvdk-018.webp","avatares/mvdk-019.webp","avatares/mvdk-020.webp","avatares/mvdk-021.webp","avatares/mvdk-022.webp","avatares/mvdk-023.webp","avatares/mvdk-024.webp","avatares/mvdk-025.webp","avatares/mvdk-026.webp"]],["Super Mario RPG",["avatares/smrpg-001.webp","avatares/smrpg-002.webp","avatares/smrpg-003.webp","avatares/smrpg-004.webp","avatares/smrpg-005.webp","avatares/smrpg-006.webp","avatares/smrpg-007.webp","avatares/smrpg-008.webp","avatares/smrpg-009.webp","avatares/smrpg-010.webp","avatares/smrpg-011.webp","avatares/smrpg-012.webp","avatares/smrpg-013.webp","avatares/smrpg-014.webp","avatares/smrpg-015.webp","avatares/smrpg-016.webp","avatares/smrpg-017.webp","avatares/smrpg-018.webp","avatares/smrpg-019.webp","avatares/smrpg-020.webp","avatares/smrpg-021.webp","avatares/smrpg-022.webp","avatares/smrpg-023.webp","avatares/smrpg-024.webp","avatares/smrpg-025.webp","avatares/smrpg-026.webp","avatares/smrpg-027.webp","avatares/smrpg-028.webp","avatares/smrpg-029.webp","avatares/smrpg-030.webp","avatares/smrpg-031.webp","avatares/smrpg-032.webp","avatares/smrpg-033.webp","avatares/smrpg-034.webp","avatares/smrpg-035.webp","avatares/smrpg-036.webp","avatares/smrpg-037.webp","avatares/smrpg-038.webp","avatares/smrpg-039.webp","avatares/smrpg-040.webp","avatares/smrpg-041.webp","avatares/smrpg-042.webp","avatares/smrpg-043.webp","avatares/smrpg-044.webp","avatares/smrpg-045.webp","avatares/smrpg-046.webp","avatares/smrpg-047.webp"]],["Donkey Kong",["avatares/donkey-kong.webp","avatares/icono-123.webp"]],["Donkey Kong Country",["avatares/dkc-001.webp","avatares/dkc-002.webp","avatares/dkc-003.webp","avatares/dkc-004.webp","avatares/dkc-005.webp","avatares/dkc-006.webp","avatares/dkc-007.webp"]],["Donkey Kong Country 2",["avatares/dkc2-001.webp","avatares/dkc2-002.webp","avatares/dkc2-003.webp","avatares/dkc2-004.webp","avatares/dkc2-005.webp","avatares/dkc2-006.webp","avatares/dkc2-007.webp"]],["Donkey Kong Country Returns HD",["avatares/dkcr-001.webp","avatares/dkcr-002.webp","avatares/dkcr-003.webp","avatares/dkcr-004.webp","avatares/dkcr-005.webp","avatares/dkcr-006.webp","avatares/dkcr-007.webp","avatares/dkcr-008.webp","avatares/dkcr-009.webp","avatares/dkcr-010.webp","avatares/dkcr-011.webp","avatares/dkcr-012.webp","avatares/dkcr-013.webp","avatares/dkcr-014.webp","avatares/dkcr-015.webp","avatares/dkcr-016.webp","avatares/dkcr-017.webp","avatares/dkcr-018.webp","avatares/dkcr-019.webp","avatares/dkcr-020.webp","avatares/dkcr-021.webp","avatares/dkcr-022.webp","avatares/dkcr-023.webp","avatares/dkcr-024.webp","avatares/dkcr-025.webp","avatares/dkcr-026.webp","avatares/dkcr-027.webp","avatares/dkcr-028.webp","avatares/dkcr-029.webp","avatares/dkcr-030.webp","avatares/dkcr-031.webp","avatares/dkcr-032.webp","avatares/dkcr-033.webp","avatares/dkcr-034.webp","avatares/dkcr-035.webp","avatares/dkcr-036.webp","avatares/dkcr-037.webp","avatares/dkcr-038.webp","avatares/dkcr-039.webp","avatares/dkcr-040.webp"]],["DK Challenge",["avatares/dkch-001.webp","avatares/dkch-002.webp","avatares/dkch-003.webp"]],["Animal Crossing",["avatares/icono-002.webp","avatares/tom-nook.webp","avatares/icono-025.webp","avatares/totakeke.webp","avatares/icono-029.webp","avatares/icono-032.webp","avatares/icono-045.webp","avatares/icono-051.webp","avatares/icono-059.webp","avatares/icono-063.webp","avatares/icono-068.webp","avatares/icono-070.webp","avatares/icono-071.webp","avatares/canela.webp","avatares/icono-098.webp","avatares/icono-104.webp","avatares/icono-105.webp","avatares/icono-111.webp","avatares/icono-119.webp","avatares/ac-001.webp","avatares/ac-002.webp","avatares/ac-003.webp","avatares/ac-004.webp","avatares/ac-005.webp","avatares/ac-006.webp","avatares/ac-007.webp","avatares/ac-008.webp","avatares/ac-009.webp","avatares/ac-010.webp","avatares/ac-011.webp","avatares/ac-012.webp","avatares/ac-013.webp","avatares/ac-014.webp","avatares/ac-015.webp","avatares/ac-016.webp","avatares/ac-017.webp","avatares/ac-018.webp"]],["Splatoon",["avatares/icono-003.webp","avatares/icono-004.webp","avatares/icono-005.webp","avatares/icono-036.webp","avatares/calamar-splatoon.webp","avatares/icono-047.webp","avatares/icono-055.webp","avatares/icono-057.webp","avatares/icono-062.webp","avatares/icono-072.webp","avatares/icono-074.webp","avatares/icono-080.webp","avatares/icono-085.webp","avatares/icono-087.webp","avatares/icono-091.webp","avatares/icono-099.webp","avatares/icono-103.webp","avatares/icono-108.webp","avatares/icono-120.webp","avatares/icono-121.webp","avatares/icono-141.webp","avatares/icono-142.webp","avatares/icono-143.webp","avatares/icono-147.webp"]],["ARMS",["avatares/icono-013.webp","avatares/icono-016.webp","avatares/icono-017.webp","avatares/icono-019.webp","avatares/icono-052.webp","avatares/icono-069.webp","avatares/icono-078.webp","avatares/icono-088.webp","avatares/icono-112.webp","avatares/icono-116.webp","avatares/icono-129.webp","avatares/icono-139.webp","avatares/icono-140.webp","avatares/icono-145.webp"]],["The Legend of Zelda",["avatares/zelda.webp","avatares/icono-010.webp","avatares/icono-015.webp","avatares/icono-018.webp","avatares/link-toon.webp","avatares/icono-040.webp","avatares/trifuerza.webp","avatares/link.webp","avatares/icono-077.webp","avatares/icono-079.webp","avatares/icono-083.webp","avatares/icono-093.webp","avatares/icono-094.webp","avatares/icono-117.webp","avatares/icono-118.webp","avatares/icono-126.webp","avatares/icono-133.webp","avatares/icono-144.webp"]],["Kirby",["avatares/kirby-corazon.webp","avatares/kirby.webp","avatares/icono-054.webp","avatares/waddle-dee.webp","avatares/icono-107.webp","avatares/icono-122.webp","avatares/icono-127.webp"]],["Pikmin",["avatares/pikmin.webp","avatares/icono-073.webp","avatares/icono-106.webp"]],["Metroid",["avatares/icono-021.webp","avatares/samus.webp","avatares/icono-134.webp"]],["Star Fox",["avatares/icono-011.webp","avatares/icono-092.webp","avatares/fox.webp"]],["Nintendo Labo",["avatares/icono-039.webp","avatares/icono-042.webp","avatares/icono-097.webp"]],["Otros",["avatares/icono-034.webp","avatares/icono-114.webp","avatares/icono-115.webp","avatares/icono-135.webp","avatares/icono-137.webp","avatares/icono-148.webp"]]];
const AK="juegos-switch-avatar"+(NV?"-novia":"");
const NK="juegos-switch-nintendo"+(NV?"-novia":"");
const REG=["España","Resto de Europa","México","Estados Unidos","Japón","Otra"];
const lget=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}};
const nin=()=>{try{return JSON.parse(lget(NK))||{}}catch(e){return{}}};
const setNin=o=>{try{localStorage.setItem(NK,JSON.stringify(o))}catch(e){}document.dispatchEvent(new Event("js-guardado"))};
const openS=new Set();
function resumen(){
try{const j=window.JS,g=j.games.map(x=>({g:x,i:j.info(x),own:j.isOwn(x.slug)})),h=g.filter(x=>x.own),mio=j.mio();
return {n:h.length,t:g.length,gb:h.filter(x=>x.i.playable).reduce((t,x)=>t+(x.i.mbEff||0),0)/1024,eur:h.reduce((t,x)=>t+(x.i.cost||0),0),hrs:h.reduce((t,x)=>t+((mio[x.g.slug]||{}).horas||0),0),done:h.filter(x=>j.stOf(x.g.slug)==="done").length}}catch(e){return null}
}
const sec=(id,t,ico,body)=>'<details class="cu-sec" data-s="'+id+'"'+(openS.has(id)?" open":"")+'><summary><span class="cu-si" aria-hidden="true">'+ico+'</span><b>'+t+'</b></summary><div class="cu-sb">'+body+'</div></details>';
function avatarHTML(s){const a=lget(AK);return a?'<span class="cu-av has" aria-hidden="true"><img src="img/'+esc(a)+'" alt=""></span>':'<span class="cu-av" aria-hidden="true">'+esc((s.nombre||s.user).slice(0,1).toUpperCase())+'</span>'}
function render(){
const s=ses();
const st={sync:"Guardando…",ok:"Todo guardado en tu cuenta",err:"No se ha podido guardar. Se reintentará con el siguiente cambio.","":""}[state]||"";
let body;
if(s){
const n=nin(),r=resumen(),fc=getFc(),av=lget(AK);
const tile=(l,b)=>'<div class="cu-tile"><small>'+l+'</small><b>'+b+'</b></div>';
body='<div class="cu-me">'+avatarHTML(s)+'<div><b>'+esc(s.nombre||s.user)+'</b>'+rolHTML(rolDe(s))+'<small class="cu-st '+state+'">'+st+'</small></div></div>'
+'<p class="adesc">Sesión de <b>'+NAME+'</b>. '+(!puedeEditar()?(NV?'Esta lista es de Nicky: puedes verla, pero solo ella y el administrador pueden cambiarla.':'Esta lista es de Rafita: puedes verla, pero solo él puede cambiarla.'):(NV&&rolDe(s).id==="admin"?'Lo que cambies aquí se guarda en la lista de Nicky y lo ve ella.':'Lo que cambies aquí lo ven todos los que entran en esta lista.'))+' La otra lista tiene su propia sesión.</p>'
+sec("perfil","Perfil","<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>",
'<div class="cu-lbl">Avatar</div><div class="cu-avg-w">'+AVG.map(([n,l])=>'<details class="cu-avg" data-g="'+esc(n)+'"'+(openS.has("g:"+n)?" open":"")+'><summary><b>'+esc(n)+'</b><small>'+l.length+'</small></summary><div class="cu-avs">'+l.map(f=>'<button type="button" class="cu-avb'+(av===f?" on":"")+'" data-av="'+f+'" aria-label="Elegir avatar de '+esc(n)+'" aria-pressed="'+(av===f)+'"><img src="img/'+f+'" alt="" loading="lazy"></button>').join("")+'</div></details>').join("")+'</div>'
+(av?'<button type="button" class="nb2 cu-mini" data-av="">Quitar avatar</button>':"")
+'<form class="cu-form" data-ed novalidate><label>Nombre de usuario<input name="nombre" maxlength="24" autocapitalize="none" spellcheck="false" value="'+esc(s.nombre||s.user)+'"></label><small class="cu-h">Solo puedes cambiar mayúsculas y minúsculas: sigues entrando con el mismo usuario.</small><button type="submit" class="nb2">Guardar nombre</button></form>'
+'<div class="cu-form"><label>Nombre en Nintendo<input data-nin="nombre" maxlength="30" autocomplete="off" value="'+esc(n.nombre||"")+'" placeholder="Tu nombre de usuario de Nintendo"></label><label>Región de la eShop<select data-nin="region"><option value="">Sin indicar</option>'+REG.map(x=>'<option'+(n.region===x?" selected":"")+'>'+x+'</option>').join("")+'</select></label></div>')
+sec("amigo","Código de amigo","<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8 10v4M6 12h4\"/><circle cx=\"16\" cy=\"11\" r=\".9\" fill=\"#fff\"/><circle cx=\"18\" cy=\"13.5\" r=\".9\" fill=\"#fff\"/><path d=\"M7 6h10a4 4 0 0 1 4 4v3a5 5 0 0 1-5 5 3 3 0 0 1-2.4-1.2L13 15h-2l-.6 1.8A3 3 0 0 1 8 18a5 5 0 0 1-5-5v-3a4 4 0 0 1 4-4z\"/></svg>",
'<div class="cu-fcrow"><input id="fcIn" type="text" inputmode="numeric" autocomplete="off" maxlength="17" placeholder="SW-0000-0000-0000" value="'+esc(fc)+'" aria-label="Código de amigo de Switch"><button type="button" class="pri" data-fccopy '+(fc.length===17?"":"disabled")+'>Copiar</button></div><small class="cu-h">Se guarda en tu cuenta. Copiar deja el mensaje listo para pegar.</small>')
+sec("resumen","Resumen","<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/></svg>",r?'<div class="cu-tiles">'+tile("Juegos que tienes",r.n+" de "+r.t)+tile("Espacio en consola",r.gb.toLocaleString("es-ES",{maximumFractionDigits:1})+" GB")+tile("Gastado",r.eur.toLocaleString("es-ES",{style:"currency",currency:"EUR"}))+tile("Horas jugadas",r.hrs.toLocaleString("es-ES",{maximumFractionDigits:1})+" h")+tile("Terminados",String(r.done))+'</div>':'<p class="adesc">El resumen aparece cuando se carga la lista.</p>')
+sec("seg","Seguridad","<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"4\" y=\"10\" width=\"16\" height=\"11\" rx=\"2.5\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/><circle cx=\"12\" cy=\"15.5\" r=\"1.3\" fill=\"#fff\"/></svg>",
'<form class="cu-form" data-pw novalidate autocomplete="off"><div class="cu-lbl">Cambiar contraseña</div><label>Contraseña actual<input name="actual" type="password" autocomplete="new-password"></label><label>Contraseña nueva<input name="nueva" type="password" autocomplete="new-password" placeholder="6 caracteres o más"></label><button type="submit" class="nb2">Cambiar contraseña</button></form>'
+'<form class="cu-form" data-mail novalidate autocomplete="off"><div class="cu-lbl">Correo de recuperación</div><small class="cu-h">'+(s.correo?"Ahora tienes puesto: "+esc(s.correo)+". Para quitarlo, deja el campo vacío.":"Si olvidas la contraseña, te enviamos un código a este correo para poner otra. Mejor un Gmail.")+'</small><label>Correo<input name="correo" data-exp="'+esc(s.correoFull||"")+'" type="text" inputmode="email" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="80" placeholder="tucorreo@gmail.com" value="'+esc(s.correoFull||"")+'"></label><label>Contraseña actual<input name="actual" type="password" autocomplete="new-password"></label><button type="submit" class="nb2">Guardar correo</button></form>'
+'<form class="cu-form" data-q novalidate autocomplete="off"><div class="cu-lbl">Pregunta de recuperación</div><small class="cu-h">'+(s.q?"Ahora tienes puesta: «"+esc(s.q)+"». Puedes cambiarla.":"Sin ella, si olvidas la contraseña no se puede recuperar la cuenta.")+'</small><label>Pregunta<input name="pregunta" data-exp="'+esc(s.q||"")+'" maxlength="80" autocomplete="off" placeholder="Ej.: ¿Cómo se llamaba mi primera consola?" value="'+esc(s.q||"")+'"></label><label>Respuesta<input name="respuesta" data-exp="" maxlength="60" autocomplete="off"></label><label>Contraseña actual<input name="actual" type="password" autocomplete="new-password"></label><button type="submit" class="nb2">Guardar pregunta</button></form>'
+'<div class="cu-lbl">Otros dispositivos</div><button type="button" class="nb2" data-others>Cerrar sesión en los demás dispositivos</button>')
+'<div class="cu-acts"><button type="button" class="pri" data-sync>Guardar ahora</button><button type="button" class="nb2" data-out>Cerrar sesión</button></div>';
}else body='<div class="cu-me"><span class="cu-av" aria-hidden="true">?</span><div><b>Invitado</b>'+rolHTML(ROLI.invitado)+'</div></div><p class="adesc">Estás como invitado en <b>'+NAME+'</b>. Entra para guardar esta lista en tu cuenta.</p>'+formHTML(mode,"dlg");
dlg.innerHTML='<div class="awin cu-win"><div class="fhead"><h3>'+(s?"Mi cuenta":"Iniciar sesión")+'</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>'+body+'<p class="amsg '+msgk+'" role="status">'+esc(msg)+'</p></div>';
cleanAuto();
}
let autoT=0;
function cleanAuto(){clearInterval(autoT);const fix=()=>{if(!dlg||!dlg.open){clearInterval(autoT);return}dlg.querySelectorAll("input[data-exp]").forEach(i=>{if(i.dataset.touched!=="1"&&i.value!==i.dataset.exp)i.value=i.dataset.exp})};
dlg.querySelectorAll("input[data-exp]").forEach(i=>{const t=()=>{i.dataset.touched="1"};i.addEventListener("keydown",t,{once:true});i.addEventListener("paste",t,{once:true});i.addEventListener("compositionstart",t,{once:true});i.addEventListener("focus",fix);i.addEventListener("change",fix)});
autoT=setInterval(fix,250)}
let rec=null,rstep=0,rq="",ru="",rmsg=null,rmail=false;
function renderRec(){
rec.innerHTML='<div class="awin cu-win"><div class="fhead"><h3>Recuperar contraseña</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>'
+(rstep===0?'<form class="cu-form" data-r0 novalidate><label>Usuario<input name="user" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="24" value="'+esc(ru)+'"></label><button type="submit" class="pri">Buscar mi pregunta</button></form>'
:rstep===2?'<form class="cu-form" data-r2 novalidate><p class="adesc">Te hemos enviado un código de 6 cifras al correo de la cuenta. Caduca en 15 minutos. Mira también el correo no deseado.</p><label>Código<input name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000"></label><label>Contraseña nueva<input name="nueva" type="password" autocomplete="new-password" placeholder="6 caracteres o más"></label><button type="submit" class="pri">Cambiar contraseña y entrar</button></form>'
:(rq?'<form class="cu-form" data-r1 novalidate><p class="adesc">Tu pregunta: <b>'+esc(rq)+'</b></p><label>Respuesta<input name="respuesta" maxlength="60" autocomplete="off"></label><label>Contraseña nueva<input name="nueva" type="password" autocomplete="new-password" placeholder="6 caracteres o más"></label><button type="submit" class="pri">Cambiar contraseña y entrar</button></form>':"")+(rmail?'<div class="cu-form"><p class="adesc">'+(rq?"O recibe":"Recibe")+' un código en el correo de la cuenta.</p><button type="button" class="nb2" data-sendcode>Enviarme un código por correo</button></div>':""))
+'<p class="amsg '+((rmsg&&rmsg.k)||"")+'" role="status">'+esc((rmsg&&rmsg.t)||"")+'</p></div>';
rec.querySelector("input")?.focus();
}
function openRec(){
if(!rec){rec=document.createElement("dialog");rec.id="recDlg";rec.setAttribute("aria-label","Recuperar contraseña");document.body.appendChild(rec);if(window.JS&&window.JS.watchDialogs)window.JS.watchDialogs();
rec.addEventListener("click",async e=>{if(e.target===rec||e.target.closest("[data-close]")){rec.close();return}
if(e.target.closest("[data-sendcode]")){try{const r=await call("codigo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:ru})});if(r.ok){rstep=2;rmsg={k:"ok",t:"Código enviado."}}else rmsg={k:"bad",t:ERR[r.j.error]||"No se ha podido enviar."}}catch(x){rmsg={k:"bad",t:"No se ha podido conectar. Inténtalo de nuevo."}}renderRec()}});
rec.addEventListener("submit",async e=>{
e.preventDefault();const f=e.target;
try{
if(f.matches("[data-r0]")){ru=f.user.value.trim();if(!/^[a-z0-9._-]{3,24}$/i.test(ru)){rmsg={k:"bad",t:ERR.usuario};renderRec();return}
const r=await call("pregunta",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:ru})});
if(!r.j.pregunta&&!r.j.correo){rmsg={k:"bad",t:"Esa cuenta no existe o no tiene pregunta ni correo de recuperación. Sin ellos no se puede recuperar."};renderRec();return}
rq=r.j.pregunta||"";rmail=!!r.j.correo;rstep=1;rmsg=null;renderRec();return}
if(f.matches("[data-r2]")){if(!/^\d{6}$/.test(f.codigo.value.trim())){rmsg={k:"bad",t:ERR.codigo};renderRec();return}
if(f.nueva.value.length<6){rmsg={k:"bad",t:ERR.clave};renderRec();return}
const r2=await call("recuperar_codigo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:ru,codigo:f.codigo.value.trim(),nueva:f.nueva.value})});
if(!r2.ok){rmsg={k:"bad",t:ERR[r2.j.error]||"No se ha podido conectar. Inténtalo de nuevo."};renderRec();return}
const er2=await login("entrar",ru,f.nueva.value);
if(er2){rmsg={k:"bad",t:er2};renderRec();return}
rec.close();if(ses()){try{closeGate()}catch(x){}label()}return}
if(f.nueva.value.length<6){rmsg={k:"bad",t:ERR.clave};renderRec();return}
const r=await call("recuperar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:ru,respuesta:f.respuesta.value,nueva:f.nueva.value})});
if(!r.ok){rmsg={k:"bad",t:ERR[r.j.error]||"No se ha podido conectar. Inténtalo de nuevo."};renderRec();return}
const er=await login("entrar",ru,f.nueva.value);
if(er){rmsg={k:"bad",t:er};renderRec();return}
rec.close();if(ses()){try{closeGate()}catch(x){}label()}
}catch(x){rmsg={k:"bad",t:"No se ha podido conectar. Inténtalo de nuevo."};renderRec()}
});
}
rstep=0;rq="";rmsg=null;renderRec();if(!rec.open)rec.showModal();rec.querySelector("input")?.focus();
}
document.addEventListener("click",e=>{if(e.target.closest("[data-forgot]")){e.preventDefault();openRec()}});
async function perfilCall0(){const se=ses();const r=await call("cerrar",{method:"POST",headers:{Authorization:"Bearer "+se.token}});if(r.ok&&r.j.token){se.token=r.j.token;setSes(se);return true}return false}
async function perfilCall(body){const se=ses();return call("perfil",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+se.token},body:JSON.stringify(body)})}
function open(){
openS.clear();
if(!dlg){dlg=document.createElement("dialog");dlg.id="cuentaDlg";dlg.setAttribute("aria-label","Mi cuenta");document.body.appendChild(dlg);if(window.JS&&window.JS.watchDialogs)window.JS.watchDialogs();
dlg.addEventListener("click",async e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const m=e.target.closest("[data-mode]");if(m){mode=m.dataset.mode;msg="";render();dlg.querySelector("input")?.focus();return}
if(e.target.closest("[data-out]")){await push();setSes(null);setGuest(false);location.reload();return}
if(e.target.closest("[data-sync]")){await push();msg=state==="ok"?"Guardado.":"No se ha podido guardar.";msgk=state==="ok"?"ok":"bad";render()}
});
dlg.addEventListener("toggle",e=>{const d=e.target;if(d.matches&&d.matches("details.cu-sec")){d.open?openS.add(d.dataset.s):openS.delete(d.dataset.s)}else if(d.matches&&d.matches("details.cu-avg")){d.open?openS.add("g:"+d.dataset.g):openS.delete("g:"+d.dataset.g)}},true);
dlg.addEventListener("click",async e=>{
const av=e.target.closest("[data-av]");if(av){try{av.dataset.av?localStorage.setItem(AK,av.dataset.av):localStorage.removeItem(AK)}catch(x){}document.dispatchEvent(new Event("js-guardado"));label();render();return}
if(e.target.closest("[data-fccopy]")){const c=getFc();try{await navigator.clipboard.writeText("Mi código de amigo de Nintendo Switch: "+c)}catch(x){const t=dlg.querySelector("#fcIn");t.select();document.execCommand("copy")}msg="Código copiado: "+c;msgk="ok";render();return}
if(e.target.closest("[data-others]")){try{const r=await perfilCall0();msg=r?"Se ha cerrado la sesión en los demás dispositivos.":"No se ha podido hacer.";msgk=r?"ok":"bad"}catch(x){msg="No se ha podido conectar.";msgk="bad"}render()}
});
dlg.addEventListener("input",e=>{const t=e.target;
if(t.id==="fcIn"){const v=fmtFc(t.value);t.value=v;try{v?localStorage.setItem(FK,v):localStorage.removeItem(FK)}catch(x){}document.dispatchEvent(new Event("js-guardado"));const b=dlg.querySelector("[data-fccopy]");if(b)b.disabled=v.length!==17}
if(t.dataset&&t.dataset.nin){const o=nin();o[t.dataset.nin]=t.value.trim();setNin(o)}});
dlg.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.nin){const o=nin();o[t.dataset.nin]=t.value.trim();setNin(o)}});
dlg.addEventListener("submit",async e=>{
e.preventDefault();
const fm=e.target;
if(fm.matches("[data-ed],[data-pw],[data-q],[data-mail]")){
const se=ses();let body;
if(fm.matches("[data-ed]"))body={nombre:fm.nombre.value.trim()};
else if(fm.matches("[data-pw]")){if(fm.nueva.value.length<6){msg=ERR.clave;msgk="bad";render();return}body={actual:fm.actual.value,nueva:fm.nueva.value}}
else if(fm.matches("[data-mail]")){body={correo:fm.correo.value.trim(),actual:fm.actual.value}}
else{body={pregunta:fm.pregunta.value,respuesta:fm.respuesta.value,actual:fm.actual.value}}
try{const r=await perfilCall(body);if(r.ok){if(r.j.nombre){se.nombre=r.j.nombre}if(r.j.pregunta!==undefined)se.q=r.j.pregunta;if(r.j.correo!==undefined){se.correo=r.j.correo;se.correoFull=r.j.correo?body.correo:""}setSes(se);label();msg=fm.matches("[data-pw]")?"Contraseña cambiada.":fm.matches("[data-mail]")?(r.j.correo?"Correo guardado.":"Correo quitado."):fm.matches("[data-q]")?"Pregunta de recuperación guardada.":"Nombre guardado.";msgk="ok"}else{msg=ERR[r.j.error]||"No se han podido guardar los cambios.";msgk="bad"}}catch(x){msg="No se ha podido conectar. Inténtalo de nuevo.";msgk="bad"}
render();return}
const [v,err]=check(e.target);
if(!v){msg=err;msgk="bad";render();return}
msg=mode==="entrar"?"Entrando…":"Creando la cuenta…";msgk="";render();
try{const err2=await login(mode,v[0],v[1]);if(err2){msg=err2;msgk="bad";render();return}if(ses()){state="ok";msg=mode==="entrar"?"Sesión iniciada.":"Cuenta creada. Todo lo que cambies se guardará en ella.";msgk="ok";label();render()}}
catch(x){msg="No se ha podido conectar. Inténtalo de nuevo.";msgk="bad";render()}
});
}
msg="";msgk="";render();
if(!dlg.open)dlg.showModal();
dlg.querySelector("input")?.focus();
}
btn.addEventListener("click",open);
label();
lectura();
if(!chosen())openGate("lista");
else if(ses())sync();
else if(!guest())openGate("login");
else{root.classList.remove("gate");publico()}
})();
