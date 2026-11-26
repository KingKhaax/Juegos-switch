(()=>{
const J=()=>window.JS;
const API="https://juegos-switch-cuentas.vercel.app/api/juegos";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slugify=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const PLAT={s1:["Switch","pl-s1"],s2:["Switch 2","pl-s2"],s2e:["Switch 2 Edition","pl-s2e"]};
const eur=n=>n==null?"":n.toLocaleString("es-ES",{style:"currency",currency:"EUR"});
const gb=mb=>mb==null?"":(mb/1024).toLocaleString("es-ES",{maximumFractionDigits:1})+" GB";
const fecha=iso=>{if(!iso)return "";const d=new Date(iso+"T00:00:00");return isNaN(d)?"":d.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"})};
const hoy=()=>new Date().toISOString().slice(0,10);
let dlg=null,timer=0,seq=0,cat=null,catP=null,items=[],msg="",busy="",qtxt="";
function loadCat(){if(catP)return catP;catP=fetch("nsw-catalogo.json").then(r=>r.ok?r.json():null).then(j=>{cat=j;return j}).catch(()=>null);return catP}
function nswFor(title){
if(!cat||!cat.g)return null;
const cands=[slugify(title),slugify(String(title).replace(/\s*[–-]\s*Nintendo Switch 2 Edition.*$/i,"")),slugify(String(title).split(":")[0])].filter((s,i,a)=>s&&a.indexOf(s)===i);
const s=cands.find(x=>cat.g[x]);
return s?{slug:s,d:cat.g[s]}:null;
}
function mergeDet(base,nsw){
if(!nsw)return base;
const o=Object.assign({},base,nsw);
if(!o.genres||!o.genres.length)o.genres=base.genres;
if(!o.summary)o.summary=base.summary;
const be=(base.editions||[])[0]||{};
o.editions=(nsw.editions&&nsw.editions.length?nsw.editions:base.editions).map((e,i)=>i===0?Object.assign({},e,{sizeMB:e.sizeMB||be.sizeMB||null,price:e.price||be.price||""}):e);
if(!o.date)o.date=base.date;
return o;
}
function inList(it){
const j=J(),by=j.bySlug();
if(by["n"+it.id])return true;
const s=slugify(it.t);
if(by[s])return true;
const n=nswFor(it.t);
return !!(n&&by[n.slug]);
}
function badge(k){const p=PLAT[k]||PLAT.s1;return `<i class="add-pl ${p[1]}">${p[0]}</i>`}
function row(it){
const fut=it.d&&it.d>hoy();
const have=inList(it);
const meta=[it.pub,gb(it.sz),it.pr!=null?eur(it.pr):""].filter(Boolean).map(esc).join(" · ");
return `<li class="add-it${have?" have":""}"><img src="${esc(it.img)}" alt="" width="64" height="64" loading="lazy"><div class="add-b"><b>${esc(it.t)}</b><span class="add-m">${badge(it.k)}${fut?`<mark class="m-or">Sale el ${esc(fecha(it.d))}</mark>`:it.d?`<span>${esc(fecha(it.d))}</span>`:""}</span><small>${meta}</small></div><div class="add-a">${have?`<span class="add-have">En tu lista</span>`:`<button type="button" class="add-want" data-add="${esc(it.id)}" data-own="0"${busy===it.id?" disabled":""}>${busy===it.id?"Añadiendo…":"Lo quiero"}</button>${fut?"":`<button type="button" class="add-own" data-add="${esc(it.id)}" data-own="1"${busy===it.id?" disabled":""}>Ya lo tengo</button>`}`}</div></li>`;
}
function mine(){
const ad=J().AD(),ks=Object.keys(ad);
if(!ks.length)return "";
return `<details class="add-mine"><summary><b>Mis juegos añadidos</b><small>${ks.length}</small></summary><ul class="add-list">${ks.map(k=>`<li class="add-it"><img src="${esc(ad[k].c.sq)}" alt="" width="48" height="48" loading="lazy"><div class="add-b"><b>${esc(ad[k].t)}</b><span class="add-m">${badge(ad[k].k)}</span></div><div class="add-a"><button type="button" class="add-del" data-del="${esc(k)}">Quitar</button></div></li>`).join("")}</ul></details>`;
}
function body(){
if(qtxt.trim().length<2)return `<p class="add-hint">Escribe al menos <mark class="m-cy">2 letras</mark>. Salen los <mark class="m-gr">juegos de Switch y Switch 2</mark> de la tienda de Nintendo, también los que <mark class="m-or">aún no han salido</mark>.</p>`;
if(busy==="buscando")return `<ul class="add-list">${Array.from({length:4},()=>`<li class="add-it sk"><i></i><div class="add-b"><b></b><span></span></div></li>`).join("")}</ul>`;
if(msg)return `<p class="add-hint bad">${esc(msg)}</p>`;
if(!items.length)return `<p class="add-hint">No hay ningún juego que empiece así. Prueba con otra parte del nombre.</p>`;
return `<ul class="add-list">${items.map(row).join("")}</ul>`;
}
function render(keep){
const inp=dlg.querySelector(".add-q");
if(!inp||!keep){
dlg.innerHTML=`<div class="awin add-win"><div class="nso-aur" aria-hidden="true"></div><div class="fhead"><h3>Añadir un juego</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
<label class="add-s"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input class="add-q" type="search" autocomplete="off" spellcheck="false" placeholder="Escribe el nombre de un juego" aria-label="Buscar un juego para añadir" value="${esc(qtxt)}"></label>
<div id="addres">${body()}</div><div id="addmine">${mine()}</div></div>`;
}else{
dlg.querySelector("#addres").innerHTML=body();
dlg.querySelector("#addmine").innerHTML=mine();
}
}
async function search(){
const my=++seq;
const t=qtxt.trim();
if(t.length<2){items=[];msg="";busy="";render(true);return}
busy="buscando";msg="";render(true);
await loadCat();
try{
const r=await fetch(API+"?q="+encodeURIComponent(t));
if(my!==seq)return;
if(!r.ok)throw new Error("http");
const j=await r.json();
items=j.items||[];msg="";
}catch(e){if(my!==seq)return;items=[];msg="No se ha podido buscar ahora mismo. Inténtalo de nuevo en un momento."}
busy="";render(true);
}
async function add(id,own){
const it=items.find(x=>x.id===id);
if(!it)return;
busy=id;render(true);
try{
const r=await fetch(API+"?id="+encodeURIComponent(id));
if(!r.ok)throw new Error("http");
const j=await r.json();
await loadCat();
const n=nswFor(j.t);
const slug=J().addCustom({id:j.id,t:j.t,k:j.k,d:j.d,c:j.c,det:mergeDet(j.detail,n&&n.d)});
busy="";
if(slug&&own){dlg.close();J().toggleOwn(slug);return}
render(true);
flash("Añadido a Los que quiero");
}catch(e){busy="";msg="No se ha podido añadir el juego. Inténtalo otra vez.";render(true)}
}
function flash(t){
const el=document.createElement("div");el.className="add-toast";el.textContent=t;
dlg.querySelector(".add-win").appendChild(el);setTimeout(()=>el.remove(),2200);
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="addlg";
dlg.setAttribute("aria-label","Añadir un juego");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const a=e.target.closest("[data-add]");if(a&&!a.disabled){add(a.dataset.add,a.dataset.own==="1");return}
const d=e.target.closest("[data-del]");if(d){J().removeCustom(d.dataset.del);render(true)}
});
dlg.addEventListener("input",e=>{
if(!e.target.classList.contains("add-q"))return;
qtxt=e.target.value;clearTimeout(timer);timer=setTimeout(search,300);
});
}
function open(){
ensure();
qtxt="";items=[];msg="";busy="";
render(false);
dlg.classList.add("fx-open");setTimeout(()=>dlg.classList.remove("fx-open"),1300);
if(!dlg.open)dlg.showModal();
loadCat();
setTimeout(()=>{const i=dlg.querySelector(".add-q");if(i)i.focus()},60);
}
const nav=document.querySelector(".apartados");
const b=document.createElement("button");
b.type="button";b.id="badd";b.className="ap";b.textContent="Añadir juego";
if(nav)nav.insertBefore(b,document.getElementById("bstats"));
b.addEventListener("click",open);
const tools=document.querySelector(".tools");
if(tools){const b2=document.createElement("button");b2.type="button";b2.id="badd2";b2.className="tbtn";b2.innerHTML="<span>＋ Añadir juego</span>";tools.appendChild(b2);b2.addEventListener("click",open)}
window.JSadd={open};
})();
