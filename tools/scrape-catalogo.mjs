import fs from "node:fs";
import { parseDetail, UA } from "./parse.mjs";
const out = process.argv[2] || ".";
const sm = await (await fetch("https://nswitchex.com/sitemap.xml", { headers: UA })).text();
const slugs = [...new Set([...sm.matchAll(/nswitchex\.com\/es\/details\/([^/<]+)\//g)].map(m => m[1]))];
const g = {};
let fails = 0;
for (const slug of slugs) {
  try {
    const r = await fetch(`https://nswitchex.com/es/details/${slug}/`, { headers: UA });
    if (!r.ok) { fails++; console.log("ERR", slug, r.status); continue; }
    const d = parseDetail(slug, await r.text());
    if (!d) { fails++; continue; }
    delete d.slug;
    if (d.summary && d.summary.length > 700) d.summary = d.summary.slice(0, 700);
    g[slug] = d;
  } catch (e) { fails++; console.log("ERR", slug, e.message); }
  await new Promise(r => setTimeout(r, 250));
}
if (Object.keys(g).length < 50) { console.log("demasiados fallos, no se escribe"); process.exit(2); }
fs.writeFileSync(`${out}/nsw-catalogo.json`, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), g }));
console.log(Object.keys(g).length, "fichas,", fails, "fallos");
