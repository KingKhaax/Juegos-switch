import fs from "node:fs";
const root = process.argv[2] || ".";
const txtPath = process.argv[3] || "";
const win = {};
new Function("window", fs.readFileSync(`${root}/games.js`, "utf8") + fs.readFileSync(`${root}/orden.js`, "utf8"))(win);
const byslug = Object.fromEntries(win.GAMES.map(g => [g.slug, g]));
const pub = (win.ORDEN && win.ORDEN.order) || [];
const def = win.GAMES.map(g => g.slug);
const seen = new Set();
const order = [...pub.filter(s => byslug[s] && !seen.has(s) && seen.add(s)), ...def.filter(s => !seen.has(s))];
const AB = { sp: "SP", cl: "CL", co: "CO", ml: "ML", mo: "MO" };
const rows = order.map((s, i) => { const g = byslug[s]; return `| ${i + 1} | ${g.title} | \`${g.slug}\` | ${g.k} | ${g.s} | ${g.m.map(m => AB[m]).join(", ")} |`; });
let r = fs.readFileSync(`${root}/README.md`, "utf8");
const lines = r.split("\n");
const hi = lines.findIndex(l => l.startsWith("| # | Juego"));
if (hi < 0) throw new Error("no se encuentra la tabla de la lista en el README");
let end = hi + 2;
while (end < lines.length && lines[end].startsWith("| ")) end++;
lines.splice(hi + 2, end - (hi + 2), ...rows);
fs.writeFileSync(`${root}/README.md`, lines.join("\n"));
console.log("README: tabla con", rows.length, "juegos en el orden publicado (orden.js, actualizado", win.ORDEN && win.ORDEN.updated, ")");
if (txtPath && fs.existsSync(txtPath)) {
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const t = fs.readFileSync(txtPath, "utf8").split("\n");
  const isItem = l => /^\s*\d+\.\s/.test(l);
  const first = t.findIndex(isItem);
  const items = t.filter(isItem).map(l => l.replace(/^\s*\d+\.\s*/, ""));
  const key = l => norm(l.split(/\s\.{2,}/)[0]);
  const used = new Set();
  const sorted = order.map(s => {
    const g = byslug[s];
    const k = norm(g.title);
    const i = items.findIndex((l, j) => !used.has(j) && key(l) === k);
    if (i >= 0) { used.add(i); return items[i]; }
    return `${g.title} ......... (añadir los modos)`;
  });
  const out = [...t.slice(0, first), ...sorted.map((l, i) => `${String(i + 1).padStart(2, " ")}. ${l}`), ""];
  fs.writeFileSync(txtPath, out.join("\n"));
  console.log("txt:", sorted.length, "líneas ordenadas");
}
