(()=>{
const T={sp:"Singleplayer",cl:"Coop local",co:"Coop online",ml:"Multi local",mo:"Multi online"};
const FT={sp:"Singleplayer",cl:"Cooperativo local",co:"Cooperativo online",ml:"Multijugador local",mo:"Multijugador online"};
const L={s1:"Switch 1 · compatible con Switch 2",s2e:"Switch 1 + Switch 2 Edition",upd:"Switch 1 + actualización gratuita Switch 2",s2:"Solo Switch 2"};
const SORTS=[["mine","Mi orden"],["meta-d","Metascore: mejor primero"],["size-a","Tamaño: menor primero"],["size-d","Tamaño: mayor primero"],["hours-a","Historia: más corta"],["hours-d","Historia: más larga"],["price-a","Precio: más barato"],["price-d","Precio: más caro"]];
const SD=[32,64,128,256,512,1024,2048];
const KEY="juegos-switch-tengo";
const CKEY="juegos-switch-consola";
const D=window.DETAILS||{};
const GAMES=window.GAMES;
const bySlug=Object.fromEntries(GAMES.map(g=>[g.slug,g]));
const $=s=>document.querySelector(s);
const active=new Set();
let q="";
let sort="mine";
let moved=null;
const store={
get(k,f){try{const v=localStorage.getItem(k);return v===null?f:v}catch(e){return f}},
set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
let own=(()=>{try{const v=JSON.parse(store.get(KEY,"[]"));return Array.isArray(v)?v.filter(s=>bySlug[s]):[]}catch(e){return[]}})();
let cons=store.get(CKEY,"2")==="1"?"1":"2";
const nf=(n,d)=>n.toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d});
const gb=mb=>nf(mb/1024,1)+" GB";
const eur=n=>nf(n,2)+" €";
const num=s=>{const m=/[\d.,]+/.exec(s||"");return m?parseFloat(m[0].replace(/\./g,"").replace(",",".")):null};
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const metaCls=n=>n>74?"g":n>49?"y":"r";
const cornerOf=k=>k==="s2"?`<img class="corner" src="img/corner-2.png" alt="Switch 2">`:k==="s2e"?`<img class="corner" src="img/corner-2e.png" alt="Switch 2 Edition">`:"";

function info(g){
const d=D[g.slug]||{};
const eds=d.editions||[];
const std=eds[0];
const s2=eds.find(e=>/switch 2/i.test(e.name));
const playable=!(cons==="1"&&g.k==="s2");
const e=cons==="2"&&s2?s2:std;
return{d,eds,std,s2,e,playable,mb:(e&&e.sizeMB)||0,price:e?num(e.price):null,hours:num(d.hours&&d.hours.main),meta:d.meta||null};
}

const KEYS={meta:i=>i.meta,size:i=>i.playable&&i.mb?i.mb:null,hours:i=>i.hours,price:i=>i.playable?i.price:null};
function sorted(list){
if(sort==="mine")return list;
const[k,dir]=sort.split("-");
return list.map((g,i)=>({g,i,v:KEYS[k](info(g))})).sort((a,b)=>{
if(a.v==null&&b.v==null)return a.i-b.i;
if(a.v==null)return 1;
if(b.v==null)return -1;
return(dir==="a"?a.v-b.v:b.v-a.v)||a.i-b.i;
}).map(o=>o.g);
}

function totals(list){
let mb=0,price=0;
list.forEach(g=>{const i=info(g);if(!i.playable)return;mb+=i.mb;price+=i.price||0});
return{mb,price};
}
const sdFor=mb=>SD.find(s=>s*1024>=mb*1.08)||SD[SD.length-1];

function renderSummary(want,have){
const a=totals(want),b=totals(have);
const all=a.mb+b.mb;
$("#resumen").innerHTML=`<div class="tile"><small>Los que quiero</small><b>${want.length} juegos</b><span>${gb(a.mb)}</span><span>${eur(a.price)} por comprar</span></div><div class="tile"><small>Los que ya tengo</small><b>${have.length} juegos</b><span>${gb(b.mb)}</span><span>${eur(b.price)} gastados</span></div><div class="tile sd"><small>Tarjeta SD que necesito</small><b>${sdFor(all)} GB</b><span>Con todo: ${gb(all)}</span><span>Con lo que quiero: ${gb(a.mb)}</span></div>`;
}

function cardHtml(g,n,owned){
const i=info(g);
const meta=i.meta?`<span class="meta ${metaCls(i.meta)}" title="Metascore ${i.meta}">${i.meta}</span>`:"";
const facts=i.playable?`<span class="facts"><b>${i.mb?gb(i.mb):"—"}</b>${i.price!=null?` · ${eur(i.price)}`:""}${sort.startsWith("hours")&&i.hours?` · ${nf(i.hours,1)} h`:""}</span>`:`<span class="facts bad">Solo Switch 2</span>`;
return `<article class="card${owned?" owned":""}" data-slug="${g.slug}" data-k="${g.k}" data-tags="${g.m.join(" ")}" data-name="${norm(g.title)}"><button class="open" type="button" aria-label="Ver la ficha de ${g.title}"><span class="media"><img class="cover" src="img/t/${g.slug}.jpg" width="240" height="240" decoding="async" loading="${!owned&&n<=6?"eager":"lazy"}" alt=""><span class="num">${owned?"✓":n}</span>${meta}${cornerOf(g.k)}</span><span class="info"><span class="name">${g.title}</span>${facts}<span class="modes">${g.m.map(m=>`<i>${T[m]}</i>`).join("")}</span></span></button><button class="own" type="button" aria-pressed="${owned}">${owned?"Quitar de «ya lo tengo»":"Ya lo tengo"}</button></article>`;
}

function tone(img){
const c=img.closest(".card");
try{
const cv=document.createElement("canvas");cv.width=24;cv.height=24;
const x=cv.getContext("2d");x.drawImage(img,0,0,24,24);
const d=x.getImageData(0,0,24,24).data;
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
const nq=norm(q.trim());
cards.forEach(c=>{
const t=c.dataset.tags.split(" ");
c.hidden=![...active].every(f=>t.includes(f))||(nq&&!c.dataset.name.includes(nq));
});
let n=0;
document.querySelectorAll("#want .card:not([hidden]) .num").forEach(e=>{e.textContent=++n});
$("#wantEmpty").hidden=n>0||!$("#want").children.length;
$("#haveEmpty").hidden=$("#have").children.length>0;
}

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
const want=sorted(GAMES.filter(g=>!own.includes(g.slug)));
const have=sorted(own.map(s=>bySlug[s]));
$("#want").innerHTML=want.map((g,i)=>cardHtml(g,i+1,false)).join("");
$("#have").innerHTML=have.map(g=>cardHtml(g,0,true)).join("");
setNum("#nq",want.length);
setNum("#nt",have.length);
renderSummary(want,have);
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
if(i>=0)own.splice(i,1);else own.push(slug);
moved=slug;
store.set(KEY,JSON.stringify(own));
render(false);
$("#live").textContent=i>=0?`${g.title} vuelve a la lista de los que quiero`:`${g.title} marcado como ya lo tengo`;
refreshDialog();
}

const svg={
tv:'<svg viewBox="0 0 48 32" width="42" height="28" aria-hidden="true"><rect x="8" y="2" width="38" height="22" rx="3" fill="#0d0f14" stroke="currentColor" stroke-width="2"/><rect x="22" y="26" width="10" height="3" rx="1" fill="currentColor"/><rect x="2" y="21" width="11" height="8" rx="2" fill="#4a4f5c"/></svg>',
hh:'<svg viewBox="0 0 48 24" width="46" height="23" aria-hidden="true"><rect x="1" y="2" width="46" height="20" rx="6" fill="#1a1c22"/><rect x="1" y="2" width="9" height="20" rx="4" fill="#00c3e3"/><rect x="38" y="2" width="9" height="20" rx="4" fill="#ff4554"/><rect x="11" y="4" width="26" height="16" rx="2" fill="#07080b"/></svg>',
ok:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
user:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="6.5" r="3.5" fill="currentColor"/><path d="M3 18c0-4 3-6 7-6s7 2 7 6z" fill="currentColor"/></svg>',
globe:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 10h16M10 2c3 3 3 13 0 16M10 2c-3 3-3 13 0 16" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
};

function fichaHtml(g){
const i=info(g),d=i.d;
const owned=own.includes(g.slug);
const e=i.e||i.std||{};
const other=cons==="2"?i.std:i.s2;
const otherLbl=cons==="2"?"Switch 1":"Switch 2 Edition";
const hrs=[["main","Historia principal"],["plus","Principal + Secundarias"],["comp","Completista"],["all","Todos los estilos"]].filter(([k])=>d.hours&&d.hours[k]);
const maxH=Math.max(1,...hrs.map(([k])=>num(d.hours[k])||0));
const pct=i.mb?Math.min(100,i.mb/1024/128*100):0;
const col=(t,ic,pairs)=>`<div class="dev"><div class="dt">${ic}<span>${t}</span></div>${pairs.map(([a,b])=>`<div class="pr"><small>${a}</small><b>${svg.ok}${b}</b></div>`).join("")}</div>`;
const perf=d.perf?`<section class="panel perf"><h3>Rendimiento en Nintendo Switch 2</h3>${d.perf.badge?`<span class="pbadge">${d.perf.badge}</span>`:""}<div class="devs">${col("En el televisor",svg.tv,d.perf.docked)}${col("En portátil",svg.hh,d.perf.handheld)}</div></section>`:"";
const players=[["Jugadores locales",d.local,svg.user],["Jugadores online",d.online,svg.globe]].filter(x=>x[1]).map(([l,v,ic])=>`<div class="pl">${ic}<div><small>${l}</small><b>${v}</b></div></div>`).join("");
return `<div class="sheet">
<form method="dialog"><button class="x" aria-label="Cerrar la ficha">×</button></form>
<button class="nav prev" type="button" aria-label="Juego anterior">‹</button><button class="nav next" type="button" aria-label="Juego siguiente">›</button>
<div class="scroll">
<div class="hero"><img src="img/${g.slug}.jpg" width="415" height="208" decoding="async" alt="Carcasa de ${g.title}"><i class="sheen"></i>${cornerOf(g.k)}
<div class="htitle"><h2>${g.title}</h2><p>${[d.dev,d.date].filter(Boolean).join(" · ")}</p></div>
${i.meta?`<div class="ring ${metaCls(i.meta)}" style="--v:${i.meta}" title="Metascore"><span data-to="${i.meta}" data-dec="0">${i.meta}</span></div>`:""}</div>
<div class="body">
<div class="chipline"><span class="chip k">${L[g.k]}</span>${g.m.map(m=>`<span class="chip">${FT[m]}</span>`).join("")}</div>
<div class="actions"><button class="own big" type="button" data-slug="${g.slug}" aria-pressed="${owned}"><span class="tick">${svg.ok}</span><span class="otxt">${owned?"Lo tengo · quitar":"Ya lo tengo"}</span></button>${i.price!=null&&i.playable?`<div class="price"><small>PVPR ${e.name||""}</small><b>${eur(i.price)}</b></div>`:""}</div>
${d.summary?`<section class="panel desc"><h3>Resumen</h3><p>${d.summary}</p></section>`:""}
<div class="grid2">
<section class="panel size"><h3>Tamaño en Switch ${cons==="1"?"1":"2"}</h3>${i.playable?`<b class="big" data-to="${i.mb/1024}" data-dec="1" data-suf=" GB">${i.mb?gb(i.mb):"—"}</b><div class="sdbar" title="Porcentaje de una tarjeta de 128 GB"><i style="--w:${pct.toFixed(1)}%"></i></div><small class="note">Ocupa el ${nf(pct,1)} % de una tarjeta de 128 GB${e.name?` · edición ${e.name}`:""}</small>`:`<p class="warn">Este juego solo funciona en Switch 2.</p>`}
${other&&other.sizeMB?`<div class="alt"><span>${otherLbl}</span><b>${gb(other.sizeMB)}</b>${other.price?`<em>${other.price.replace("€"," €")}</em>`:""}</div>`:""}
${d.updateMB?`<div class="alt"><span>Actualización</span><b>${gb(d.updateMB)}</b></div>`:""}</section>
<section class="panel hours"><h3>Horas para completarlo</h3>${hrs.map(([k,l],n)=>`<div class="hr"><div><small>${l}</small><b>${d.hours[k].replace("Horas","h")}</b></div><div class="bar"><i style="--w:${((num(d.hours[k])||0)/maxH*100).toFixed(1)}%;--d:${n*.12}s"></i></div></div>`).join("")}</section>
</div>
<section class="panel genre"><h3>Género y jugadores</h3><div class="chips">${(d.genres||[]).map(x=>`<span class="chip g">${x}</span>`).join("")}</div><div class="pls">${players}</div><div class="who"><div><small>Desarrollador</small><b>${d.dev||"—"}</b></div><div><small>Distribuidor</small><b>${d.dist||"—"}</b></div></div></section>
${perf}
<p class="src">Datos de nswitchex.com</p>
</div></div></div>`;
}

function countUp(el){
const to=parseFloat(el.dataset.to);
if(!isFinite(to)||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
const dec=+el.dataset.dec||0,suf=el.dataset.suf||"";
const t0=performance.now(),dur=800;
const step=t=>{
const k=Math.min(1,(t-t0)/dur);
const e=1-Math.pow(1-k,3);
el.textContent=nf(to*e,dec)+suf;
if(k<1)requestAnimationFrame(step);
};
requestAnimationFrame(step);
}

const dlg=$("#dlg");
const visible=()=>[...document.querySelectorAll("main .card:not([hidden])")].map(c=>c.dataset.slug);
function accentOf(slug){
const c=document.querySelector(`.card[data-slug="${slug}"]`);
return c&&getComputedStyle(c).getPropertyValue("--c").trim()||"#e60012";
}
function openDlg(slug,dir){
const g=bySlug[slug];
if(!g)return;
dlg.innerHTML=fichaHtml(g);
dlg.dataset.slug=slug;
const sh=dlg.querySelector(".sheet");
sh.style.setProperty("--ac",accentOf(slug));
if(dir)sh.classList.add(dir>0?"in-r":"in-l");
if(!dlg.open)dlg.showModal();
dlg.querySelector(".scroll").scrollTop=0;
dlg.querySelectorAll("[data-to]").forEach(countUp);
history.replaceState(null,"","#"+slug);
const v=visible();
const k=v.indexOf(slug);
dlg.querySelector(".prev").hidden=v.length<2;
dlg.querySelector(".next").hidden=v.length<2;
dlg._v=v;dlg._k=k;
}
function step(dir){
const v=visible();
if(v.length<2)return;
const k=v.indexOf(dlg.dataset.slug);
openDlg(v[(k+dir+v.length)%v.length],dir);
}
function refreshDialog(){
if(dlg.open)openDlg(dlg.dataset.slug);
}
dlg.addEventListener("click",e=>{
if(e.target===dlg){dlg.close();return}
const b=e.target.closest(".own.big");
if(b){toggleOwn(b.dataset.slug);return}
if(e.target.closest(".prev"))step(-1);
else if(e.target.closest(".next"))step(1);
});
dlg.addEventListener("close",()=>{if(bySlug[location.hash.slice(1)])history.replaceState(null,"",location.pathname+location.search)});
dlg.addEventListener("pointermove",e=>{
const p=e.target.closest&&e.target.closest(".panel");
if(!p)return;
const r=p.getBoundingClientRect();
p.style.setProperty("--mx",(e.clientX-r.left)+"px");
p.style.setProperty("--my",(e.clientY-r.top)+"px");
},{passive:true});
let sx=0,sy=0;
dlg.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
dlg.addEventListener("touchend",e=>{
const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6)step(dx<0?1:-1);
},{passive:true});
document.addEventListener("keydown",e=>{
if(!dlg.open)return;
if(e.key==="ArrowRight"){e.preventDefault();step(1)}
else if(e.key==="ArrowLeft"){e.preventDefault();step(-1)}
});

const warmed=new Set();
document.addEventListener("pointerover",e=>{
const c=e.target.closest&&e.target.closest(".card");
if(!c||warmed.has(c.dataset.slug))return;
warmed.add(c.dataset.slug);
new Image().src=`img/${c.dataset.slug}.jpg`;
},{passive:true});

document.addEventListener("click",e=>{
const c=e.target.closest(".card");
if(!c||!c.closest("main"))return;
if(e.target.closest(".own"))toggleOwn(c.dataset.slug);
else if(e.target.closest(".open"))openDlg(c.dataset.slug);
});

const filters=$("#filters");
filters.innerHTML=`<button type="button" class="on" data-f="all">Todos</button>`+Object.keys(FT).map(k=>`<button type="button" data-f="${k}">${FT[k]}</button>`).join("");
filters.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
if(b.dataset.f==="all")active.clear();else if(active.has(b.dataset.f))active.delete(b.dataset.f);else active.add(b.dataset.f);
filters.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x.dataset.f==="all"?active.size===0:active.has(x.dataset.f)));
applyFilters();
});

$("#sort").innerHTML=SORTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join("");
$("#sort").addEventListener("change",e=>{sort=e.target.value;render(false)});
$("#q").addEventListener("input",e=>{q=e.target.value;applyFilters()});
const seg=document.querySelectorAll(".seg button");
const syncSeg=()=>seg.forEach(b=>{const on=b.dataset.c===cons;b.setAttribute("aria-checked",on);b.classList.toggle("on",on)});
seg.forEach(b=>b.addEventListener("click",()=>{
cons=b.dataset.c;
store.set(CKEY,cons);
syncSeg();
render(false);
refreshDialog();
}));
syncSeg();

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
