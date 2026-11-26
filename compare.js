(()=>{
const J=()=>window.JS;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let bar=null,dlg=null;
function ensure(){
if(bar)return;
bar=document.createElement("div");
bar.id="cmpbar";
bar.hidden=true;
bar.innerHTML='<span id="cmpt"></span><button type="button" id="cmpgo" class="pri">Ver comparación</button><button type="button" id="cmpclr">Vaciar</button>';
document.body.appendChild(bar);
dlg=document.createElement("dialog");
dlg.id="cmpdlg";
dlg.setAttribute("aria-label","Comparar juegos");
document.body.appendChild(dlg);
J().watchDialogs();
bar.addEventListener("click",e=>{
if(e.target.closest("#cmpgo"))open();
else if(e.target.closest("#cmpclr"))J().setCmp([]);
});
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const r=e.target.closest("[data-rm]");
if(r){J().setCmp(J().cmp.filter(s=>s!==r.dataset.rm));if(J().cmp.length<2)dlg.close();else render()}
});
}
function sync(){
ensure();
const n=J().cmp.length;
bar.hidden=n===0;
$t().textContent=n===1?"1 juego elegido: elige otro para compararlo":`${n} juegos para comparar`;
$g().disabled=n<2;
}
const $t=()=>document.getElementById("cmpt");
const $g=()=>document.getElementById("cmpgo");
function best(vals,mode){
const v=vals.map(x=>(x==null||isNaN(x))?null:x);
const ok=v.filter(x=>x!=null);
if(ok.length<2)return v.map(()=>false);
const t=mode==="max"?Math.max(...ok):Math.min(...ok);
return v.map(x=>x!=null&&x===t&&ok.filter(y=>y===t).length<ok.length);
}
function table(){
const j=J();
const gs=j.cmp.map(s=>j.bySlug()[s]).filter(Boolean);
const I=gs.map(g=>j.info(g));
const cell=(c,b)=>`<td class="${b?"best":""}">${c}</td>`;
const row=(label,cells,flags)=>`<tr><th scope="row">${label}</th>${cells.map((c,k)=>cell(c,flags&&flags[k])).join("")}</tr>`;
const hrs=k=>I.map(i=>j.num((i.d.hours||{})[k]));
const hf=a=>a.map(x=>x!=null?`${j.nf(x,1)} h`:"—");
const meta=I.map(i=>i.meta);
const size=I.map(i=>i.playable?i.mbEff:null);
const price=I.map(i=>i.playable?i.cost:null);
const head=`<tr><th></th>${gs.map(g=>`<th scope="col" class="ch"><button type="button" class="rm" data-rm="${g.slug}" aria-label="Quitar ${esc(g.title)} de la comparación">×</button><img src="${(window.JS.AD()[g.slug]||{c:{}}).c.sq||`img/t/${g.slug}.jpg`}" width="120" height="120" alt=""><span>${esc(g.title)}</span></th>`).join("")}</tr>`;
const rows=[
row("Metascore",meta.map(m=>m!=null?`<b class="metab ${j.metaCls(m)}">${m}</b>`:"—"),best(meta,"max")),
row("Consola",I.map((i,k)=>esc(j.L[gs[k].k]))),
row(`Tamaño en Switch ${j.cons}`,I.map((i,k)=>i.playable?(i.mbEff?j.gb(i.mbEff):"0,0 GB")+(i.fmt==="f"?" <em>físico</em>":""):"Solo Switch 2"),best(size,"min")),
row("Precio",I.map(i=>i.playable&&i.cost!=null?j.eur(i.cost):"—"),best(price,"min")),
row("Historia principal",hf(hrs("main"))),
row("Principal + Secundarias",hf(hrs("plus"))),
row("Completista",hf(hrs("comp"))),
row("Duración de jugador promedio",hf(hrs("all"))),
row("Género",I.map(i=>esc((i.d.genres||[]).join(", ")||"—"))),
row("Jugadores locales",I.map(i=>esc(i.d.local||"—"))),
row("Jugadores online",I.map(i=>esc(i.d.online||"—"))),
row("Modos",gs.map(g=>g.m.length?g.m.map(m=>j.FT[m]).join(", "):"Sin confirmar")),
row("Desarrollador",I.map(i=>esc(i.d.dev||"—"))),
row("Fecha",I.map(i=>esc(i.d.date||"—")))
].join("");
return `<thead>${head}</thead><tbody>${rows}</tbody>`;
}
function render(){
dlg.innerHTML=`<div class="cwin"><div class="fhead"><h3>Comparar juegos</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div><div class="ctw"><table class="ct">${table()}</table></div><p class="fdesc">En verde, el mejor de cada fila (más Metascore, menos tamaño, menos precio). Los tamaños y precios son los de tu consola y tu formato.</p></div>`;
}
function open(){
ensure();
if(J().cmp.length<2)return;
render();
if(!dlg.open)dlg.showModal();
}
document.addEventListener("juegos:cmp",sync);
document.addEventListener("juegos:render",()=>{if(bar)sync();else if(J().cmp.length)sync()});
document.addEventListener("juegos:listo",sync);
if(window.JS)sync();
if(location.hash==="#comparar"&&window.JS){J().setCmp(J().games.slice(0,3).map(g=>g.slug));open()}
})();
