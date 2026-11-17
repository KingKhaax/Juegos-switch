(()=>{
const cv=document.getElementById("bg");
if(!cv)return;
const ctx=cv.getContext("2d");
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const COL=["230,0,18","0,195,227","255,255,255"];
const GL=["A","B","X","Y","+","−"];
let w=0,h=0,dpr=1,mx=0,my=0,tx=0,ty=0,raf=0,P=[];
const sprite=p=>{
const sz=Math.ceil(p.s*1.7)+12;
const c=document.createElement("canvas");
c.width=c.height=Math.ceil(sz*dpr);
const x=c.getContext("2d");
x.scale(dpr,dpr);
x.translate(sz/2,sz/2);
x.strokeStyle=x.fillStyle=`rgb(${p.c})`;
x.lineWidth=2;
if(p.t===0){x.beginPath();x.arc(0,0,p.s/2,0,6.283);x.stroke()}
else if(p.t===1){x.beginPath();x.arc(0,0,p.s/3,0,6.283);x.fill()}
else if(p.t===2){x.font=`800 ${p.s}px Nunito,sans-serif`;x.textAlign="center";x.textBaseline="middle";x.fillText(p.g,0,0)}
else{x.beginPath();(x.roundRect||x.rect).call(x,-p.s*.3,-p.s*.8,p.s*.6,p.s*1.6,p.s*.3);x.stroke()}
p.sz=sz;
return c;
};
const mk=()=>{
const r=Math.random();
const p={x:Math.random()*w,y:Math.random()*h,s:12+Math.random()*30,v:.1+Math.random()*.4,a:Math.random()*6.28,sw:.4+Math.random()*1.2,rot:(Math.random()-.5)*.008,r:Math.random()*6.28,c:COL[Math.floor(Math.random()*COL.length)],g:GL[Math.floor(Math.random()*GL.length)],t:r<.3?0:r<.55?1:r<.8?2:3,z:.3+Math.random()*.7,al:.1+Math.random()*.18};
if(p.t===1)p.al*=.6;
p.img=sprite(p);
return p;
};
const size=()=>{
dpr=Math.min(devicePixelRatio||1,1.5);
w=innerWidth;h=innerHeight;
cv.width=w*dpr;cv.height=h*dpr;
cv.style.width=w+"px";cv.style.height=h+"px";
ctx.setTransform(dpr,0,0,dpr,0,0);
const n=Math.round(Math.min(34,Math.max(14,w*h/42000)));
P=Array.from({length:n},mk);
};
const draw=(p,t)=>{
ctx.save();
ctx.translate(p.x+Math.sin(t*.0004*p.sw+p.a)*26+tx*p.z*34,p.y+ty*p.z*34);
ctx.rotate(p.r);
ctx.globalAlpha=p.al;
ctx.drawImage(p.img,-p.sz/2,-p.sz/2,p.sz,p.sz);
ctx.restore();
};
const off=()=>document.documentElement.classList.contains("no-bg");
const frame=t=>{
if(off()){raf=0;return}
raf=requestAnimationFrame(frame);
if(document.querySelector("dialog[open]"))return;
tx+=(mx-tx)*.04;ty+=(my-ty)*.04;
ctx.clearRect(0,0,w,h);
for(const p of P){p.y-=p.v;p.r+=p.rot;if(p.y<-70){p.y=h+70;p.x=Math.random()*w}draw(p,t)}
};
let rt=0;
addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(size,200)});
size();
if(reduce){P.forEach(p=>draw(p,0))}
else{
raf=requestAnimationFrame(frame);
document.addEventListener("visibilitychange",()=>{cancelAnimationFrame(raf);if(!document.hidden)raf=requestAnimationFrame(frame)});
}
document.addEventListener("ajustes",()=>{if(!off()&&!raf&&!reduce)raf=requestAnimationFrame(frame)});
let pend=false,mx2=0,my2=0;
const spot=document.querySelector(".bg .spot");
addEventListener("pointermove",e=>{
mx=(e.clientX/w-.5)*2;my=(e.clientY/h-.5)*2;
mx2=e.clientX;my2=e.clientY;
if(pend)return;
pend=true;
requestAnimationFrame(()=>{pend=false;if(spot)spot.style.transform=`translate3d(${mx2}px,${my2}px,0)`});
},{passive:true});
})();
