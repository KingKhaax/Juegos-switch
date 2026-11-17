const dec = s => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&middot;/g, "·").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export const toks = html => dec(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "|")).split("|").map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
const LABELS = new Set(["Resumen","Desarrollador","Ediciones","Distribuidor","Género","Tags","Jugadores locales","Jugadores online","Edición","Tamaño","PVPR","Historia principal","Principal + Secundarias","Completista","Todos los estilos","Tipo de cartucho","Código del cartucho","Versión cartucho","Tamaño de la actualización","Otros","Rendimiento en Nintendo Switch 2","Explora juegos del mismo género"]);
export const UA = { "User-Agent": "Mozilla/5.0" };
export function parseDetail(slug, html) {
  const t = toks(html);
  const iR = t.indexOf("Resumen");
  if (iR < 0) return null;
  const iD = t.findIndex((s, i) => i < iR && / · /.test(s));
  const d = { slug, nswTitle: iD > 0 ? t[iD - 1] : slug, meta: iD >= 0 && /^\d{1,3}$/.test(t[iD + 1] || "") ? +t[iD + 1] : null, date: iD >= 0 ? t[iD].split(" · ").slice(1).join(" · ") : "", summary: t[iR + 1], genres: [], editions: [], hours: {}, others: [], perf: null };
  const vm = /youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/.exec(html);
  d.video = vm ? vm[1] : null;
  let end = t.indexOf("Explora juegos del mismo género");
  if (end < 0) end = t.length;
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
    else if (l === "Tipo de cartucho") d.cartTipo = vals().join(" ");
    else if (l === "Código del cartucho") d.cartCod = vals().join(" ");
    else if (l === "Versión cartucho") { const v = vals().filter(x => x !== "actualización"); d.cartVer = { cart: v[0] || "", upd: v[1] || "" }; }
    else if (l === "Rendimiento en Nintendo Switch 2") {
      const raw = vals();
      const k = raw.indexOf("Tasa de frames");
      const badge = k > 0 ? raw.slice(0, k).join(" ") : "";
      const pairs = []; for (let j = Math.max(k, 0); j + 1 < raw.length; j += 2) pairs.push([raw[j], raw[j + 1]]);
      const half = pairs.length / 2;
      d.perf = { badge, docked: pairs.slice(0, half), handheld: pairs.slice(half) };
    } else vals();
  }
  return d;
}
