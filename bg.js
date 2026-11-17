(()=>{
const cv=document.getElementById("bg");
if(!cv)return;
const ctx=cv.getContext("2d");
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const COL=["230,0,18","0,195,227","255,255,255"];
const GL=["A","B","X","Y","+","−"];
let w=0,h=0,mx=0,my=0,tx=0,ty=0,raf=0,P=[];
const mk=()=>{
const r=Math.random();
return{x:Math.random()*w,y:Math.random()*h,s:12+Math.random()*30,v:.1+Math.random()*.4,a:Math.random()*6.28,sw:.4+Math.random()*1.2,rot:(Math.random()-.5)*.008,r:Math.random()*6.28,c:COL[Math.floor(Math.random()*COL.length)],g:GL[Math.floor(Math.random()*GL.length)],t:r<.3?0:r<.55?1:r<.8?2:3,z:.3+Math.random()*.7,al:.1+Math.random()*.18};
};
const size=()=>{
const dpr=Math.min(devicePixelRatio||1,2);
w=innerWidth;h=innerHeight;
cv.width=w*dpr;cv.height=h*dpr;
cv.style.width=w+"px";cv.style.height=h+"px";
ctx.setTransform(dpr,0,0,dpr,0,0);
const n=Math.round(Math.min(48,Math.max(18,w*h/30000)));
P=Array.from({length:n},mk);
};
const draw=(p,t)=>{
const px=p.x+Math.sin(t*.0004*p.sw+p.a)*26+tx*p.z*34;
const py=p.y+ty*p.z*34;
ctx.save();
ctx.translate(px,py);
ctx.rotate(p.r);
ctx.globalAlpha=p.al;
ctx.strokeStyle=`rgb(${p.c})`;
ctx.fillStyle=`rgb(${p.c})`;
ctx.lineWidth=2;
if(p.t===0){ctx.beginPath();ctx.arc(0,0,p.s/2,0,6.283);ctx.stroke()}
else if(p.t===1){ctx.globalAlpha=p.al*.6;ctx.beginPath();ctx.arc(0,0,p.s/3,0,6.283);ctx.fill()}
else if(p.t===2){ctx.font=`800 ${p.s}px Nunito,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(p.g,0,0)}
else{ctx.beginPath();(ctx.roundRect||ctx.rect).call(ctx,-p.s*.3,-p.s*.8,p.s*.6,p.s*1.6,p.s*.3);ctx.stroke()}
ctx.restore();
};
const frame=t=>{
tx+=(mx-tx)*.04;ty+=(my-ty)*.04;
ctx.clearRect(0,0,w,h);
for(const p of P){p.y-=p.v;p.r+=p.rot;if(p.y<-70){p.y=h+70;p.x=Math.random()*w}draw(p,t)}
raf=requestAnimationFrame(frame);
};
size();
addEventListener("resize",size);
if(reduce){ctx.clearRect(0,0,w,h);P.forEach(p=>draw(p,0))}
else{
raf=requestAnimationFrame(frame);
document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(raf);else raf=requestAnimationFrame(frame)});
}
let pend=false;
addEventListener("pointermove",e=>{
mx=(e.clientX/w-.5)*2;my=(e.clientY/h-.5)*2;
if(pend)return;
pend=true;
requestAnimationFrame(()=>{pend=false;document.documentElement.style.setProperty("--cx",e.clientX+"px");document.documentElement.style.setProperty("--cy",e.clientY+"px")});
},{passive:true});
})();
