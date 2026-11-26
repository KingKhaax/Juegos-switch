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
      const raw = String(q.q).slice(0, 80);
      const tokens = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 8);
      if (!tokens.length) return res.status(400).json({ error: 'busqueda' });
      const term = (t) => { const f = t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0; return '(' + t + ' OR ' + t + '*' + (f ? ' OR ' + t + '~' + f : '') + ')'; };
      const base = { fq: FQ, rows: 40, fl: FL + ',score', defType: 'edismax', qf: 'title^4 title_extras_txt', pf: 'title^8' };
      let r = await solr({ ...base, q: tokens.map(term).join(' '), 'q.op': 'AND' });
      let aprox = false;
      if (!r.numFound && tokens.length > 1) { r = await solr({ ...base, q: tokens.map(term).join(' '), 'q.op': 'OR' }); aprox = true; }
      const norm = (x) => slugify(x).replace(/-/g, ' ');
      const qn = norm(raw);
      const tri = (x) => { const t = '  ' + x + ' '; const o = new Set(); for (let k = 0; k < t.length - 2; k++) o.add(t.slice(k, k + 3)); return o; };
      const qt = tri(qn);
      const sim = (x) => { const a = tri(x); let c = 0; for (const g of a) if (qt.has(g)) c++; return (2 * c) / (a.size + qt.size || 1); };
      const qw = qn.split(' ');
      const rank = (d) => {
        const tn = norm(d.title);
        const words = tn.split(' ');
        let p = 0;
        if (tn === qn) p += 120;
        else if (tn.startsWith(qn)) p += 70;
        else if (tn.includes(qn)) p += 45;
        for (const w of qw) { if (words.includes(w)) p += 12; else if (words.some((x) => x.startsWith(w))) p += 7; }
        p += sim(tn) * 40;
        p += Math.min(10, (d.score || 0) / 5);
        if (/\b(pack|bundle|lote|dlc|expansion|pase)\b/i.test(d.title)) p -= 15;
        return p;
      };
      const docs = r.docs.map((d) => [rank(d), d]).sort((a, b) => b[0] - a[0]).slice(0, 20).map((x) => x[1]);
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
      return res.status(200).json({ total: r.numFound, aprox, items: docs.map(short) });
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
