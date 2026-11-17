(()=>{
const T={sp:"Singleplayer",cl:"Coop local",co:"Coop online",ml:"Multi local",mo:"Multi online"};
const FT={sp:"Singleplayer",cl:"Cooperativo local",co:"Cooperativo online",ml:"Multijugador local",mo:"Multijugador online"};
const L={s1:"Switch 1 · compatible con Switch 2",s2e:"Switch 1 + Switch 2 Edition",upd:"Switch 1 + actualización gratuita Switch 2",s2:"Solo Switch 2"};
const KEY="juegos-switch-tengo";
const D=window.DETAILS||{};
const GAMES=window.GAMES;
const bySlug=Object.fromEntries(GAMES.map(g=>[g.slug,g]));
const $=s=>document.querySelector(s);
const active=new Set();
const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v.filter(s=>bySlug[s]):[]}catch(e){return[]}};
let own=load();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(own))}catch(e){}};
const gb=mb=>(mb/1024).toFixed(1).replace(".",",")+" GB";
const metaCls=n=>n>74?"g":n>49?"y":"r";
const cornerOf=k=>k==="s2"?`<img class="corner" src="img/corner-2.png" alt="Switch 2">`:k==="s2e"?`<img class="corner" src="img/corner-2e.png" alt="Switch 2 Edition">`:"";

function cardHtml(g,n,owned){
const d=D[g.slug]||{};
const meta=d.meta?`<span class="meta ${metaCls(d.meta)}" title="Metascore ${d.meta}">${d.meta}</span>`:"";
return `<article class="card${owned?" owned":""}" data-slug="${g.slug}" data-k="${g.k}" data-tags="${g.m.join(" ")}"><button class="open" type="button" aria-label="Ver la ficha de ${g.title}"><span class="media"><img class="cover" src="img/${g.slug}.jpg" alt=""><span class="num">${owned?"✓":n}</span>${meta}${cornerOf(g.k)}</span><span class="info"><span class="name">${g.title}</span><span class="modes">${g.m.map(m=>`<i>${T[m]}</i>`).join("")}</span></span></button><button class="own" type="button" aria-pressed="${owned}">${owned?"Quitar de «ya lo tengo»":"Ya lo tengo"}</button></article>`;
}

function tone(img){
const c=img.closest(".card");
try{
const cv=document.createElement("canvas");cv.width=24;cv.height=12;
const x=cv.getContext("2d");x.drawImage(img,0,0,24,12);
const d=x.getImageData(0,0,24,12).data;
let r=0,g=0,b=0;const n=d.length/4;
for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2]}
r/=255*n;g/=255*n;b/=255*n;
const mx=Math.max(r,g,b),mn=Math.min(r,g,b),dl=mx-mn;
let h=0;
if(dl){if(mx===r)h=((g-b)/dl)%6;else if(mx===g)h=(b-r)/dl+2;else h=(r-g)/dl+4}
h=Math.round(h*60+360)%360;
const s=Math.min(80,Math.max(50,Math.round(dl/(1-Math.abs(mx+mn-1))*100)||60));
c.style.setProperty("--c",`hsl(${h} ${s}% 42%)`);
}catch(e){}
}

function applyFilters(){
const cards=[...document.querySelectorAll(".card")];
cards.forEach(c=>{const t=c.dataset.tags.split(" ");c.hidden=![...active].every(f=>t.includes(f))});
let n=0;
document.querySelectorAll("#want .card:not([hidden]) .num").forEach(e=>{e.textContent=++n});
const vis=id=>document.querySelectorAll(`#${id} .card:not([hidden])`).length;
$("#wantEmpty").hidden=vis("want")>0||!$("#want").children.length;
$("#haveEmpty").hidden=$("#have").children.length>0;
}

let moved=null;
const io="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{
if(!e.isIntersecting)return;
const c=e.target;
c.style.transitionDelay=(c._d||0)+"ms";
c.classList.remove("pre");
io.unobserve(c);
setTimeout(()=>{c.style.transitionDelay=""},1100);
}),{rootMargin:"0px 0px -6% 0px"}):null;

const setNum=(sel,n)=>{
const e=$(sel);
if(e.textContent===String(n))return;
e.textContent=n;
e.classList.remove("bump");
void e.offsetWidth;
e.classList.add("bump");
};

function render(first){
const want=GAMES.filter(g=>!own.includes(g.slug));
const have=own.map(s=>bySlug[s]);
$("#want").innerHTML=want.map((g,i)=>cardHtml(g,i+1,false)).join("");
$("#have").innerHTML=have.map(g=>cardHtml(g,0,true)).join("");
setNum("#nq",want.length);
setNum("#nt",have.length);
document.querySelectorAll(".card .cover").forEach(im=>{if(im.complete)tone(im);else im.addEventListener("load",()=>tone(im),{once:true})});
applyFilters();
if(first&&io)document.querySelectorAll(".card").forEach((c,i)=>{c.classList.add("pre");c._d=(i%6)*70;io.observe(c)});
if(moved){
const c=document.querySelector(`.card[data-slug="${moved}"]`);
if(c){c.classList.add("just");c.addEventListener("animationend",()=>c.classList.remove("just"),{once:true})}
moved=null;
}
}

function toggleOwn(slug){
const g=bySlug[slug];
const i=own.indexOf(slug);
if(i>=0){own.splice(i,1)}else{own.push(slug)}
moved=slug;
save();render(false);
$("#live").textContent=i>=0?`${g.title} vuelve a la lista de los que quiero`:`${g.title} marcado como ya lo tengo`;
refreshDialogButton(slug);
}

const tv='<svg viewBox="0 0 48 32" width="40" height="27" aria-hidden="true"><rect x="8" y="2" width="38" height="22" rx="2" fill="#1e1e22" stroke="#fff" stroke-width="2"/><rect x="22" y="26" width="10" height="3" fill="#fff"/><rect x="2" y="22" width="10" height="7" rx="1" fill="#555"/></svg>';
const hh='<svg viewBox="0 0 48 24" width="44" height="22" aria-hidden="true"><rect x="1" y="2" width="46" height="20" rx="5" fill="#222"/><rect x="1" y="2" width="9" height="20" rx="4" fill="#00c3e3"/><rect x="38" y="2" width="9" height="20" rx="4" fill="#ff4554"/><rect x="11" y="4" width="26" height="16" fill="#0b0b0d"/></svg>';

function dlgHtml(g){
const d=D[g.slug]||{};
const owned=own.includes(g.slug);
const meta=d.meta?`<span class="meta big ${metaCls(d.meta)}" title="Metascore">${d.meta}</span>`:"";
const eds=(d.editions||[]).map(e=>`<div class="ed"><small>${d.editions.length>1?"Tamaño · "+e.name:"Tamaño"}</small><b>${e.sizeMB?gb(e.sizeMB):"—"}</b>${e.price?`<span>PVPR ${e.price}</span>`:""}</div>`).join("");
const upd=d.updateMB?`<div class="ed"><small>Actualización</small><b>${gb(d.updateMB)}</b></div>`:"";
const hours=[["main","Historia principal"],["plus","Principal + Secundarias"],["comp","Completista"],["all","Todos los estilos"]].filter(([k])=>d.hours&&d.hours[k]).map(([k,l])=>`<div><small>${l}</small><b>${d.hours[k].replace("Horas","horas")}</b></div>`).join("");
const col=(t,svg,pairs)=>`<div class="pc"><div class="pt">${svg}<span>${t}</span></div>${pairs.map(([a,b])=>`<div class="pr"><small>${a}</small><b>${b}</b></div>`).join("")}</div>`;
const perf=d.perf?`<section class="panel perf"><h3>Rendimiento en Nintendo Switch 2</h3><div class="pb">${d.perf.badge?`<span class="pbadge">${d.perf.badge}</span>`:""}${col("En el televisor",tv,d.perf.docked)}${col("En portátil",hh,d.perf.handheld)}</div></section>`:"";
const players=[["Jugadores locales",d.local],["Jugadores online",d.online]].filter(x=>x[1]).map(([l,v])=>`<div class="kv"><small>${l}</small><b>${v}</b></div>`).join("");
return `<div class="sheet"><form method="dialog"><button class="x" aria-label="Cerrar la ficha">×</button></form>
<div class="hero"><img src="img/${g.slug}.jpg" alt="Carcasa de ${g.title}">${meta}${cornerOf(g.k)}</div>
<div class="head"><h2>${g.title}</h2><p>${[d.dev,d.date].filter(Boolean).join(" · ")}</p><p class="chipline"><span class="chip k">${L[g.k]}</span>${g.m.map(m=>`<span class="chip">${FT[m]}</span>`).join("")}</p>
<button class="own big" type="button" data-slug="${g.slug}" aria-pressed="${owned}">${owned?"Quitar de «ya lo tengo»":"Ya lo tengo"}</button></div>
${d.summary?`<section class="panel desc"><h3>Resumen</h3><p>${d.summary}</p></section>`:""}
<div class="panels">
<section class="panel genre"><h3>Género</h3><div class="chips">${(d.genres||[]).map(x=>`<span class="chip g">${x}</span>`).join("")}</div>${players}<div class="kv"><small>Desarrollador</small><b>${d.dev||"—"}</b></div><div class="kv"><small>Distribuidor</small><b>${d.dist||"—"}</b></div></section>
<section class="panel size"><div class="eds">${eds}${upd}</div></section>
<section class="panel hours"><h3>Horas para completarlo</h3><div class="hg">${hours}</div></section>
${perf}
</div>
<p class="src">Datos de nswitchex.com</p></div>`;
}

const dlg=$("#dlg");
function openDlg(slug){
const g=bySlug[slug];if(!g)return;
dlg.innerHTML=dlgHtml(g);
dlg.dataset.slug=slug;
if(!dlg.open)dlg.showModal();
dlg.querySelector(".sheet").scrollTop=0;
history.replaceState(null,"","#"+slug);
}
function refreshDialogButton(slug){
if(!dlg.open||dlg.dataset.slug!==slug)return;
const b=dlg.querySelector(".own.big");
const owned=own.includes(slug);
b.setAttribute("aria-pressed",owned);
b.textContent=owned?"Quitar de «ya lo tengo»":"Ya lo tengo";
}
dlg.addEventListener("click",e=>{
if(e.target===dlg){dlg.close();return}
const b=e.target.closest(".own.big");
if(b)toggleOwn(b.dataset.slug);
});
dlg.addEventListener("close",()=>{if(bySlug[location.hash.slice(1)])history.replaceState(null,"",location.pathname+location.search)});

document.addEventListener("click",e=>{
const c=e.target.closest(".card");
if(!c||!c.closest("main"))return;
if(e.target.closest(".own"))toggleOwn(c.dataset.slug);
else if(e.target.closest(".open"))openDlg(c.dataset.slug);
});

const filters=$("#filters");
filters.innerHTML=`<button class="on" data-f="all">Todos</button>`+Object.keys(FT).map(k=>`<button data-f="${k}">${FT[k]}</button>`).join("");
filters.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
if(b.dataset.f==="all")active.clear();else if(active.has(b.dataset.f))active.delete(b.dataset.f);else active.add(b.dataset.f);
filters.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x.dataset.f==="all"?active.size===0:active.has(x.dataset.f)));
applyFilters();
});

render(true);
document.addEventListener("pointermove",e=>{
const c=e.target.closest&&e.target.closest(".card");
if(!c)return;
const r=c.getBoundingClientRect();
c.style.setProperty("--mx",(e.clientX-r.left)+"px");
c.style.setProperty("--my",(e.clientY-r.top)+"px");
},{passive:true});
const prog=$("#prog");
addEventListener("scroll",()=>{
const m=document.documentElement.scrollHeight-innerHeight;
prog.style.transform=`scaleX(${m>0?scrollY/m:0})`;
},{passive:true});
const fromHash=()=>{const s=location.hash.slice(1);if(bySlug[s])openDlg(s)};
addEventListener("hashchange",fromHash);
fromHash();
})();
