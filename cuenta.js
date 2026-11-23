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
async function call(a,opt){
const r=await fetch(API+"?a="+a,opt);
let j={};try{j=await r.json()}catch(e){}
return {ok:r.ok,status:r.status,j};
}
const ERR={nombre:"El nombre solo puede cambiar las mayúsculas y minúsculas del usuario.",existe:"Ese usuario ya existe. Elige otro o entra con él.",credenciales:"Usuario o contraseña incorrectos.",usuario:"Usuario no válido.",clave:"Contraseña no válida."};
const btn=document.createElement("button");
btn.type="button";
btn.id="bcuenta";
btn.className="ap";
const nav=document.querySelector(".apartados");
if(nav)nav.insertBefore(btn,document.getElementById("bset"));
let state="";
const label=()=>{const s=ses();btn.innerHTML=s?`<span class="cu-dot ${state}" aria-hidden="true"></span>${esc(s.nombre||s.user)}`:`<span class="cu-dot" aria-hidden="true"></span>Invitado`;btn.setAttribute("aria-label",s?`Mi cuenta: ${s.user}`:"Estás como invitado. Iniciar sesión")};
const mark=s=>{state=s;label();const d=document.getElementById("cuentaDlg");if(d&&d.open)render()};
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
const d=slot(r.j.data);
if(!Object.keys(d).length&&Object.keys(collect()).length){push();return}
if(!same(collect(),d)){
let done="";try{done=sessionStorage.getItem("js-sync-"+PROF)||""}catch(e){}
if(done!==String(r.j.updated)){try{sessionStorage.setItem("js-sync-"+PROF,String(r.j.updated))}catch(e){}apply(d);s.synced=r.j.updated;setSes(s);location.reload();return}
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
setSes({user:r.j.user,nombre:r.j.nombre||r.j.user,token:r.j.token,synced:r.j.updated,dirty:0});
if(mode==="entrar"){
const d=slot(r.j.data);
if(!Object.keys(d).length){if(Object.keys(collect()).length)await push()}
else if(!same(collect(),d)){apply(d);try{sessionStorage.setItem("js-sync-"+PROF,String(r.j.updated))}catch(e){}location.reload();return ""}
}
return "";
}
const formHTML=(mode,id)=>`<div class="cu-tabs" role="tablist"><button type="button" role="tab" aria-selected="${mode==="entrar"}" data-mode="entrar">Entrar</button><button type="button" role="tab" aria-selected="${mode==="registro"}" data-mode="registro">Crear cuenta</button></div>
<form class="cu-form" novalidate data-form="${id}"><label>Usuario<input name="user" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="24" required></label><label>Contraseña<input name="pass" type="password" autocomplete="${mode==="entrar"?"current-password":"new-password"}" minlength="6" maxlength="100" required></label>
<button type="submit" class="pri big2">${mode==="entrar"?"Entrar":"Crear cuenta"}</button></form>`;
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
<div class="gate-opts"><button type="button" class="gopt gopt-r" data-lista="rafa"><span class="gopt-ico" aria-hidden="true"><img src="img/switch-logo.png" width="150" height="150" alt=""></span><b>Jueguitos Switch de Rafita</b></button>
<button type="button" class="gopt gopt-n" data-lista="novia"><span class="gopt-ico" aria-hidden="true"><img src="img/kitty.png?v=20261123f" width="256" height="256" alt=""></span><b>Jueguitos Switch de Nicky</b></button></div>
</div>`;return}
gate.innerHTML=`<div class="gate-card" role="dialog" aria-modal="true" aria-labelledby="gateT">
<button type="button" class="gate-back" data-back>‹ Elegir otra lista</button>
<div class="gate-ico" aria-hidden="true">${NV?'<img src="img/kitty.png?v=20261123d" width="256" height="256" alt="">':'<img src="img/switch-logo.png" width="150" height="150" alt="">'}</div>
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
if(e.target.closest("[data-guest]")){setGuest(true);closeGate();label()}
if(e.target.closest("[data-back]")){gstep="lista";gmsg="";renderGate();return}
const l=e.target.closest("[data-lista]");
if(l){setChosen();const p=l.dataset.lista;
if(p!==PROF){try{localStorage.setItem("juegos-switch-perfil",p);sessionStorage.setItem("js-cambio",p)}catch(x){}gate.classList.add("bye");setTimeout(()=>location.reload(),250);return}
if(ses()){closeGate();sync();return}
if(guest()){closeGate();label();return}
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
function render(){
const s=ses();
const st={sync:"Guardando…",ok:"Todo guardado en tu cuenta",err:"No se ha podido guardar. Se reintentará con el siguiente cambio.","":""}[state]||"";
dlg.innerHTML=`<div class="awin cu-win"><div class="fhead"><h3>${s?"Mi cuenta":"Iniciar sesión"}</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
${s?`<div class="cu-me"><span class="cu-av" aria-hidden="true">${esc((s.nombre||s.user).slice(0,1).toUpperCase())}</span><div><b>${esc(s.nombre||s.user)}</b><small class="cu-st ${state}">${st}</small></div></div>
<p class="adesc">Sesión de <b>${NAME}</b>. Todo lo que cambias aquí (lo que tienes, precios, estados, notas, orden y almacenamiento) se guarda solo en esta cuenta. La otra lista tiene su propia sesión.</p>
<form class="cu-ed" data-ed novalidate><label>Nombre de usuario<input name="nombre" maxlength="24" autocapitalize="none" spellcheck="false" value="${esc(s.nombre||s.user)}"></label><label>Contraseña actual<input name="actual" type="password" autocomplete="current-password"></label><label>Contraseña nueva<input name="nueva" type="password" autocomplete="new-password" placeholder="Déjala vacía para no cambiarla"></label><button type="submit" class="nb2">Guardar cambios</button></form>
<div class="cu-fc"><label for="fcIn"><b>Código de amigo de Switch</b></label><div class="cu-fcrow"><input id="fcIn" type="text" inputmode="numeric" autocomplete="off" maxlength="17" placeholder="SW-0000-0000-0000" value="${esc(getFc())}"><button type="button" class="nb2" data-fccopy ${getFc().length===17?"":"disabled"}>Copiar</button></div><small>Se guarda en tu cuenta. Con Copiar lo tienes listo para pegar en un mensaje.</small></div>
<div class="cu-acts"><button type="button" class="pri" data-sync>Guardar ahora</button><button type="button" class="nb2" data-out>Cerrar sesión</button></div>`:
`<p class="adesc">Estás como invitado en <b>${NAME}</b>. Entra para guardar esta lista en tu cuenta.</p>${formHTML(mode,"dlg")}`}
<p class="amsg ${msgk}" role="status">${esc(msg)}</p></div>`;
}
function open(){
if(!dlg){dlg=document.createElement("dialog");dlg.id="cuentaDlg";dlg.setAttribute("aria-label","Mi cuenta");document.body.appendChild(dlg);if(window.JS&&window.JS.watchDialogs)window.JS.watchDialogs();
dlg.addEventListener("click",async e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const m=e.target.closest("[data-mode]");if(m){mode=m.dataset.mode;msg="";render();dlg.querySelector("input")?.focus();return}
if(e.target.closest("[data-fccopy]")){const c=getFc();try{await navigator.clipboard.writeText("Mi código de amigo de Nintendo Switch: "+c)}catch(x){const t=dlg.querySelector("#fcIn");t.select();document.execCommand("copy")}msg="Código copiado: "+c;msgk="ok";render();return}
if(e.target.closest("[data-out]")){await push();setSes(null);setGuest(false);location.reload();return}
if(e.target.closest("[data-sync]")){await push();msg=state==="ok"?"Guardado.":"No se ha podido guardar.";msgk=state==="ok"?"ok":"bad";render()}
});
dlg.addEventListener("input",e=>{if(e.target.id!=="fcIn")return;const v=fmtFc(e.target.value);e.target.value=v;try{v?localStorage.setItem(FK,v):localStorage.removeItem(FK)}catch(x){}document.dispatchEvent(new Event("js-guardado"));const b=dlg.querySelector("[data-fccopy]");if(b)b.disabled=v.length!==17});
dlg.addEventListener("submit",async e=>{
e.preventDefault();
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
if(!chosen())openGate("lista");
else if(ses())sync();
else if(!guest())openGate("login");
else root.classList.remove("gate");
})();
