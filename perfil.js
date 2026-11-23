(()=>{
const NV=window.PERFIL==="novia";
const root=document.documentElement;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const T=document.querySelector(".title"),S=document.querySelector(".sub");
if(T)T.textContent=NV?"Jueguitos Switch de Nicky":"Jueguitos Switch de Rafita";if(NV){if(S)S.textContent="Mis juegos favoritos, ordenados por preferencia · Switch 1 y Switch 2"}
const icoR='<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="14" width="20" height="36" rx="10" fill="#00c3e3"/><rect x="36" y="14" width="20" height="36" rx="10" fill="#e60012"/><circle cx="18" cy="26" r="4" fill="#0b0d12"/><circle cx="46" cy="40" r="4" fill="#0b0d12"/><rect x="26" y="20" width="12" height="24" rx="3" fill="#1c1e24"/></svg>';
const icoN='<img src="img/kitty.png?v=20261123c" width="256" height="256" alt="" decoding="async">';
const next=NV?"rafa":"novia";
const b=document.createElement("button");
b.type="button";
b.id="bperfil";
b.className="perfil-btn "+(NV?"is-n":"is-r");
b.setAttribute("aria-label",NV?"Cambiar a Jueguitos Switch de Rafita":"Cambiar a Jueguitos Switch de Nicky");
b.innerHTML=`<span class="pb-ring" aria-hidden="true"></span><span class="pb-glow" aria-hidden="true"></span><span class="pb-face">${NV?icoN:icoR}</span><span class="pb-sp" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="pb-tip">${NV?"Cambiar a Jueguitos Switch de Rafita":"Cambiar a Jueguitos Switch de Nicky"}</span>`;
document.body.appendChild(b);
const go=()=>{
if(b.disabled)return;
b.disabled=true;
try{localStorage.setItem("juegos-switch-perfil",next);sessionStorage.setItem("js-cambio",next);sessionStorage.setItem("js-elegida","1")}catch(e){}
if(reduce){location.reload();return}
const r=b.getBoundingClientRect();
const ov=document.createElement("div");
ov.className="perfil-ov to-"+next;
ov.style.setProperty("--x",r.left+r.width/2+"px");
ov.style.setProperty("--y",r.top+r.height/2+"px");
let parts="";
const G=next==="novia"?["♥","✦","♡","✿","★"]:["A","B","X","Y","+"];
for(let i=0;i<26;i++){const a=Math.random()*6.283,d=120+Math.random()*420;parts+=`<i style="--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--d:${(Math.random()*.25).toFixed(2)}s;--s:${(.7+Math.random()*1.2).toFixed(2)}">${G[i%G.length]}</i>`}
ov.innerHTML=`<span class="pov-c"></span><span class="pov-p">${parts}</span><span class="pov-t">${next==="novia"?'<img class="pov-k" src="img/kitty.png?v=20261123c" alt="">Jueguitos Switch de Nicky':"Jueguitos Switch de Rafita"}</span>`;
document.body.appendChild(ov);
b.classList.add("go");
requestAnimationFrame(()=>ov.classList.add("on"));
setTimeout(()=>location.reload(),1050);
};
b.addEventListener("click",go);
let came="";
try{came=sessionStorage.getItem("js-cambio")||"";sessionStorage.removeItem("js-cambio")}catch(e){}
if(came&&!reduce){
const ov=document.createElement("div");
ov.className="perfil-ov to-"+(NV?"novia":"rafa")+" on out";
ov.style.setProperty("--x","calc(100vw - 52px)");
ov.style.setProperty("--y","52px");
ov.innerHTML=`<span class="pov-c"></span><span class="pov-t">${NV?'<img class="pov-k" src="img/kitty.png?v=20261123c" alt="">Jueguitos Switch de Nicky':"Jueguitos Switch de Rafita"}</span>`;
document.body.appendChild(ov);
root.classList.add("perfil-in");
requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.add("gone")));
setTimeout(()=>{ov.remove();root.classList.remove("perfil-in")},1300);
}
})();
