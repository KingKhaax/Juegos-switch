import ExcelJS from 'exceljs';

export const METODOS = ['Bizum', 'Transferencia', 'Efectivo', 'PayPal', 'Otro'];
export const POR_DEFECTO = {
  cuota: 8.75,
  renovacion: '2027-11-25T14:33',
  auto: false,
  miembros: ['Rafael', 'Nicky', 'Jésus', 'Carles', 'Daniel', 'Leticia', 'Nerea', 'Alfonso'].map((n, i) => ({
    nombre: n, rol: i === 0 ? 'Administrador' : 'Usuario', rolColor: i === 0 ? '#ffb800' : '#1f8fff', pagado: false, fecha: '', metodo: '', contacto: '', notas: '',
  })),
};

export const ahoraMadrid = () => new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid' }).replace(' ', 'T').slice(0, 16);
function avanzar(s) {
  if (s.length === 10) s += 'T00:00';
  let y = +s.slice(0, 4);
  const ahora = ahoraMadrid();
  while (y < 2200 && (y + s.slice(4)) <= ahora) y++;
  return y + s.slice(4);
}
const HEX = /^#[0-9a-fA-F]{6}$/;
function rolDe(m) {
  let n = String(m.rol == null ? '' : m.rol).slice(0, 40).trim();
  if (n === 'Moderadora') n = 'Moderador';
  if (!n || n === 'Miembro') n = 'Usuario';
  const def = n === 'Administrador' ? '#ffb800' : '#1f8fff';
  return { nombre: n, color: HEX.test(String(m.rolColor || '')) ? m.rolColor.toLowerCase() : def };
}
const claro = (hex) => (parseInt(hex.slice(1, 3), 16) * 299 + parseInt(hex.slice(3, 5), 16) * 587 + parseInt(hex.slice(5, 7), 16) * 114) / 1000 > 150;
const tel = (v) => {
  const t = String(v == null ? '' : v).slice(0, 120).trim();
  const d = t.replace(/[\s.-]/g, '').replace(/^(\+34|0034)/, '');
  return /^\d{9}$/.test(d) ? d.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : t;
};
const txt = (v, n) => String(v == null ? '' : v).slice(0, n);
export function limpiar(b) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.miembros) || b.miembros.length < 1 || b.miembros.length > 16) return null;
  const cuota = Math.round(Number(b.cuota) * 100) / 100;
  if (!(cuota >= 0 && cuota < 1000)) return null;
  return {
    cuota,
    renovacion: avanzar(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(b.renovacion || '')) ? b.renovacion : POR_DEFECTO.renovacion),
    auto: !!b.auto,
    miembros: b.miembros.map((m, i) => ({
      nombre: (i === 0 && txt(m.nombre, 40).trim() === 'Rafa') ? 'Rafael' : txt(m.nombre, 40).trim() || 'Sin nombre',
      rol: rolDe(m).nombre,
      rolColor: rolDe(m).color,
      pagado: !!m.pagado,
      fecha: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(String(m.fecha || '')) ? m.fecha : '',
      metodo: METODOS.includes(m.metodo) ? m.metodo : '',
      contacto: tel(m.contacto),
      notas: txt(m.notas, 500),
    })),
  };
}

const PAG = '✔ Pagado', PEN = '✘ Pendiente';
const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const borde = { style: 'thin', color: { argb: 'FF3A3350' } };
const marco = { top: borde, left: borde, bottom: borde, right: borde };
const fecha = (s) => (s ? new Date(s.length > 10 ? s + ':00Z' : s + 'T00:00:00Z') : null);

export async function construir(p, roles) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Pagos Switch Online', { views: [{ showGridLines: false }] });
  const n = p.miembros.length, f0 = 12, f1 = 11 + n, ft = f1 + 2;
  ws.columns = [{ width: 2 }, { width: 6 }, { width: 18 }, { width: 18 }, { width: 16 }, { width: 19 }, { width: 16 }, { width: 17 }, { width: 14 }, { width: 24 }, { width: 44 }];
  const pagados = p.miembros.filter((m) => m.pagado).length;
  const rec = pagados * p.cuota, falta = (n - pagados) * p.cuota;
  const base = { font: { name: 'Calibri', color: { argb: 'FFFFFFFF' } }, fill: fill('FF17141F') };
  for (let r = 1; r <= ft + 2; r++) for (let c = 1; c <= 12; c++) Object.assign(ws.getCell(r, c), base);

  ws.mergeCells('B1:K1');
  Object.assign(ws.getCell('B1'), { value: 'NINTENDO SWITCH ONLINE  +  PAQUETE DE EXPANSION', font: { name: 'Calibri', size: 20, bold: true, color: { argb: 'FFFFD96A' } }, alignment: { horizontal: 'center', vertical: 'middle' } });
  ws.getRow(1).height = 34;
  ws.mergeCells('B2:K2');
  Object.assign(ws.getCell('B2'), { value: `Control de pagos del grupo familiar (plan anual, ${n} miembros)`, font: { name: 'Calibri', size: 12, color: { argb: 'FFC3A2FF' } }, alignment: { horizontal: 'center' } });

  const tarjetas = [['B4:C4', 'B5:C5', 'CUOTA POR PERSONA', p.cuota, '#,##0.00 "€"', 'FF7A1F2B'], ['D4:E4', 'D5:E5', 'RENOVACION', fecha(p.renovacion), 'dd/mm/yyyy hh:mm', 'FF7A1F2B'], ['F4:G4', 'F5:G5', 'PAGADOS', { formula: `COUNTIF($E$${f0}:$E$${f1},"${PAG}")&" / ${n}"`, result: `${pagados} / ${n}` }, '@', 'FF1F6B45'], ['H4:I4', 'H5:I5', 'RECAUDADO', { formula: `SUM($H$${f0}:$H$${f1})`, result: rec }, '#,##0.00 "€"', 'FF1F6B45'], ['J4:K4', 'J5:K5', 'FALTA POR COBRAR', { formula: `SUM($I$${f0}:$I$${f1})`, result: falta }, '#,##0.00 "€"', 'FF7A3B14']];
  for (const [a, b, t, v, nf, col] of tarjetas) {
    ws.mergeCells(a); ws.mergeCells(b);
    const ca = ws.getCell(a.split(':')[0]), cb = ws.getCell(b.split(':')[0]);
    Object.assign(ca, { value: t, font: { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFE9A8' } }, fill: fill(col), alignment: { horizontal: 'center' } });
    Object.assign(cb, { value: v, numFmt: nf, font: { name: 'Calibri', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }, fill: fill(col), alignment: { horizontal: 'center', vertical: 'middle' } });
  }
  ws.getRow(5).height = 32;

  ws.mergeCells('B7:C7'); ws.mergeCells('D7:J7');
  Object.assign(ws.getCell('B7'), { value: 'PROGRESO DE COBRO', font: { bold: true, color: { argb: 'FFFFE9A8' } } });
  const lleno = Math.round((pagados / n) * 40);
  Object.assign(ws.getCell('D7'), { value: { formula: `REPT("█",ROUND(COUNTIF($E$${f0}:$E$${f1},"${PAG}")/${n}*40,0))&REPT("░",40-ROUND(COUNTIF($E$${f0}:$E$${f1},"${PAG}")/${n}*40,0))`, result: '█'.repeat(lleno) + '░'.repeat(40 - lleno) }, font: { name: 'Consolas', color: { argb: 'FF3DDC84' } } });
  Object.assign(ws.getCell('K7'), { value: { formula: `TEXT(COUNTIF($E$${f0}:$E$${f1},"${PAG}")/${n},"0%")&" cobrado"`, result: Math.round((pagados / n) * 100) + '% cobrado' }, font: { bold: true, color: { argb: 'FF3DDC84' } } });

  ['Nº', 'NOMBRE', 'ROL', 'ESTADO', 'FECHA DE PAGO', 'METODO', 'IMPORTE PAGADO', 'PENDIENTE', 'CONTACTO', 'NOTAS'].forEach((h, i) => {
    Object.assign(ws.getCell(11, 2 + i), { value: h, font: { bold: true, color: { argb: 'FF1B1500' } }, fill: fill('FFFFB800'), alignment: { horizontal: 'center', vertical: 'middle' }, border: marco });
  });
  ws.getRow(11).height = 24;

  const lista = (roles || []).map((r) => r.nombre).filter((x) => x && !x.includes(',')).slice(0, 12);
  if (!lista.length) lista.push('Administrador', 'Moderador', 'Usuario', 'Invitado');
  p.miembros.forEach((m, i) => {
    const r = f0 + i;
    const celdas = [i + 1, m.nombre, m.rol, m.pagado ? PAG : PEN, fecha(m.fecha), m.metodo || null,
      { formula: `IF(E${r}="${PAG}",$B$5,0)`, result: m.pagado ? p.cuota : 0 }, { formula: `$B$5-H${r}`, result: m.pagado ? 0 : p.cuota }, (/^\d{3} \d{3} \d{3}$/.test(m.contacto || '') ? { richText: [{ text: '+34 ', font: { bold: true, color: { argb: 'FFFFC400' } } }, { text: m.contacto, font: { color: { argb: 'FFFFFFFF' } } }] } : (m.contacto || null)), m.notas || null];
    celdas.forEach((v, j) => {
      const c = ws.getCell(r, 2 + j);
      c.value = v; c.border = marco; c.alignment = { horizontal: j === 1 || j >= 8 ? 'left' : 'center', vertical: 'middle', wrapText: j >= 8 };
      if (j === 2) { const col = m.rolColor || '#1f8fff'; c.fill = fill('FF' + col.slice(1).toUpperCase()); c.font = { bold: true, color: { argb: claro(col) ? 'FF1B1500' : 'FFFFFFFF' } }; }
      if (j === 4) c.numFmt = 'dd/mm/yyyy hh:mm';
      if (j === 6 || j === 7) c.numFmt = '#,##0.00 "€"';
    });
    ws.getCell(r, 5).dataValidation = { type: 'list', allowBlank: false, formulae: [`"${PAG},${PEN}"`] };
    ws.getCell(r, 7).dataValidation = { type: 'list', allowBlank: true, formulae: [`"${METODOS.join(',')}"`] };
    ws.getCell(r, 4).dataValidation = { type: 'list', allowBlank: false, formulae: ['"' + lista.join(',') + '"'] };
    ws.getRow(r).height = Math.max(22, 16 * Math.max(Math.ceil((m.notas || '').length / 48), Math.ceil((m.contacto || '').length / 26), 1) + 6);
  });
  const reglas = [
    { type: 'expression', priority: 3, formulae: [`$E${f0}="${PAG}"`], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF1F5A3C' } } } },
    { type: 'expression', priority: 4, formulae: [`$E${f0}="${PEN}"`], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF5A1F2B' } } } },
  ];
  ws.addConditionalFormatting({ ref: `B${f0}:C${f1}`, rules: reglas });
  ws.addConditionalFormatting({ ref: `E${f0}:K${f1}`, rules: reglas });

  ws.mergeCells(`B${ft}:G${ft}`);
  Object.assign(ws.getCell(`B${ft}`), { value: 'TOTAL DEL GRUPO', font: { bold: true, size: 12, color: { argb: 'FFFFD96A' } }, alignment: { horizontal: 'right' } });
  Object.assign(ws.getCell(`H${ft}`), { value: { formula: `SUM(H${f0}:H${f1})`, result: rec }, numFmt: '#,##0.00 "€"', font: { bold: true, color: { argb: 'FF3DDC84' } }, alignment: { horizontal: 'center' } });
  Object.assign(ws.getCell(`I${ft}`), { value: { formula: `SUM(I${f0}:I${f1})`, result: falta }, numFmt: '#,##0.00 "€"', font: { bold: true, color: { argb: 'FFFF7B7B' } }, alignment: { horizontal: 'center' } });
  Object.assign(ws.getCell(`B${ft + 2}`), { value: 'Las casillas en rojo oscuro (cuota y renovación) se pueden cambiar; todo lo demás se recalcula solo.', font: { italic: true, size: 9, color: { argb: 'FFB9B3CC' } } });
  return Buffer.from(await wb.xlsx.writeBuffer());
}
