(()=>{
const nav=document.querySelector(".apartados");
if(!nav)return;
const svg=p=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const ICO={
quiero:svg('<path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z"/>'),
tengo:svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7 5.3-5.7"/>'),
badd:svg('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>'),
bstats:svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
bnext:svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
bhoras:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
bnso:svg('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M8 10h.01M16 10h.01M9 14c1.5 1 4.5 1 6 0"/>'),
bset:svg('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>')
};
const BURGER=svg('<path d="M4 7h16M4 12h16M4 17h16"/>');
const CLOSE=svg('<path d="M6 6l12 12M18 6L6 18"/>');
nav.id="drawer";
nav.classList.add("drawer");
nav.setAttribute("aria-label","Menú");
const key=el=>el.id||(el.getAttribute("href")||"").replace("#","");
[...nav.children].forEach(el=>{
const k=key(el);
if(ICO[k])el.insertAdjacentHTML("afterbegin",ICO[k]);
if(k==="bnext"&&window.UPCOMING&&window.UPCOMING.length)el.insertAdjacentHTML("beforeend",`<em class="nx" title="Juegos anunciados">${window.UPCOMING.length}</em>`);
});
const burger=document.createElement("button");
burger.type="button";burger.id="bmenu";
burger.setAttribute("aria-label","Abrir el menú");
burger.setAttribute("aria-controls","drawer");
burger.setAttribute("aria-expanded","false");
burger.innerHTML=BURGER;
const bd=document.createElement("div");
bd.id="drawer-bd";
document.body.append(bd,burger);
const open=()=>{document.body.classList.add("menu-open");burger.innerHTML=CLOSE;burger.setAttribute("aria-expanded","true");burger.setAttribute("aria-label","Cerrar el menú");setTimeout(()=>{const f=nav.querySelector("a,button");if(f)f.focus({preventScroll:true})},60)};
const close=(back)=>{if(!document.body.classList.contains("menu-open"))return;document.body.classList.remove("menu-open");burger.innerHTML=BURGER;burger.setAttribute("aria-expanded","false");burger.setAttribute("aria-label","Abrir el menú");if(back)burger.focus({preventScroll:true})};
burger.addEventListener("click",()=>document.body.classList.contains("menu-open")?close(true):open());
bd.addEventListener("click",()=>close(true));
nav.addEventListener("click",e=>{if(e.target.closest("a,button"))setTimeout(()=>close(false),0)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("menu-open")&&!document.querySelector("dialog[open]"))close(true)});
})();
