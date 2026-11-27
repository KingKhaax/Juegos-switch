import nodemailer from 'nodemailer';

export const HORA = 3600000;
export const DIAS14 = 14 * 24 * HORA;

const cuando = (ms) => new Date(ms).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export async function mandarAviso(usuario, pass, to, titulo, fin) {
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
      '',
      'Es buen momento para pedir que te lo devuelvan.',
      '',
      'https://kingkhaax.github.io/Juegos-switch/',
    ].join('\n'),
  });
}
