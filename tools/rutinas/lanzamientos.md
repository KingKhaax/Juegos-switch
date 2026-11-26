# Instrucciones de la rutina programada: próximos lanzamientos (cada 2 días)

Este archivo lo lee la rutina programada en la nube cada vez que se ejecuta. Si cambias algo aquí, se aplica en la siguiente ejecución.

Eres el responsable de mantener al día el apartado «Próximos lanzamientos» de la web Juegos-switch (repositorio KingKhaax/Juegos-switch, publicada en https://kingkhaax.github.io/Juegos-switch/). Los datos salen de https://nswitchex.com/es/ (sección de próximos exclusivos).

## Qué hacer

1. Desde la raíz del repositorio, guarda una copia de `upcoming.js` (`cp upcoming.js /tmp/upcoming.antes.js`).
2. Ejecuta `node tools/scrape-upcoming.mjs .`. Descarga la lista de próximos exclusivos, la ficha de cada uno (`details/<slug>/`) y su carcasa (`img/next/<slug>.jpg`), y reescribe `upcoming.js`.
3. Comprueba que ha ido bien:
   - El script termina sin error y la última línea dice `N próximos` con N de 1 o más.
   - `node --check upcoming.js` no da error.
   - Si N es 0 o el script falla, la web de origen ha cambiado: restaura con `git checkout upcoming.js img/next` y sigue en «Si falla».
4. Compara con `/tmp/upcoming.antes.js` (por ejemplo con un script de Node que cargue las dos listas): anota qué juegos son nuevos, cuáles han desaparecido (normalmente porque ya han salido) y a cuáles les ha cambiado la fecha (`fecha`).
5. En `README.md`, en la frase del apartado «Próximos lanzamientos» que dice «N juegos con fecha» y «a fecha dd/mm/aaaa», pon el número y la fecha de hoy (formato dd/mm/aaaa). No toques nada más del README.
5b. Actualiza también el catálogo de fichas de nswitchex.com que usa el buscador de «Añadir juego»: ejecuta `node tools/scrape-catalogo.mjs .` (tarda un par de minutos; escribe `nsw-catalogo.json`). Si termina con «demasiados fallos» o error, NO lo subas y sigue sin él, avisando en el correo de fallo solo si tampoco funcionó el paso 2.

6. Sube los cambios a `main`:
   - `git add upcoming.js img/next README.md nsw-catalogo.json`
   - Un solo commit con identidad `sr.kitkat <180756772+KingKhaax@users.noreply.github.com>` (`git -c user.name=sr.kitkat -c user.email=180756772+KingKhaax@users.noreply.github.com commit`).
   - Mensaje corto y sencillo en castellano, por ejemplo: «Próximos lanzamientos actualizados (dd/mm/aaaa)». Si hay novedades de juegos o fechas, añádelas en la segunda línea.
   - NUNCA menciones a Claude, a ningún asistente ni herramienta de IA en el commit, ni añadas `Co-Authored-By`.
   - `git pull --rebase` y `git push origin main`. GitHub Pages publica solo en un minuto.
7. Si no hay ningún cambio real salvo los días que faltan y la fecha de lectura, igualmente se sube (así la ventana de la web muestra «datos del dd/mm/aaaa» al día).

## Reglas

- No cambies código, estilos ni otras listas. Solo `upcoming.js`, `img/next/`, `nsw-catalogo.json` y la frase del README.
- Nunca inventes datos: lo que no salga de nswitchex.com no se escribe.
- No toques `games.js` ni las listas de Rafael ni de Nicky: «Lo quiero» las guarda cada usuario en su navegador.

## Si falla

Si no se puede descargar la web, el script da error, N es 0 o no se puede subir a GitHub, NO subas nada a medias y envía UN correo con la herramienta de Gmail `send_message` (cárgala con ToolSearch: `select:mcp__Gmail__send_message`) a familiagarciaadamuz@gmail.com con el asunto «Fallo en Juegos-switch (próximos lanzamientos): <qué ha fallado>» y un cuerpo en castellano con: 1) qué paso estabas haciendo, 2) el error completo tal como salió (código HTTP, línea del script), 3) por qué crees que ha fallado y si parece temporal, 4) qué se ha quedado sin hacer, 5) qué debería hacer Rafael o «nada, se reintentará en 2 días». Sin claves ni tokens. Además envía una notificación corta con PushNotification (`select:PushNotification`, menos de 200 caracteres, que empiece por «Fallo Juegos-switch:»). Si todo ha ido bien, no envíes nada.
