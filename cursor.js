(()=>{
if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const root=document.documentElement;
const dot=document.createElement("div");
dot.className="cur-dot";
const ring=document.createElement("div");
ring.className="cur-ring";
document.body.append(dot,ring);
root.classList.add("cur-on");
let mx=-100,my=-100,rx=-100,ry=-100,rw=36,rh=36,rr=18;
let on=false,native=false,down=false,pick=null,pulled=null;
const pickOf=t=>{
if(!t||!t.closest)return null;
const b=t.closest(".own,.pay,.x,.nav,.price,button,a,[role=radio]");
if(b&&!b.classList.contains("open"))return{el:b,card:false};
const c=t.closest(".card");
return c?{el:c,card:true}:null;
};
addEventListener("pointermove",e=>{
mx=e.clientX;my=e.clientY;
if(!on){on=true;rx=mx-18;ry=my-18}
native=!!(e.target.closest&&e.target.closest("input,select,textarea,option"));
pick=native?null:pickOf(e.target);
},{passive:true});
addEventListener("pointerdown",()=>{down=true});
addEventListener("pointerup",()=>{down=false});
document.documentElement.addEventListener("mouseleave",()=>{on=false});
const release=()=>{if(pulled){pulled.style.transform="";pulled=null}};
const frame=()=>{
requestAnimationFrame(frame);
const dlg=document.querySelector("dialog[open]");
root.classList.toggle("cur-dlg",!!dlg);
const show=on&&!dlg&&!native;
ring.style.opacity=show?1:0;
dot.style.opacity=show?1:0;
if(!show){release();return}
let tx=mx-18,ty=my-18,tw=36,th=36,tr=18;
if(pick&&pick.el.isConnected){
const r=pick.el.getBoundingClientRect();
tx=r.left-6;ty=r.top-6;tw=r.width+12;th=r.height+12;
tr=pick.card?20:Math.min(22,r.height/2+6);
}
const k=reduce?1:.22;
rx+=(tx-rx)*k;ry+=(ty-ry)*k;rw+=(tw-rw)*k;rh+=(th-rh)*k;rr+=(tr-rr)*k;
ring.style.transform=`translate(${rx}px,${ry}px) scale(${down?.94:1})`;
ring.style.width=rw+"px";
ring.style.height=rh+"px";
ring.style.borderRadius=rr+"px";
dot.style.transform=`translate(${mx}px,${my}px) scale(${pick?.45:1})`;
const open=pick&&pick.card&&pick.el.isConnected?pick.el.querySelector(".open"):null;
if(pulled&&pulled!==open)release();
if(open&&!reduce){
const r=pick.el.getBoundingClientRect();
open.style.transform=`translate(${(mx-(r.left+r.width/2))*.07}px,${(my-(r.top+r.height/2))*.07}px)`;
pulled=open;
}
};
requestAnimationFrame(frame);
})();
