(()=>{
const API="https://juegos-switch-cuentas.vercel.app/api/cuenta";
const CK="juegos-switch-cuenta";
const SKIP=/^juegos-switch-(cuenta|token|perfil|ajustes|mig1)$/;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ses=()=>{try{return JSON.parse(localStorage.getItem(CK))||null}catch(e){return null}};
const setSes=v=>{try{v?localStorage.setItem(CK,JSON.stringify(v)):localStorage.removeItem(CK)}catch(e){}};
const keys=()=>{const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("juegos-switch-")&&!SKIP.test(k))out.push(k)}return out};
const collect=()=>Object.fromEntries(keys().sort().map(k=>[k,localStorage.getItem(k)]));
const apply=d=>{keys().forEach(k=>localStorage.removeItem(k));Object.entries(d||{}).forEach(([k,v])=>{if(k.startsWith("juegos-switch-")&&!SKIP.test(k)&&typeof v==="string")localStorage.setItem(k,v)})};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(Object.fromEntries(Object.entries(b||{}).sort()));
async function call(a,opt){
const r=await fetch(API+"?a="+a,opt);
let j={};try{j=await r.json()}catch(e){}
return {ok:r.ok,status:r.status,j};
}
const btn=document.createElement("button");
btn.type="button";
btn.id="bcuenta";
btn.className="ap";
const nav=document.querySelector(".apartados");
if(nav)nav.insertBefore(btn,document.getElementById("bset"));
let state="";
const label=()=>{const s=ses();btn.innerHTML=s?`<span class="cu-dot ${state}" aria-hidden="true"></span>${esc(s.user)}`:"Iniciar sesión";btn.setAttribute("aria-label",s?`Mi cuenta: ${s.user}`:"Iniciar sesión")};
const mark=s=>{state=s;label();const d=document.getElementById("cuentaDlg");if(d&&d.open)render()};
let timer=0,busy=false,again=false;
async function push(){
const s=ses();if(!s)return;
if(busy){again=true;return}
busy=true;mark("sync");
try{
const r=await call("datos",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token},body:JSON.stringify({data:collect()})});
if(r.status===401){setSes(null);mark("");busy=false;return}
if(r.ok){const n=ses();if(n){n.dirty=0;n.synced=r.j.updated;setSes(n)}mark("ok")}else mark("err");
}catch(e){mark("err")}
busy=false;
if(again){again=false;push()}
}
document.addEventListener("js-guardado",()=>{const s=ses();if(!s)return;s.dirty=Date.now();setSes(s);mark("sync");clearTimeout(timer);timer=setTimeout(push,1200)});
addEventListener("pagehide",()=>{const s=ses();if(s&&s.dirty){clearTimeout(timer);fetch(API+"?a=datos",{method:"PUT",keepalive:true,headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token},body:JSON.stringify({data:collect()})}).catch(()=>{})}});
async function boot(){
const s=ses();label();if(!s)return;
if(s.dirty){push();return}
mark("sync");
try{
const r=await call("datos",{headers:{Authorization:"Bearer "+s.token}});
if(r.status===401){setSes(null);mark("");return}
if(!r.ok){mark("err");return}
if(!same(collect(),r.j.data)){
let done="";try{done=sessionStorage.getItem("js-sync")||""}catch(e){}
if(done!==String(r.j.updated)){try{sessionStorage.setItem("js-sync",String(r.j.updated))}catch(e){}apply(r.j.data);s.synced=r.j.updated;setSes(s);location.reload();return}
}
mark("ok");
}catch(e){mark("err")}
}
let dlg=null,mode="entrar",msg="",msgk="";
function render(){
const s=ses();
const st={sync:"Guardando…",ok:"Todo guardado en tu cuenta",err:"No se ha podido guardar. Se reintentará con el siguiente cambio.","":""}[state]||"";
dlg.innerHTML=`<div class="awin cu-win"><div class="fhead"><h3>${s?"Mi cuenta":"Iniciar sesión"}</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
${s?`<div class="cu-me"><span class="cu-av" aria-hidden="true">${esc(s.user.slice(0,1).toUpperCase())}</span><div><b>${esc(s.user)}</b><small class="cu-st ${state}">${st}</small></div></div>
<p class="adesc">Todo lo que cambias (lo que tienes, precios, estados, notas, orden y tu almacenamiento) se guarda solo en esta cuenta, de las listas de Rafita y de Nicky. Entra con el mismo usuario en otro móvil u ordenador y lo verás igual.</p>
<div class="cu-acts"><button type="button" class="pri" data-sync>Guardar ahora</button><button type="button" class="nb2" data-out>Cerrar sesión</button></div>`:
`<div class="cu-tabs" role="tablist"><button type="button" role="tab" aria-selected="${mode==="entrar"}" data-mode="entrar">Entrar</button><button type="button" role="tab" aria-selected="${mode==="registro"}" data-mode="registro">Crear cuenta</button></div>
<form class="cu-form" novalidate><label>Usuario<input name="user" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="24" required></label><label>Contraseña<input name="pass" type="password" autocomplete="${mode==="entrar"?"current-password":"new-password"}" minlength="6" maxlength="100" required></label>
<button type="submit" class="pri big2">${mode==="entrar"?"Entrar":"Crear cuenta"}</button></form>
<p class="adesc">${mode==="entrar"?"Entra para guardar las listas de Rafita y de Nicky en tu cuenta y verlas igual en todos tus dispositivos.":"Usuario de 3 a 24 letras o números (sin espacios) y contraseña de 6 caracteres o más. Lo que ya tienes en este navegador se guardará en la cuenta nueva."}</p>`}
<p class="amsg ${msgk}" role="status">${esc(msg)}</p></div>`;
}
function open(){
if(!dlg){dlg=document.createElement("dialog");dlg.id="cuentaDlg";dlg.setAttribute("aria-label","Mi cuenta");document.body.appendChild(dlg);if(window.JS&&window.JS.watchDialogs)window.JS.watchDialogs();
dlg.addEventListener("click",async e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const m=e.target.closest("[data-mode]");if(m){mode=m.dataset.mode;msg="";render();dlg.querySelector("input")?.focus();return}
if(e.target.closest("[data-out]")){setSes(null);state="";msg="Sesión cerrada. Lo que hay en este navegador se queda aquí.";msgk="ok";label();render();return}
if(e.target.closest("[data-sync]")){await push();msg=state==="ok"?"Guardado.":"No se ha podido guardar.";msgk=state==="ok"?"ok":"bad";render()}
});
dlg.addEventListener("submit",async e=>{
e.preventDefault();
const f=e.target;const user=f.user.value.trim().toLowerCase();const pass=f.pass.value;
if(!/^[a-z0-9._-]{3,24}$/.test(user)){msg="El usuario tiene que tener de 3 a 24 letras o números, sin espacios ni tildes.";msgk="bad";render();return}
if(pass.length<6){msg="La contraseña tiene que tener 6 caracteres o más.";msgk="bad";render();return}
msg=mode==="entrar"?"Entrando…":"Creando la cuenta…";msgk="";render();
try{
const body={user,pass};if(mode==="registro")body.data=collect();
const r=await call(mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
if(!r.ok){msg={existe:"Ese usuario ya existe. Elige otro o entra con él.",credenciales:"Usuario o contraseña incorrectos.",usuario:"Usuario no válido.",clave:"Contraseña no válida."}[r.j.error]||"No se ha podido conectar. Inténtalo de nuevo.";msgk="bad";render();return}
const data=r.j.data||{};
const empty=!Object.keys(data).length;
setSes({user:r.j.user,token:r.j.token,synced:r.j.updated,dirty:0});
if(mode==="entrar"&&empty&&Object.keys(collect()).length){await push();msg="Sesión iniciada. Lo que tenías en este navegador se ha guardado en tu cuenta.";msgk="ok";label();render();return}
if(mode==="entrar"&&!same(collect(),data)){apply(data);location.reload();return}
state="ok";msg=mode==="entrar"?"Sesión iniciada.":"Cuenta creada. Todo lo que cambies se guardará en ella.";msgk="ok";label();render();
}catch(err){msg="No se ha podido conectar. Inténtalo de nuevo.";msgk="bad";render()}
});
}
msg="";msgk="";render();
if(!dlg.open)dlg.showModal();
dlg.querySelector("input")?.focus();
}
btn.addEventListener("click",open);
boot();
})();
