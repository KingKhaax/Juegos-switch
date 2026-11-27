(()=>{
const J=()=>window.JS;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const eur=n=>n.toLocaleString("es-ES",{style:"currency",currency:"EUR"});
const up=x=>Math.ceil(x*100-1e-9)/100;
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;
const URL_NSO="https://www.nintendo.com/es-es/Nintendo-Switch-Online/Nintendo-Switch-Online-Paquete-de-expansion/Nintendo-Switch-Online-Paquete-de-expansion-Que-incluye-2060571.html";
const PRICE={base:{ind:{1:3.99,3:7.99,12:19.99},fam:{12:34.99}},exp:{ind:{12:39.99},fam:{12:69.99}}};
const CONF=new Set(["base-ind-12","base-fam-12","exp-ind-12","exp-fam-12"]);
const PLAN={
base:{n:"Nintendo Switch Online",sub:"Para jugar en línea y tener los clásicos de <mark class=\"m-or\">NES, Super NES y Game Boy</mark>.",tag:"Básica"},
exp:{n:"Nintendo Switch Online + Paquete de expansión",sub:"Todo lo de la básica y además <mark class=\"m-pu\">GameCube, Nintendo 64, GBA, Mega Drive, Virtual Boy</mark> y contenido extra de juegos.",tag:"Completa"}
};
const ico=p=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const I={
online:ico('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
chat:ico('<path d="M4 5h16v11H9l-5 4z"/>'),
music:ico('<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
retro:ico('<rect x="3" y="7" width="18" height="11" rx="3"/><path d="M8 10v5M5.5 12.5h5M16 11.5h.01M18 13.5h.01"/>'),
cloud:ico('<path d="M7 18a4 4 0 0 1-.6-7.9A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9z"/>'),
star:ico('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
disc:ico('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
dlc:ico('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>'),
up:ico('<path d="M12 20V6M6 12l6-6 6 6"/>'),
lock:ico('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
user:ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
minus:ico('<path d="M5 12h14"/>'),
plus:ico('<path d="M12 5v14M5 12h14"/>'),
gift:ico('<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M12 9v11M3 13h18M12 9C9 9 7.5 5 10 4.5S13 7 12 9zM12 9c3 0 4.5-4 2-4.5S11 7 12 9z"/>')
};
const FEAT=[
{p:"base",i:"online",c:"cy",t:"Juego en línea",d:"Partidas en línea con amigos y rivales en los juegos compatibles de Switch y Switch 2."},
{p:"base",i:"chat",c:"gr",t:"GameChat en Switch 2",d:"Chat de <mark class=\"m-gr\">voz para hasta 12 personas</mark> mientras jugáis y <mark class=\"m-cy\">pantalla compartida o vídeo para hasta 4</mark>. Con GameShare, jugáis ciertos modos para 4 aunque tus amigos no tengan el juego. <mark class=\"m-cy\">Solo en Nintendo Switch 2</mark>, solo con amigos aprobados y con verificación por SMS. Para vídeo hace falta una cámara USB-C aparte. Menores de 15 años necesitan permiso de un tutor."},
{p:"base",i:"music",c:"pk",t:"Nintendo Music",d:"App para el móvil con temas sueltos y <mark class=\"m-pk\">bandas sonoras completas</mark> de Super Mario, The Legend of Zelda y más, y listas de reproducción propias."},
{p:"base",i:"retro",c:"or",t:"NES, Super NES y Game Boy",d:"Catálogo creciente de clásicos, con partidas locales o en línea. Incluye <mark class=\"m-or\">Super Mario Bros. 3, Super Mario World y Zelda: A Link to the Past</mark>."},
{p:"base",i:"cloud",c:"sk",t:"Guardado de datos en la nube",d:"Copia de seguridad automática de tus partidas para recuperarlas si cambias o pierdes la consola. No sirve para todos los juegos."},
{p:"base",i:"star",c:"go",t:"Ventajas exclusivas",d:"Juegos de muestra, títulos exclusivos y productos solo a la venta para suscriptores, como los <mark class=\"m-go\">mandos clásicos</mark>."},
{p:"exp",i:"disc",c:"pu",t:"Nintendo GameCube",d:"Clásicos como The Wind Waker y F-ZERO GX, con partidas locales o en línea. <mark class=\"m-cy\">Solo en Switch 2</mark>."},
{p:"exp",i:"retro",c:"re",t:"Nintendo 64, Game Boy Advance y Virtual Boy",d:"Catálogos de clásicos que se desbloquean con el paquete. Virtual Boy solo se puede jugar con el Paquete de expansión."},
{p:"exp",i:"retro",c:"bl",t:"SEGA Mega Drive",d:"Clásicos como Sonic The Hedgehog 2 y Streets of Rage 2, con partidas locales o en línea."},
{p:"exp",i:"up",c:"gr",t:"Mejora a Switch 2 Edition de Zelda",d:"Paquetes de mejora de Breath of the Wild y Tears of the Kingdom <mark class=\"m-gr\">sin coste adicional</mark> mientras estés suscrito. Necesitas el juego y una Switch 2."},
{p:"exp",i:"dlc",c:"or",t:"Contenido extra descargable",d:"Mario Kart 8 Deluxe (pase de pistas extras), Animal Crossing: New Horizons (Happy Home Paradise) y Splatoon 2 (Octo Expansion) <mark class=\"m-gr\">sin coste adicional</mark>. Necesitas el juego."}
];
const COL=["#e60012","#00c3e3","#ffd96a","#ff6fae","#3ddc84","#ff9f43","#a678ff","#4d8dff"];
const S={plan:"base",type:"ind",months:12,people:2,prev:null,fx:{feat:true,dot:-1,price:true}};
let dlg=null,raf=0,downOn=null,pressing=false,later=false;S.pt=null;
const PKEY="juegos-switch-nso";
const mio=()=>{try{const o=JSON.parse(J().store.get(PKEY,"{}"));return o&&typeof o==="object"?o:{}}catch(e){return{}}};
const pago=(p,t)=>{const v=+mio()[p+"-"+t];return v>0?v:null};
const anual=(p,t)=>pago(p,t)||PRICE[p][t][12];
const precio=(p,t,m)=>m===12?anual(p,t):PRICE[p][t][m];
function setPago(p,t,v){const o=mio();if(v>0)o[p+"-"+t]=Math.round(v*100)/100;else delete o[p+"-"+t];Object.keys(o).length?J().store.set(PKEY,JSON.stringify(o)):J().store.del(PKEY)}
function setPers(n){const o=mio();o.personas=n;J().store.set(PKEY,JSON.stringify(o))}
const avail=()=>Object.keys(PRICE[S.plan][S.type]).map(Number);
function fix(){const a=avail();if(!a.includes(S.months))S.months=a[a.length-1];if(S.type==="ind")S.people=1;else if(S.people<2)S.people=2}
function calc(){
const total=precio(S.plan,S.type,S.months);
const n=S.type==="fam"?S.people:1;
const mes=up(total/S.months);
const ind12=anual(S.plan,"ind");
return{total,n,mes,pp:up(total/S.months/n),ppy:total/n*(12/S.months),ahorro:S.type==="fam"?Math.max(0,ind12*n*(S.months/12)-total):0,ind12}
}
function planCard(k){
const p=PLAN[k],m=up(PRICE[k].ind[12]/12);
return `<button type="button" class="nso-plan nso-${k}${S.plan===k?" on":""}" data-plan="${k}" aria-pressed="${S.plan===k}"><span class="nso-glow"></span><small>${p.tag}</small><b>${esc(p.n)}</b><span>${p.sub}</span><em>Desde <i>${eur(m)}</i> al mes</em>${k==="exp"?`<u class="nso-rib">Más completa</u>`:""}</button>`;
}
function featHtml(){
const fx=S.fx.feat;
const inc=S.plan==="exp"?FEAT:FEAT.filter(f=>f.p==="base");
const row=(f,locked,n)=>`<li class="nso-f c-${f.c}${locked?" lock":""}${fx?" in":""}" style="--n:${n}"><span class="nso-fi">${locked?I.lock:I[f.i]}</span><span><b>${esc(f.t)}</b><small>${f.d}</small></span></li>`;
let h=`<h4 class="nso-h">${S.plan==="exp"?"Todo lo que incluye":"Lo que incluye"}</h4><ul class="nso-fl">${inc.map((f,i)=>row(f,false,i)).join("")}</ul>`;
if(S.plan==="base")h+=`<h4 class="nso-h nso-up">Solo con el <mark class="m-go">Paquete de expansión</mark></h4><ul class="nso-fl">${FEAT.filter(f=>f.p==="exp").map((f,i)=>row(f,true,i+inc.length)).join("")}</ul>`;
return h;
}
function render(){
fix();
const c=calc(),a=avail();
const conf=CONF.has(`${S.plan}-${S.type}-${S.months}`);
const people=S.type==="fam"?`<div class="nso-row"><span class="nso-lbl">¿Cuántas personas sois?</span><div class="nso-step"><button type="button" data-p="-1" aria-label="Una persona menos"${S.people<=2?" disabled":""}>${I.minus}</button><b aria-live="polite">${S.people}</b><button type="button" data-p="1" aria-label="Una persona más"${S.people>=8?" disabled":""}>${I.plus}</button></div><div class="nso-dots" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i class="${i<S.people?"on":""}${S.fx.dot===i?" pop":""}" style="--c:${COL[i]}">${I.user}</i>`).join("")}</div><small class="nso-h">Hasta <mark class="m-cy">8 cuentas Nintendo</mark> del mismo grupo familiar.</small></div>`:"";
const dur=`<div class="nso-row"><span class="nso-lbl">Duración</span><div class="nso-chips" role="group" aria-label="Duración">${[1,3,12].map(m=>{const ok=a.includes(m);return `<button type="button" class="nso-chip${S.months===m?" on":""}" data-m="${m}"${ok?"":" disabled"} aria-pressed="${S.months===m}">${m===12?"12 meses":m+(m===1?" mes":" meses")}${ok?`<small>${eur(precio(S.plan,S.type,m))}</small>`:`<small>No se vende</small>`}</button>`}).join("")}</div>${a.length===1?`<small class="nso-h">Nintendo solo vende ${S.type==="fam"?"la suscripción familiar":"esta suscripción"} por <mark class="m-go">12 meses</mark>.</small>`:""}</div>`;
const mp=pago(S.plan,S.type),of=PRICE[S.plan][S.type][12];
const mine=`<div class="nso-row nso-mine${mp?" on":""}"><label class="nso-lbl" for="nsoPago">Lo que pagas al año</label><div class="nso-pago"><span class="nso-in"><input id="nsoPago" type="text" inputmode="decimal" autocomplete="off" placeholder="${eur(of).replace(/\s?€/,"")}" value="${mp?String(mp).replace(".",","):""}" aria-describedby="nsoPagoH"><i>€</i></span>${mp?`<button type="button" class="nso-reset" data-reset>Volver al precio oficial</button>`:""}</div><small class="nso-h" id="nsoPagoH">${mp?`Precio oficial: <s>${eur(of)}</s>. Ahorras <mark class="m-gr">${eur(Math.max(0,of-mp))}</mark> al año.`:`Si lo compras más barato en otra tienda, escribe lo que pagas por 12 meses de ${S.plan==="exp"?"Paquete de expansión":"la básica"} ${S.type==="fam"?"familiar":"individual"}. Se guarda para cada versión.`}</small></div>`;
const money=`<div class="nso-price${S.plan==="exp"?" xp":""}"><span class="nso-spark s1"></span><span class="nso-spark s2"></span><span class="nso-spark s3"></span><div class="nso-big"><small>${S.type==="fam"?"Cada persona paga al mes":"Pagas al mes"}</small><b id="nsoBig">${eur(c.pp)}</b></div><dl><div><dt>Total ${S.months===12?"del año":"de "+S.months+(S.months===1?" mes":" meses")}</dt><dd>${eur(c.total)}</dd></div>${S.type==="fam"?`<div><dt>Todo el grupo al mes</dt><dd>${eur(c.mes)}</dd></div><div><dt>Cada persona al año</dt><dd>${eur(c.ppy)}</dd></div>${c.ahorro>0.005?`<div class="ok"><dt>Ahorráis frente a suscripciones individuales</dt><dd>${eur(c.ahorro)}</dd></div>`:`<div class="warn"><dt>Con ${S.people} personas no compensa más que la individual</dt><dd></dd></div>`}`:`<div><dt>Al año equivale a</dt><dd>${eur(c.total*(12/S.months))}</dd></div>`}</dl></div>`;
dlg.innerHTML=`<div class="awin nso-win"><div class="nso-aur" aria-hidden="true"></div><div class="fhead"><h3 class="nso-title">Nintendo Switch Online</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
<p class="adesc">Precios en España con IVA y qué trae cada suscripción. Datos de nintendo.com/es-es a 25/11/2026.</p>
<div class="nso-plans">${planCard("base")}${planCard("exp")}</div>
<div class="nso-row"><span class="nso-lbl">Tipo</span><div class="nso-seg" data-on="${S.pt||S.type}" role="group" aria-label="Tipo de suscripción"><i class="nso-thumb"></i><button type="button" data-t="ind" class="${S.type==="ind"?"on":""}" aria-pressed="${S.type==="ind"}">${I.user}Individual</button><button type="button" data-t="fam" class="${S.type==="fam"?"on":""}" aria-pressed="${S.type==="fam"}">${I.online}Familiar</button></div></div>
${people}${dur}${mine}${money}
${conf?"":`<p class="nso-note">Los precios de 1 y 3 meses salen de la eShop según Eurogamer e inLobby; no aparecen en la página oficial. Compruébalos al comprar.</p>`}
<div class="nso-feat">${featHtml()}</div>
<div class="nso-trial"><span class="nso-fi">${I.gift}</span><p><b>Prueba gratuita de 7 días</b>, una por cuenta Nintendo. Si ya tienes una suscripción, tienes <mark class="m-gr">descuento</mark> para pasar al Paquete de expansión.</p></div>
<div class="cu-acts"><a class="pri nso-go" href="${URL_NSO}" target="_blank" rel="noopener">Ver en nintendo.com</a></div></div>`;
const seg=dlg.querySelector(".nso-seg");if(seg&&S.pt&&S.pt!==S.type){requestAnimationFrame(()=>requestAnimationFrame(()=>{seg.dataset.on=S.type}))}S.pt=null;
const big=dlg.querySelector("#nsoBig");
if(big){const to=c.pp,from=S.prev==null||!S.fx.price||REDUCE?to:S.prev;S.prev=to;cancelAnimationFrame(raf);if(from!==to){const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/520),e=1-Math.pow(1-k,3);big.textContent=eur(up(from+(to-from)*e));if(k<1)raf=requestAnimationFrame(step);else{big.textContent=eur(to);big.classList.add("bump");setTimeout(()=>big.classList.remove("bump"),400)}};raf=requestAnimationFrame(step)}}
S.fx={feat:false,dot:-1,price:true};
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="nsodlg";
dlg.setAttribute("aria-label","Nintendo Switch Online");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{
if((e.target===dlg&&downOn===dlg)||e.target.closest("[data-close]")){dlg.close();return}
const pl=e.target.closest("[data-plan]");if(pl){if(S.plan!==pl.dataset.plan)S.fx.feat=true;S.plan=pl.dataset.plan;render();return}
const t=e.target.closest("button[data-t]");if(t){S.pt=S.type;S.type=t.dataset.t;render();return}
const m=e.target.closest("[data-m]");if(m&&!m.disabled){S.months=+m.dataset.m;render();return}
if(e.target.closest("[data-reset]")){setPago(S.plan,S.type,0);render();return}
const p=e.target.closest("[data-p]");if(p&&!p.disabled){const d=+p.dataset.p;S.people=Math.max(2,Math.min(8,S.people+d));if(d>0)S.fx.dot=S.people-1;setPers(S.people);render()}
});
dlg.addEventListener("change",e=>{
if(e.target.id!=="nsoPago")return;
const raw=e.target.value.trim().replace(/[€\s]/g,"");
const v=raw?Number(raw.includes(",")?raw.replace(/\./g,"").replace(",","."):raw):0;
if(raw&&!(v>0&&v<1000)){e.target.setCustomValidity("Escribe un precio, por ejemplo 15,99");e.target.reportValidity();return}
e.target.setCustomValidity("");setPago(S.plan,S.type,v);S.months=12;if(pressing)later=true;else render();
});
dlg.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="nsoPago"){e.preventDefault();e.target.blur()}});
dlg.addEventListener("pointerdown",e=>{downOn=e.target;pressing=true});
addEventListener("pointerup",()=>{if(!pressing)return;pressing=false;if(later){later=false;setTimeout(()=>{if(dlg.open)render()},0)}});
addEventListener("pointercancel",()=>{pressing=false;if(later){later=false;render()}});
dlg.addEventListener("pointermove",e=>{
const c=e.target.closest(".nso-plan");if(!c||REDUCE)return;
const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
c.style.setProperty("--mx",(x*100)+"%");c.style.setProperty("--my",(y*100)+"%");
c.style.setProperty("--rx",((.5-y)*7)+"deg");c.style.setProperty("--ry",((x-.5)*9)+"deg");
});
dlg.addEventListener("pointerout",e=>{const c=e.target.closest&&e.target.closest(".nso-plan");if(c&&!c.contains(e.relatedTarget)){c.style.removeProperty("--rx");c.style.removeProperty("--ry")}});
}
function open(){ensure();{const q=+mio().personas;if(q>=2&&q<=8)S.people=q}S.fx={feat:true,dot:-1,price:false};S.prev=null;render();if(!dlg.open)dlg.showModal()}
const nav=document.querySelector(".apartados");
const b=document.createElement("button");
b.type="button";b.id="bnso";b.className="ap";b.textContent="Nintendo Switch Online";
if(nav)nav.insertBefore(b,document.getElementById("bset"));
b.addEventListener("click",open);
})();
