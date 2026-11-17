import fs from "node:fs";
import { parseDetail, UA } from "./parse.mjs";
const out = process.argv[2] || ".";
const slugs = ["leyendas-pokemon-z-a","donkey-kong-bananza","super-mario-bros-wonder","mario-rabbids-sparks-of-hope","mario-rabbids-kingdom-battle","super-mario-party","super-mario-3d-world-bowsers-fury","super-smash-bros-ultimate","pokemon-diamante-brillante","the-legend-of-zelda-breath-of-the-wild","pokemon-lets-go-eevee","mario-luigi-conexion-fraternal","the-legend-of-zelda-tears-of-the-kingdom","mario-strikers-battle-league-football","mario-kart-world","mario-kart-8-deluxe","pokemon-escarlata","leyendas-pokemon-arceus","pokemon-espada","super-mario-odyssey","super-mario-galaxy-1-2","super-mario-maker-2","pokken-tournament-dx","kirby-y-la-tierra-olvidada","animal-crossing-new-horizons"];
fs.mkdirSync(`${out}/img`, { recursive: true });
const details = {};
for (const slug of slugs) {
  const res = await fetch(`https://nswitchex.com/es/details/${slug}/`, { headers: UA });
  if (!res.ok) { console.log("ERR", slug, res.status); continue; }
  const d = parseDetail(slug, await res.text());
  if (!d) { console.log("SIN DATOS", slug); continue; }
  details[slug] = d;
  const img = await fetch(`https://nswitchex.com/static/img/banners/jpg/${slug}.jpg`, { headers: UA });
  if (img.ok) fs.writeFileSync(`${out}/img/${slug}.jpg`, Buffer.from(await img.arrayBuffer())); else console.log("NOIMG", slug);
  console.log("ok", slug, d.meta, d.genres.join("/"), d.editions.map(e => e.sizeMB).join(","), d.perf ? "perf" : "", d.video || "sin vídeo");
  await new Promise(r => setTimeout(r, 300));
}
fs.writeFileSync(`${out}/details.js`, "window.DETAILS=" + JSON.stringify(details) + ";\n");
const fav = await fetch("https://nswitchex.com/static/favicon.ico", { headers: UA });
if (fav.ok) fs.writeFileSync(`${out}/favicon.ico`, Buffer.from(await fav.arrayBuffer())); else console.log("NOFAV");
