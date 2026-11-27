(()=>{
const API="https://juegos-switch-cuentas.vercel.app/api/cuenta";
const KEY="juegos-switch-prestados";
const DIAS=14*86400000,HORA=3600000;
const PROF=window.PERFIL==="novia"?"novia":"rafa";
const CK=PROF==="novia"?"juegos-switch-cuenta-novia":"juegos-switch-cuenta";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const J=()=>window.JS;
const ses=()=>{try{const v=JSON.parse(localStorage.getItem(CK));return v&&v.token?v:null}catch(e){return null}};
let M={},correoOk=null;
const pub=()=>{window.PREST=Object.fromEntries(Object.entries(M).map(([k,v])=>[k,v.fin]));if(J()&&J().redraw)J().redraw()};
const leer=()=>{try{const o=JSON.parse(J().store.get(KEY,"{}"));M=o&&typeof o==="object"?o:{}}catch(e){M={}}};
const guardar=()=>{Object.keys(M).length?J().store.set(KEY,JSON.stringify(M)):J().store.del(KEY)};
async function call(a,opt){
const s=ses();if(!s)return null;
try{
const r=await fetch(API+"?a="+a,Object.assign({headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.token}},opt||{}));
let j={};try{j=await r.json()}catch(e){}
if(j&&typeof j.correo==="boolean")correoOk=j.correo;
return{ok:r.ok,j}
}catch(e){return null}
}
const subir=(slug,it)=>call("prestamo_set",{method:"POST",body:JSON.stringify({perfil:PROF,slug,titulo:it?it.titulo:slug,fin:it?it.fin:0})});
const partes=ms=>{const t=Math.max(0,Math.floor(ms/1000));return{d:Math.floor(t/86400),h:Math.floor(t%86400/3600),m:Math.floor(t%3600/60),s:t%60}};
const p2=n=>String(n).padStart(2,"0");
const largo=ms=>{const p=partes(ms);return[["d",p.d],["h",p2(p.h)],["min",p2(p.m)],["s",p2(p.s)]].map(([u,v])=>`<span><i>${v}</i>${u}</span>`).join("")};
const corto=ms=>{const p=partes(ms);return p.d>0?`${p.d} d ${p.h} h`:p.h>0?`${p.h} h ${p2(p.m)} min`:`${p.m} min ${p2(p.s)} s`};
const fechaTxt=ms=>new Date(ms).toLocaleString("es-ES",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
const nota=()=>!ses()?"Entra con tu cuenta y vincula un correo para que te avise por Gmail cuando quede 1 hora.":correoOk===false?"Vincula un correo a tu cuenta para que te avise por Gmail cuando quede 1 hora.":"Te mando un Gmail al correo de tu cuenta cuando quede 1 hora.";
const ICON='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h13M13 7l5 5-5 5"/><path d="M20 4v16"/></svg>';
function bloque(slug){
const it=M[slug];
if(!it)return`<div class="prest" data-pslug="${esc(slug)}"><button type="button" class="prest-go" data-prest="1">${ICON}<span>Juego prestado</span></button><p class="prest-n">Cuenta 14 días exactos desde que lo pulses. ${esc(nota())}</p></div>`;
return`<div class="prest on" data-pslug="${esc(slug)}"><small class="prest-h">Juego prestado · vuelve en</small><div class="prest-c" data-fin="${it.fin}" role="timer">${largo(it.fin-Date.now())}</div><p class="prest-n">Termina el ${esc(fechaTxt(it.fin))}. ${esc(nota())}</p><button type="button" class="prest-back" data-prest="0">Ya me lo han devuelto</button></div>`;
}
function pintaDialogo(){
const dlg=document.getElementById("dlg");
if(!dlg||!dlg.open)return;
const sh=dlg.querySelector(".sheet"),ac=sh&&sh.querySelector(".actions");
if(!ac)return;
const slug=dlg.dataset.slug;
const cur=sh.querySelector(".prest");
if(cur){if(cur.dataset.pslug===slug&&(!!M[slug])===cur.classList.contains("on"))return;cur.outerHTML=bloque(slug);return}
ac.insertAdjacentHTML("afterend",bloque(slug));
}
function insignias(){
for(const slug of Object.keys(M)){
const c=document.querySelector('.card[data-slug="'+slug+'"]');
if(!c)continue;
let b=c.querySelector(".prest-b");
if(!b){b=document.createElement("span");b.className="prest-b";b.title="Juego prestado";c.appendChild(b)}
b.textContent="Prestado · "+corto(M[slug].fin-Date.now());
}
}
function quitaInsignia(slug){document.querySelectorAll('.card[data-slug="'+slug+'"] .prest-b').forEach(b=>b.remove())}
function empezar(slug){
const g=J().bySlug()[slug];
const it={fin:Date.now()+DIAS,titulo:g?g.title:slug,av:false};
M[slug]=it;guardar();pub();subir(slug,it).then(()=>{pintaDialogo();refrescaBloque(slug)});
refrescaBloque(slug);insignias();renderSeccion();
}
function parar(slug){
delete M[slug];guardar();pub();quitaInsignia(slug);subir(slug,null);refrescaBloque(slug);renderSeccion();
}
function refrescaBloque(slug){
const dlg=document.getElementById("dlg");
if(!dlg||!dlg.open||dlg.dataset.slug!==slug)return;
const cur=dlg.querySelector(".prest");
if(cur)cur.outerHTML=bloque(slug);else pintaDialogo();
}
const cover=g=>{const A=J().AD&&J().AD();return g.cus&&A&&A[g.slug]?A[g.slug].c.sq:"img/t/"+g.slug+".jpg"};
let sig="";
function seccion(){
let sec=document.getElementById("prestados");
if(!sec){
const tg=document.getElementById("tengo");
if(!tg)return;
sec=document.createElement("section");
sec.id="prestados";sec.className="loan";sec.setAttribute("aria-labelledby","hp");
sec.innerHTML='<h2 id="hp">Juegos prestados</h2><div class="pr-list" id="prlist"></div><p class="empty" id="prEmpty" hidden>Ningún juego prestado ahora mismo. Abre un juego y pulsa «Juego prestado» para empezar la cuenta atrás de 14 días.</p>';
tg.insertAdjacentElement("afterend",sec);
const nav=document.querySelector(".apartados");
const lk=nav&&nav.querySelector('a[href="#tengo"]');
if(lk){const a=document.createElement("a");a.href="#prestados";a.innerHTML='Juegos prestados <b id="np">0</b>';lk.insertAdjacentElement("afterend",a)}
const list=sec.querySelector("#prlist");
list.addEventListener("toggle",e=>{const d=e.target;if(!d.matches||!d.matches("details.pr-item"))return;const it=M[d.dataset.slug];if(it&&!!it.ab!==d.open){it.ab=d.open;guardar()}},true);
list.addEventListener("click",e=>{
const d=e.target.closest("details.pr-item");if(!d)return;
if(e.target.closest("[data-pr-open]")){e.preventDefault();J().openDlg(d.dataset.slug);return}
if(e.target.closest("[data-pr-back]")){e.preventDefault();parar(d.dataset.slug)}
});
}
}
function renderSeccion(){
seccion();
const list=document.getElementById("prlist");
if(!list)return;
const claves=Object.keys(M).sort();
const np=document.getElementById("np");
if(np&&np.textContent!==String(claves.length)){np.textContent=claves.length;np.classList.remove("bump");void np.offsetWidth;np.classList.add("bump")}
const ahora=claves.map(k=>k+M[k].fin+(M[k].ab?"1":"0")).join("|");
if(ahora===sig)return;
sig=ahora;
document.getElementById("prEmpty").hidden=claves.length>0;
list.innerHTML=claves.map(slug=>{
const it=M[slug],g=J().bySlug()[slug];
if(!g)return"";
return'<details class="pr-item"'+(it.ab?" open":"")+' data-slug="'+esc(slug)+'"><summary><img class="pr-img" src="'+esc(cover(g))+'" width="56" height="56" alt="" loading="lazy"><span class="pr-name">'+esc(g.title)+'</span><span class="pr-mini" data-fin="'+it.fin+'">'+esc(corto(it.fin-Date.now()))+'</span><span class="pr-chev" aria-hidden="true"></span></summary><div class="pr-body"><small class="prest-h">Vuelve en</small><div class="prest-c pr-big" data-fin="'+it.fin+'" role="timer">'+largo(it.fin-Date.now())+'</div><p class="prest-n">Termina el '+esc(fechaTxt(it.fin))+'. '+esc(nota())+'</p><div class="pr-acts"><button type="button" class="pr-b" data-pr-open>Ver la ficha</button><button type="button" class="prest-back" data-pr-back>Ya me lo han devuelto</button></div></div></details>'}).join("");
}
function tick(){
const ahora=Date.now();
for(const [slug,it] of Object.entries(M)){
const falta=it.fin-ahora;
if(falta<=0){delete M[slug];guardar();pub();quitaInsignia(slug);subir(slug,null);refrescaBloque(slug);continue}
if(falta<=HORA&&!it.av&&ses()){it.av=true;guardar();call("prestamo_aviso",{method:"POST",body:JSON.stringify({perfil:PROF,slug})})}
}
document.querySelectorAll(".prest-c").forEach(e=>{e.innerHTML=largo(+e.dataset.fin-ahora)});
document.querySelectorAll(".pr-mini").forEach(e=>{e.textContent=corto(+e.dataset.fin-ahora);e.classList.toggle("last",+e.dataset.fin-ahora<=HORA)});
renderSeccion();
insignias();
}
async function sincroniza(){
if(!ses())return;
const r=await call("prestamo_lista");
if(!r||!r.ok)return;
const ya=new Set();
for(const x of r.j.items||[]){
const i=x.k.indexOf(":");
if(x.k.slice(0,i)!==PROF)continue;
const slug=x.k.slice(i+1);ya.add(slug);
if(!M[slug]||M[slug].fin!==x.fin)M[slug]={fin:x.fin,titulo:x.titulo,av:false,ab:M[slug]?M[slug].ab:false};
}
guardar();pub();
for(const [slug,it] of Object.entries(M))if(!ya.has(slug))subir(slug,it);
insignias();renderSeccion();refrescaBloque(document.getElementById("dlg").dataset.slug);
}
function iniciar(){
leer();pub();
const dlg=document.getElementById("dlg");
new MutationObserver(pintaDialogo).observe(dlg,{childList:true,subtree:false});
dlg.addEventListener("click",e=>{
const b=e.target.closest("[data-prest]");
if(!b)return;
e.stopPropagation();
const slug=dlg.dataset.slug;
if(b.dataset.prest==="1")empezar(slug);else parar(slug);
});
setInterval(tick,1000);
tick();
pintaDialogo();
sincroniza();
}
if(window.JS)iniciar();else document.addEventListener("juegos:listo",iniciar,{once:true});
})();
