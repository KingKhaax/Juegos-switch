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
let on=false,native=false,down=false,pick=null,pulled=null,running=false,lastDlg=null;
const pickOf=t=>{
if(!t||!t.closest)return null;
const b=t.closest(".own,.pay,.x,.x2,.nav,.price,.fo,.fb,.fchip,button,a,[role=radio]");
if(b&&!b.classList.contains("open"))return{el:b,card:false};
const c=t.closest(".card");
return c?{el:c,card:true}:null;
};
const release=()=>{if(pulled){pulled.style.transform="";pulled=null}};
const frame=()=>{
running=false;
const dlg=document.querySelector("dialog[open]");
if(!!dlg!==lastDlg){lastDlg=!!dlg;root.classList.toggle("cur-dlg",lastDlg)}
const show=on&&!dlg&&!native;
const op=show?"1":"0";
if(ring.style.opacity!==op){ring.style.opacity=op;dot.style.opacity=op}
if(!show){release();return}
let tx=mx-18,ty=my-18,tw=36,th=36,tr=18;
if(pick&&pick.el.isConnected){
const r=pick.el.getBoundingClientRect();
tx=r.left-6;ty=r.top-6;tw=r.width+12;th=r.height+12;
tr=pick.card?20:Math.min(22,r.height/2+6);
}
const k=reduce?1:.22;
const dx=tx-rx,dy=ty-ry,dw=tw-rw,dh=th-rh,dr=tr-rr;
rx+=dx*k;ry+=dy*k;rw+=dw*k;rh+=dh*k;rr+=dr*k;
ring.style.transform=`translate3d(${rx}px,${ry}px,0) scale(${down?.94:1})`;
ring.style.width=rw+"px";
ring.style.height=rh+"px";
ring.style.borderRadius=rr+"px";
dot.style.transform=`translate3d(${mx}px,${my}px,0) scale(${pick?.45:1})`;
const open=pick&&pick.card&&pick.el.isConnected?pick.el.querySelector(".open"):null;
if(pulled&&pulled!==open)release();
if(open&&!reduce){
const r=pick.el.getBoundingClientRect();
open.style.transform=`translate(${(mx-(r.left+r.width/2))*.07}px,${(my-(r.top+r.height/2))*.07}px)`;
pulled=open;
}
const settled=Math.abs(dx)<.3&&Math.abs(dy)<.3&&Math.abs(dw)<.3&&Math.abs(dh)<.3&&Math.abs(dr)<.3;
if(!settled)kick();
};
const kick=()=>{if(!running){running=true;requestAnimationFrame(frame)}};
addEventListener("pointermove",e=>{
mx=e.clientX;my=e.clientY;
if(!on){on=true;rx=mx-18;ry=my-18}
native=!!(e.target.closest&&e.target.closest("input,select,textarea,option"));
pick=native?null:pickOf(e.target);
kick();
},{passive:true});
addEventListener("pointerdown",()=>{down=true;kick()});
addEventListener("pointerup",()=>{down=false;kick()});
addEventListener("keydown",kick);
addEventListener("scroll",()=>{
if(!on)return;
pick=native?null:pickOf(document.elementFromPoint(mx,my));
kick();
},{passive:true,capture:true});
document.querySelectorAll("dialog").forEach(d=>{
new MutationObserver(kick).observe(d,{attributes:true,attributeFilter:["open"]});
});
root.addEventListener("mouseleave",()=>{on=false;kick()});
})();
