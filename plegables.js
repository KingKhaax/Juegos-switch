(()=>{
const KEY="juegos-switch-plegables";
const IDS=["quiero","tengo","prestados"];
const J=()=>window.JS;
const NUM={quiero:"nq",tengo:"nt",prestados:"np"};
let S={};
const leer=()=>{try{const o=JSON.parse(J().store.get(KEY,"{}"));S=o&&typeof o==="object"?o:{}}catch(e){S={}}};
const guardar=()=>{Object.keys(S).length?J().store.set(KEY,JSON.stringify(S)):J().store.del(KEY)};
function aplica(sec,cerrado,anim){
if(anim){sec.classList.add("pl-anim");clearTimeout(sec._t);sec._t=setTimeout(()=>sec.classList.remove("pl-anim"),520)}
sec.classList.toggle("pl-closed",cerrado);
const b=sec.querySelector(".pl-h");
if(b)b.setAttribute("aria-expanded",String(!cerrado));
const body=sec.querySelector(".pl-in");
if(body){if(cerrado)body.setAttribute("inert","");else body.removeAttribute("inert")}
}
function prepara(sec){
if(!sec||sec.dataset.pl)return;
const h=sec.querySelector("h2");
if(!h)return;
sec.dataset.pl="1";
const id=sec.id;
const titulo=h.textContent;
h.innerHTML='<button type="button" class="pl-h" aria-expanded="true" aria-controls="pl-'+id+'"><span class="pl-t"></span><b class="pl-n" aria-hidden="true">0</b><span class="pl-chev" aria-hidden="true"></span></button>';
h.querySelector(".pl-t").textContent=titulo;
const body=document.createElement("div");
body.className="pl-body";body.id="pl-"+id;
const inn=document.createElement("div");
inn.className="pl-in";
[...sec.children].filter(x=>x!==h).forEach(x=>inn.appendChild(x));
body.appendChild(inn);
sec.appendChild(body);
aplica(sec,!!S[id],false);
h.querySelector(".pl-h").addEventListener("click",()=>{
const c=!sec.classList.contains("pl-closed");
aplica(sec,c,true);
if(c)S[id]=1;else delete S[id];
guardar();
});
}
function todas(){IDS.forEach(i=>prepara(document.getElementById(i)))}
function numeros(){
IDS.forEach(i=>{
const sec=document.getElementById(i),src=document.getElementById(NUM[i]);
const n=sec&&sec.querySelector(".pl-n");
if(n&&src&&n.textContent!==src.textContent)n.textContent=src.textContent;
});
}
function abrirDestino(e){
const a=e.target.closest&&e.target.closest('a[href^="#"]');
if(!a)return;
const id=a.getAttribute("href").slice(1);
const sec=IDS.includes(id)?document.getElementById(id):null;
if(sec&&sec.classList.contains("pl-closed")){aplica(sec,false,true);delete S[id];guardar()}
}
function iniciar(){
leer();
todas();
const main=document.querySelector("main");
if(main)new MutationObserver(todas).observe(main,{childList:true});
document.addEventListener("click",abrirDestino,true);
setInterval(numeros,700);
numeros();
}
if(window.JS)iniciar();else document.addEventListener("juegos:listo",iniciar,{once:true});
})();
