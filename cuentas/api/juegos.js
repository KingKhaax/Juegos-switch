const UA = { 'User-Agent': 'Mozilla/5.0' };

const ORIGINS = ['https://kingkhaax.github.io'];
const SOLR = 'https://searching.nintendo-europe.com/es/select';
const FQ = 'type:GAME AND (playable_on_txt:HAC OR playable_on_txt:BEE)';
const FL = 'fs_id,title,playable_on_txt,date_from,publisher,datasize_readable_txt,price_regular_f,price_lowest_f,image_url_sq_s,image_url_h2x1_s,image_url_h16x9_s,excerpt,product_catalog_description_s,pretty_game_categories_txt,players_to,players_to_local_i,players_to_online_i,pretty_agerating_s';

const toMB = (a) => {
  const s = Array.isArray(a) ? a[0] : a;
  const m = /([\d.,]+)\s*(GB|MB|KB)/i.exec(s || '');
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  const u = m[2].toUpperCase();
  return Math.round(u === 'GB' ? n * 1024 : u === 'MB' ? n : n / 1024);
};
const plat = (d) => {
  const p = (d.playable_on_txt || []).map((x) => String(x).toUpperCase());
  const s1 = p.includes('HAC');
  const s2 = p.includes('BEE');
  if (s2 && !s1) return 's2';
  if (s1 && s2) return /switch 2 edition/i.test(d.title || '') ? 's2e' : 's1';
  return /switch 2 edition/i.test(d.title || '') ? 's2e' : 's1';
};
const slugify = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const eur = (n) => (typeof n === 'number' && n > 0 ? n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '');
const longDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};
const short = (d) => ({
  id: String(d.fs_id),
  t: d.title,
  k: plat(d),
  img: d.image_url_sq_s || d.image_url_h2x1_s || d.image_url_h16x9_s || '',
  d: (d.date_from || '').slice(0, 10),
  pub: d.publisher || '',
  sz: toMB(d.datasize_readable_txt),
  pr: typeof d.price_regular_f === 'number' && d.price_regular_f > 0 ? d.price_regular_f : null,
});

async function solr(params) {
  const u = new URL(SOLR);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set('wt', 'json');
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error('solr ' + r.status);
  return (await r.json()).response;
}

function build(d) {
  const k = plat(d);
  const size = toMB(d.datasize_readable_txt);
  const price = eur(d.price_regular_f);
  const base = {
    nswTitle: d.title,
    meta: null,
    date: longDate(d.date_from),
    summary: String(d.excerpt || d.product_catalog_description_s || '').slice(0, 700),
    genres: d.pretty_game_categories_txt || [],
    editions: [{ name: k === 's2' ? 'Nintendo Switch 2' : 'Estándar', sizeMB: size, price }],
    hours: {},
    dev: '',
    dist: d.publisher || '',
    local: d.players_to_local_i ? '1-' + d.players_to_local_i : '',
    online: d.players_to_online_i ? '1-' + d.players_to_online_i : '',
    others: [],
    perf: null,
    video: null,
    pegi: d.pretty_agerating_s || '',
  };
  return base;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ORIGINS.includes(origin) || origin.startsWith('http://localhost:')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'metodo' });
  const q = req.query || {};
  try {
    if (q.q !== undefined) {
      const tokens = String(q.q).replace(/[+\-&|!(){}\[\]^"~*?:\\/]/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 8);
      if (!tokens.length) return res.status(400).json({ error: 'busqueda' });
      const keep = tokens.filter((t, i) => t.length >= 3 || i === tokens.length - 1);
      const query = keep.map((t) => '(' + t + ' OR ' + t + '*)').join(' ');
      const r = await solr({ q: query, fq: FQ, rows: 14, fl: FL, defType: 'edismax', qf: 'title^4 title_extras_txt', 'q.op': 'AND' });
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
      return res.status(200).json({ total: r.numFound, items: r.docs.map(short) });
    }
    if (q.id !== undefined) {
      const id = String(q.id).replace(/\D/g, '');
      if (!id) return res.status(400).json({ error: 'id' });
      const r = await solr({ q: 'fs_id:' + id, fq: 'type:GAME', rows: 1, fl: FL });
      const d = r.docs[0];
      if (!d) return res.status(404).json({ error: 'no_existe' });
      const s = short(d);
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=7200');
      return res.status(200).json({ ...s, c: { sq: d.image_url_sq_s || '', h: d.image_url_h2x1_s || d.image_url_h16x9_s || d.image_url_sq_s || '' }, detail: build(d) });
    }
    return res.status(400).json({ error: 'parametros' });
  } catch (e) {
    return res.status(502).json({ error: 'origen' });
  }
}
