import { criticasDe } from '../lib/criticas.js';

const ORIGINS = ['https://kingkhaax.github.io'];
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ORIGINS.includes(origin) || origin.startsWith('http://localhost:')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  const s = String((req.query && req.query.s) || '').toLowerCase();
  const t = String((req.query && req.query.t) || '').slice(0, 100);
  if (!/^[a-z0-9-]{1,90}$/.test(s)) return res.status(400).json({ error: 'juego' });
  try {
    const r = await criticasDe(s, t);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(r);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'fuente' });
  }
}
