(()=>{
const R={
kanto:["Kanto","kanto"],johto:["Johto","johto"],hoenn:["Hoenn","hoenn"],sinnoh:["Sinnoh","sinnoh"],hisui:["Hisui (la antigua Sinnoh)","hisui"],
kalos:["Kalos · Ciudad Luminalia","kalos"],galar:["Galar","galar"],paldea:["Paldea","paldea"],ferrum:["Ferrum","ferrum"],nueva:["Región nueva · islas del sudeste asiático","nueva"]
};
const N=["","Primera","Segunda","Tercera","Cuarta","Quinta","Sexta","Séptima","Octava","Novena","Décima"];
const ROM=["","I","II","III","IV","V","VI","VII","VIII","IX","X"];
const P={
"pokemon-lets-go-pikachu":{m:1,r:"kanto",g:[1,7]},
"pokemon-lets-go-eevee":{m:1,r:"kanto",g:[1,7]},
"pokemon-diamante-brillante":{m:4,r:"sinnoh",g:[1,2,3,4]},
"pokemon-perla-reluciente":{m:4,r:"sinnoh",g:[1,2,3,4]},
"leyendas-pokemon-arceus":{m:8,r:"hisui",g:[1,2,3,4,5,6,7,8]},
"pokemon-espada":{m:8,r:"galar",g:[1,2,3,4,5,6,7,8]},
"pokemon-escarlata":{m:9,r:"paldea",g:[1,2,3,4,5,6,7,8,9]},
"leyendas-pokemon-z-a":{m:6,r:"kalos",g:[1,2,3,4,5,6]},
"pokken-tournament-dx":{m:1,r:"ferrum",g:[1,2,3,4,5,6,7]},
"pokemon-oleaje":{m:10,r:"nueva",g:[10],soon:true},
"pokemon-viento":{m:10,r:"nueva",g:[10],soon:true}
};
const pin='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>';
window.pkPills=slug=>{
const p=P[slug];
if(!p)return"";
const reg=R[p.r];
const gens=p.g.map((n,i)=>`<span class="pk-gen g${n}${n===p.m?" main":""}" style="--i:${i}" title="${N[n]} generación${n===p.m?": la principal del juego":""}">${n===p.m?'<span class="pk-star" aria-hidden="true">★</span>':""}<span class="pk-gi" aria-hidden="true"><i>${ROM[n]}</i></span><span class="pk-gn">${N[n]}</span>${n===p.m?'<span class="pk-mainl">Principal</span>':""}</span>`).join("");
return `<div class="pk-tags" aria-label="Región y generaciones"><span class="pk-reg r-${reg[1]}">${pin}<span>${reg[0]}</span></span><span class="pk-gl">${p.g.length>1?"Generaciones":"Generación"}${p.soon?" (por confirmar)":""}</span>${gens}</div>`;
};
})();
