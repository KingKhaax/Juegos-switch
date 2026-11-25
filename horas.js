(()=>{
const J=()=>window.JS;
let dlg=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>n==null||n===""?"":String(n).replace(".",",");
function parse(t){
t=String(t).trim().toLowerCase().replace(",",".");
if(!t)return "";
const h=t.match(/(\d+(?:\.\d+)?)\s*h/),m=t.match(/(\d+(?:\.\d+)?)\s*m/);
let n;
if(h||m)n=(h?parseFloat(h[1]):0)+(m?parseFloat(m[1])/60:0);
else n=parseFloat(t);
return isFinite(n)&&n>=0?Math.round(n*10)/10:null;
}
function rows(q){
const j=J();
return j.games.filter(g=>j.isOwn(g.slug)&&(!q||j.norm(g.title).includes(j.norm(q))));
}
function total(){const mio=J().mio();return Object.values(mio).reduce((t,m)=>t+(Number(m.horas)||0),0)}
function list(q){
const j=J(),mio=j.mio();
const r=rows(q);
if(!r.length)return `<p class="adesc">${q?"Ningún juego tuyo coincide con la búsqueda.":"Aún no tienes ningún juego marcado como «ya tengo». Márcalos y aparecerán aquí."}</p>`;
return `<div class="hr-list">${r.map(g=>{const i=j.info(g),main=i.hours;return `<label class="hr-row"><img src="img/${esc(g.slug)}.jpg" alt="" width="44" height="44" loading="lazy"><span class="hr-t"><b>${esc(g.title)}</b><small>${main?`Historia principal: ${esc(j.nf(main,1))} h`:"Sin dato de duración"}</small></span><span class="hr-in"><input type="text" inputmode="decimal" autocomplete="off" data-slug="${esc(g.slug)}" placeholder="0" value="${esc(fmt((mio[g.slug]||{}).horas))}" aria-label="Horas jugadas de ${esc(g.title)}"><i>h</i></span></label>`}).join("")}</div>`;
}
function totalTxt(){const t=total();return `Total: ${J().nf(t,1)} h jugadas`}
function render(q){
dlg.innerHTML=`<div class="awin hr-win"><div class="fhead"><h3>Mis horas jugadas</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
<p class="adesc">Copia las horas desde la consola (Perfil → <mark class="m-pk">Historial de juego</mark>). Puedes escribir <mark class="m-cy">12,5</mark>, <mark class="m-gr">12 h 30 min</mark> o <mark class="m-or">12h30m</mark>. Se guarda al salir del campo y con Intro pasas al siguiente juego.</p>
<input type="search" class="hr-q" placeholder="Buscar entre mis juegos" aria-label="Buscar entre mis juegos" value="${esc(q||"")}" autocomplete="off">
<div id="hrlist">${list(q)}</div>
<p class="hr-tot" id="hrtot" role="status">${totalTxt()}</p></div>`;
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="hrdlg";
dlg.setAttribute("aria-label","Mis horas jugadas");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{if(e.target===dlg||e.target.closest("[data-close]"))dlg.close()});
dlg.addEventListener("close",()=>J().redraw());
dlg.addEventListener("input",e=>{if(e.target.matches(".hr-q")){const l=dlg.querySelector("#hrlist");l.innerHTML=list(e.target.value)}});
dlg.addEventListener("change",e=>{
const t=e.target;if(!t.matches("[data-slug]"))return;
const n=parse(t.value);
if(n===null){t.classList.add("bad");return}
t.classList.remove("bad");
J().setMi(t.dataset.slug,{horas:n});
t.value=fmt(n);
dlg.querySelector("#hrtot").textContent=totalTxt();
});
dlg.addEventListener("keydown",e=>{
if(e.key!=="Enter"||!e.target.matches("[data-slug]"))return;
e.preventDefault();
const all=[...dlg.querySelectorAll("[data-slug]")],i=all.indexOf(e.target);
e.target.blur();
(all[i+1]||e.target).focus();
});
}
function open(){ensure();dlg.classList.add("fx-open");setTimeout(()=>dlg.classList.remove("fx-open"),1300);render("");if(!dlg.open)dlg.showModal();dlg.querySelector(".hr-q").focus()}
const nav=document.querySelector(".apartados");
const b=document.createElement("button");
b.type="button";b.id="bhoras";b.className="ap";b.textContent="Mis horas";
if(nav)nav.insertBefore(b,document.getElementById("bset"));
b.addEventListener("click",open);
})();
