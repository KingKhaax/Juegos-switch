import fs from "node:fs";
const out = process.argv[2];
const slugs = ["leyendas-pokemon-z-a","donkey-kong-bananza","super-mario-bros-wonder","mario-rabbids-sparks-of-hope","mario-rabbids-kingdom-battle","super-mario-party","super-mario-3d-world-bowsers-fury","super-smash-bros-ultimate","pokemon-diamante-brillante","the-legend-of-zelda-breath-of-the-wild","pokemon-lets-go-eevee","mario-luigi-conexion-fraternal","the-legend-of-zelda-tears-of-the-kingdom","mario-strikers-battle-league-football","mario-kart-world","mario-kart-8-deluxe","pokemon-escarlata","leyendas-pokemon-arceus","pokemon-espada","super-mario-odyssey","super-mario-galaxy-1-2","super-mario-maker-2","pokken-tournament-dx","animal-crossing-new-horizons"];
const H = { "User-Agent": "Mozilla/5.0" };
const dec = s => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&middot;/g, "·").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const toks = html => dec(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "|")).split("|").map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
const LABELS = new Set(["Resumen","Desarrollador","Ediciones","Distribuidor","Género","Tags","Jugadores locales","Jugadores online","Edición","Tamaño","PVPR","Historia principal","Principal + Secundarias","Completista","Todos los estilos","Tipo de cartucho","Código del cartucho","Versión cartucho","Tamaño de la actualización","Otros","Rendimiento en Nintendo Switch 2","Explora juegos del mismo género"]);
const details = {};
for (const slug of slugs) {
  const res = await fetch(`https://nswitchex.com/es/details/${slug}/`, { headers: H });
  if (!res.ok) { console.log("ERR", slug, res.status); continue; }
  const html = await res.text();
  const t = toks(html);
  const vm = /youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/.exec(html);
  const iR = t.indexOf("Resumen");
  const iD = t.findIndex((s, i) => i < iR && / · /.test(s));
  const d = { slug, nswTitle: t[iD - 1], meta: /^\d{1,3}$/.test(t[iD + 1] || "") ? +t[iD + 1] : null, date: t[iD].split(" · ").slice(1).join(" · "), summary: t[iR + 1], genres: [], editions: [], hours: {}, others: [], perf: null, video: vm ? vm[1] : null };
  const end = t.indexOf("Explora juegos del mismo género");
  let i = iR + 2;
  const vals = () => { const v = []; while (i < end && !LABELS.has(t[i])) v.push(t[i++]); return v; };
  let ed = null;
  while (i < end) {
    const l = t[i++];
    if (l === "Desarrollador") d.dev = vals().join(", ");
    else if (l === "Distribuidor") d.dist = vals().join(", ");
    else if (l === "Género") d.genres = vals();
    else if (l === "Jugadores locales") d.local = vals().join(" ");
    else if (l === "Jugadores online") d.online = vals().join(" ");
    else if (l === "Edición") { ed = { name: vals().join(" ") }; d.editions.push(ed); }
    else if (l === "Tamaño") { const v = vals().join(" "); const m = /([\d.,]+)\s*MB/.exec(v); (ed || (ed = { name: "Estándar" }, d.editions.push(ed))).sizeMB = m ? parseFloat(m[1].replace(",", ".")) : null; }
    else if (l === "PVPR") { (ed || (ed = { name: "Estándar" }, d.editions.push(ed))).price = vals().join(" "); }
    else if (l === "Historia principal") d.hours.main = vals().join(" ");
    else if (l === "Principal + Secundarias") d.hours.plus = vals().join(" ");
    else if (l === "Completista") d.hours.comp = vals().join(" ");
    else if (l === "Todos los estilos") d.hours.all = vals().join(" ");
    else if (l === "Tamaño de la actualización") { const m = /([\d.,]+)\s*MB/.exec(vals().join(" ")); d.updateMB = m ? parseFloat(m[1].replace(",", ".")) : null; }
    else if (l === "Otros") d.others = vals();
    else if (l === "Rendimiento en Nintendo Switch 2") {
      const raw = vals();
      const k = raw.indexOf("Tasa de frames");
      const badge = k > 0 ? raw.slice(0, k).join(" ") : "";
      const pairs = []; for (let j = Math.max(k, 0); j + 1 < raw.length; j += 2) pairs.push([raw[j], raw[j + 1]]);
      const half = pairs.length / 2;
      d.perf = { badge, docked: pairs.slice(0, half), handheld: pairs.slice(half) };
    } else vals();
  }
  details[slug] = d;
  const img = await fetch(`https://nswitchex.com/static/img/banners/jpg/${slug}.jpg`, { headers: H });
  if (img.ok) fs.writeFileSync(`${out}/img/${slug}.jpg`, Buffer.from(await img.arrayBuffer())); else console.log("NOIMG", slug);
  console.log("ok", slug, d.meta, d.genres.join("/"), d.editions.map(e => e.sizeMB).join(","), d.perf ? "perf" : "");
  await new Promise(r => setTimeout(r, 300));
}
fs.writeFileSync(`${out}/details.js`, "window.DETAILS=" + JSON.stringify(details) + ";\n");
const fav = await fetch("https://nswitchex.com/static/favicon.ico", { headers: H });
if (fav.ok) fs.writeFileSync(`${out}/favicon.ico`, Buffer.from(await fav.arrayBuffer())); else console.log("NOFAV");
