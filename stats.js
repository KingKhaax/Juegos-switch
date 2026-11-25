(()=>{
const J=()=>window.JS;
let dlg=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="stdlg";
dlg.setAttribute("aria-label","Estadísticas de mi colección");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{if(e.target===dlg||e.target.closest("[data-close]"))dlg.close()});
}
const sum=a=>a.reduce((x,y)=>x+y,0);
const avg=a=>a.length?sum(a)/a.length:null;
function bars(rows,fmt){
const max=Math.max(1,...rows.map(r=>r.h+r.w));
return `<div class="sbars">${rows.map(r=>`<div class="sbr"><span class="sbl">${esc(r.l)}</span><span class="sbt"><i class="have" style="--w:${(r.h/max*100).toFixed(1)}%"></i><i class="want" style="--w:${(r.w/max*100).toFixed(1)}%"></i></span><span class="sbv">${fmt?fmt(r):`${r.h}<small>/</small>${r.w}`}</span></div>`).join("")}</div>`;
}
function build(){
const j=J();
const games=j.games;
const infos=games.map(g=>({g,i:j.info(g),own:j.isOwn(g.slug)}));
const have=infos.filter(x=>x.own),want=infos.filter(x=>!x.own);
const play=x=>x.i.playable;
const gbOf=l=>sum(l.filter(play).map(x=>x.i.mbEff))/1024;
const eurOf=l=>sum(l.filter(play).map(x=>x.i.cost||0));
const mio=j.mio();
const horasJ=sum(have.map(x=>(mio[x.g.slug]||{}).horas||0));
const hMain=sum(want.map(x=>j.num((x.i.d.hours||{}).main)||0));
const hComp=sum(want.map(x=>j.num((x.i.d.hours||{}).comp)||0));
const hLeft=sum(have.filter(x=>j.stOf(x.g.slug)!=="done").map(x=>Math.max(0,(j.num((x.i.d.hours||{}).main)||0)-((mio[x.g.slug]||{}).horas||0))));
const mH=avg(have.map(x=>x.i.meta).filter(Boolean)),mW=avg(want.map(x=>x.i.meta).filter(Boolean));
const notas=have.map(x=>x.i.nota).filter(Boolean);
const tile=(l,b,s)=>`<div class="stile"><small>${l}</small><b>${b}</b>${s?`<span>${s}</span>`:""}</div>`;
const sagas=j.SAGAS.map(([v,l])=>({l,h:have.filter(x=>x.g.s===v).length,w:want.filter(x=>x.g.s===v).length})).filter(r=>r.h+r.w>0);
const gen={};
infos.forEach(x=>(x.i.d.genres||[]).forEach(t=>{gen[t]=gen[t]||{l:t,h:0,w:0};gen[t][x.own?"h":"w"]++}));
const genres=Object.values(gen).sort((a,b)=>b.h+b.w-(a.h+a.w));
const months={};
have.forEach(x=>{const c=(mio[x.g.slug]||{}).compra;if(!c)return;const k=c.slice(0,7);months[k]=(months[k]||0)+(x.i.cost||0)});
const mrows=Object.keys(months).sort().map(k=>({l:k.split("-").reverse().join("/"),h:months[k],w:0}));
const states=j.STATES.map(([k,l])=>({l,h:have.filter(x=>j.stOf(x.g.slug)===k).length,w:0}));
return `<div class="swin"><div class="fhead"><h3>Estadísticas de mi colección</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
<div class="stiles">
${tile("Juegos",`${have.length} <small>tengo</small> · ${want.length} <small>quiero</small>`,"")}
${tile("Espacio",`${j.nf(gbOf(have),1)} GB <small>instalado</small>`,`${j.nf(gbOf(want),1)} GB por instalar`)}
${tile("Dinero",`${j.eur(eurOf(have))} <small>gastado</small>`,`${j.eur(eurOf(want))} por gastar`)}
${tile("Horas jugadas",`${j.nf(horasJ,1)} h`,hLeft?`Me faltan ${j.nf(hLeft,1)} h de historia en lo que tengo`:"")}
${tile("Por jugar lo que quiero",`${j.nf(hMain,0)} h <small>historia</small>`,`${j.nf(hComp,0)} h al completarlo todo`)}
${tile("Metascore medio",`${mH?j.nf(mH,0):"—"} <small>tengo</small> · ${mW?j.nf(mW,0):"—"} <small>quiero</small>`,notas.length?`Mi nota media: ${j.nf(avg(notas),1)}`:"")}
</div>
<div class="skey"><span><i class="k have"></i>Tengo</span><span><i class="k want"></i>Quiero</span></div>
<h4>Por saga</h4>${bars(sagas)}
<h4>Por género</h4>${bars(genres)}
<h4>Estado de lo que tengo</h4>${bars(states,r=>r.h)}
${mrows.length?`<h4>Gasto por mes de compra</h4>${bars(mrows,r=>j.eur(r.h))}`:""}
<p class="src">Se calcula con tu <mark class="m-cy">consola (Switch ${j.cons})</mark>, el <mark class="m-pu">formato digital o físico</mark> y el <mark class="m-go">precio que pagaste</mark>.</p></div>`;
}
function open(){
ensure();
dlg.innerHTML=build();dlg.classList.add("fx-open");setTimeout(()=>dlg.classList.remove("fx-open"),1300);
if(!dlg.open)dlg.showModal();
}
document.addEventListener("click",e=>{if(e.target.closest("#bstats"))open()});
window.addEventListener("keydown",e=>{if(e.key==="Escape"&&dlg&&dlg.open)dlg.close()});
window.JSstats={open};
if(location.hash==="#estadisticas")open();
})();
