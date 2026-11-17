(()=>{
const J=()=>window.JS;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let dlg=null;
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="nxdlg";
dlg.setAttribute("aria-label","Próximos lanzamientos");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const a=e.target.closest("[data-add]");
if(a){
const s=a.dataset.add;
if(J().isExtra(s)){if(J().isOwn(s))return;J().removeExtra(s)}else J().addExtra(s);
render();
return;
}
const v=e.target.closest("[data-ver]");
if(v){dlg.close();J().openDlg(v.dataset.ver)}
});
}
const daysLeft=u=>{
if(!u.fecha)return null;
const d=Math.round((new Date(u.fecha+"T00:00:00")-new Date(new Date().toDateString()))/86400000);
return d;
};
function render(){
const j=J();
const list=[...j.UPC].sort((a,b)=>(a.days??9999)-(b.days??9999));
const scraped=list[0]&&list[0].scraped?list[0].scraped.split("-").reverse().join("/"):"";
dlg.innerHTML=`<div class="nwin"><div class="fhead"><h3>Próximos lanzamientos</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div><p class="fdesc">Los próximos exclusivos que anuncia nswitchex.com${scraped?` (datos del ${scraped})`:""}. Pulsa «Lo quiero» para añadirlos a Los que quiero; se verán en tu lista como los demás.</p><ul class="nlist">${list.map(u=>{
const d=u.detail||{};
const inList=j.isExtra(u.slug);
const dl=daysLeft(u);
const when=d.date||"Por confirmar";
const eta=dl==null?"":dl<0?"":dl===0?"Sale hoy":`En ${dl} días`;
return `<li class="nit"><img src="img/t/${u.slug}.jpg" width="96" height="96" loading="lazy" alt=""><div class="nbody"><h4>${esc(u.title)}</h4><p class="nmeta">${esc(when)}${eta?` · <b>${eta}</b>`:""}${u.k==="s2"?" · Solo Switch 2":""}</p><p class="ngen">${esc([d.dev,(d.genres||[]).join(", ")].filter(Boolean).join(" · "))}</p><div class="nact"><button type="button" class="${inList?"nb2 on":"nb2"}" data-add="${u.slug}"${inList&&j.isOwn(u.slug)?" disabled":""}>${inList?(j.isOwn(u.slug)?"Ya lo tengo":"En mi lista · quitar"):"Lo quiero"}</button>${inList?`<button type="button" class="nb2" data-ver="${u.slug}">Ver ficha</button>`:""}<a class="nb2" href="https://nswitchex.com/es/details/${u.slug}/" target="_blank" rel="noopener noreferrer">nswitchex ↗</a></div></div></li>`;
}).join("")}</ul></div>`;
}
function open(){
ensure();
render();
if(!dlg.open)dlg.showModal();
}
document.addEventListener("click",e=>{if(e.target.closest("#bnext"))open()});
if(location.hash==="#proximos")open();
})();
