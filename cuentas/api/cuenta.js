import { put, get } from '@vercel/blob';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

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

function makeToken(user, ep = 0) {
  const body = Buffer.from(user).toString('base64url') + '.' + (Date.now() + 180 * DAY) + '.' + ep;
  return body + '.' + sign(body);
}
function readToken(t) {
  if (typeof t !== 'string') return null;
  const p = t.split('.');
  const sig = p.pop();
  const [u, exp, e] = p;
  if (!u || !exp || !sig) return null;
  const body = p.join('.');
  const good = sign(body);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  if (+exp < Date.now()) return null;
  const user = Buffer.from(u, 'base64url').toString();
  return okUser(user) ? { user, ep: +(e || 0) } : null;
}
const okMail = (m) => typeof m === 'string' && m.length <= 80 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m);
const maskMail = (m) => (m ? m.replace(/^(.).*(@.*)$/, '$1***$2') : '');
const MAIL_USER = process.env.GMAIL_USER || '';
const MAIL_PASS = process.env.GMAIL_APP_PASSWORD || '';
async function sendCode(to, code) {
  const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: MAIL_USER, pass: MAIL_PASS } });
  await tr.sendMail({
    from: '"Jueguitos Switch" <' + MAIL_USER + '>',
    to,
    subject: 'Tu código para recuperar la contraseña: ' + code,
    text: 'Tu código es ' + code + '. Caduca en 15 minutos. Si no lo has pedido tú, ignora este correo y no pasa nada.\n\nJueguitos Switch',
  });
}
const normAns = (s) => String(s || '').trim().toLowerCase().replace(/s+/g, ' ');
const okAns = (s) => normAns(s).length >= 3 && normAns(s).length <= 60;
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
      const raw = String(b.user || '').trim();
      const user = raw.toLowerCase();
      const pass = b.pass;
      if (!okUser(user)) return res.status(400).json({ error: 'usuario' });
      if (!okPass(pass)) return res.status(400).json({ error: 'clave' });
      const rec = await load(user);
      if (a === 'registro') {
        if (rec) return res.status(409).json({ error: 'existe' });
        const salt = crypto.randomBytes(16).toString('hex');
        const data = {};
        if (okPerfil(b.perfil) && okData(b.data)) data[b.perfil] = b.data;
        const nrec = { display: raw, salt, hash: await hashPass(pass, salt), data, updated: Date.now(), created: Date.now() };
        await save(user, nrec);
        return res.status(200).json({ token: makeToken(user), user, nombre: raw, data: nrec.data, updated: nrec.updated });
      }
      if (!rec) { await sleep(400); return res.status(401).json({ error: 'credenciales' }); }
      if (rec.llock && rec.llock > Date.now()) return res.status(429).json({ error: 'bloqueo' });
      const h = await hashPass(pass, rec.salt);
      if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.hash, 'hex'))) {
        rec.lf = (rec.lf || 0) + 1;
        if (rec.lf >= 8) { rec.lf = 0; rec.llock = Date.now() + 15 * 60000; }
        await save(user, rec);
        await sleep(400);
        return res.status(401).json({ error: 'credenciales' });
      }
      if (rec.lf || rec.llock) { rec.lf = 0; rec.llock = 0; await save(user, rec); }
      return res.status(200).json({ token: makeToken(user, rec.epoch || 0), user, nombre: rec.display || user, data: slots(rec.data), updated: rec.updated || 0 });
    }
    if (req.method === 'POST' && a === 'perfil') {
      const tk = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!tk) return res.status(401).json({ error: 'sesion' });
      const user = tk.user;
      const rec = await load(user);
      if (!rec || (rec.epoch || 0) !== tk.ep) return res.status(401).json({ error: 'sesion' });
      const b = await body(req);
      if (b.nombre !== undefined) {
        const n = String(b.nombre).trim();
        if (n.toLowerCase() !== user) return res.status(400).json({ error: 'nombre' });
        rec.display = n;
      }
      if (b.pregunta !== undefined) {
        const q = String(b.pregunta).trim();
        if (q.length < 3 || q.length > 80 || !okAns(b.respuesta)) return res.status(400).json({ error: 'pregunta' });
        const h = await hashPass(String(b.actual || ''), rec.salt);
        if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.hash, 'hex'))) { await sleep(400); return res.status(401).json({ error: 'credenciales' }); }
        rec.q = q;
        rec.qsalt = crypto.randomBytes(16).toString('hex');
        rec.ah = await hashPass(normAns(b.respuesta), rec.qsalt);
      }
      if (b.correo !== undefined) {
        const m = String(b.correo).trim().toLowerCase();
        const h = await hashPass(String(b.actual || ''), rec.salt);
        if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.hash, 'hex'))) { await sleep(400); return res.status(401).json({ error: 'credenciales' }); }
        if (m && !okMail(m)) return res.status(400).json({ error: 'correo' });
        rec.email = m;
      }
      if (b.nueva) {
        if (!okPass(b.nueva)) return res.status(400).json({ error: 'clave' });
        const h = await hashPass(String(b.actual || ''), rec.salt);
        if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.hash, 'hex'))) { await sleep(400); return res.status(401).json({ error: 'credenciales' }); }
        rec.salt = crypto.randomBytes(16).toString('hex');
        rec.hash = await hashPass(b.nueva, rec.salt);
      }
      await save(user, rec);
      return res.status(200).json({ nombre: rec.display || user, pregunta: rec.q || '', correo: maskMail(rec.email) });
    }
    if (req.method === 'POST' && a === 'cerrar') {
      const tk = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!tk) return res.status(401).json({ error: 'sesion' });
      const rec = await load(tk.user);
      if (!rec || (rec.epoch || 0) !== tk.ep) return res.status(401).json({ error: 'sesion' });
      rec.epoch = (rec.epoch || 0) + 1;
      await save(tk.user, rec);
      return res.status(200).json({ token: makeToken(tk.user, rec.epoch) });
    }
    if (req.method === 'POST' && a === 'pregunta') {
      const b = await body(req);
      const u = String(b.user || '').trim().toLowerCase();
      const rec = okUser(u) ? await load(u) : null;
      return res.status(200).json({ pregunta: (rec && rec.q) || '', correo: !!(rec && rec.email && MAIL_USER && MAIL_PASS) });
    }
    if (req.method === 'POST' && a === 'codigo') {
      const b = await body(req);
      const u = String(b.user || '').trim().toLowerCase();
      if (!okUser(u)) return res.status(400).json({ error: 'usuario' });
      if (!MAIL_USER || !MAIL_PASS) return res.status(503).json({ error: 'correo_no' });
      const rec = await load(u);
      if (rec && rec.email) {
        if (rec.rclast && Date.now() - rec.rclast < 60000) return res.status(429).json({ error: 'espera' });
        const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        rec.rcsalt = crypto.randomBytes(16).toString('hex');
        rec.rch = await hashPass(code, rec.rcsalt);
        rec.rcexp = Date.now() + 15 * 60000;
        rec.rcfa = 0;
        rec.rclast = Date.now();
        await save(u, rec);
        try { await sendCode(rec.email, code); } catch { return res.status(502).json({ error: 'envio' }); }
      } else await sleep(600);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'POST' && a === 'recuperar_codigo') {
      const b = await body(req);
      const u = String(b.user || '').trim().toLowerCase();
      const code = String(b.codigo || '').trim();
      if (!okUser(u) || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'codigo' });
      if (!okPass(b.nueva)) return res.status(400).json({ error: 'clave' });
      const rec = await load(u);
      if (!rec || !rec.rch || (rec.rcexp || 0) < Date.now() || (rec.rcfa || 0) >= 5) { await sleep(600); return res.status(401).json({ error: 'codigo' }); }
      const h = await hashPass(code, rec.rcsalt);
      if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.rch, 'hex'))) {
        rec.rcfa = (rec.rcfa || 0) + 1;
        await save(u, rec);
        await sleep(600);
        return res.status(401).json({ error: 'codigo' });
      }
      rec.rch = '';
      rec.rcexp = 0;
      rec.salt = crypto.randomBytes(16).toString('hex');
      rec.hash = await hashPass(b.nueva, rec.salt);
      rec.epoch = (rec.epoch || 0) + 1;
      rec.lf = 0;
      rec.llock = 0;
      await save(u, rec);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'POST' && a === 'recuperar') {
      const b = await body(req);
      const u = String(b.user || '').trim().toLowerCase();
      if (!okUser(u) || !okAns(b.respuesta)) return res.status(400).json({ error: 'respuesta' });
      if (!okPass(b.nueva)) return res.status(400).json({ error: 'clave' });
      const rec = await load(u);
      if (!rec || !rec.ah) { await sleep(400); return res.status(401).json({ error: 'respuesta' }); }
      if (rec.lock && rec.lock > Date.now()) return res.status(429).json({ error: 'bloqueo' });
      const h = await hashPass(normAns(b.respuesta), rec.qsalt);
      if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.ah, 'hex'))) {
        rec.fa = (rec.fa || 0) + 1;
        if (rec.fa >= 5) { rec.fa = 0; rec.lock = Date.now() + 15 * 60000; }
        await save(u, rec);
        await sleep(800);
        return res.status(401).json({ error: 'respuesta' });
      }
      rec.fa = 0;
      rec.lock = 0;
      rec.salt = crypto.randomBytes(16).toString('hex');
      rec.hash = await hashPass(b.nueva, rec.salt);
      rec.epoch = (rec.epoch || 0) + 1;
      await save(u, rec);
      return res.status(200).json({ ok: true });
    }
    if (a === 'datos') {
      const tk = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!tk) return res.status(401).json({ error: 'sesion' });
      const user = tk.user;
      const rec = await load(user);
      if (!rec || (rec.epoch || 0) !== tk.ep) return res.status(401).json({ error: 'sesion' });
      if (req.method === 'GET') return res.status(200).json({ user, nombre: rec.display || user, pregunta: rec.q || '', correo: maskMail(rec.email), data: slots(rec.data), updated: rec.updated || 0 });
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
