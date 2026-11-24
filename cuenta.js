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
const ERR={correo:"Ese correo no es válido.",codigo:"El código no es correcto o ha caducado.",espera:"Espera un minuto antes de pedir otro código.",envio:"No se ha podido enviar el correo. Inténtalo más tarde.",correo_no:"El envío por correo aún no está activado.",bloqueo:"Demasiados intentos fallidos. Prueba de nuevo en 15 minutos.",bloqueo:"Demasiados intentos fallidos. Prueba de nuevo en 15 minutos.",pregunta:"Escribe una pregunta (3 a 80 letras) y una respuesta (3 o más).",respuesta:"La respuesta no es correcta.",nombre:"El nombre solo puede cambiar las mayúsculas y minúsculas del usuario.",existe:"Ese usuario ya existe. Elige otro o entra con él.",credenciales:"Usuario o contraseña incorrectos.",usuario:"Usuario no válido.",clave:"Contraseña no válida."};
const btn=document.createElement("button");
btn.type="button";
btn.id="bcuenta";
btn.className="ap";
const nav=document.querySelector(".apartados");
if(nav)nav.insertBefore(btn,nav.firstElementChild);
let state="";
const label=()=>{const s=ses();btn.innerHTML=s?`<span class="cu-dot ${state}" aria-hidden="true"></span>${esc(s.nombre||s.user)}`:`<span class="cu-dot" aria-hidden="true"></span>Invitado`;btn.setAttribute("aria-label",s?`Mi cuenta: ${s.user}`:"Estás como invitado. Iniciar sesión")};
let toast=null,retryT=0;
const showToast=on=>{clearTimeout(retryT);if(!on){if(toast){toast.remove();toast=null}return}
if(!toast){toast=document.createElement("div");toast.id="cu-toast";toast.setAttribute("role","alert");toast.innerHTML='<span>No se ha podido guardar en tu cuenta. Tus cambios siguen en este navegador y se reintentará solo.</span><button type="button" class="nb2" data-retry>Reintentar</button>';toast.addEventListener("click",e=>{if(e.target.closest("[data-retry]"))push()});document.body.appendChild(toast)}
retryT=setTimeout(()=>{if(state==="err")push()},30000)};
const mark=s=>{state=s;showToast(s==="err");label();const d=document.getElementById("cuentaDlg");if(d&&d.open)render()};
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
{const se=ses();if(se&&(se.q||"")!==(r.j.pregunta||"")){se.q=r.j.pregunta||"";if(r.j.nombre)se.nombre=r.j.nombre;setSes(se)}if(se&&(se.correo||"")!==(r.j.correo||"")){se.correo=r.j.correo||"";setSes(se)}}
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
const AV=["kitty.png","switch-logo.png","super-mario-odyssey.jpg","super-mario-bros-wonder.jpg","mario-kart-8-deluxe.jpg","mario-kart-world.jpg","animal-crossing-new-horizons.jpg","super-smash-bros-ultimate.jpg","kirby-y-la-tierra-olvidada.jpg","donkey-kong-bananza.jpg","pokemon-escarlata.jpg","pokemon-espada.jpg","pokemon-lets-go-pikachu.jpg","pokemon-lets-go-eevee.jpg","leyendas-pokemon-arceus.jpg","leyendas-pokemon-z-a.jpg","super-mario-party-jamboree.jpg","super-mario-maker-2.jpg","super-mario-galaxy-1-2.jpg","pokken-tournament-dx.jpg"];
const AK="juegos-switch-avatar"+(NV?"-novia":"");
const NK="juegos-switch-nintendo"+(NV?"-novia":"");
const REG=["España","Resto de Europa","México","Estados Unidos","Japón","Otra"];
const lget=k=>{try{return localStorage.getItem(k)||""}catch(e){return""}};
const nin=()=>{try{return JSON.parse(lget(NK))||{}}catch(e){return{}}};
const setNin=o=>{try{localStorage.setItem(NK,JSON.stringify(o))}catch(e){}document.dispatchEvent(new Event("js-guardado"))};
const openS=new Set(["perfil"]);
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
body='<div class="cu-me">'+avatarHTML(s)+'<div><b>'+esc(s.nombre||s.user)+'</b><small class="cu-st '+state+'">'+st+'</small></div></div>'
+'<p class="adesc">Sesión de <b>'+NAME+'</b>. Lo que cambias aquí se guarda solo en esta cuenta; la otra lista tiene su propia sesión.</p>'
+sec("perfil","Perfil","👤",
'<div class="cu-lbl">Avatar</div><div class="cu-avs">'+AV.map(f=>'<button type="button" class="cu-avb'+(av===f?" on":"")+'" data-av="'+f+'" aria-label="Elegir avatar" aria-pressed="'+(av===f)+'"><img src="img/'+f+'" alt="" loading="lazy"></button>').join("")+'</div>'
+(av?'<button type="button" class="nb2 cu-mini" data-av="">Quitar avatar</button>':"")
+'<form class="cu-form" data-ed novalidate><label>Nombre de usuario<input name="nombre" maxlength="24" autocapitalize="none" spellcheck="false" value="'+esc(s.nombre||s.user)+'"></label><small class="cu-h">Solo puedes cambiar mayúsculas y minúsculas: sigues entrando con el mismo usuario.</small><button type="submit" class="nb2">Guardar nombre</button></form>'
+'<div class="cu-form"><label>Nombre en Nintendo<input data-nin="nombre" maxlength="30" autocomplete="off" value="'+esc(n.nombre||"")+'" placeholder="Tu nombre de usuario de Nintendo"></label><label>Región de la eShop<select data-nin="region"><option value="">Sin indicar</option>'+REG.map(x=>'<option'+(n.region===x?" selected":"")+'>'+x+'</option>').join("")+'</select></label></div>')
+sec("amigo","Código de amigo","🎮",
'<div class="cu-fcrow"><input id="fcIn" type="text" inputmode="numeric" autocomplete="off" maxlength="17" placeholder="SW-0000-0000-0000" value="'+esc(fc)+'" aria-label="Código de amigo de Switch"><button type="button" class="pri" data-fccopy '+(fc.length===17?"":"disabled")+'>Copiar</button></div><small class="cu-h">Se guarda en tu cuenta. Copiar deja el mensaje listo para pegar.</small>')
+sec("resumen","Resumen","📊",r?'<div class="cu-tiles">'+tile("Juegos que tienes",r.n+" de "+r.t)+tile("Espacio en consola",r.gb.toLocaleString("es-ES",{maximumFractionDigits:1})+" GB")+tile("Gastado",r.eur.toLocaleString("es-ES",{style:"currency",currency:"EUR"}))+tile("Horas jugadas",r.hrs.toLocaleString("es-ES",{maximumFractionDigits:1})+" h")+tile("Terminados",String(r.done))+'</div>':'<p class="adesc">El resumen aparece cuando se carga la lista.</p>')
+sec("seg","Seguridad","🔒",
'<form class="cu-form" data-pw novalidate><div class="cu-lbl">Cambiar contraseña</div><label>Contraseña actual<input name="actual" type="password" autocomplete="current-password"></label><label>Contraseña nueva<input name="nueva" type="password" autocomplete="new-password" placeholder="6 caracteres o más"></label><button type="submit" class="nb2">Cambiar contraseña</button></form>'
+'<form class="cu-form" data-mail novalidate><div class="cu-lbl">Correo de recuperación</div><small class="cu-h">'+(s.correo?"Ahora tienes puesto: "+esc(s.correo)+". Para quitarlo, deja el campo vacío.":"Si olvidas la contraseña, te enviamos un código a este correo para poner otra. Mejor un Gmail.")+'</small><label>Correo<input name="correo" type="email" autocomplete="email" maxlength="80" placeholder="tucorreo@gmail.com"></label><label>Contraseña actual<input name="actual" type="password" autocomplete="current-password"></label><button type="submit" class="nb2">Guardar correo</button></form>'
+'<form class="cu-form" data-q novalidate><div class="cu-lbl">Pregunta de recuperación</div><small class="cu-h">'+(s.q?"Ahora tienes puesta: «"+esc(s.q)+"». Puedes cambiarla.":"Sin ella, si olvidas la contraseña no se puede recuperar la cuenta.")+'</small><label>Pregunta<input name="pregunta" maxlength="80" autocomplete="off" placeholder="Ej.: ¿Cómo se llamaba mi primera consola?"></label><label>Respuesta<input name="respuesta" maxlength="60" autocomplete="off"></label><label>Contraseña actual<input name="actual" type="password" autocomplete="current-password"></label><button type="submit" class="nb2">Guardar pregunta</button></form>'
+'<div class="cu-lbl">Otros dispositivos</div><button type="button" class="nb2" data-others>Cerrar sesión en los demás dispositivos</button>')
+'<div class="cu-acts"><button type="button" class="pri" data-sync>Guardar ahora</button><button type="button" class="nb2" data-out>Cerrar sesión</button></div>';
}else body='<p class="adesc">Estás como invitado en <b>'+NAME+'</b>. Entra para guardar esta lista en tu cuenta.</p>'+formHTML(mode,"dlg");
dlg.innerHTML='<div class="awin cu-win"><div class="fhead"><h3>'+(s?"Mi cuenta":"Iniciar sesión")+'</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>'+body+'<p class="amsg '+msgk+'" role="status">'+esc(msg)+'</p></div>';
}
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
if(!dlg){dlg=document.createElement("dialog");dlg.id="cuentaDlg";dlg.setAttribute("aria-label","Mi cuenta");document.body.appendChild(dlg);if(window.JS&&window.JS.watchDialogs)window.JS.watchDialogs();
dlg.addEventListener("click",async e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const m=e.target.closest("[data-mode]");if(m){mode=m.dataset.mode;msg="";render();dlg.querySelector("input")?.focus();return}
if(e.target.closest("[data-out]")){await push();setSes(null);setGuest(false);location.reload();return}
if(e.target.closest("[data-sync]")){await push();msg=state==="ok"?"Guardado.":"No se ha podido guardar.";msgk=state==="ok"?"ok":"bad";render()}
});
dlg.addEventListener("toggle",e=>{const d=e.target;if(d.matches&&d.matches("details.cu-sec")){d.open?openS.add(d.dataset.s):openS.delete(d.dataset.s)}},true);
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
try{const r=await perfilCall(body);if(r.ok){if(r.j.nombre){se.nombre=r.j.nombre}if(r.j.pregunta!==undefined)se.q=r.j.pregunta;if(r.j.correo!==undefined)se.correo=r.j.correo;setSes(se);label();msg=fm.matches("[data-pw]")?"Contraseña cambiada.":fm.matches("[data-mail]")?(r.j.correo?"Correo guardado.":"Correo quitado."):fm.matches("[data-q]")?"Pregunta de recuperación guardada.":"Nombre guardado.";msgk="ok"}else{msg=ERR[r.j.error]||"No se han podido guardar los cambios.";msgk="bad"}}catch(x){msg="No se ha podido conectar. Inténtalo de nuevo.";msgk="bad"}
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
if(!chosen())openGate("lista");
else if(ses())sync();
else if(!guest())openGate("login");
else root.classList.remove("gate");
})();
