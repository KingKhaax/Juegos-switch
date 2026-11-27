import { put, get, list } from '@vercel/blob';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { mandarAviso, HORA, DIAS14 } from '../lib/prestamos.js';
import { POR_DEFECTO, limpiar, construir } from '../lib/pagos.js';

const ORIGINS = ['https://kingkhaax.github.io'];
const SECRET = process.env.CUENTAS_SECRET || '';
const DAY = 86400000;
const MAXDATA = 900000;

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
const ADMIN = 'kingkhaax';
const MODS = { zya: 'Moderador' };
const DUENOS = { rafa: ADMIN, novia: 'zya' };
const PERSONAL = /^juegos-switch-(avatar|nintendo|amigo|nso|prestados)(-novia)?$/;
const ROLES_RUTA = 'config/roles.json';
const PAGOS_RUTA = 'config/pagos.json';
const PREST_RUTA = 'config/prestamos.json';
const CRON_KEY = process.env.CRON_KEY || '';
async function loadPrest() {
  try {
    const g = await get(PREST_RUTA, { access: 'private', useCache: false });
    if (g && g.statusCode === 200) {
      const j = JSON.parse(await new Response(g.stream).text());
      if (j && typeof j === 'object') return j;
    }
  } catch {}
  return {};
}
const savePrest = (p) => put(PREST_RUTA, JSON.stringify(p), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
const okSlug = (s) => typeof s === 'string' && /^[a-z0-9-]{1,90}$/.test(s);
async function avisarSiToca(user, k, it, rec) {
  if (it.avisado || it.fin <= Date.now() || it.fin - Date.now() > HORA + 120000) return false;
  if (!rec || !rec.email || !MAIL_USER || !MAIL_PASS) return false;
  await mandarAviso(MAIL_USER, MAIL_PASS, rec.email, it.titulo, it.fin);
  it.avisado = true;
  return true;
}
async function loadPagos() {
  try {
    const g = await get(PAGOS_RUTA, { access: 'private', useCache: false });
    if (g && g.statusCode === 200) {
      const j = limpiar(JSON.parse(await new Response(g.stream).text()));
      if (j) return j;
    }
  } catch {}
  return POR_DEFECTO;
}
const savePagos = (p) => put(PAGOS_RUTA, JSON.stringify(p), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
async function mandarPagos(to, p) {
  const buf = await construir(p, await loadRoles());
  const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: MAIL_USER, pass: MAIL_PASS } });
  const pag = p.miembros.filter((m) => m.pagado).length;
  await tr.sendMail({
    from: '"Jueguitos Switch" <' + MAIL_USER + '>',
    to,
    subject: 'Pagos Switch Online: ' + pag + ' de ' + p.miembros.length + ' pagados',
    text: ['Te adjunto el Excel de pagos del Switch Online actualizado.', '', 'Cuota por persona: ' + p.cuota.toFixed(2) + ' €', 'Pagados: ' + pag + ' / ' + p.miembros.length, 'Recaudado: ' + (pag * p.cuota).toFixed(2) + ' €', 'Falta por cobrar: ' + ((p.miembros.length - pag) * p.cuota).toFixed(2) + ' €'].join('\n'),
    attachments: [{ filename: 'Pagos-Switch-Online.xlsx', content: buf }],
  });
}
const ROLES_BASE = [
  { id: 'admin', nombre: 'Administrador', color: '#ffb800', fijo: true },
  { id: 'mod', nombre: 'Moderador', color: '#ff5fa8', fijo: false },
  { id: 'usuario', nombre: 'Usuario', color: '#1f8fff', fijo: true },
  { id: 'invitado', nombre: 'Invitado', color: '#8a90a0', fijo: true },
];
const ROLES_FIJOS = ['admin', 'usuario', 'invitado'];
const NO_ASIGNABLES = ['admin', 'invitado'];
let rolesMem = null;
let rolesT = 0;
async function loadRoles(force) {
  if (!force && rolesMem && Date.now() - rolesT < 20000) return rolesMem;
  let r = null;
  try {
    const g = await get(ROLES_RUTA, { access: 'private', useCache: false });
    if (g && g.statusCode === 200) {
      const j = JSON.parse(await new Response(g.stream).text());
      if (Array.isArray(j.roles) && j.roles.length) r = j.roles;
    }
  } catch {}
  rolesMem = (r || ROLES_BASE).map((x) => ({ ...x, nombre: x.nombre === 'Moderadora' ? 'Moderador' : x.nombre, fijo: x.id === 'admin' ? true : typeof x.fijo === 'boolean' ? x.fijo : ROLES_FIJOS.includes(x.id) }));
  rolesT = Date.now();
  return rolesMem;
}
const saveRoles = (roles) => {
  rolesMem = roles;
  rolesT = Date.now();
  return put(ROLES_RUTA, JSON.stringify({ roles }), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
};
const porDefecto = (roles) => roles.find((r) => r.id === 'usuario') || roles.find((r) => !NO_ASIGNABLES.includes(r.id)) || ROLES_BASE[2];
const rolDe = (u, rec, roles) => {
  if (u === ADMIN) return roles.find((r) => r.id === 'admin') || ROLES_BASE[0];
  const id = rec && rec.role ? rec.role : MODS[u] ? 'mod' : 'usuario';
  return roles.find((r) => r.id === id) || porDefecto(roles);
};
const okRoleList = (l) => {
  if (!Array.isArray(l) || l.length < 2 || l.length > 14) return null;
  const ids = new Set();
  const out = [];
  for (const r of l) {
    if (!r || typeof r.id !== 'string' || !/^[a-z0-9_-]{2,20}$/.test(r.id) || ids.has(r.id)) return null;
    const nombre = String(r.nombre || '').trim();
    if (nombre.length < 1 || nombre.length > 24) return null;
    const color = /^#[0-9a-fA-F]{6}$/.test(r.color || '') ? r.color : '#8a90a0';
    ids.add(r.id);
    out.push({ id: r.id, nombre, color, fijo: r.id === 'admin' ? true : !!r.fijo });
  }
  return ids.has('admin') && out.some((r) => !NO_ASIGNABLES.includes(r.id)) ? out : null;
};
async function todosLosUsuarios() {
  const names = [];
  let cursor;
  do {
    const r = await list({ prefix: 'cuentas/', limit: 1000, cursor });
    for (const b of r.blobs) {
      const m = /^cuentas\/([a-z0-9._-]{3,24})\.json$/.exec(b.pathname);
      if (m) names.push(m[1]);
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  const out = [];
  for (let i = 0; i < names.length; i += 8) {
    const lote = await Promise.all(names.slice(i, i + 8).map(async (u) => [u, await load(u)]));
    for (const [u, rec] of lote) if (rec) out.push([u, rec]);
  }
  return out;
}
const horasDe = (r) => {
  try {
    return Object.values(JSON.parse(r['juegos-switch-mio'] || '{}')).reduce((t, m) => t + (Number(m && m.horas) || 0), 0);
  } catch {
    return 0;
  }
};
const cuenta = (d, k) => {
  try {
    const v = JSON.parse((d || {})[k] || '[]');
    return Array.isArray(v) ? v.length : Object.keys(v || {}).length;
  } catch {
    return 0;
  }
};
const puede = (u, p) => u === ADMIN || u === DUENOS[p];
const sinPersonal = (d) => Object.fromEntries(Object.entries(d || {}).filter(([k]) => !PERSONAL.test(k)));
const soloPersonal = (d) => Object.fromEntries(Object.entries(d || {}).filter(([k]) => PERSONAL.test(k)));
async function efectivas(user, rec) {
  const out = {};
  for (const p of PERFILES) {
    const dueno = DUENOS[p];
    const drec = dueno === user ? rec : await load(dueno);
    const mio = slots(rec.data)[p] || {};
    out[p] = dueno === user ? mio : { ...sinPersonal(drec && slots(drec.data)[p]), ...soloPersonal(mio) };
  }
  return out;
}
const extra = async (user, rec) => ({ rol: rolDe(user, rec, await loadRoles()), admin: user === ADMIN, puede: Object.fromEntries(PERFILES.map((p) => [p, puede(user, p)])) });
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
async function avisoNueva(req, user, raw, perfil, datos) {
  if (!MAIL_USER || !MAIL_PASS) return;
  const adm = await load(ADMIN);
  const to = (adm && adm.email) || MAIL_USER;
  const lista = perfil === 'novia' ? 'Jueguitos Switch de Nicky' : perfil === 'rafa' ? 'Jueguitos Switch de Rafita' : 'sin indicar';
  const hora = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  const h = (k) => { const v = req.headers[k]; return v ? decodeURIComponent(String(v)) : ''; };
  const lugar = [h('x-vercel-ip-city'), h('x-vercel-ip-country-region'), h('x-vercel-ip-country')].filter(Boolean).join(', ') || 'desconocido';
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
  const ua = String(req.headers['user-agent'] || 'desconocido');
  const disp = /iPhone|iPad/i.test(ua) ? 'iPhone/iPad' : /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : 'otro';
  const nav = /OPR|Opera/i.test(ua) ? 'Opera' : /Edg\//i.test(ua) ? 'Edge' : /Chrome\//i.test(ua) ? 'Chrome' : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : 'otro';
  const d = datos && typeof datos === 'object' ? datos : {};
  const arr = (k) => { try { const v = JSON.parse(d[k] || '[]'); return Array.isArray(v) ? v : Object.keys(v || {}); } catch { return []; } };
  const suf = perfil === 'novia' ? '-novia' : '';
  const tengo = arr('juegos-switch-tengo' + suf);
  const claves = Object.keys(d).map((k) => k.replace('juegos-switch-', '')).join(', ') || 'nada';
  const lineas = [
    'Alguien acaba de crear una cuenta en tu web Jueguitos Switch.',
    '',
    'Usuario para entrar: ' + user,
    'Nombre que se muestra: ' + raw,
    'Rol: Usuario (solo puede ver las listas)',
    'Creada desde: ' + lista,
    'Fecha: ' + hora + ' (hora de España)',
    '',
    'Dispositivo: ' + disp + ' · navegador ' + nav,
    'Ubicación aproximada: ' + lugar,
    'IP: ' + ip,
    'Datos completos del navegador: ' + ua,
    '',
    'Lo que tenía guardado en el navegador al crearla: ' + claves,
    'Juegos marcados como «ya lo tengo»: ' + (tengo.length ? tengo.join(', ') : 'ninguno'),
    '',
    'La contraseña no se envía nunca: se guarda cifrada.',
    '',
    'https://kingkhaax.github.io/Juegos-switch/',
  ];
  const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: MAIL_USER, pass: MAIL_PASS } });
  await tr.sendMail({ from: '"Jueguitos Switch" <' + MAIL_USER + '>', to, subject: 'Nueva cuenta en Jueguitos Switch: ' + raw, text: lineas.join('\n') });
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
        try { await avisoNueva(req, user, raw, b.perfil, b.data); } catch {}
        return res.status(200).json({ token: makeToken(user), user, nombre: raw, data: await efectivas(user, nrec), ...(await extra(user, nrec)), updated: nrec.updated });
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
      return res.status(200).json({ token: makeToken(user, rec.epoch || 0), user, nombre: rec.display || user, data: await efectivas(user, rec), ...(await extra(user, rec)), updated: rec.updated || 0 });
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
    if (req.method === 'GET' && a === 'roles') {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
      return res.status(200).json({ roles: await loadRoles() });
    }
    if (a === 'admin_usuarios' || a === 'admin_rol' || a === 'admin_roles' || a === 'pagos_get' || a === 'pagos_set' || a === 'pagos_xlsx' || a === 'pagos_mail') {
      const tk = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!tk || tk.user !== ADMIN) return res.status(403).json({ error: 'permiso' });
      const yo = await load(tk.user);
      if (!yo || (yo.epoch || 0) !== tk.ep) return res.status(401).json({ error: 'sesion' });
      if (a === 'pagos_get' && req.method === 'GET') return res.status(200).json({ pagos: await loadPagos(), roles: (await loadRoles()).map((r) => ({ id: r.id, nombre: r.nombre, color: r.color })), correo: !!(yo.email && MAIL_USER && MAIL_PASS), correoMask: maskMail(yo.email) });
      if (a === 'pagos_xlsx' && req.method === 'GET') {
        const buf = await construir(await loadPagos(), await loadRoles());
        return res.status(200).json({ nombre: 'Pagos-Switch-Online.xlsx', base64: buf.toString('base64') });
      }
      if (a === 'pagos_set' && req.method === 'POST') {
        const bp = await body(req);
        const nuevo = limpiar(bp.pagos);
        if (!nuevo) return res.status(400).json({ error: 'datos' });
        await savePagos(nuevo);
        let enviado = false, fallo = '';
        if (nuevo.auto && bp.correo !== false) {
          if (!yo.email || !MAIL_USER || !MAIL_PASS) fallo = 'sin_correo';
          else { try { await mandarPagos(yo.email, nuevo); enviado = true; } catch { fallo = 'envio'; } }
        }
        return res.status(200).json({ ok: true, enviado, fallo });
      }
      if (a === 'pagos_mail' && req.method === 'POST') {
        if (!yo.email || !MAIL_USER || !MAIL_PASS) return res.status(409).json({ error: 'sin_correo' });
        try { await mandarPagos(yo.email, await loadPagos()); } catch { return res.status(502).json({ error: 'envio' }); }
        return res.status(200).json({ ok: true, a: maskMail(yo.email) });
      }
      if (req.method === 'GET' && a === 'admin_usuarios') {
        const roles = await loadRoles(true);
        const us = await todosLosUsuarios();
        const users = us
          .map(([u, rec]) => {
            const sl = slots(rec.data);
            const r = sl.rafa || {};
            const n = sl.novia || {};
            return {
              user: u,
              nombre: rec.display || u,
              rol: rolDe(u, rec, roles).id,
              creada: rec.created || 0,
              actividad: rec.updated || 0,
              correo: maskMail(rec.email),
              pregunta: !!rec.q,
              avatar: r['juegos-switch-avatar'] || n['juegos-switch-avatar-novia'] || '',
              tengo: { rafa: cuenta(r, 'juegos-switch-tengo'), novia: cuenta(n, 'juegos-switch-tengo-novia') },
              horas: horasDe(r),
            };
          })
          .sort((x, y) => (x.user === ADMIN ? -1 : y.user === ADMIN ? 1 : y.creada - x.creada));
        return res.status(200).json({ roles, users, admin: ADMIN });
      }
      if (req.method === 'POST' && a === 'admin_rol') {
        const b = await body(req);
        const u = String(b.user || '').toLowerCase();
        const roles = await loadRoles(true);
        if (!okUser(u) || u === ADMIN) return res.status(400).json({ error: 'usuario' });
        if (typeof b.role !== 'string' || NO_ASIGNABLES.includes(b.role) || !roles.some((r) => r.id === b.role)) return res.status(400).json({ error: 'rol' });
        const rec = await load(u);
        if (!rec) return res.status(404).json({ error: 'no_existe' });
        rec.role = b.role;
        await save(u, rec);
        return res.status(200).json({ ok: true, user: u, rol: b.role });
      }
      if (req.method === 'POST' && a === 'admin_roles') {
        const b = await body(req);
        const nuevos = okRoleList(b.roles);
        if (!nuevos) return res.status(400).json({ error: 'roles' });
        const antes = await loadRoles(true);
        const quitados = antes.filter((r) => !nuevos.some((n) => n.id === r.id)).map((r) => r.id);
        await saveRoles(nuevos);
        let movidos = 0;
        if (quitados.length) {
          for (const [u, rec] of await todosLosUsuarios()) {
            if (rec.role && quitados.includes(rec.role)) {
              rec.role = porDefecto(nuevos).id;
              await save(u, rec);
              movidos++;
            } else if (!rec.role && MODS[u] && quitados.includes('mod')) {
              rec.role = porDefecto(nuevos).id;
              await save(u, rec);
              movidos++;
            }
          }
        }
        return res.status(200).json({ ok: true, roles: nuevos, movidos, destino: porDefecto(nuevos).nombre });
      }
      return res.status(404).json({ error: 'ruta' });
    }
    if (req.method === 'GET' && a === 'publico') {
      const p = okPerfil(req.query.perfil) ? req.query.perfil : 'rafa';
      const m = await load(DUENOS[p]);
      return res.status(200).json({ data: sinPersonal(m && slots(m.data)[p]), updated: (m && m.updated) || 0 });
    }
    if (a === 'prestamos_cron') {
      if (!CRON_KEY || String(req.headers['x-cron-key'] || '') !== CRON_KEY) return res.status(403).json({ error: 'permiso' });
      const todo = await loadPrest();
      let enviados = 0, cambios = false;
      for (const [u, items] of Object.entries(todo)) {
        let rec = null;
        for (const [k, it] of Object.entries(items)) {
          if (it.fin < Date.now() - DAY) { delete items[k]; cambios = true; continue; }
          if (it.avisado || it.fin <= Date.now() || it.fin - Date.now() > HORA + 120000) continue;
          rec = rec || (await load(u));
          try { if (await avisarSiToca(u, k, it, rec)) { enviados++; cambios = true; } } catch {}
        }
        if (!Object.keys(items).length) { delete todo[u]; cambios = true; }
      }
      if (cambios) await savePrest(todo);
      return res.status(200).json({ ok: true, enviados });
    }
    if (a === 'prestamo_lista' || a === 'prestamo_set' || a === 'prestamo_aviso') {
      const tk = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!tk) return res.status(401).json({ error: 'sesion' });
      const rec = await load(tk.user);
      if (!rec || (rec.epoch || 0) !== tk.ep) return res.status(401).json({ error: 'sesion' });
      const todo = await loadPrest();
      const mios = todo[tk.user] || {};
      const correo = !!(rec.email && MAIL_USER && MAIL_PASS);
      if (a === 'prestamo_lista' && req.method === 'GET') {
        const ahora = Date.now();
        return res.status(200).json({ correo, items: Object.entries(mios).filter(([, it]) => it.fin > ahora).map(([k, it]) => ({ k, titulo: it.titulo, fin: it.fin })) });
      }
      if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
      const b = await body(req);
      if (!okPerfil(b.perfil) || !okSlug(b.slug)) return res.status(400).json({ error: 'datos' });
      const k = b.perfil + ':' + b.slug;
      if (a === 'prestamo_set') {
        const fin = Math.round(Number(b.fin));
        if (!fin) { delete mios[k]; }
        else {
          if (!(fin > Date.now() && fin <= Date.now() + DIAS14 + HORA)) return res.status(400).json({ error: 'fecha' });
          const prev = mios[k];
          mios[k] = { titulo: String(b.titulo || b.slug).slice(0, 90), fin, avisado: prev && prev.fin === fin ? !!prev.avisado : false };
        }
        if (Object.keys(mios).length) todo[tk.user] = mios; else delete todo[tk.user];
        await savePrest(todo);
        return res.status(200).json({ ok: true, correo });
      }
      const it = mios[k];
      let enviado = false;
      if (it) { try { enviado = await avisarSiToca(tk.user, k, it, rec); } catch {} if (enviado) { todo[tk.user] = mios; await savePrest(todo); } }
      return res.status(200).json({ ok: true, enviado, correo });
    }
    if (a === 'datos') {
      const tk = readToken(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!tk) return res.status(401).json({ error: 'sesion' });
      const user = tk.user;
      const rec = await load(user);
      if (!rec || (rec.epoch || 0) !== tk.ep) return res.status(401).json({ error: 'sesion' });
      if (req.method === 'GET') return res.status(200).json({ user, nombre: rec.display || user, pregunta: rec.q || '', correo: maskMail(rec.email), data: await efectivas(user, rec), ...(await extra(user, rec)), updated: rec.updated || 0 });
      if (req.method === 'PUT') {
        const b = await body(req);
        if (!okPerfil(b.perfil) || !okData(b.data)) return res.status(400).json({ error: 'datos' });
        const now = Date.now();
        const dueno = DUENOS[b.perfil];
        rec.data = slots(rec.data);
        if (dueno === user) {
          rec.data[b.perfil] = b.data;
        } else {
          rec.data[b.perfil] = soloPersonal(b.data);
          if (puede(user, b.perfil)) {
            const drec = await load(dueno);
            if (drec) {
              drec.data = slots(drec.data);
              drec.data[b.perfil] = { ...soloPersonal(drec.data[b.perfil]), ...sinPersonal(b.data) };
              drec.updated = now;
              await save(dueno, drec);
            }
          }
        }
        rec.updated = now;
        await save(user, rec);
        return res.status(200).json({ updated: rec.updated, soloLectura: !puede(user, b.perfil) });
      }
    }
    return res.status(404).json({ error: 'ruta' });
  } catch (e) {
    return res.status(500).json({ error: 'servidor' });
  }
}
