const K = '1MOZgmNFxvmljaQR1X9KAuKvSAYspEJt';
const H = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', accept: 'application/json' };
const BASE = 'https://backend.metacritic.com';

export const OVERRIDES = {
  'leyendas-pokemon-z-a': 'pokemon-legends-z-a',
  'pokemon-diamante-brillante': 'pokemon-brilliant-diamond',
  'pokemon-lets-go-pikachu': 'pokemon-lets-go-pikachu',
  'pokemon-lets-go-eevee': 'pokemon-lets-go-eevee',
  'mario-luigi-conexion-fraternal': 'mario-and-luigi-brothership',
  'pokemon-escarlata': 'pokemon-scarlet',
  'pokemon-espada': 'pokemon-sword',
  'kirby-y-la-tierra-olvidada': 'kirby-and-the-forgotten-land',
  'pokemon-perla-reluciente': 'pokemon-shining-pearl',
};

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const toks = (s) => norm(s).split(' ').filter((x) => x.length > 1 || /\d/.test(x));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jget(url) {
  const r = await fetch(url, { headers: H });
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
}

export async function buscarSlug(texto) {
  const j = await jget(`${BASE}/finder/metacritic/autosuggest/${encodeURIComponent(texto)}?apiKey=${K}`);
  const items = ((j && j.data && j.data.items) || []).filter((x) => x.type === 'game-title');
  if (!items.length) return null;
  const q = new Set(toks(texto));
  let best = null, bs = 0;
  for (const it of items) {
    const t = toks(it.title);
    const inter = t.filter((x) => q.has(x)).length;
    const sc = inter / Math.max(t.length, q.size);
    if (sc > bs) { bs = sc; best = it; }
  }
  return bs >= 0.6 ? best.slug : null;
}

async function pagina(slug, plat, offset) {
  const j = await jget(`${BASE}/reviews/metacritic/critic/games/${slug}/platform/${plat}/web?apiKey=${K}&offset=${offset}&limit=100&filterBySentiment=all&sort=score`);
  return j && j.data ? { total: j.data.totalResults || 0, items: j.data.items || [] } : { total: 0, items: [] };
}
async function resenas(slug, plat, primera) {
  const p0 = primera || (await pagina(slug, plat, 0));
  const t = p0.total;
  if (t <= 10) return p0;
  const offs = new Set([10, 20, t - 10, t - 20, t - 30].filter((o) => o >= 10 && o < t));
  const resto = await Promise.all([...offs].map((o) => pagina(slug, plat, o)));
  return { total: t, items: [...p0.items, ...resto.flatMap((r) => r.items)] };
}

const POS = ['masterpiece', 'brilliant', 'excellent', 'superb', 'fantastic', 'stunning', 'best', 'delight', 'must-play', 'phenomenal', 'incredible', 'joy', 'wonderful', 'outstanding', 'gem', 'perfect'];
const NEG = ['but', 'however', 'lacks', 'disappoint', 'issue', 'flaw', 'problem', 'frustrat', 'repetit', 'bland', 'shallow', 'tedious', 'dated', 'bug', 'mediocre', 'underwhelm', 'unfortunately', 'falls short', 'clunky', 'rough', 'weak', 'poor'];
const hits = (q, arr) => { const l = ' ' + q.toLowerCase().replace(/[^a-z0-9à-ÿ ]+/g, ' ') + ' '; return arr.filter((w) => l.includes(' ' + w)).length; };
const corta = (q) => {
  const t = q.replace(/\s+/g, ' ').trim();
  if (t.length <= 380) return t;
  const c = t.slice(0, 380), p = Math.max(c.lastIndexOf('. '), c.lastIndexOf('! '), c.lastIndexOf('? '));
  return p > 160 ? c.slice(0, p + 1) : c.replace(/\s+\S*$/, '') + '…';
};

export function elegir(items) {
  const v = items.filter((x) => x && x.quote && x.quote.trim().length >= 40 && typeof x.score === 'number');
  const seen = new Set();
  const uniq = v.filter((x) => { const k = x.quote.slice(0, 60); if (seen.has(k)) return false; seen.add(k); return true; });
  const f = (x) => ({ q: corta(x.quote), s: x.score, a: x.publicationName || '', u: x.url || '', d: x.date || '' });
  const pick = (arr, n) => { const out = [], pubs = new Set(); for (const x of arr) { if (pubs.has(x.publicationName)) continue; pubs.add(x.publicationName); out.push(x); if (out.length >= n) break; } return out; };
  const nPos = uniq.length >= 6 ? 3 : Math.floor(uniq.length / 2);
  const pos = pick([...uniq].sort((a, b) => (b.score + hits(b.quote, POS) * 3) - (a.score + hits(a.quote, POS) * 3)), nPos);
  const usados = new Set(pos);
  const resto = uniq.filter((x) => !usados.has(x));
  const bajos = [...resto].sort((a, b) => a.score - b.score).slice(0, Math.max(6, Math.ceil(resto.length * 0.25)));
  const neg = pick(bajos.sort((a, b) => (hits(b.quote, NEG) * 4 - b.score) - (hits(a.quote, NEG) * 4 - a.score)), Math.min(3, Math.max(0, uniq.length >= 6 ? 3 : uniq.length - nPos)));
  return { pos: pos.map(f), neg: neg.map(f), n: uniq.length };
}

export async function traducir(texto) {
  try {
    const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' + encodeURIComponent(texto), { headers: { 'user-agent': H['user-agent'] } });
    if (!r.ok) return null;
    const j = await r.json();
    const t = (j[0] || []).map((x) => x[0]).join('');
    return t && t.trim() ? t.trim() : null;
  } catch { return null; }
}

export async function criticasDe(slugJuego, titulo) {
  let slug = OVERRIDES[slugJuego] || null;
  if (!slug) slug = await buscarSlug(String(slugJuego || '').replace(/-/g, ' '));
  if (!slug && titulo) slug = await buscarSlug(titulo);
  if (!slug) return { vacio: true };
  const primeras = await Promise.all(['nintendo-switch-2', 'nintendo-switch'].map((p) => pagina(slug, p, 0)));
  const plat = primeras[0].total >= primeras[1].total ? 'nintendo-switch-2' : 'nintendo-switch';
  const mejor = await resenas(slug, plat, primeras[plat === 'nintendo-switch-2' ? 0 : 1]);
  if (!mejor || mejor.total < 2) return { vacio: true, mc: slug };
  const e = elegir(mejor.items);
  for (const lista of [e.pos, e.neg]) {
    for (const c of lista) { c.es = await traducir(c.q); await sleep(120); }
  }
  return { mc: slug, plat, total: mejor.total, pos: e.pos, neg: e.neg };
}
