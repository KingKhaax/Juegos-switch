(()=>{
const API="https://juegos-switch-cuentas.vercel.app/api/criticas";
const J=()=>window.JS;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const UP='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9h5.3c1.2 0 2 1.1 1.7 2.2l-1.6 7.2c-.2.9-1 1.6-2 1.6H7"/></svg>';
const DOWN='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 13V4H4v9zM7 13l4 8c1.5 0 2.5-1 2.5-2.5V15h5.3c1.2 0 2-1.1 1.7-2.2l-1.6-7.2c-.2-.9-1-1.6-2-1.6H7"/></svg>';
let estatico=null;
const cargaEstatico=()=>estatico||(estatico=fetch("criticas.json?v=20261127b").then(r=>r.ok?r.json():{}).catch(()=>({})));
const cover=g=>{const A=J().AD&&J().AD();return g.cus&&A&&A[g.slug]?A[g.slug].c.sq:"img/t/"+g.slug+".jpg"};
const mes=d=>{if(!d)return"";const x=new Date(d+"T00:00:00");return isNaN(x)?"":x.toLocaleDateString("es-ES",{month:"short",year:"numeric"})};
const cache={};
async function datos(g){
if(cache[g.slug])return cache[g.slug];
const est=await cargaEstatico();
if(est[g.slug])return(cache[g.slug]=est[g.slug]);
const r=await fetch(API+"?s="+encodeURIComponent(g.slug)+"&t="+encodeURIComponent(g.title));
if(!r.ok)throw new Error("fuente");
const j=await r.json();
return(cache[g.slug]=j);
}
function tarjeta(c,k,i){
const texto=c.es||c.q;
return`<article class="crit-c ${k}" style="--i:${i}"><div class="crit-s" aria-label="Nota ${c.s} sobre 100"><b>${c.s}</b></div><div class="crit-b"><blockquote>${esc(texto)}</blockquote><div class="crit-m"><b>${esc(c.a)}</b>${c.d?`<span>${esc(mes(c.d))}</span>`:""}${c.es?'<button type="button" class="crit-or" data-orig aria-expanded="false">Ver original</button>':'<em class="crit-en">en inglés</em>'}${c.u?`<a href="${esc(c.u)}" target="_blank" rel="noopener noreferrer">Leer reseña ↗</a>`:""}</div>${c.es?`<p class="crit-o" hidden lang="en">${esc(c.q)}</p>`:""}</div></article>`;
}
function seccion(k,tit,sub,ico,arr){
if(!arr.length)return"";
return`<section class="crit-sec ${k}" aria-labelledby="crit-${k}"><div class="crit-aur" aria-hidden="true"></div><h4 id="crit-${k}"><span class="crit-ic">${ico}</span><span>${tit}<small>${sub}</small></span></h4><div class="crit-list">${arr.map((c,i)=>tarjeta(c,k,i)).join("")}</div><i class="crit-sp s1" aria-hidden="true"></i><i class="crit-sp s2" aria-hidden="true"></i><i class="crit-sp s3" aria-hidden="true"></i></section>`;
}
function cuerpo(d){
if(!d||d.vacio||(!d.pos.length&&!d.neg.length))return'<p class="crit-vacio">Todavía no hay críticas de la prensa para este juego. Puede que aún no haya salido o que no esté en Metacritic.</p>';
return`<p class="crit-n">${d.total} críticas de la prensa analizadas en Metacritic${d.plat==="nintendo-switch-2"?" (Switch 2)":""}</p>${seccion("pos","Lo mejor que dicen","Las notas y frases más positivas",UP,d.pos)}<div class="crit-vs" aria-hidden="true"><span>pero no todo es perfecto</span></div>${seccion("neg","Lo peor que dicen","Las notas más bajas y las pegas",DOWN,d.neg)}<p class="crit-foot">Citas de la prensa tomadas de Metacritic y traducidas automáticamente. Pulsa «Ver original» para leerlas en inglés.</p>`;
}
async function muestra(slug){
const dlg=document.getElementById("dlg");
const g=J().bySlug()[slug];
if(!g||!dlg)return;
dlg.dataset.slug=slug;
dlg.innerHTML=`<div class="sheet crit" style="--ac:#c084fc"><div class="crit-top"><button type="button" class="crit-back" data-cback>‹ Volver a la ficha</button><button type="button" class="x2" data-ccl aria-label="Cerrar">×</button></div><div class="crit-scroll"><header class="crit-head"><img src="${esc(cover(g))}" alt="" width="84" height="84"><div><h3>Críticas de ${esc(g.title)}</h3><p>Qué dice la prensa: lo mejor y lo peor</p></div></header><div id="critBody" aria-live="polite"><div class="crit-load" role="status" aria-label="Cargando críticas"><i></i><i></i><i></i></div></div></div></div>`;
try{
const d=await datos(g);
if(dlg.dataset.slug!==slug||!dlg.querySelector("#critBody"))return;
dlg.querySelector("#critBody").innerHTML=cuerpo(d);
}catch(e){
const b=dlg.querySelector("#critBody");
if(b)b.innerHTML='<p class="crit-vacio">No se han podido cargar las críticas ahora mismo. Inténtalo de nuevo en un rato.</p>';
}
}
function iniciar(){
const dlg=document.getElementById("dlg");
dlg.addEventListener("click",e=>{
const b=e.target.closest("[data-crit]");
if(b){e.stopPropagation();muestra(dlg.dataset.slug);return}
if(e.target.closest("[data-cback]")){e.stopPropagation();J().openDlg(dlg.dataset.slug);return}
if(e.target.closest("[data-ccl]")){e.stopPropagation();dlg.close();return}
const o=e.target.closest("[data-orig]");
if(o){e.stopPropagation();const p=o.closest(".crit-b").querySelector(".crit-o");const ab=p.hidden;p.hidden=!ab;o.setAttribute("aria-expanded",String(ab));o.textContent=ab?"Ocultar original":"Ver original"}
},true);
}
if(window.JS)iniciar();else document.addEventListener("juegos:listo",iniciar,{once:true});
})();
