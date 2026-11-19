(()=>{
const J=()=>window.JS;
const SKEY="juegos-switch-ajustes";
const TKEY="juegos-switch-token";
const REPO="KingKhaax/Juegos-switch";
const root=document.documentElement;
const get=()=>{try{return JSON.parse(localStorage.getItem(SKEY))||{}}catch(e){return{}}};
let A=Object.assign({lite:false,bg:true,cursor:true,font:0},get());
const save=()=>{try{localStorage.setItem(SKEY,JSON.stringify(A))}catch(e){}};
const apply=()=>{
root.classList.toggle("lite",!!A.lite);
root.classList.toggle("no-bg",!!A.lite||!A.bg);
root.classList.toggle("no-cursor",!!A.lite||!A.cursor);
root.classList.remove("fs-1","fs-2");
if(A.font)root.classList.add("fs-"+A.font);
document.dispatchEvent(new Event("ajustes"));
};
apply();
{const m=location.hash.match(/^#tok=(github_pat_\w{20,})$/);if(m){try{localStorage.setItem(TKEY,m[1])}catch(e){}history.replaceState(null,"",location.pathname+location.search)}}
let dlg=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function ensure(){
if(dlg)return;
dlg=document.createElement("dialog");
dlg.id="ajdlg";
dlg.setAttribute("aria-label","Ajustes");
document.body.appendChild(dlg);
J().watchDialogs();
dlg.addEventListener("click",e=>{
if(e.target===dlg||e.target.closest("[data-close]")){dlg.close();return}
const t=e.target.closest("[data-tg]");
if(t){const k=t.dataset.tg;A[k]=!A[k];if(k==="lite"&&A.lite){}save();apply();render();return}
const f=e.target.closest("[data-font]");
if(f){A.font=+f.dataset.font;save();apply();render();return}
if(e.target.closest("[data-pub]")){publish();return}
if(e.target.closest("[data-savetok]")){
const v=dlg.querySelector("#tok").value.trim();
if(v){J().store.set(TKEY,v);msg("Token guardado en este navegador.","ok")}
render();return;
}
if(e.target.closest("[data-deltok]")){J().store.del(TKEY);render();msg("Token borrado.","ok");return}
if(e.target.closest("[data-copy]")){
const ta=dlg.querySelector("#orden-txt");
ta.select();
try{navigator.clipboard.writeText(ta.value);msg("Copiado. Pégalo en la página de GitHub que se ha abierto y pulsa «Commit changes».","ok")}catch(err){msg("Selecciona el texto y cópialo con Ctrl+C.","bad")}
}
});
}
function msg(t,k){
const m=dlg&&dlg.querySelector("#amsg");
if(m){m.textContent=t;m.className="amsg "+(k||"")}
}
const content=()=>{
const d=new Date();
const day=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
return `window.ORDEN=${JSON.stringify({updated:day,order:J().order})};\n`;
};
const b64=s=>btoa(unescape(encodeURIComponent(s)));
async function publish(){
const tok=J().store.get(TKEY,"");
const text=content();
if(!tok){
const box=dlg.querySelector("#fallback");
box.hidden=false;
dlg.querySelector("#orden-txt").value=text;
window.open(`https://github.com/${REPO}/edit/main/orden.js`,"_blank","noopener");
msg("Sin token no puedo guardarlo yo. Copia el texto, pégalo en la página de GitHub (borra lo que había) y pulsa «Commit changes».","");
return;
}
msg("Publicando…","");
const url=`https://api.github.com/repos/${REPO}/contents/orden.js`;
const h={Authorization:"Bearer "+tok,Accept:"application/vnd.github+json"};
try{
const cur=await fetch(url+"?ref=main",{headers:h});
if(cur.status===401||cur.status===403)throw new Error("auth");
const sha=cur.ok?(await cur.json()).sha:undefined;
const put=await fetch(url,{method:"PUT",headers:Object.assign({"Content-Type":"application/json"},h),body:JSON.stringify({message:"Actualizar el orden de la lista",content:b64(text),sha,branch:"main"})});
if(put.status===401||put.status===403||put.status===404)throw new Error("auth");
if(!put.ok)throw new Error("http "+put.status);
msg("Orden publicado en GitHub. Quien abra la web lo verá en unos 10 minutos (GitHub tarda en actualizar la página).","ok");
}catch(e){
msg(e.message==="auth"?"GitHub ha rechazado el token. Comprueba que es de este repositorio y que tiene permiso «Contents: Read and write».":"No se ha podido publicar ("+esc(e.message)+"). Inténtalo de nuevo.","bad");
}
}
function render(){
const tok=J().store.get(TKEY,"");
const sw=(k,l,d)=>`<div class="arow"><div><b>${l}</b><small>${d}</small></div><button type="button" class="tgl" role="switch" aria-checked="${!!A[k]}" data-tg="${k}"><i></i></button></div>`;
dlg.innerHTML=`<div class="awin"><div class="fhead"><h3>Ajustes</h3><button class="x2" type="button" data-close aria-label="Cerrar">×</button></div>
<div class="agroup"><h4>Rendimiento</h4>
${sw("lite","Modo ligero","Apaga el fondo animado, el cursor y las animaciones. Para móviles o equipos lentos.")}
${A.lite?"":`${sw("bg","Fondo animado","Luces y botones flotando.")}${sw("cursor","Cursor magnético","Punto y anillo que sustituyen al cursor.")}`}
</div>
<div class="agroup"><h4>Tamaño del texto</h4><div class="stbar" role="group" aria-label="Tamaño del texto">${[["Normal",0],["Grande",1],["Muy grande",2]].map(([l,v])=>`<button type="button" class="stb" data-font="${v}" aria-pressed="${A.font===v}">${l}</button>`).join("")}</div></div>
<div class="agroup"><h4>Publicar mi orden</h4>
<p class="adesc">El orden que pones con «Reordenar» solo lo ves tú. Si lo publicas, se guarda en GitHub (archivo <code>orden.js</code>) y cualquiera que abra la web, como tu novia, lo verá igual.</p>
<button type="button" class="pri big2" data-pub>Publicar mi orden en GitHub</button>
<div id="fallback" hidden><textarea id="orden-txt" rows="4" readonly></textarea><button type="button" class="nb2" data-copy>Copiar el texto</button></div>
<p id="amsg" class="amsg" role="status"></p>
<details class="tokd"${tok?"":""}><summary>${tok?"Token guardado: publicar con un clic":"Publicar con un clic (opcional)"}</summary>
<p class="adesc">Con un token personal de GitHub la web puede guardar el orden sin pasos manuales. Créalo en GitHub: Settings → Developer settings → Fine-grained tokens → solo el repositorio <b>${REPO}</b> → permiso <b>Contents: Read and write</b>. Se guarda únicamente en este navegador, nunca en la web. No se lo des a nadie.</p>
${tok?`<button type="button" class="nb2" data-deltok>Borrar el token de este navegador</button>`:`<div class="arow2"><input id="tok" type="password" autocomplete="off" placeholder="github_pat_…" aria-label="Token de GitHub"><button type="button" class="nb2" data-savetok>Guardar</button></div>`}
</details></div></div>`;
}
function open(){
ensure();
render();
if(!dlg.open)dlg.showModal();
}
document.addEventListener("click",e=>{if(e.target.closest("#bset"))open()});
document.addEventListener("keydown",e=>{
const t=e.target;
if(t.closest&&t.closest("input,textarea,select"))return;
if(document.querySelector("dialog[open]")&&!(dlg&&dlg.open))return;
if(e.key==="/"){
if(document.querySelector("dialog[open]"))return;
e.preventDefault();
const q=document.getElementById("q");
q.focus();q.select();
}else if(e.key==="?"){
e.preventDefault();
if(dlg&&dlg.open)dlg.close();else open();
}
});
window.JSajustes={open};
if(location.hash==="#ajustes")open();
})();
