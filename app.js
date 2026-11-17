(()=>{
const T={sp:"Singleplayer",cl:"Coop local",co:"Coop online",ml:"Multi local",mo:"Multi online"};
const FT={sp:"Singleplayer",cl:"Cooperativo local",co:"Cooperativo online",ml:"Multijugador local",mo:"Multijugador online"};
const L={s1:"Switch 1 · compatible con Switch 2",s2e:"Switch 1 + Switch 2 Edition",upd:"Switch 1 + actualización gratuita Switch 2",s2:"Solo Switch 2"};
const SORTS=[["mine","Mi orden"],["meta-d","Crítica (Metascore): mejor primero"],["meta-a","Crítica (Metascore): peor primero"],["size-a","Tamaño: menor primero"],["size-d","Tamaño: mayor primero"],["hours-a","Historia: más corta"],["hours-d","Historia: más larga"],["price-a","Precio: más barato"],["price-d","Precio: más caro"]];
const SD=[32,64,128,256,400,512,1024,2048];
const INT=[[32,"32 GB (Switch / Lite)"],[64,"64 GB (Switch OLED)"],[256,"256 GB (Switch 2)"]];
const IFACT=.85;
const SFACT=.93;
const KEY="juegos-switch-tengo";
const CKEY="juegos-switch-consola";
const IKEY="juegos-switch-interna";
const SKEY="juegos-switch-sd";
const D=window.DETAILS||{};
const GAMES=window.GAMES;
const bySlug=Object.fromEntries(GAMES.map(g=>[g.slug,g]));
const $=s=>document.querySelector(s);
const SAGAS=[["pokemon","Pokémon"],["zelda","Zelda"],["mario","Mario"],["dk","Donkey Kong"],["smash","Super Smash Bros."],["ac","Animal Crossing"]];
const GENRES=[...new Set(window.GAMES.flatMap(g=>((window.DETAILS||{})[g.slug]||{}).genres||[]))].sort((a,b)=>a.localeCompare(b,"es"));
const fsets={mode:new Set(),saga:new Set(),genre:new Set()};
const active=fsets.mode;
let q="";
let sort="mine";
let moved=null;
const store={
get(k,f){try{const v=localStorage.getItem(k);return v===null?f:v}catch(e){return f}},
set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
let own=(()=>{try{const v=JSON.parse(store.get(KEY,"[]"));return Array.isArray(v)?v.filter(s=>bySlug[s]):[]}catch(e){return[]}})();
const PKEY="juegos-switch-pagado";
let paid=(()=>{try{const v=JSON.parse(store.get(PKEY,"{}"));return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}catch(e){return{}}})();
const savePaid=()=>store.set(PKEY,JSON.stringify(paid));
const isOwn=s=>own.includes(s);
let cons=store.get(CKEY,"2")==="1"?"1":"2";
let internal=parseInt(store.get(IKEY,""),10)||0;
let sdcard=parseInt(store.get(SKEY,"0"),10)||0;
let lastW=[];
let lastH=[];
const internalGB=()=>internal||(cons==="1"?32:256);
const sdLabel=n=>n===0?"Sin tarjeta":n>=1024?`${n/1024} TB`:`${n} GB`;
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
const price=e?num(e.price):null;
const cost=isOwn(g.slug)&&paid[g.slug]!=null?paid[g.slug]:price;
return{d,eds,std,s2,e,playable,mb:(e&&e.sizeMB)||0,price,cost,hours:num(d.hours&&d.hours.main),meta:d.meta||null};
}

const KEYS={meta:i=>i.meta,size:i=>i.playable&&i.mb?i.mb:null,hours:i=>i.hours,price:i=>i.playable?i.cost:null};
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
list.forEach(g=>{const i=info(g);if(!i.playable)return;mb+=i.mb;price+=i.cost||0});
return{mb,price};
}
const sdFor=g=>SD.find(s=>s*SFACT>=g)||SD[SD.length-1];

function renderSummary(want,have){
lastW=want;lastH=have;
const a=totals(want),b=totals(have);
const all=(a.mb+b.mb)/1024;
const ig=internalGB()*IFACT;
const need=all<=ig?0:sdFor(all-ig);
$("#resumen").innerHTML=`<div class="tile"><small>Los que quiero</small><b>${want.length} juegos</b><span>${gb(a.mb)}</span><span>${eur(a.price)} por comprar</span></div><div class="tile"><small>Los que ya tengo</small><b>${have.length} juegos</b><span>${gb(b.mb)}</span><span>${eur(b.price)} gastados</span></div><div class="tile sd"><small>Tarjeta SD que necesito</small><b>${need?sdLabel(need):"Ninguna"}</b><span>Con todo: ${nf(all,1)} GB</span><span>Memoria interna: ${internalGB()} GB</span></div>`;
renderStorage(a,b,all,ig,need);
}

function renderStorage(a,b,all,ig,need){
const cap=ig+sdcard*SFACT;
const haveG=b.mb/1024,wantG=a.mb/1024;
const N=20;
const hf=cap>0?haveG/cap:0,wf=cap>0?wantG/cap:0;
let hb=hf>0?Math.max(1,Math.round(hf*N)):0;
hb=Math.min(N,hb);
let wb=wf>0?Math.max(1,Math.round((hf+wf)*N)-Math.round(hf*N)):0;
wb=Math.min(N-hb,wb);
const bar=$("#sbar");
if(!bar.children.length){
bar.innerHTML="<i></i>".repeat(N);
[...bar.children].forEach((c,i)=>c.style.setProperty("--d",i*45));
}
[...bar.children].forEach((c,i)=>{
const s=i<hb?1:i<hb+wb?2:0;
if(c._s!==s){c._s=s;c.className=s===1?"c1":s===2?"c2":""}
});
bar.classList.toggle("over",hf+wf>1.0001);
bar.setAttribute("aria-label",`Ocupado ${nf((hf+wf)*100,0)} % de la capacidad`);
const free=cap-all;
$("#leg").innerHTML=`<span><i class="k have"></i>Tengo ${nf(haveG,1)} GB</span><span><i class="k want"></i>Quiero ${nf(wantG,1)} GB</span><span><i class="k free"></i>Capacidad ${nf(cap,1)} GB</span>`;
$("#snote").className=free<0?"snote bad":"snote ok";
$("#snote").textContent=free<0?`Con todo instalado me faltan ${nf(-free,1)} GB. Necesito una tarjeta SD de ${sdLabel(sdFor(all-ig))} o más.`:`Con todo instalado me sobran ${nf(free,1)} GB.`;
}

function initStorage(){
const si=$("#internal"),ss=$("#sdcard");
si.innerHTML=INT.map(([v,l])=>`<option value="${v}">${l}</option>`).join("");
ss.innerHTML=[0,...SD].map(v=>`<option value="${v}">${sdLabel(v)}</option>`).join("");
const sync=()=>{si.value=String(internalGB());ss.value=String(sdcard)};
sync();
si.addEventListener("change",()=>{internal=parseInt(si.value,10);store.set(IKEY,String(internal));renderSummary(lastW,lastH)});
ss.addEventListener("change",()=>{sdcard=parseInt(ss.value,10);store.set(SKEY,String(sdcard));renderSummary(lastW,lastH)});
return sync;
}
let syncStorage=()=>{};

function cardHtml(g,n,owned){
const i=info(g);
const meta=i.meta?`<span class="meta ${metaCls(i.meta)}" title="Metascore ${i.meta}">${i.meta}</span>`:"";
const pr=i.cost!=null?(owned&&i.price!=null&&i.cost!==i.price?`<s>${eur(i.price)}</s> ${eur(i.cost)}`:eur(i.cost)):"";
const facts=i.playable?`<span class="facts"><b>${i.mb?gb(i.mb):"—"}</b>${pr?` · ${pr}`:""}${sort.startsWith("hours")&&i.hours?` · ${nf(i.hours,1)} h`:""}</span>`:`<span class="facts bad">Solo Switch 2</span>`;
return `<article class="card${owned?" owned":""}" data-slug="${g.slug}" data-k="${g.k}" data-tags="${g.m.join(" ")}" data-name="${norm(g.title)}" data-saga="${g.s}" data-genres="${(i.d.genres||[]).join("|")}"><button class="open" type="button" aria-label="Ver la ficha de ${g.title}"><span class="media"><img class="cover" src="img/t/${g.slug}.jpg" width="240" height="240" decoding="async" loading="${!owned&&n<=6?"eager":"lazy"}" alt=""><span class="num">${owned?"✓":n}</span>${meta}${cornerOf(g.k)}</span><span class="info"><span class="name">${g.title}</span>${facts}<span class="modes">${g.m.map(m=>`<i>${T[m]}</i>`).join("")}</span></span></button>${owned?`<button class="pay" type="button">Cambiar precio</button>`:""}<button class="own" type="button" aria-pressed="${owned}">${owned?"Quitar de «ya lo tengo»":"Ya lo tengo"}</button></article>`;
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
c.hidden=![...fsets.mode].every(f=>t.includes(f))
||(fsets.saga.size>0&&!fsets.saga.has(c.dataset.saga))
||(fsets.genre.size>0&&!c.dataset.genres.split("|").some(x=>fsets.genre.has(x)))
||(nq&&!c.dataset.name.includes(nq));
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

const pd=$("#paydlg");
function finishPay(v){
const cb=pd._cb;
pd._cb=null;
if(pd.open)pd.close();
if(cb)cb(v);
}
function askPrice(slug,editing,cb){
const g=bySlug[slug],i=info(g);
$("#ptitle").textContent=g.title;
$("#pinfo").textContent=i.price!=null?`PVPR en Switch ${cons}: ${eur(i.price)}`:"La web no tiene PVPR de este juego";
$("#perr").textContent="";
$("#payin").value=editing&&paid[slug]!=null?String(paid[slug]):i.price!=null?String(i.price):"";
pd._cb=cb;
pd.showModal();
$("#payin").select();
}
$("#payform").addEventListener("submit",e=>{
e.preventDefault();
const t=$("#payin").value.replace(",",".").trim();
if(t===""){finishPay(null);return}
const n=parseFloat(t);
if(!isFinite(n)||n<0){$("#perr").textContent="Escribe un precio válido, por ejemplo 19,99.";return}
finishPay(Math.round(n*100)/100);
});
$("#payuse").addEventListener("click",()=>finishPay(null));
$("#paycancel").addEventListener("click",()=>finishPay(undefined));
pd.addEventListener("cancel",e=>{e.preventDefault();finishPay(undefined)});
pd.addEventListener("click",e=>{if(e.target===pd)finishPay(undefined)});

function commitOwn(slug,added){
const g=bySlug[slug];
moved=slug;
store.set(KEY,JSON.stringify(own));
savePaid();
render(false);
$("#live").textContent=added?`${g.title} marcado como ya lo tengo`:`${g.title} vuelve a la lista de los que quiero`;
refreshDialog();
}
function toggleOwn(slug){
if(isOwn(slug)){
own.splice(own.indexOf(slug),1);
delete paid[slug];
commitOwn(slug,false);
return;
}
askPrice(slug,false,p=>{
if(p===undefined)return;
own.push(slug);
if(p!=null)paid[slug]=p;
commitOwn(slug,true);
});
}
function editPrice(slug){
askPrice(slug,true,p=>{
if(p===undefined)return;
if(p===null)delete paid[slug];else paid[slug]=p;
savePaid();
render(false);
refreshDialog();
});
}

const svg={
tv:'<svg viewBox="0 0 48 32" width="42" height="28" aria-hidden="true"><rect x="8" y="2" width="38" height="22" rx="3" fill="#0d0f14" stroke="currentColor" stroke-width="2"/><rect x="22" y="26" width="10" height="3" rx="1" fill="currentColor"/><rect x="2" y="21" width="11" height="8" rx="2" fill="#4a4f5c"/></svg>',
hh:'<svg viewBox="0 0 48 24" width="46" height="23" aria-hidden="true"><rect x="1" y="2" width="46" height="20" rx="6" fill="#1a1c22"/><rect x="1" y="2" width="9" height="20" rx="4" fill="#00c3e3"/><rect x="38" y="2" width="9" height="20" rx="4" fill="#ff4554"/><rect x="11" y="4" width="26" height="16" rx="2" fill="#07080b"/></svg>',
card:'<svg class="ic-card" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M5 1.5h7.6L15.5 4.4V18.5h-10.5z" fill="#fff"/><rect x="7" y="4.5" width="6.5" height="6" rx="1" fill="#e60012" opacity=".75"/><rect x="7" y="13.5" width="1.5" height="3.6" rx=".4" fill="#c9a24a"/><rect x="9.3" y="13.5" width="1.5" height="3.6" rx=".4" fill="#c9a24a"/><rect x="11.6" y="13.5" width="1.5" height="3.6" rx=".4" fill="#c9a24a"/></svg>',
ok:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
user:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="6.5" r="3.5" fill="currentColor"/><path d="M3 18c0-4 3-6 7-6s7 2 7 6z" fill="currentColor"/></svg>',
globe:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 10h16M10 2c3 3 3 13 0 16M10 2c-3 3-3 13 0 16" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
};

const BADGE={
"Sin parchear":"El juego funciona en Switch 2 tal cual salió en Switch 1, sin ninguna actualización específica para Switch 2 (sin el parche). Los datos de abajo son los de esa versión original.",
"Actualización gratuita":"La desarrolladora ofrece un parche gratuito que mejora el juego en Switch 2 (más fps, más resolución o menos tiempo de carga). Se descarga sin coste con tu copia de Switch 1.",
"Switch 2 Edition":"Versión mejorada pensada para Switch 2. Suele ser una compra aparte (o una ampliación si ya tienes el juego) y trae mejoras técnicas y de contenido."
};

const NOTE={
s2e:["Switch 2 Edition","Versión mejorada pensada para Switch 2, con mejoras técnicas (más resolución, más fps o menos tiempo de carga) y a veces de contenido. Suele ser una compra aparte, o una ampliación si ya tienes el juego de Switch 1."],
upd:["Actualización gratuita","La desarrolladora ofrece un parche gratuito que mejora el juego en Switch 2, sin coste con tu copia de Switch 1."],
s2:["Solo Switch 2","Juego hecho solo para Switch 2: no funciona en la Switch original."]
};

function playVideo(btn){
const w=document.createElement("div");
w.className="vwrap";
w.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${btn.dataset.video}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Vídeo de presentación" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
btn.replaceWith(w);
}

function fichaHtml(g){
const i=info(g),d=i.d;
const owned=own.includes(g.slug);
const e=i.e||i.std||{};
const other=cons==="2"?i.std:i.s2;
const otherLbl=cons==="2"?"Switch 1":"Switch 2 Edition";
const hrs=[["main","Historia principal"],["plus","Principal + Secundarias"],["comp","Completista"],["all","Duración de jugador promedio"]].filter(([k])=>d.hours&&d.hours[k]);
const maxH=Math.max(1,...hrs.map(([k])=>num(d.hours[k])||0));
const pct=i.mb?Math.min(100,i.mb/1024/128*100):0;
const col=(t,ic,pairs)=>`<div class="dev"><div class="dt">${ic}<span>${t}</span></div>${pairs.map(([a,b])=>`<div class="pr"><small>${a}</small><b>${svg.ok}${b}</b></div>`).join("")}</div>`;
const perf=d.perf?`<section class="panel perf"><h3>Rendimiento en Nintendo Switch 2</h3>${d.perf.badge?`<div class="pbrow"><span class="pbadge">${d.perf.badge}</span>${BADGE[d.perf.badge]?`<p class="pbtxt">${BADGE[d.perf.badge]}</p>`:""}</div>`:""}<div class="devs">${col("En el televisor",svg.tv,d.perf.docked)}${col("En portátil",svg.hh,d.perf.handheld)}</div></section>`:"";
const NT=NOTE[g.k];
const edLine=i.eds.length>1?`<span class="cied">En este juego: ${i.eds.map(x=>`${x.name} ${x.sizeMB?gb(x.sizeMB):"—"}${x.price?" · "+x.price.replace("€"," €"):""}`).join(" · ")}.</span>`:"";
const cinfo=NT&&!(d.perf&&d.perf.badge===NT[0])?`<div class="cinfo"><span class="pbadge">${NT[0]}</span><p class="pbtxt">${NT[1]} ${edLine}</p></div>`:"";
const players=[["Jugadores locales",d.local,svg.user],["Jugadores online",d.online,svg.globe]].filter(x=>x[1]).map(([l,v,ic])=>`<div class="pl">${ic}<div><small>${l}</small><b>${v}</b></div></div>`).join("");
return `<div class="sheet">
<form method="dialog"><button class="x" aria-label="Cerrar la ficha">×</button></form>
<button class="nav prev" type="button" aria-label="Juego anterior">‹</button><button class="nav next" type="button" aria-label="Juego siguiente">›</button>
<div class="scroll">
<div class="hero"><img src="img/hd/${g.slug}.jpg" width="1660" height="832" decoding="async" alt="Carcasa de ${g.title}"><i class="sheen"></i>${cornerOf(g.k)}
<div class="htitle"><h2>${g.title}</h2><p>${[d.dev,d.date].filter(Boolean).join(" · ")}</p></div>
${i.meta?`<div class="ring ${metaCls(i.meta)}" style="--v:${i.meta}" title="Metascore"><span data-to="${i.meta}" data-dec="0">${i.meta}</span></div>`:""}</div>
<div class="body">
<div class="chipline"><span class="chip k">${L[g.k]}</span>${g.m.map(m=>`<span class="chip">${FT[m]}</span>`).join("")}</div>
${cinfo}
<div class="actions"><button class="own big" type="button" data-slug="${g.slug}" aria-pressed="${owned}"><span class="tick">${svg.card}${svg.ok.replace("<svg ",'<svg class="ic-ok" ')}</span><span class="otxt">${owned?"Lo tengo · quitar":"Ya lo tengo"}</span></button>${i.cost!=null&&i.playable?(owned?`<button class="price paidtag" type="button" data-pay="1"><small>${paid[g.slug]!=null?"Pagado":"PVPR"}</small><b>${eur(i.cost)}</b>${paid[g.slug]!=null&&i.price!=null&&i.price!==i.cost?`<s>PVPR ${eur(i.price)}</s>`:""}<em>cambiar precio</em></button>`:`<div class="price"><small>PVPR ${e.name||""}</small><b>${eur(i.price)}</b></div>`):""}</div>
${d.summary?`<section class="panel desc"><h3>Resumen</h3><p>${d.summary}</p></section>`:""}
<div class="grid2">
<section class="panel size"><h3>Tamaño en Switch ${cons==="1"?"1":"2"}</h3>${i.playable?`<b class="big" data-to="${i.mb/1024}" data-dec="1" data-suf=" GB">${i.mb?gb(i.mb):"—"}</b><div class="sdbar" title="Porcentaje de una tarjeta de 128 GB"><i style="--w:${pct.toFixed(1)}%"></i></div><small class="note">Ocupa el ${nf(pct,1)} % de una tarjeta de 128 GB${e.name?` · edición ${e.name}`:""}</small>`:`<p class="warn">Este juego solo funciona en Switch 2.</p>`}
${other&&other.sizeMB?`<div class="alt"><span>${otherLbl}</span><b>${gb(other.sizeMB)}</b>${other.price?`<em>${other.price.replace("€"," €")}</em>`:""}</div>`:""}
${d.updateMB?`<div class="alt"><span>Actualización</span><b>${gb(d.updateMB)}</b></div>`:""}</section>
<section class="panel hours"><h3>Horas para completarlo</h3>${hrs.map(([k,l],n)=>`<div class="hr h-${k}"><div><small>${l}</small><b>${d.hours[k].replace("Horas","h")}</b></div><div class="bar"><i style="--w:${((num(d.hours[k])||0)/maxH*100).toFixed(1)}%;--d:${n*.12}s"></i></div></div>`).join("")}<p class="hnote"><b>Duración de jugador promedio</b> es la media de los tiempos de todos los jugadores, sin separar por forma de jugar.</p></section>
</div>
<section class="panel genre"><h3>Género y jugadores</h3><div class="chips">${(d.genres||[]).map(x=>`<span class="chip g">${x}</span>`).join("")}</div><div class="pls">${players}</div><div class="who"><div><small>Desarrollador</small><b>${d.dev||"—"}</b></div><div><small>Distribuidor</small><b>${d.dist||"—"}</b></div></div></section>
${perf}
${d.video?`<section class="panel vid"><h3>Vídeo de presentación</h3><button type="button" class="vbox" data-video="${d.video}" aria-label="Reproducir el vídeo de presentación de ${g.title}"><img src="https://i.ytimg.com/vi/${d.video}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${d.video}/hqdefault.jpg'" alt="" width="1280" height="720" loading="lazy" decoding="async"><span class="play"><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span></button></section>`:""}
<p class="src">Datos y vídeo de nswitchex.com</p>
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
if(e.target.closest("[data-pay]")){editPrice(dlg.dataset.slug);return}
const vb=e.target.closest("[data-video]");
if(vb){playVideo(vb);return}
if(e.target.closest(".prev"))step(-1);
else if(e.target.closest(".next"))step(1);
});
dlg.addEventListener("close",()=>{
dlg.innerHTML="";
if(bySlug[location.hash.slice(1)])history.replaceState(null,"",location.pathname+location.search);
});
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
new Image().src=`img/hd/${c.dataset.slug}.jpg`;
},{passive:true});

document.addEventListener("click",e=>{
const c=e.target.closest(".card");
if(!c||!c.closest("main"))return;
if(e.target.closest(".own"))toggleOwn(c.dataset.slug);
else if(e.target.closest(".pay"))editPrice(c.dataset.slug);
else if(e.target.closest(".open"))openDlg(c.dataset.slug);
});

const FCAT={
mode:{t:"Modo de juego",d:"Tienen que cumplirse todos los modos que marques.",opts:()=>Object.keys(FT).map(k=>[k,FT[k]]),n:v=>GAMES.filter(g=>g.m.includes(v)).length},
saga:{t:"Saga",d:"Basta con que el juego sea de una de las sagas que marques.",opts:()=>SAGAS,n:v=>GAMES.filter(g=>g.s===v).length},
genre:{t:"Género",d:"Basta con que el juego tenga uno de los géneros que marques.",opts:()=>GENRES.map(x=>[x,x]),n:v=>GAMES.filter(g=>((D[g.slug]||{}).genres||[]).includes(v)).length}
};
const fd=$("#fdlg");
const labelOf=(cat,v)=>{const o=FCAT[cat].opts().find(x=>x[0]===v);return o?o[1]:v};
function refreshFbar(){
let total=0;
document.querySelectorAll(".fb").forEach(b=>{
const n=fsets[b.dataset.cat].size;
total+=n;
const e=b.querySelector("b");
e.textContent=n||"";
e.hidden=!n;
b.classList.toggle("on",n>0);
});
$("#fclear").hidden=total===0;
$("#fchips").innerHTML=Object.keys(fsets).flatMap(cat=>[...fsets[cat]].map(v=>`<button type="button" class="fchip" data-cat="${cat}" data-v="${v}" aria-label="Quitar el filtro ${labelOf(cat,v)}">${labelOf(cat,v)}<span aria-hidden="true">×</span></button>`)).join("");
}
function fCount(){
const n=document.querySelectorAll("main .card:not([hidden])").length;
const e=$("#fcount");
if(e)e.textContent=n===1?"Ver 1 juego":`Ver ${n} juegos`;
}
function renderF(cat){
const c=FCAT[cat],set=fsets[cat];
fd.dataset.cat=cat;
fd.innerHTML=`<div class="fwin"><div class="fhead"><h3>${c.t}</h3><button class="x2" type="button" data-close aria-label="Cerrar la ventana">×</button></div><p class="fdesc">${c.d}</p><div class="fopts">${c.opts().map(([v,l])=>`<button type="button" class="fo${set.has(v)?" on":""}" data-v="${v}" aria-pressed="${set.has(v)}"><span>${l}</span><em>${c.n(v)}</em></button>`).join("")}</div><div class="ffoot"><button type="button" class="fclr" data-clr>Quitar de esta categoría</button><button type="button" class="fok" data-close id="fcount"></button></div></div>`;
fCount();
}
function openF(cat){renderF(cat);if(!fd.open)fd.showModal()}
document.querySelectorAll(".fb").forEach(b=>b.addEventListener("click",()=>openF(b.dataset.cat)));
fd.addEventListener("click",e=>{
if(e.target===fd){fd.close();return}
if(e.target.closest("[data-close]")){fd.close();return}
const cat=fd.dataset.cat;
if(e.target.closest("[data-clr]")){fsets[cat].clear();renderF(cat);applyFilters();refreshFbar();fCount();return}
const o=e.target.closest(".fo");
if(!o)return;
const v=o.dataset.v,set=fsets[cat];
if(set.has(v))set.delete(v);else set.add(v);
o.classList.toggle("on",set.has(v));
o.setAttribute("aria-pressed",set.has(v));
applyFilters();refreshFbar();fCount();
});
$("#fclear").addEventListener("click",()=>{Object.values(fsets).forEach(s=>s.clear());applyFilters();refreshFbar()});
$("#fchips").addEventListener("click",e=>{
const c=e.target.closest(".fchip");
if(!c)return;
fsets[c.dataset.cat].delete(c.dataset.v);
applyFilters();refreshFbar();
});
refreshFbar();
$("#sort").innerHTML=SORTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join("");
$("#sort").addEventListener("change",e=>{sort=e.target.value;render(false)});
$("#q").addEventListener("input",e=>{q=e.target.value;applyFilters()});
const seg=document.querySelectorAll(".seg button");
const syncSeg=()=>seg.forEach(b=>{const on=b.dataset.c===cons;b.setAttribute("aria-checked",on);b.classList.toggle("on",on)});
seg.forEach(b=>b.addEventListener("click",()=>{
cons=b.dataset.c;
store.set(CKEY,cons);
syncSeg();
syncStorage();
render(false);
refreshDialog();
}));
syncSeg();
syncStorage=initStorage();

render(true);
let gp=null,gx=0,gy=0,gc=null;
document.addEventListener("pointermove",e=>{
const c=e.target.closest&&e.target.closest(".card");
if(!c)return;
gc=c;gx=e.clientX;gy=e.clientY;
if(gp)return;
gp=requestAnimationFrame(()=>{
gp=null;
const r=gc.getBoundingClientRect();
gc.style.setProperty("--mx",(gx-r.left)+"px");
gc.style.setProperty("--my",(gy-r.top)+"px");
});
},{passive:true});
const prog=$("#prog");
let sp=false;
addEventListener("scroll",()=>{
if(sp)return;
sp=true;
requestAnimationFrame(()=>{
sp=false;
const m=document.documentElement.scrollHeight-innerHeight;
prog.style.transform=`scaleX(${m>0?scrollY/m:0})`;
});
},{passive:true});
const syncLock=()=>document.documentElement.classList.toggle("lock",!!document.querySelector("dialog[open]"));
document.querySelectorAll("dialog").forEach(d=>new MutationObserver(syncLock).observe(d,{attributes:true,attributeFilter:["open"]}));
const fromHash=()=>{const s=location.hash.slice(1);if(bySlug[s])openDlg(s);else if(/^filtros-(mode|saga|genre)$/.test(s))openF(s.slice(8))};
addEventListener("hashchange",fromHash);
fromHash();
})();
