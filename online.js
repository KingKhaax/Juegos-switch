(()=>{
const J=()=>window.JS;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const eur=n=>n.toLocaleString("es-ES",{style:"currency",currency:"EUR"});
const URL_NSO="https://www.nintendo.com/es-es/Nintendo-Switch-Online/Nintendo-Switch-Online-Paquete-de-expansion/Nintendo-Switch-Online-Paquete-de-expansion-Que-incluye-2060571.html";
const PRICE={base:{ind:{1:3.99,3:7.99,12:19.99},fam:{12:34.99}},exp:{ind:{12:39.99},fam:{12:69.99}}};
const CONF=new Set(["base-ind-12","base-fam-12","exp-ind-12","exp-fam-12"]);
const PLAN={
base:{n:"Nintendo Switch Online",sub:"Para jugar en línea y tener los clásicos de NES, Super NES y Game Boy.",tag:"Básica"},
exp:{n:"Nintendo Switch Online + Paquete de expansión",sub:"Todo lo de la básica y además GameCube, Nintendo 64, GBA, Mega Drive, Virtual Boy y contenido extra de juegos.",tag:"Completa"}
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
check:ico('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
user:ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
minus:ico('<path d="M5 12h14"/>'),
plus:ico('<path d="M12 5v14M5 12h14"/>')
};
const FEAT=[
{p:"base",i:"online",t:"Juego en línea",d:"Partidas en línea con amigos y rivales en los juegos compatibles de Switch y Switch 2."},
{p:"base",i:"chat",t:"GameChat en Switch 2",d:"Charla con tus amigos mientras jugáis, solo en Nintendo Switch 2."},
{p:"base",i:"music",t:"Nintendo Music",d:"Aplicación para el móvil con bandas sonoras de juegos Nintendo."},
{p:"base",i:"retro",t:"NES, Super NES y Game Boy",d:"Catálogo creciente de clásicos con partidas locales o en línea. Incluye Super Mario World y Zelda: A Link to the Past."},
{p:"base",i:"cloud",t:"Guardado de datos en la nube",d:"Copia de seguridad de tus partidas para recuperarlas si cambias o pierdes la consola. No vale para todos los juegos."},
{p:"base",i:"star",t:"Ventajas exclusivas",d:"Juegos de muestra, títulos y productos solo para suscriptores."},
{p:"exp",i:"disc",t:"Nintendo GameCube",d:"Clásicos como The Wind Waker y F-ZERO GX. Solo en Switch 2."},
{p:"exp",i:"retro",t:"Nintendo 64, Game Boy Advance y Virtual Boy",d:"Los tres catálogos de clásicos suben a la vez con el paquete."},
{p:"exp",i:"retro",t:"SEGA Mega Drive",d:"Clásicos como Sonic The Hedgehog 2 y Streets of Rage 2."},
{p:"exp",i:"up",t:"Mejora a Switch 2 Edition de Zelda",d:"Paquetes gratis de Breath of the Wild y Tears of the Kingdom mientras estés suscrito. Necesitas el juego."},
{p:"exp",i:"dlc",t:"Contenido extra descargable",d:"Mario Kart 8 Deluxe (pase de pistas extras), Animal Crossing: New Horizons (Happy Home Paradise) y Splatoon 2 (Octo Expansion). Necesitas el juego."}
];
const S={plan:"base",type:"ind",months:12,people:2};
let dlg=null;
const avail=()=>Object.keys(PRICE[S.plan][S.type]).map(Number);
function fix(){const a=avail();if(!a.includes(S.months))S.months=a[a.length-1];if(S.type==="ind")S.people=1;else if(S.people<2)S.people=2}
function calc(){
const total=PRICE[S.plan][S.type][S.months];
const n=S.type==="fam"?S.people:1;
const up=x=>Math.ceil(x*100-1e-9)/100;const mes=up(total/S.months);
const ind12=PRICE[S.plan].ind[12];
return{total,n,mes,pp:up(total/S.months/n),ppy:total/n*(12/S.months),ahorro:S.type==="fam"?Math.max(0,ind12*n*(S.months/12)-total):0,ind12}
}
function planCard(k){
const p=PLAN[k];
const m=Math.ceil(PRICE[k].ind[12]/12*100-1e-9)/100;
return `<button type="button" class="nso-plan${S.plan===k?" on":""}" data-plan="${k}" aria-pressed="${S.plan===k}"><small>${p.tag}</small><b>${esc(p.n)}</b><span>${esc(p.sub)}</span><em>Desde ${eur(m)} al mes</em></button>`;
}
function featHtml(){
const inc=S.plan==="exp"?FEAT:FEAT.filter(f=>f.p==="base");
const row=(f,locked)=>`<li class="nso-f${locked?" lock":""}"><span class="nso-fi">${locked?I.lock:I[f.i]}</span><span><b>${esc(f.t)}</b><small>${esc(f.d)}</small></span></li>`;
let h=`<h4 class="nso-h">${S.plan==="exp"?"Todo lo que incluye":"Lo que incluye"}</h4><ul class="nso-fl">${inc.map(f=>row(f,false)).join("")}</ul>`;
if(S.plan==="base")h+=`<h4 class="nso-h nso-h2">Solo con el Paquete de expansión</h4><ul class="nso-fl">${FEAT.filter(f=>f.p==="exp").map(f=>row(f,true)).join("")}</ul>`;
return h;
}
function render(){
fix();
const c=calc(),a=avail();
const conf=CONF.has(`${S.plan}-${S.type}-${S.months}`);
const people=S.type==="fam"?`<div class="nso-row"><span class="nso-lbl">¿Cuántas personas sois?</span><div class="nso-step"><button type="button" data-p="-1" aria-label="Una persona menos"${S.people<=2?" disabled":""}>${I.minus}</button><b aria-live="polite">${S.people}</b><button type="button" data-p="1" aria-label="Una persona más"${S.people>=8?" disabled":""}>${I.plus}</button></div><div class="nso-dots" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i class="${i<S.people?"on":""}">${I.user}</i>`).join("")}</div><small class="nso-h">Hasta 8 cuentas Nintendo del mismo grupo familiar.</small></div>`:"";
const dur=`<div class="nso-row"><span class="nso-lbl">Duración</span><div class="nso-chips" role="group" aria-label="Duración">${[1,3,12].map(m=>{const ok=a.includes(m);return `<button type="button" class="nso-chip${S.months===m?" on":""}" data-m="${m}"${ok?"":" disabled"} aria-pressed="${S.months===m}">${m===12?"12 meses":m+(m===1?" mes":" meses")}${ok?`<small>${eur(PRICE[S.plan][S.type][m])}</small>`:`<small>No se vende</small>`}</button>`}).join("")}</div>${a.length===1?`<small class="nso-h">Nintendo solo vende ${S.type==="fam"?"la suscripción familiar":"esta suscripción"} por 12 meses.</small>`:""}</div>`;
const money=`<div class="nso-price"><div class="nso-big"><small>${S.type==="fam"?"Cada persona paga al mes":"Pagas al mes"}</small><b>${eur(c.pp)}</b></div><dl><div><dt>Total ${S.months===12?"del año":"de "+S.months+(S.months===1?" mes":" meses")}</dt><dd>${eur(c.total)}</dd></div>${S.type==="fam"?`<div><dt>Todo el grupo al mes</dt><dd>${eur(c.mes)}</dd></div><div><dt>Cada persona al año</dt><dd>${eur(c.ppy)}</dd></div>${c.ahorro>0.005?`<div class="ok"><dt>Ahorráis frente a suscripciones individuales</dt><dd>${eur(c.ahorro)}</dd></div>`:`<div class="warn"><dt>Con ${S.people} personas no compensa más que la individual</dt><dd></dd></div>`}`:`<div><dt>Al año equivale a</dt><dd>${eur(c.total*(12/S.months))}</dd></div>`}</dl></div>`;
dlg.innerHTML=`<div class="awin nso-win"><div class="fhead"><h3>Nintendo Switch Online</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
<p class="adesc">Precios en España con IVA y qué trae cada suscripción. Datos de nintendo.com/es-es a 25/11/2026.</p>
<div class="nso-plans">${planCard("base")}${planCard("exp")}</div>
<div class="nso-row"><span class="nso-lbl">Tipo</span><div class="nso-seg" role="group" aria-label="Tipo de suscripción"><button type="button" data-t="ind" class="${S.type==="ind"?"on":""}" aria-pressed="${S.type==="ind"}">${I.user}Individual</button><button type="button" data-t="fam" class="${S.type==="fam"?"on":""}" aria-pressed="${S.type==="fam"}">${I.online}Familiar</button></div></div>
${people}${dur}${money}
${conf?"":`<p class="nso-note">Los precios de 1 y 3 meses salen de la eShop según Eurogamer e inLobby; no aparecen en la página oficial. Compruébalos al comprar.</p>`}
<div class="nso-feat">${featHtml()}</div>
<p class="nso-note">Prueba gratuita de 7 días, una por cuenta Nintendo. Con una suscripción ya activa tienes descuento para pasar al Paquete de expansión.</p>
<div class="cu-acts"><a class="pri" href="${URL_NSO}" target="_blank" rel="noopener">Ver en nintendo.com</a></div></div>`;
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="nsodlg";
dlg.setAttribute("aria-label","Nintendo Switch Online");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const pl=e.target.closest("[data-plan]");if(pl){S.plan=pl.dataset.plan;render();return}
const t=e.target.closest("[data-t]");if(t){S.type=t.dataset.t;render();return}
const m=e.target.closest("[data-m]");if(m&&!m.disabled){S.months=+m.dataset.m;render();return}
const p=e.target.closest("[data-p]");if(p&&!p.disabled){S.people=Math.max(2,Math.min(8,S.people+(+p.dataset.p)));render()}
});
}
function open(){ensure();render();if(!dlg.open)dlg.showModal()}
const nav=document.querySelector(".apartados");
const b=document.createElement("button");
b.type="button";b.id="bnso";b.className="ap";b.textContent="Nintendo Switch Online";
if(nav)nav.insertBefore(b,document.getElementById("bset"));
b.addEventListener("click",open);
})();
