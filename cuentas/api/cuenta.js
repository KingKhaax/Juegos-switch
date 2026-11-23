import { put, get } from '@vercel/blob';
import crypto from 'node:crypto';

const ORIGINS = ['https://kingkhaax.github.io'];
const SECRET = process.env.CUENTAS_SECRET || '';
const DAY = 86400000;
const MAXDATA = 300000;

const okUser = (u) => typeof u === 'string' && /^[a-z0-9._-]{3,24}$/.test(u);
const okPass = (p) => typeof p === 'string' && p.length >= 6 && p.length <= 100;
const path = (u) => `cuentas/${u}.json`;
const PERFILES = ['rafa', 'novia'];
const okPerfil = (p) => PERFILES.includes(p);
function slots(d) {
  if (!d || typeof d !== 'object') return {};
  if (Object.keys(d).some((k) => k.startsWith('juegos-switch-'))) {
    const r = {}, n = {};
    for (const [k, v] of Object.entries(d)) (k.endsWith('-novia') ? n : r)[k] = v;
    return { rafa: r, novia: n };
  }
  return d;
}
const okData = (d) => d && typeof d === 'object' && !Array.isArray(d) && JSON.stringify(d).length <= MAXDATA;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hashPass = (pass, salt) => new Promise((res, rej) => crypto.scrypt(pass, salt, 64, (e, k) => (e ? rej(e) : res(k.toString('hex')))));
const sign = (s) => crypto.createHmac('sha256', SECRET).update(s).digest('base64url');

function makeToken(user) {
  const body = Buffer.from(user).toString('base64url') + '.' + (Date.now() + 180 * DAY);
  return body + '.' + sign(body);
}
function readToken(t) {
  if (typeof t !== 'string') return null;
  const [u, exp, sig] = t.split('.');
  if (!u || !exp || !sig) return null;
  const body = u + '.' + exp;
  const good = sign(body);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  if (+exp < Date.now()) return null;
  const user = Buffer.from(u, 'base64url').toString();
  return okUser(user) ? user : null;
}
async function load(user) {
  const r = await get(path(user), { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse(await new Response(r.stream).text());
}
const save = (user, rec) => put(path(user), JSON.stringify(rec), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let s = '';
  for await (const c of req) { s += c; if (s.length > MAXDATA * 2) break; }
  try { return JSON.parse(s || '{}'); } catch { return {}; }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!SECRET) return res.status(500).json({ error: 'config' });
  const a = (req.query && req.query.a) || '';
  try {
    if (req.method === 'POST' && (a === 'registro' || a === 'entrar')) {
      const b = await body(req);
      const user = String(b.user || '').trim().toLowerCase();
      const pass = b.pass;
      if (!okUser(user)) return res.status(400).json({ error: 'usuario' });
      if (!okPass(pass)) return res.status(400).json({ error: 'clave' });
      const rec = await load(user);
      if (a === 'registro') {
        if (rec) return res.status(409).json({ error: 'existe' });
        const salt = crypto.randomBytes(16).toString('hex');
        const data = {};
        if (okPerfil(b.perfil) && okData(b.data)) data[b.perfil] = b.data;
        const nrec = { salt, hash: await hashPass(pass, salt), data, updated: Date.now(), created: Date.now() };
        await save(user, nrec);
        return res.status(200).json({ token: makeToken(user), user, data: nrec.data, updated: nrec.updated });
      }
      if (!rec) { await sleep(400); return res.status(401).json({ error: 'credenciales' }); }
      const h = await hashPass(pass, rec.salt);
      if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.hash, 'hex'))) { await sleep(400); return res.status(401).json({ error: 'credenciales' }); }
      return res.status(200).json({ token: makeToken(user), user, data: slots(rec.data), updated: rec.updated || 0 });
    }
    if (a === 'datos') {
      const user = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!user) return res.status(401).json({ error: 'sesion' });
      const rec = await load(user);
      if (!rec) return res.status(401).json({ error: 'sesion' });
      if (req.method === 'GET') return res.status(200).json({ user, data: slots(rec.data), updated: rec.updated || 0 });
      if (req.method === 'PUT') {
        const b = await body(req);
        if (!okPerfil(b.perfil) || !okData(b.data)) return res.status(400).json({ error: 'datos' });
        rec.data = slots(rec.data);
        rec.data[b.perfil] = b.data;
        rec.updated = Date.now();
        await save(user, rec);
        return res.status(200).json({ updated: rec.updated });
      }
    }
    return res.status(404).json({ error: 'ruta' });
  } catch (e) {
    return res.status(500).json({ error: 'servidor' });
  }
}
