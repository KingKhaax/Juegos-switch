(()=>{
const J=()=>window.JS;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DICE='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01M12 12h.01"/></svg>';
const TIEMPO=[["any","Cualquiera"],["s","Corto · hasta 12 h"],["m","Medio · 12 a 30 h"],["l","Largo · más de 30 h"]];
const MODO=[["any","Cualquiera"],["sp","Solo"],["co","Con alguien"]];
let dlg=null,F={t:"any",m:"any"},last="",busy=false,timer=0;
const cover=g=>{const A=J().AD&&J().AD();return g.cus&&A&&A[g.slug]?A[g.slug].c.sq:"img/t/"+g.slug+".jpg"};
const stL=s=>s==="playing"?"Lo estoy jugando":"Pendiente de jugar";
function pool(){
const out=[];
for(const g of J().games){
if(!J().isOwn(g.slug))continue;
const st=J().stOf(g.slug);
if(st!=="todo"&&st!=="playing")continue;
const i=J().info(g);
if(!i.playable)continue;
const h=i.hours;
if(F.t==="s"&&!(h!=null&&h<=12))continue;
if(F.t==="m"&&!(h!=null&&h>12&&h<=30))continue;
if(F.t==="l"&&!(h!=null&&h>30))continue;
if(F.m==="sp"&&!g.m.includes("sp"))continue;
if(F.m==="co"&&!g.m.some(x=>x!=="sp"))continue;
out.push({g,i,st});
}
return out;
}
function elige(p){
const base=p.length>1?p.filter(x=>x.g.slug!==last):p;
const w=base.map(x=>1+(x.i.nota||0)/5+(x.st==="playing"?1.5:0));
let r=Math.random()*w.reduce((a,b)=>a+b,0);
for(let k=0;k<base.length;k++){r-=w[k];if(r<=0)return base[k]}
return base[base.length-1];
}
const modos=g=>g.m.map(x=>(J().T&&J().T[x])||x).join(" · ");
const tarjeta=x=>`<img class="pj-img" src="${esc(cover(x.g))}" alt="" width="180" height="180"><div class="pj-info"><b class="pj-t">${esc(x.g.title)}</b><span>${x.i.hours!=null?"Unas "+x.i.hours.toLocaleString("es-ES")+" h de historia · ":""}${esc(stL(x.st))}</span><span>${esc(modos(x.g))}</span></div>`;
function pills(k,arr){return arr.map(([v,l])=>`<button type="button" class="pj-p${F[k]===v?" on":""}" data-f="${k}" data-v="${v}" aria-pressed="${F[k]===v}">${l}</button>`).join("")}
function render(){
if(!dlg)return;
const n=pool().length;
const tot=J().games.filter(g=>J().isOwn(g.slug)&&["todo","playing"].includes(J().stOf(g.slug))).length;
dlg.innerHTML=`<div class="awin pj-win"><div class="nso-aur adm-aur" aria-hidden="true"></div><div class="fhead"><h3 class="pj-title"><span class="pj-ic">${DICE}</span>¿A qué juego ahora?</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div><p class="adesc">Elijo uno de los juegos que ya tienes y todavía no has terminado. Puedes afinar cuánto tiempo tienes y con quién juegas.</p><div class="pj-fil"><span class="pj-l">Cuánto dura la historia</span><div class="pj-row">${pills("t",TIEMPO)}</div><span class="pj-l">Con quién</span><div class="pj-row">${pills("m",MODO)}</div></div><div class="pj-stage" id="pjStage" aria-live="polite">${tot?`<p class="pj-hint">${n?`Hay ${n} ${n===1?"juego posible":"juegos posibles"}. Pulsa el botón y que decida la suerte.`:"Ningún juego cumple esos filtros. Prueba con otros."}</p>`:'<p class="pj-hint">Todavía no tienes juegos pendientes. Marca alguno como «Ya lo tengo» y vuelve.</p>'}</div><div class="pj-acts"><button type="button" class="pj-go" data-go${n?"":" disabled"}>Elegir juego</button></div></div>`;
}
function girar(){
if(busy)return;
const p=pool();
if(!p.length)return;
busy=true;
const st=dlg.querySelector("#pjStage"),btn=dlg.querySelector("[data-go]");
btn.disabled=true;
const win=elige(p);
st.className="pj-stage spin";
let k=0,steps=16;
const paso=()=>{
const x=k<steps?p[Math.floor(Math.random()*p.length)]:win;
st.innerHTML='<div class="pj-card'+(k>=steps?" win":"")+'">'+tarjeta(x)+"</div>";
if(k>=steps){
last=win.g.slug;busy=false;st.className="pj-stage done";
btn.disabled=false;btn.textContent="Elegir otro";
st.insertAdjacentHTML("beforeend",'<div class="pj-btns"><button type="button" class="pj-ver" data-ver="'+esc(win.g.slug)+'">Ver la ficha</button></div><i class="pj-sp s1"></i><i class="pj-sp s2"></i><i class="pj-sp s3"></i><i class="pj-sp s4"></i><i class="pj-sp s5"></i>');
return;
}
k++;
timer=setTimeout(paso,55+k*16);
};
paso();
}
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="pldlg";dlg.setAttribute("aria-label","Elegir a qué jugar");
document.body.appendChild(dlg);
J().watchDialogs&&J().watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const f=e.target.closest("[data-f]");
if(f){F[f.dataset.f]=f.dataset.v;last="";render();return}
if(e.target.closest("[data-go]")){girar();return}
const v=e.target.closest("[data-ver]");
if(v){const s=v.dataset.ver;dlg.close();J().openDlg(s)}
});
dlg.addEventListener("close",()=>{clearTimeout(timer);busy=false});
}
function abrir(){
ensure();
render();
dlg.classList.add("fx-open");setTimeout(()=>dlg.classList.remove("fx-open"),1300);
if(!dlg.open)dlg.showModal();
}
function iniciar(){
const nav=document.querySelector(".apartados");
if(nav){
const b=document.createElement("button");
b.type="button";b.id="bplay";b.className="ap";b.textContent="¿A qué juego ahora?";
nav.insertBefore(b,document.getElementById("bset"));
b.addEventListener("click",abrir);
}
const tools=document.querySelector(".tools");
if(tools){
const b2=document.createElement("button");
b2.type="button";b2.id="bplay2";b2.className="tbtn";b2.innerHTML="<span>¿A qué juego ahora?</span>";
tools.appendChild(b2);
b2.addEventListener("click",abrir);
}
}
if(window.JS)iniciar();else document.addEventListener("juegos:listo",iniciar,{once:true});
})();
