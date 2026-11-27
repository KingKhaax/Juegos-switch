import nodemailer from 'nodemailer';

export const HORA = 3600000;
export const DIAS14 = 14 * 24 * HORA;

const cuando = (ms) => new Date(ms).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export async function mandarAviso(usuario, pass, to, titulo, fin, quien, nota) {
  const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: usuario, pass } });
  const falta = Math.max(0, Math.round((fin - Date.now()) / 60000));
  await tr.sendMail({
    from: '"Jueguitos Switch" <' + usuario + '>',
    to,
    subject: 'Queda 1 hora para que acabe el préstamo de ' + titulo,
    text: [
      'Hola,',
      '',
      'Al juego «' + titulo + '» que marcaste como prestado le queda ' + (falta >= 55 ? '1 hora' : falta + ' minutos') + '.',
      'El préstamo de 14 días acaba el ' + cuando(fin) + '.',
      ...(quien ? ['Se lo prestaste a ' + quien + '.'] : []),
      ...(nota ? ['Nota: ' + nota] : []),
      '',
      'Es buen momento para pedir que te lo devuelvan.',
      '',
      'https://kingkhaax.github.io/Juegos-switch/',
    ].join('\n'),
  });
}

const eur = (n) => (Math.round(n * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
export async function mandarRenovacion(usuario, pass, to, p, reno) {
  const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: usuario, pass } });
  const debe = p.miembros.filter((m) => !m.pagado);
  const falta = debe.length * p.cuota;
  const fecha = new Date(reno + ':00Z').toLocaleString('es-ES', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const dias = Math.max(0, Math.ceil((Date.parse(reno + ':00Z') - Date.parse(new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid' }).replace(' ', 'T') + 'Z')) / 86400000));
  await tr.sendMail({
    from: '"Jueguitos Switch" <' + usuario + '>',
    to,
    subject: 'Nintendo Switch Online se renueva en ' + dias + ' días: ' + (debe.length ? 'faltan ' + eur(falta) + ' por cobrar' : 'todos han pagado'),
    text: [
      'Hola,',
      '',
      'La suscripción familiar a Nintendo Switch Online se renueva el ' + fecha + '.',
      'Cuota por persona: ' + eur(p.cuota) + '.',
      '',
      debe.length ? 'Todavía no han pagado (' + debe.length + '):' : 'Todos los miembros han pagado.',
      ...debe.map((m) => ' - ' + m.nombre + ': ' + eur(p.cuota)),
      ...(debe.length ? ['', 'Falta por cobrar: ' + eur(falta)] : []),
      '',
      'Puedes ver y cambiar los pagos en el apartado «Pagos Switch Online» de la web:',
      'https://kingkhaax.github.io/Juegos-switch/',
    ].join(String.fromCharCode(10)),
  });
}
