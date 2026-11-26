# Juegos Switch

Mi lista de juegos de Nintendo Switch: los que quiero y los que ya tengo. Cada juego es un cartucho; al pulsarlo se abre su ficha con el resumen, el tamaño, las horas para completarlo, el rendimiento en Switch 2, el vídeo de presentación y más.

**Web:** https://kingkhaax.github.io/Juegos-switch/

Este README recoge todo lo que está decidido y apuntado del proyecto, para que cualquiera que lo edite (añadir juegos, borrar, reordenar, cambiar el diseño) lo tenga en cuenta. **Se actualiza en cada cambio**, junto con `juegos-switch.txt` del escritorio de Rafael (copia en texto de la lista).

Última actualización: 23/11/2026.

## Guía rápida para otra sesión

Antes de tocar nada, léelo entero. Después, en cada cambio:

1. Aplica el cambio en el código (`games.js`, `app.js`, `styles.css`…).
2. Si cambia la lista (orden, juegos, modos, sagas), actualiza también la tabla de este README y `C:\Users\Rafael\Desktop\juegos-switch.txt`. Si cambias `styles.css`, regenera el tema rosa con `node tools/tema-novia.mjs .`.
3. Comprueba que no hay errores: `node --check app.js cursor.js bg.js` y mira la página con una captura (Edge sin ventana: `msedge --headless=new --screenshot=salida.png --window-size=1100,900 --virtual-time-budget=6000 file:///C:/Users/Rafael/Desktop/Juegos-switch/index.html#<slug>`). Las fichas se abren con `index.html#<slug>` y las ventanas de filtros con `#filtros-mode`, `#filtros-saga`, `#filtros-genre`.
4. Actualiza este README (y la fecha de arriba).
5. `git add -A`, commit y `git push` a `main`. GitHub Pages publica solo (tarda unos 40 s).

Reglas que Rafael ha pedido y que valen siempre:

- **Los commits, el README y los archivos del repo no mencionan a ningún asistente ni herramienta de IA** (sin `Co-Authored-By`, sin «generado con…», sin nombres de asistentes).
- Commits a nombre de Rafael con el correo `noreply` de GitHub (`KingKhaax@users.noreply.github.com`), nunca con su correo personal (en el repo está configurado en local).
- El código va **sin comentarios**.
- Los textos de la web están en español. Los tamaños **siempre en GB**.
- Cada cambio de la lista va a tres sitios: `games.js`, este README y `juegos-switch.txt`.
- Cuando Rafael dice «pon el 6 en el 9» son posiciones actuales; varios movimientos se aplican **en el orden en que los dice**, cada uno sobre la lista tal como queda tras el anterior.
- Rafael da permiso explícito para usar su sesión de GitHub (`gh` instalado con winget en `C:\Program Files\GitHub CLI\gh.exe`, con la cuenta KingKhaax) y para ejecutar `realesrgan-ncnn-vulkan.exe` (ver «Carcasas en HD»).

### El orden publicado (orden.js)

El orden de la lista lo decide Rafael desde la propia web (botón **Reordenar**: se arrastran las tarjetas por el icono de puntos, o se usan las flechas ‹ ›) y se publica con **Ajustes → Publicar mi orden en GitHub**. Se guarda en `orden.js` (`window.ORDEN={"updated":"AAAA-MM-DD","order":["slug",…]}`), que carga la web, así que **cualquiera que abra la web (su novia, por ejemplo) ve el mismo orden**. GitHub Pages tarda unos 10 minutos en actualizar el archivo.

- Precedencia: el orden que cada persona ha cambiado en su navegador (`localStorage`, clave `juegos-switch-orden`) manda sobre el publicado; sin cambios propios se usa `orden.js`; si falta un juego, se coloca tras el que le precede en `games.js`.
- Para publicar hay dos vías. Con un **token personal de GitHub** (fine-grained, solo este repositorio, permiso Contents: lectura y escritura; se guarda solo en el navegador de Rafael, clave `juegos-switch-token`) la web hace el commit sola (`Actualizar el orden de la lista`, a nombre de su cuenta). Sin token, la web abre la página de edición de `orden.js` en GitHub con el texto para copiar y pegar. Para guardar el token en un navegador sin escribirlo, se abre una vez `https://kingkhaax.github.io/Juegos-switch/#tok=<token>`: `ajustes.js` lo guarda en `localStorage` y borra el `#tok=` de la dirección. El token **no** va nunca en el código de la web (es pública y cualquiera podría cambiar el repositorio); está guardado solo en los PC de Rafael, en `Claves-locales-WipeTime-NinjaLoot\juegos-switch-token.txt`.
- **Regla para cualquier sesión:** `orden.js` es la fuente de verdad del orden. Al empezar a trabajar, ejecuta `node tools/sync-readme.mjs . C:\Users\Rafael\Desktop\juegos-switch.txt`: deja la tabla de «Lista actual» de este README y `juegos-switch.txt` en el orden publicado. Un juego nuevo se añade en `games.js` y se publica su sitio en el orden con Reordenar (o se coloca en `orden.js`). El orden base de `games.js` solo se usa donde `orden.js` no dice nada.

## Dos listas: la de Rafael y Jueguitos Switch (23/11/2026)

Títulos: la de Rafael se llama **«Jueguitos Switch de Rafita»** y la de su novia **«Jueguitos Switch de Nicky»** (título de la página, pestaña del navegador, tooltip del botón y texto de la animación al cambiar).

La web tiene dos perfiles. Se cambia con el **botón redondo de arriba a la derecha** (`perfil.js`): tiene un anillo de colores girando, un brillo que late, chispas y un tooltip. Al pulsarlo, un círculo de color sale del botón y cubre la pantalla con una explosión de símbolos (corazones y estrellas hacia Jueguitos Switch; A, B, X, Y y + hacia la de Rafael). La página se recarga con el otro perfil y se destapa con las tarjetas apareciendo una a una. Con `prefers-reduced-motion` solo cambia, sin animación.

- **Perfil `rafa`**: «Mi colección de Nintendo Switch», con el tema rojo y azul de siempre. Usa la lista `window.LISTS.rafa` de `games.js` en el orden de `orden.js`.
- **Perfil `novia`**: **«Jueguitos Switch»** (15 juegos desde el 26/11/2026; se añadieron Pokémon Oleaje y Pokémon Viento como próximos lanzamientos, The Legend of Zelda: Ocarina of Time, Pokémon Leyendas Z-A, Pokémon Escarlata y Pokémon Perla Reluciente), la lista de la novia de Rafael, con tema rosa (`novia.css`) y fondo animado con corazones, estrellas y flores (`bg.js`). Su orden de base es `window.LISTS.novia`:
  1. Mario & Luigi: Conexión Fraternal
  2. Leyendas Pokémon: Arceus
  3. Pokémon Espada
  4. Super Mario Odyssey
  5. Donkey Kong Bananza
  6. Kirby y la Tierra Olvidada
  7. Super Mario 3D World + Bowser's Fury
  8. Pokémon Let's Go, Eevee!
  9. Super Mario Galaxy: es la ficha «Super Mario Galaxy + Super Mario Galaxy 2», la única edición en Switch.

  `orden.js` no le afecta, y en sus Ajustes no sale «Publicar mi orden».
- **Dónde se guarda el perfil:** en `localStorage` (`juegos-switch-perfil`). Lo lee un script en línea del `<head>` de `index.html`, que pone la clase `novia` en `<html>`, cambia el título de la pestaña y carga `novia.css` en vez de `styles.css`, sin parpadeo.
- **Cada perfil guarda lo suyo:** en el perfil `novia` todas las claves llevan el sufijo `-novia` (`juegos-switch-tengo-novia`…). Las claves `ajustes`, `token`, `perfil` y `cuenta` son comunes.
- **`novia.css` no se edita a mano.** Lo genera `node tools/tema-novia.mjs .` a partir de `styles.css`: cambia cada color rojo, azul o gris por su versión rosa, lila o ciruela, y le añade `tools/tema-novia-extra.css`. **Después de cambiar `styles.css` hay que volver a ejecutarlo.**
- **`games.js`** tiene todos los juegos de las dos listas (`window.GAMES`) y qué juegos van en cada una (`window.LISTS`). Un juego nuevo para una lista se añade a `GAMES` y a esa lista.
- **Imagen del botón:** en Jueguitos Switch el botón lleva la cara de Hello Kitty (`img/kitty.png`, recortada sin el texto y con fondo transparente a partir de la imagen que pasó Rafael), que se balancea al pasar el ratón. También sale grande en la animación al cambiar a Jueguitos Switch. En la lista de Rafael el botón lleva un Joy-Con.

## Roles y dueños de cada lista (26/11/2026)

Cada cuenta tiene un **rol**. Sale como título con efectos justo debajo del nombre, en «Mi cuenta» (`.rol-admin`, `.rol-mod`, `.rol-usuario`, `.rol-invitado` en `styles.css`):

| Rol | Quién | Título |
|---|---|---|
| Administrador | `kingkhaax` (Rafael) | dorado, naranja y rojo, con brillo |
| Moderador / Moderadora | `zya` (Nicky) | rosa, lila y celeste, con brillo |
| Usuario | cualquier otra cuenta | azul |
| Invitado | sin cuenta | gris |

- **Cada lista tiene una dueña:** la de Rafita es de `kingkhaax` y la de Nicky es de `zya` (`DUENOS` en `cuentas/api/cuenta.js`).
- **Todos ven lo de la dueña:** invitados, usuarios, la moderadora y el administrador ven en cada lista lo que tiene guardado su dueña (orden, lo que tiene, estados, precios, notas…).
- **Quién puede cambiar cada lista:**
  - la lista de Rafita, solo el administrador;
  - la de Nicky, Nicky y el administrador. Si la cambia el administrador, el cambio se guarda en la cuenta de Nicky y lo ve ella.
- **Los demás, en solo lectura:** la web pone la clase `solo-lectura` en `<html>`, oculta los botones de cambiar («Ya lo tengo», estado, precio, formato, reordenar…) y muestra un aviso encima de las herramientas. El servidor también ignora sus cambios de la lista.
- **Lo personal de cada uno** (avatar, datos de Nintendo y código de amigo) se guarda siempre en su propia cuenta y no pasa a nadie.
- **Aviso de cuentas nuevas:** cada vez que alguien crea una cuenta, el servidor manda al momento un correo («Nueva cuenta en Jueguitos Switch: <usuario>») a la dirección de recuperación de la cuenta del administrador, con usuario, nombre, lista desde la que se creó, fecha, dispositivo y navegador, ubicación aproximada, IP y lo que traía guardado en el navegador. Nunca la contraseña. Usa `GMAIL_USER` y `GMAIL_APP_PASSWORD` de Vercel (`avisoNueva()` en `cuentas/api/cuenta.js`).
- **Cómo cambiar roles o dueños:** se editan `ADMIN`, `MODS` (con el nombre del título, por ejemplo `'Moderador'`) y `DUENOS` en `cuentas/api/cuenta.js`, y se publica el servidor.

## Cuentas: entrada obligatoria y una sesión por lista (23/11/2026)

**Primero, qué lista quieres ver:** cada vez que se abre la web (una vez por pestaña, `sessionStorage` `js-elegida`) sale «¿Qué lista quieres ver?» con dos tarjetas grandes, Jueguitos Switch de Rafita (rojo y azul, logo de Switch) y Jueguitos Switch de Nicky (rosa, Hello Kitty). Si eliges la otra lista, la web cambia a ella; si ya tienes sesión en la elegida, entra directamente. Desde la pantalla de usuario, «‹ Elegir otra lista» vuelve a las tarjetas.

**Después, siempre hay que elegir:** entrar con usuario y contraseña (pestañas **Entrar** y **Crear cuenta**) o **Entrar como invitado**. Es una pantalla completa (`#gate`, en `cuenta.js`) que tapa la web; no se puede cerrar sin elegir. El botón de cambio de lista sigue visible encima, para poder cambiar de lista antes de entrar. Un script en línea del `<head>` pone la clase `gate` en `<html>` antes de pintar nada, así la lista no se ve ni un instante.

- **Una sesión por lista:** la lista de Rafita y la de Nicky tienen cada una su sesión. Entrar en una no te deja dentro de la otra: al cambiar de lista hay que volver a entrar (o entrar como invitado).
  - Sesión de Rafita: `juegos-switch-cuenta`.
  - Sesión de Nicky: `juegos-switch-cuenta-novia`.
  - Invitado: `sessionStorage` `js-invitado-rafa` / `js-invitado-novia`. Dura hasta cerrar la pestaña, así que la pantalla vuelve a salir en la siguiente visita.
- **Con cuenta, la sesión se mantiene** (180 días) y cada cambio que haces se guarda solo en esa cuenta, al segundo (y al cerrar la página si quedaba algo pendiente). En la cabecera, el botón muestra el usuario con un punto verde si está guardado, amarillo mientras guarda y rojo si falla. Como invitado pone «Invitado»; al pulsarlo se puede iniciar sesión.
- **Qué se guarda:** solo las claves de esa lista. En la de Rafita, las `juegos-switch-*` sin `-novia`; en la de Nicky, las que acaban en `-novia`. No se guardan `ajustes`, `token`, `perfil`, las sesiones ni `mig1`. La misma cuenta puede guardar una lista en cada perfil.
- **Al crear la cuenta** se sube lo que había en ese navegador para esa lista.
- **Al entrar**, lo de la cuenta sustituye a lo del navegador. Si la cuenta no tiene nada de esa lista, se sube lo del navegador.
- **Al abrir con sesión**, si la cuenta tiene algo distinto (cambiado en otro dispositivo), se carga y la página se recarga una vez.
- **Cerrar sesión** (en Mi cuenta) guarda lo pendiente y vuelve a la pantalla de entrada.
- **Servidor:** proyecto de Vercel `juegos-switch-cuentas` (cuenta KingKhaax), en `https://juegos-switch-cuentas.vercel.app/api/cuenta`, con el código en `cuentas/`. Solo acepta peticiones desde `https://kingkhaax.github.io`. Acciones:
  - `POST ?a=registro` y `POST ?a=entrar`: devuelven un token firmado válido 180 días. En el registro se puede mandar `perfil` y `data`.
  - `GET ?a=datos`: devuelve `{rafa:{…}, novia:{…}}`.
  - `PUT ?a=datos` con `{perfil, data}`: guarda solo esa lista.
  - `POST ?a=perfil` (con token): cambia el nombre con mayúsculas (`nombre`, solo puede variar mayúsculas y minúsculas del usuario), la contraseña (`actual` y `nueva`) y la pregunta de recuperación (`pregunta`, `respuesta` y `actual`).
  - `POST ?a=cerrar` (con token): cierra la sesión en los demás dispositivos subiendo un contador de sesión (`epoch`) de la cuenta y devuelve un token nuevo para este.
  - `POST ?a=pregunta` con `{user}`: devuelve la pregunta de recuperación, o vacío si no existe la cuenta o no tiene.
  - `POST ?a=recuperar` con `{user, respuesta, nueva}`: pone contraseña nueva si la respuesta es correcta (sin mirar mayúsculas ni espacios). Tras 5 fallos seguidos bloquea 15 minutos (429 `bloqueo`) y cierra todas las sesiones.

  Todas las de `datos` van con `Authorization: Bearer <token>`. Las cuentas antiguas con todas las claves juntas se separan solas por el sufijo `-novia`.
- **Datos:** Vercel Blob privado `juegos-switch-cuentas` (región París), un archivo por usuario `cuentas/<usuario>.json`, con la contraseña cifrada con scrypt y sal (nunca en claro).
- **Variables de entorno en Vercel:**
  - `BLOB_READ_WRITE_TOKEN`: la pone Vercel al conectar el Blob.
  - `CUENTAS_SECRET`: firma los tokens. Si se cambia, se cierran todas las sesiones.
- **Publicar el servidor:** `cd cuentas && npm install && npx vercel deploy --prod --yes`. `cuentas/.vercel` y `.env.local` no van a git; se recrean con `npx vercel link --yes --project juegos-switch-cuentas`.
- **Recuperación de contraseña:** solo si la cuenta tiene pregunta de recuperación (se pone en «Mi cuenta», Seguridad). Si no la tiene y se olvida, se borra el archivo del usuario (`npx vercel blob delete cuentas/<usuario>.json --rw-token <BLOB_READ_WRITE_TOKEN>`) y se crea la cuenta de nuevo.

## Texto que no se puede seleccionar

En la ficha, las etiquetas (consola y modos de juego), los botones («Ya lo tengo», precio, eShop, comparar…) y las pastillas de Pokémon no se pueden seleccionar ni copiar con el ratón (`user-select:none`), igual que la cabecera.

## Región y generaciones en los juegos de Pokémon (26/11/2026)

En la ficha de los juegos de Pokémon, junto al título «Resumen», salen unas pastillas con efectos (`pokemon.js`; estilos `.pk-*` en `styles.css`):

- **Región** donde transcurre el juego, con un color propio para cada una: Kanto, Sinnoh, Hisui, Galar, Paldea, Kalos (Ciudad Luminalia), Ferrum y la región nueva de Pokémon Viento/Oleaje.
- **Generaciones** de los Pokémon que incluye el juego. Cada una lleva su icono de dos colores con el número romano (I rojo y azul, II oro y plata, III rubí y zafiro, IV azul y rosa, V negro y blanco, VI azul y rojo, VII naranja y morado, VIII celeste y magenta, IX rojo y morado, X verde y azul) y su nombre (Primera, Segunda…).
- **Datos** (en `P` de `pokemon.js`):
  - Let's Go: Kanto, I y VII (Meltan).
  - Diamante Brillante y Perla Reluciente: Sinnoh, I a IV.
  - Leyendas Arceus: Hisui, I a VIII.
  - Espada: Galar, I a VIII.
  - Escarlata: Paldea, I a IX.
  - Leyendas Z-A: Kalos, I a VI.
  - Pokkén Tournament DX: Ferrum, I a VII (luchadores).
  - Viento y Oleaje: región nueva, X, por confirmar.
- **Generación principal** (`m` en `P`): la de los Pokémon nuevos que presenta el juego. Lleva estrella giratoria, borde de colores en movimiento, brillo y la etiqueta «Principal».
- **Juego de Pokémon nuevo:** se añade su fila en `P` de `pokemon.js`.
- **Ojo:** las variables de color se llaman `--pa`/`--pb` porque `--a` ya está registrada como ángulo (`@property`) para otra animación.

## Cómo funciona la web

- Los `.js` (menos `orden.js`) y `styles.css` se enlazan en `index.html` con `?v=AAAAMMDD`: **al cambiar cualquiera de ellos, sube esa fecha** para que los navegadores no sigan usando la versión vieja guardada (GitHub Pages deja guardar los archivos 10 minutos y algunos navegadores más).
- Página estática sin servidor ni dependencias: `index.html` + `styles.css` + `app.js` + `bg.js` + `cursor.js` + datos en `games.js` y `details.js`.
- Título "Mi colección de Nintendo Switch" con dos apartados en la misma página: **Los que quiero** (arriba, numerados por preferencia) y **Los que ya tengo** (al final, atenuados).
- Cada cartucho tiene el botón **Ya lo tengo**. Al pulsarlo el juego pasa al final del todo (apartado "Los que ya tengo"), se oscurece, y la lista de los que quiero se renumera: si se marca el 4.º, el 5.º pasa a ser el 4.º y así con todos. Pulsando de nuevo («Quitar de ya lo tengo») vuelve a su sitio original de la lista. Los números siempre son consecutivos entre las tarjetas visibles: con un filtro activo se renumeran (1, 2, 3…) en lugar de conservar el número que tendrían sin filtro, para que no haya saltos.
- Lo que se marca como "ya lo tengo" se guarda en el navegador (`localStorage`, clave `juegos-switch-tengo`). No se sincroniza entre dispositivos.
- Al pulsar un cartucho se abre la ficha (`<dialog>`). También se abre con la URL `#<slug>`, por ejemplo `#super-mario-odyssey`. Con la ficha abierta la rueda del ratón mueve solo la ficha y no la página de detrás (`html:has(dialog[open])`, clase `lock` por JS y `overscroll-behavior:contain`).
- **Mi consola** (Switch 1 / Switch 2, se guarda en `localStorage`, clave `juegos-switch-consola`, por defecto Switch 2): decide qué edición se usa para el tamaño, el precio y los totales. En Switch 1 se usa la edición Estándar; en Switch 2, la Switch 2 Edition si existe y si no la Estándar. Los juegos solo de Switch 2 (Donkey Kong Bananza, Mario Kart World) con Switch 1 elegida salen como "Solo Switch 2" y no cuentan en totales.
- **Buscador** por nombre (sin acentos ni mayúsculas) y **orden alternativo**: Mi orden, Crítica (Metascore) mejor o peor primero, Tamaño (menor o mayor primero), Historia (más corta o más larga), Precio (más barato o más caro). Los sin dato quedan al final. Con otro orden distinto de "Mi orden" los números son la posición en ese orden.
- **Resumen de arriba:** juegos, GB y euros de lo que quiero (por comprar) y de lo que tengo (gastados),.
- Cada tarjeta muestra tamaño y precio (PVPR de la edición elegida) y el Metascore.
- **Mi almacenamiento:** memoria interna (32 GB Switch/Lite, 64 GB OLED, 256 GB Switch 2; por defecto según la consola elegida, `juegos-switch-interna`) y tarjeta SD (ninguna, 32, 64, 128, 256, 400, 512, 1 TB o 2 TB; `juegos-switch-sd`). Barra de 8 bits (elegida entre 16 estilos): 20 bloques con borde de píxel, azules lo que tengo, rojos lo que quiero y apagados lo libre, que se encienden uno a uno; el borde parpadea en rojo si no cabe todo. Debajo, leyenda y aviso de cuánto sobra o falta. Es una estimación: la interna cuenta al 85 % (la consola reserva espacio) y la SD al 93 % (los GB de la caja son decimales). La tarjeta que se recomienda arriba es la menor de 32/64/128/256/400/512/1024/2048 GB que cubre todo descontando la memoria interna ("Ninguna" si todo cabe en ella).
- **Precio pagado:** al marcar «Ya lo tengo» se pregunta cuánto se pagó (por defecto el PVPR, o «Usar el PVPR»). El precio pagado sustituye al PVPR en esa tarjeta (con el PVPR tachado), en la ficha y en el total «gastados». Se puede cambiar con «Cambiar precio» (en la tarjeta y en la ficha). Se guarda en `localStorage`, clave `juegos-switch-pagado`; al quitar el juego de «ya lo tengo» se borra.
- **Filtros en tres ventanas** (botones Modo de juego, Saga y Género; cada botón abre su ventana, muestra cuántos juegos hay por opción y un botón «Ver N juegos»). Los filtros activos salen como etiquetas que se quitan con un clic, y hay «Quitar filtros». Entre categorías se combinan con Y. Dentro de **Modo de juego** deben cumplirse todos los marcados (Singleplayer, Cooperativo local, Cooperativo online, Multijugador local, Multijugador online); dentro de **Saga** y **Género** basta con uno. Sagas (campo `s` de `games.js`): pokemon (7), zelda (2), mario (12, incluye Kart, Party, Rabbids, Maker, Galaxy, Strikers, Mario & Luigi), dk, smash, ac, kirby (1). Géneros: los de `details.js` (Acción, Aventura, Carreras, Deportes, Estrategia, Lucha, Plataformas, RPG, Simulación, Tablero; no hay de disparos). Al añadir un juego hay que poner su `s` en `games.js`.
- El color de la franja superior del cartucho sale de la carátula (canvas; si el navegador no deja leer la imagen se usa el rojo por defecto). Metascore con los colores de nswitchex.com: verde por encima de 74, amarillo de 50 a 74, rojo por debajo.
- El icono de la pestaña (`favicon.ico`) es el de nswitchex.com. El logo de cabecera es el de Nintendo Switch en negro sobre transparente (`img/switch-logo.png`, de Wikimedia Commons: "Nintendo Switch Logo.svg"), mostrado en blanco con `filter:invert(1)` y brillo rojo. Sin el 2 y sin el cuadrado rojo.
- Fondo animado con la estética Switch (`bg.js`, canvas): luces roja y azul de los Joy-Con, botones A/B/X/Y, signos +/−, círculos y mandos flotando con parallax según el ratón, y un foco de luz que sigue al cursor (un `div` `.spot` movido con `transform`). Con `prefers-reduced-motion` el fondo queda quieto.
- Efectos: logo que flota y brilla, título con destello (3 pasadas), cartas que aparecen al hacer scroll, brillo que sigue al ratón sobre cada cartucho, pines dorados que se mueven al pasar por encima, el juego que se marca como "ya lo tengo" aterriza con animación en su sitio, contadores que rebotan al cambiar y barra de progreso de scroll arriba.
- **Cursor magnético** (`cursor.js`, elegido entre 16 efectos de cursor): punto y anillo con inercia que sustituyen al cursor del sistema solo con ratón (`hover:hover` y `pointer:fine`; en táctil no se activa). El anillo se ajusta al cartucho o botón que se toca y el cartucho se desplaza un poco hacia el cursor. Se oculta con las fichas abiertas y sobre campos de texto y desplegables, donde vuelve el cursor normal. Solo trabaja cuando hay movimiento. Con `prefers-reduced-motion` el anillo sigue sin inercia y sin tirón.
- La cabecera (título, resúmenes, almacenamiento), la barra de herramientas y los filtros no se pueden seleccionar ni copiar con el ratón (`user-select:none`); el buscador sí deja escribir y seleccionar. No es una protección real: el texto sigue en el código de la página.
- Estilo elegido: **Cartuchos** (cartucho con muesca, pines dorados y franja de color). Se probaron otros 24 estilos y se descartaron.

### Segunda tanda de funciones (17/11/2026)

- **Mi diario** (solo en los juegos que ya tengo, dentro de la ficha): **mi nota** del 1 al 10, un **comentario** de hasta 280 caracteres, **fecha de compra** (se rellena sola al marcar «Ya lo tengo»), **horas jugadas** y **fecha en que lo terminé** (se rellena sola al poner el estado «Terminado»). Con las horas sale «Llevo X de Y h de la historia principal (Z %)» y la tarjeta muestra una barra verde fina abajo de la carátula y «Mi nota N». Todo en `localStorage`, clave `juegos-switch-mio` (`{slug:{nota,com,compra,horas,fin,fmt}}`). Al quitar un juego de «ya lo tengo» se borran sus datos del diario (menos el formato). Se puede ordenar por «Mi nota» y por «Horas jugadas».
- **Formato digital o físico** (en el panel de tamaño de la ficha, para cualquier juego, campo `fmt` de `juegos-switch-mio`). Al elegir uno cambia el número grande, la barra y un recuadro que explica cada formato. **Digital:** ocupa en la consola el juego completo (el tamaño de la edición que toca), sin cartucho, ligado a la cuenta Nintendo, no se presta ni se revende. **Físico:** el juego va en el cartucho y en la consola solo se descarga la actualización (`updateMB` de `details.js`, «Tamaño de la actualización» de la web), con el tipo de cartucho, su código y su versión (`cartTipo`, `cartCod`, `cartVer` de `details.js`), se puede prestar y revender, y las actualizaciones futuras y los DLC suman GB aparte. Si el tipo de cartucho contiene «key» o «llave» (cartucho llave de Switch 2 que obliga a descargar todo) se cuenta el tamaño completo. **Limitación:** la web de origen no tiene el tamaño de las actualizaciones de varios juegos (Smash, Mario Kart 8 Deluxe, Pokémon Escarlata, Espada, Arceus y Diamante Brillante, Animal Crossing, Super Mario Party…); en esos el botón pone «Físico · sin dato» y se cuenta como 0 GB, con un aviso de que puede ocupar algo más. Los GB de las tarjetas, del resumen, de «Mi almacenamiento», de las estadísticas y del comparador usan el formato elegido.
- **Formato al añadir a la colección:** al pulsar «Ya lo tengo» (y en «Cambiar precio») el diálogo pregunta, además del precio pagado, el formato con dos botones grandes: **Digital** (azul, icono de nube) y **Físico** (amarillo, icono de cartucho). Se guarda en mt de juegos-switch-mio y se ve en las tarjetas de «Los que ya tengo» (etiqueta ancha de color justo encima del estado, fuera de la zona atenuada) y en la ficha (etiqueta junto al precio; al pulsarla se abre el mismo diálogo). El formato sigue teniendo efecto en los GB, como se explica arriba.
- **Reordenar**: ver «El orden publicado». No hay botón para restablecer el orden: lo que Rafael deja es el orden que quiere (lo pidió así el 17/11/2026); no añadir uno. Solo funciona sin filtros, sin búsqueda y con «Mi orden». En ese modo se arrastra cualquier parte de una tarjeta de «Los que quiero»: **durante el arrastre no se mueve ninguna otra tarjeta**; la original se queda atenuada en su sitio, una tarjeta fantasma sigue al ratón y una barra azul marca entre qué dos juegos (o delante o detrás de cuál) caerá. El cambio se hace **al soltar el clic**. Cerca del borde de la pantalla la página se desplaza sola. También hay flechas ‹ › en cada tarjeta para moverla un puesto (útil con teclado y móvil). Las tarjetas llevan una barra con el icono de puntos y las flechas, y no se abre la ficha al pulsarlas.
- **Comparar** (hasta 3 juegos): botón con dos flechas en cada tarjeta y «Comparar» en la ficha. Aparece una barra «N juegos para comparar» con «Ver comparación» y «Vaciar». La tabla pone en verde lo mejor de cada fila (más Metascore, menos tamaño, menos precio) y usa los tamaños y precios de tu consola y formato.
- **Estadísticas** (botón de la cabecera, `#estadisticas`): juegos, GB, dinero gastado y por gastar, horas jugadas y por jugar, Metascore y nota media, y barras por saga, por género, por estado y gasto por mes de compra.
- **Próximos lanzamientos** (botón de la cabecera, `#proximos`): los próximos exclusivos que anuncia nswitchex.com (`upcoming.js`, generado por `tools/scrape-upcoming.mjs`, 8 juegos con fecha, carcasa y ficha completa, a fecha 25/11/2026). «Lo quiero» los añade a «Los que quiero» (clave `juegos-switch-extra`, saga «Próximos lanzamientos», modos «sin confirmar» y fecha de salida en lugar del tamaño); se pueden quitar mientras no estén marcados como que ya los tengo. Para refrescar la lista: `node tools/scrape-upcoming.mjs .`, y las carcasas nuevas pasarlas por Real-ESRGAN y hacer su miniatura (ver «Carcasas en HD y miniaturas»).
- **Ajustes** (botón de la cabecera, `#ajustes` o la tecla `?`; clave `juegos-switch-ajustes`): **modo ligero** (apaga fondo, cursor y animaciones: clases `lite`, `no-bg`, `no-cursor` en `<html>`), fondo animado y cursor magnético por separado, tamaño del texto (clases `fs-1`, `fs-2`), lista de atajos (`/` buscar, `?` ajustes, ← → entre fichas, Esc) y la publicación del orden.

### Ficha del juego (rediseñada el 17/11/2026)

La ficha toma el color de acento de la carátula (el mismo que la franja del cartucho), tiene anillo animado de Metascore, flechas para pasar al juego anterior o siguiente (también con las teclas ← → y deslizando en el móvil), botón "Ya lo tengo" con icono de cartucho que se convierte en check, etiqueta de precio, barras animadas de horas y de espacio en la tarjeta SD (128 GB), y el subtítulo "desarrollador · fecha" y el título "Resumen" con colores propios. Paneles con brillo que sigue al cursor. Al cerrarla se vacía el `<dialog>` (así se detiene el vídeo).

Datos tomados de la ficha de nswitchex.com de cada juego (`https://nswitchex.com/es/details/<slug>/`):

- Carcasa grande (en HD), Metascore, desarrollador, fecha, resumen (el texto de la web).
- **Género** y **jugadores locales / online** (panel oscuro con etiquetas rojas).
- **Tamaño** (panel dorado). **Siempre en GB, nunca en MB** (MB / 1024, un decimal). Si hay varias ediciones (por ejemplo Estándar y Switch 2 Edition) se muestra la de la consola elegida y la otra debajo, con el PVPR. Se añade el tamaño de la actualización.
- **Horas para completarlo** (panel azul): Historia principal (azul), Principal + Secundarias (verde), Completista (naranja) y Duración de jugador promedio (violeta), cada una con su color. «Duración de jugador promedio» se llama «Todos los estilos» en la web de origen; es la media de los tiempos de todos los jugadores, sin separar por forma de jugar. En la ficha se llama siempre «Duración de jugador promedio», por petición de Rafael, y debajo de las barras hay una nota que lo explica.
- **Rendimiento en Nintendo Switch 2** (panel verde), solo si la web lo tiene: etiqueta y, para televisor y portátil, tasa de frames, resolución y tiempo de carga. La etiqueta es una píldora blanca con texto azul turquesa en negrita (como en nswitchex.com: fondo `#fff`, texto `#12879f`, negrita, 1,02 rem, relleno 7 × 20 px, bordes totalmente redondos), con su significado al lado:
  - **Sin parchear** (Mario + Rabbids Sparks of Hope, Super Smash Bros. Ultimate, Mario & Luigi: Conexión Fraternal y Pokémon Leyendas: Arceus): el juego funciona en Switch 2 tal cual salió en Switch 1, sin ninguna actualización específica para Switch 2 (sin el parche). Los datos son los de esa versión original.
  - **Actualización gratuita**: la desarrolladora ofrece un parche gratuito que mejora el juego en Switch 2 (más fps, más resolución o menos tiempo de carga), sin coste con la copia de Switch 1.
  - **Switch 2 Edition**: versión mejorada pensada para Switch 2, con mejoras técnicas (más resolución, más fps o menos tiempo de carga) y a veces de contenido; suele ser una compra aparte (o una ampliación si ya se tiene el juego de Switch 1). Esta explicación es de redacción propia, no viene de la web de origen.
  - Además, justo debajo de las etiquetas de la ficha hay un recuadro con la misma píldora y su explicación para los juegos `s2e` («Switch 2 Edition»), `upd` («Actualización gratuita») y `s2` («Solo Switch 2»), con una línea con el tamaño y el PVPR de cada edición del juego (por ejemplo Z-A: Estándar 5,9 GB · 59,99 € y Switch 2 Edition 11,0 GB · 69,99 €). No se repite si el panel de rendimiento ya muestra esa misma etiqueta.
- **Vídeo de presentación** (panel al final): es el vídeo de YouTube que trae cada ficha de nswitchex.com (el identificador está en `details.js`, campo `video`). Carga bajo demanda: se ve la miniatura (`i.ytimg.com`, `maxresdefault` y si no existe `hqdefault`) con un botón de reproducir, y solo al pulsar se crea el `iframe` de `youtube-nocookie.com` con reproducción automática.
- Etiquetas de modo de juego (apuntadas a mano) y la etiqueta de compatibilidad con Switch 2.

### Estado de cada juego

Solo para los juegos que ya tengo (el apartado «Los que ya tengo»). Estados: **Pendiente** (por defecto al marcar «Ya lo tengo»), **Jugando**, **Terminado** y **Abandonado**, cada uno con su color (gris, azul, verde y rojo). Se cambia pulsando el botón de estado de la tarjeta (va rotando entre los cuatro) o con los cuatro botones de la ficha. Se guarda en `localStorage`, clave `juegos-switch-estado`, y se borra al quitar el juego de «ya lo tengo». El resumen de «Los que ya tengo» muestra cuántos hay de cada estado. Hay una cuarta ventana de filtros, **Estado**, que solo se aplica a los que ya tengo (los que todavía quiero no tienen estado y desaparecen si se filtra por uno); se abre con `#filtros-status`.

### Enlaces para comprobar precios

En la ficha hay dos botones que abren en pestaña nueva: **Ver en la eShop** (búsqueda por título en la web oficial de Nintendo España, `https://www.nintendo.com/es-es/Search/Search-299117.html?q=<título>`; esa página carga los resultados con JavaScript y no se pudo comprobar desde una herramienta, hay que probarla en el navegador) y **Comparar precios** (búsqueda en Deku Deals, `https://www.dekudeals.com/search?q=<título>`). El precio que sale en la web es el **PVPR** de nswitchex.com, no el precio actual.

### Verificación de los modos de juego (17/11/2026)

Los modos de `games.js` se apuntaron de memoria. La web de origen solo da cuántos jugadores caben a la vez en la misma consola («Jugadores locales») y online, así que no vale para todo. Se contrastaron con búsquedas los dudosos:

- **Mario + Rabbids Sparks of Hope: no tiene cooperativo** (Ubisoft lo descartó). Cambiado de SP, CL a solo SP. Una fuente menciona un modo versus local añadido más tarde; no se pudo confirmar y no se ha puesto.
- Mario + Rabbids Kingdom Battle: un jugador y cooperativo local para dos (SP, CL).
- Super Mario Bros. Wonder: local hasta 4 y online hasta 4 con Nintendo Switch Online; correcto (SP, CL, CO, MO). La web de origen no da dato online.
- Super Mario Maker 2: local hasta 4, cooperativo y competitivo con amigos online; correcto.
- Mario Strikers: Battle League Football: cooperativo local y online (hasta 4) y 1-8 en la misma consola; correcto.
- Pokémon Escarlata y Espada: el cooperativo es el Círculo Unión / incursiones, local inalámbrico u online hasta 4 (cada jugador con su consola); correcto aunque la web de origen ponga 1 jugador local.
- Pendiente de comprobar el resto contra la ficha oficial de Nintendo si se quiere más seguridad.

## Compatibilidad con Switch 2

Clasificación tomada de nswitchex.com (campo `k` en `games.js`):

| Clave | Significado | Juegos |
|---|---|---|
| `s2` | Solo Switch 2 | Donkey Kong Bananza, Mario Kart World |
| `s2e` | Switch 1 + Switch 2 Edition | Pokémon Leyendas Z-A, Super Mario Bros. Wonder, Breath of the Wild, Tears of the Kingdom, Animal Crossing: New Horizons |
| `upd` | Switch 1 + actualización gratuita para Switch 2 | Super Mario Odyssey, Super Mario 3D World + Bowser Fury |
| `s1` | Switch 1, funciona en Switch 2 | el resto |

Las esquinas de la carcasa son las de la web: "2" para solo Switch 2 y "2E" para Switch 2 Edition (`img/corner-2.png`, `img/corner-2e.png`).

## Lista actual (orden de preferencia)

Modos: SP singleplayer, CL cooperativo local, CO cooperativo online, ML multijugador local, MO multijugador online. Sagas: pokemon, zelda, mario, dk, smash, ac, kirby.

| # | Juego | Slug | Consola | Saga | Modos |
|---|---|---|---|---|---|
| 1 | Pokémon Leyendas Z-A | `leyendas-pokemon-z-a` | s2e | pokemon | SP, MO |
| 2 | Donkey Kong Bananza | `donkey-kong-bananza` | s2 | dk | SP, CL |
| 3 | Super Mario 3D World + Bowser Fury | `super-mario-3d-world-bowsers-fury` | upd | mario | SP, CL, CO, MO |
| 4 | Mario + Rabbids Kingdom Battle | `mario-rabbids-kingdom-battle` | s1 | mario | SP, CL |
| 5 | Mario + Rabbids Sparks of Hope | `mario-rabbids-sparks-of-hope` | s1 | mario | SP |
| 6 | Super Mario Party Jamboree | `super-mario-party-jamboree` | s2e | mario | SP, CL, ML, MO |
| 7 | Pokémon Let's Go, Pikachu! | `pokemon-lets-go-pikachu` | s1 | pokemon | SP, CL, MO |
| 8 | Super Mario Bros. Wonder | `super-mario-bros-wonder` | s2e | mario | SP, CL, CO, MO |
| 9 | Super Mario Odyssey | `super-mario-odyssey` | upd | mario | SP, CL |
| 10 | Mario & Luigi: Conexión Fraternal | `mario-luigi-conexion-fraternal` | s1 | mario | SP |
| 11 | The Legend of Zelda: Breath of the Wild | `the-legend-of-zelda-breath-of-the-wild` | s2e | zelda | SP |
| 12 | Pokémon Diamante Brillante | `pokemon-diamante-brillante` | s1 | pokemon | SP, MO |
| 13 | The Legend of Zelda: Tears of the Kingdom | `the-legend-of-zelda-tears-of-the-kingdom` | s2e | zelda | SP |
| 14 | Pokémon Leyendas: Arceus | `leyendas-pokemon-arceus` | s1 | pokemon | SP, MO |
| 15 | Pokémon Escarlata | `pokemon-escarlata` | s1 | pokemon | SP, CL, CO, MO |
| 16 | Super Smash Bros. Ultimate | `super-smash-bros-ultimate` | s1 | smash | SP, ML, MO |
| 17 | Mario Kart World | `mario-kart-world` | s2 | mario | SP, ML, MO |
| 18 | Mario Kart 8 Deluxe | `mario-kart-8-deluxe` | s1 | mario | SP, ML, MO |
| 19 | Mario Strikers: Battle League Football | `mario-strikers-battle-league-football` | s1 | mario | SP, CL, CO, ML, MO |
| 20 | Pokémon Espada | `pokemon-espada` | s1 | pokemon | SP, CL, CO, MO |
| 21 | Super Mario Galaxy + Super Mario Galaxy 2 | `super-mario-galaxy-1-2` | s1 | mario | SP, CL |
| 22 | Animal Crossing: New Horizons | `animal-crossing-new-horizons` | s2e | ac | SP, CL, MO |
| 23 | Super Mario Maker 2 | `super-mario-maker-2` | s1 | mario | SP, CL, CO, ML, MO |
| 24 | Pokkén Tournament DX | `pokken-tournament-dx` | s1 | pokemon | SP, ML, MO |
| 25 | Kirby y la Tierra Olvidada | `kirby-y-la-tierra-olvidada` | s2e | kirby | SP, CL |

Notas sobre los modos (apuntados de memoria, sin verificar en fuentes): Super Mario Party solo tiene historia en solitario en modos concretos y su online es limitado; los Pokémon Leyendas Z-A, Diamante Brillante y Arceus no tienen cooperativo propiamente dicho; en Smash el "cooperativo" son combates por equipos; en Galaxy el segundo jugador solo ayuda.

### Reglas de orden que ha pedido Rafael

- **Animal Crossing: New Horizons va siempre el último** de la lista.
- **Los Pokémon van siempre por encima de los 3 últimos Mario** (Odyssey, Galaxy y Maker 2).
- Pokkén Tournament DX se añadió el 17/11/2026 y se colocó justo antes de Animal Crossing para respetar la regla anterior.
- Pokémon Leyendas Z-A es el 1 y Donkey Kong Bananza el 2 desde el 17/11/2026 (orden pedido a mano).
- Kirby y la Tierra Olvidada se añadió el 17/11/2026 justo antes de Animal Crossing (Switch 2 Edition, modos SP y CL, saga nueva «kirby»); moverlo con Reordenar si Rafael quiere.
- Mario + Rabbids Kingdom Battle se añadió el 17/11/2026 y se colocó justo después de Sparks of Hope (puesto 5), porque Rafael no dijo dónde; moverlo si lo pide.

## Estructura del proyecto

```
index.html        página (cabecera, almacenamiento, herramientas, filtros, apartados, ventanas)
orden.js          orden publicado de la lista (lo escribe la web con «Publicar mi orden»; ver «El orden publicado»)
upcoming.js       próximos lanzamientos (generado por tools/scrape-upcoming.mjs)
stats.js          ventana de estadísticas
compare.js        comparador de juegos
proximos.js       ventana de próximos lanzamientos
ajustes.js        ajustes, atajos y publicación del orden
styles.css        estilos (cartuchos, ficha, ventanas, responsive móvil, prefers-reduced-motion)
app.js            lógica: render, "ya lo tengo", precio pagado, filtros, orden, almacenamiento, ficha, vídeo
cursor.js         cursor magnético (punto y anillo)
bg.js             fondo animado en canvas (sprites precalculados, se pausa con la ficha abierta)
games.js          la lista en orden: slug, saga (s), título, consola (k), modos (m)
details.js        datos de nswitchex.com por slug (generado por tools/scrape.mjs, no editar a mano)
favicon.ico       icono de la pestaña (de nswitchex.com)
img/<slug>.jpg    carcasa original de nswitchex.com (415×208), fuente de las demás
img/t/<slug>.jpg  miniatura cuadrada 240 px para las tarjetas
img/hd/<slug>.jpg carcasa a 1660×832 subida de resolución con IA, para la ficha
img/corner-*.png  esquinas de Switch 2 y Switch 2 Edition
img/switch-logo.png  logo de la cabecera
tools/parse.mjs   lector de las fichas de nswitchex.com (lo usan los dos scrapers)
tools/scrape.mjs  descarga datos, vídeo y carcasas de los juegos de la lista
tools/scrape-upcoming.mjs  descarga los próximos lanzamientos
tools/sync-readme.mjs  deja la tabla del README y el .txt en el orden de orden.js
```

## Cómo añadir, borrar o reordenar

1. **Reordenar o borrar:** editar el orden de `games.js` (el orden del array es el orden de preferencia). Si se borra un juego, quitarlo también de la tabla de este README y de `juegos-switch.txt`.
2. **Añadir un juego:** el slug es el de su ficha en nswitchex.com (`/es/details/<slug>/`; la lista completa está en `https://nswitchex.com/sitemap.xml`). Añadir el slug a la lista `slugs` de `tools/scrape.mjs`, ejecutar `node tools/scrape.mjs .` desde la raíz del proyecto (regenera `details.js`, con el vídeo, y descarga las carcasas originales), y añadir la línea en `games.js` con slug, saga (`s`), título, consola (`k`) y modos (`m`). Respetar las reglas de orden. Después hacer las miniaturas y la versión HD de la carcasa nueva (ver siguiente apartado).
3. Actualizar este README (tabla, fecha) y `juegos-switch.txt`.
4. `app.js` no necesita cambios para añadir o quitar juegos. Probar abriendo `index.html` y una ficha (`index.html#<slug>`).

### Carcasas en HD y miniaturas

- Las originales de nswitchex.com son de 415×208 px y se veían pixeladas en la ficha. Se subieron a 1660×832 con Real-ESRGAN (`realesrgan-ncnn-vulkan` v0.2.5.0 de `xinntao/Real-ESRGAN`, modelo `realesrgan-x4plus`, escala 4): `realesrgan-ncnn-vulkan.exe -i <carpeta con los jpg> -o <salida> -n realesrgan-x4plus -s 4 -f jpg`. Se recomprimieron a JPEG calidad 80 en `img/hd/` (4,7 MB las 23). Con el modelo `-anime` las líneas salían más limpias pero los logos quedaban peor. Descargar el programa a una carpeta nueva y vacía, fuera del proyecto.
- Miniaturas de las tarjetas: recorte cuadrado centrado de la carcasa original, 240×240, JPEG calidad 72, en `img/t/` (3 veces más ligeras que cargar la original).
- La ficha usa `img/hd/`; las tarjetas usan `img/t/`. Rafael autorizó ejecutar ese programa; hay que repetir el proceso con cada juego nuevo.

## Datos que se guardan en el navegador (`localStorage`)

| Clave | Contenido |
|---|---|
| `juegos-switch-tengo` | slugs de los juegos que ya tengo, en el orden en que se marcaron |
| `juegos-switch-pagado` | precio pagado por slug |
| `juegos-switch-estado` | estado por slug (playing, done, dropped; pendiente = sin clave) |
| `juegos-switch-mio` | diario y formato por slug (nota, com, compra, horas, fin, fmt) |
| `juegos-switch-orden` | orden propio de la lista (slugs) |
| `juegos-switch-extra` | próximos lanzamientos añadidos a la lista |
| `juegos-switch-consola`, `-interna`, `-sd` | consola, memoria interna y tarjeta SD |
| `juegos-switch-ajustes` | modo ligero, fondo, cursor y tamaño del texto |
| `juegos-switch-token` | token de GitHub para publicar el orden (opcional, solo en el navegador de Rafael) |
| `juegos-switch-perfil` | perfil elegido: `rafa` o `novia` (Jueguitos Switch) |
| `juegos-switch-cuenta`, `juegos-switch-cuenta-novia` | sesión de la lista de Rafita / de Nicky: usuario, token y si hay cambios sin subir |
| `juegos-switch-*-novia` | las mismas claves de arriba, pero del perfil Jueguitos Switch |

Sin sesión, nada de esto se sincroniza entre dispositivos salvo el orden de Rafael, que se publica en `orden.js`. Con sesión iniciada, todo (menos ajustes, token, perfil y la propia sesión) se guarda en la cuenta (ver «Cuentas»).

## Rendimiento (optimización del 17/11/2026)

- Miniaturas pequeñas en las tarjetas y `loading="lazy"` salvo las 6 primeras; la HD solo se carga al abrir la ficha (y se precarga al pasar el ratón por el cartucho).
- Scripts con `defer`, fuente de Google precargada sin bloquear, logo con `fetchpriority="high"` y tamaños fijos en las imágenes (sin saltos de maquetación).
- El vídeo no se carga hasta que se pulsa reproducir.
- Fondo: sprites precalculados, menos partículas, `devicePixelRatio` limitado a 1,5, se pausa con la ficha abierta o la pestaña oculta; las luces de fondo son degradados (sin `blur`) animados con `transform`; el foco del cursor es un elemento movido con `transform` (no repinta toda la pantalla).
- Sin `backdrop-filter` sobre el fondo animado (resúmenes y almacenamiento usan fondo casi opaco); el cursor no usa `mix-blend-mode`.
- `content-visibility:auto` en las tarjetas; animaciones infinitas reducidas (el título brilla 3 veces); eventos de ratón y scroll limitados a un fotograma.
- El cursor magnético solo calcula mientras el anillo se mueve.

## Convenciones

- El código va **sin comentarios**.
- Los commits y este README **no mencionan a ningún asistente ni herramienta de IA**.
- Los commits van a nombre de Rafael con el correo `noreply` de GitHub.
- Las imágenes, textos y datos pertenecen a sus dueños (Nintendo y las demás compañías) y a nswitchex.com; se usan solo para esta lista personal.
- Los textos de la web están en español.
- «Ya lo tengo», el diario y el resto de datos personales no se sincronizan entre dispositivos (son `localStorage`); solo el orden se publica en `orden.js`.

## Historial de decisiones

- Se pidió una web con las carcasas de los juegos con etiqueta de Switch 1 / Switch 2, filtros y animaciones; después se probaron 25 estilos con varios skills de diseño y se eligió **Cartuchos**.
- Los filtros de consola (Solo Switch 2, Switch 2 Edition…) se quitaron; los filtros pasaron a tres ventanas (modo de juego, saga y género).
- Las carcasas, la compatibilidad con Switch 2, el vídeo y los datos de la ficha (rendimiento, horas, tamaño, género y jugadores) salen de nswitchex.com.
- Metascore con los mismos colores que la web de origen y orden por crítica en los dos sentidos.
- De 16 efectos de cursor se eligió el **cursor magnético**; de 16 estilos de barra, la de **8 bits**.
- Carcasas en HD con Real-ESRGAN (17/11/2026).
- 17/11/2026: se añadieron reordenar y publicar el orden, nota y diario, formato digital/físico, estadísticas, comparador, próximos lanzamientos y ajustes (Rafael eligió estas diez ideas de mejora y descartó la copia de seguridad/exportar y otras).
- Ideas pendientes que Rafael no ha pedido todavía: estado de cada juego (jugando, terminado…), «¿a qué juego?» al azar, aviso de Nintendo Switch Online, enlaces a la eShop, exportar o compartir la lista, instalar como app en el móvil y sincronizar «ya lo tengo» entre dispositivos.

## Estado de cada juego (desplegable, 23/11/2026)

En los juegos que ya tengo, el botón de estado abre un **desplegable** con Pendiente, Jugando, Terminado y Abandonado (cada uno con su color y una marca en el actual), en vez de ir pasando de uno a otro con cada clic. Se maneja también con el teclado (flechas, Intro y Esc) y se cierra al pulsar fuera o al hacer scroll. El menú se pinta fuera de la tarjeta (`.stmenu`, posición fija) porque la tarjeta recorta su contenido.

## Mi cuenta: perfil, código de amigo y resumen
- El botón de la cuenta es el primero de la barra. Dentro: avatar (carátula o logo de `img/`), nombre con mayúsculas, nombre en Nintendo y región de la eShop, código de amigo `SW-0000-0000-0000` con botón Copiar, resumen de la colección (juegos, GB, gastado, horas, terminados) y Seguridad (contraseña, pregunta de recuperación y cerrar otras sesiones).
- Todo se guarda en la cuenta como claves `juegos-switch-avatar`, `juegos-switch-nintendo` y `juegos-switch-amigo` (con sufijo `-novia` en la lista de Nicky).

## Seguridad, avisos y enlace compartido (24/11/2026)
- **Entrar:** tras 8 contraseñas erróneas seguidas la cuenta se bloquea 15 minutos (429 `bloqueo`), incluso con la contraseña buena. Se desbloquea sola.
- **Aviso de guardado:** si falla el guardado en la nube sale un aviso abajo con botón «Reintentar»; además se reintenta solo cada 30 s.
- **Atajos de teclado:** quitados (`/` para buscar y `?` para Ajustes). Siguen las flechas dentro de una ficha y Escape en los menús.
- **Vista previa del enlace:** título, descripción e imagen (`img/og.png`, 1200x630) en `index.html`.
- **Publicar mi orden:** solo aparece en Ajustes si no hay sesión iniciada.
- **Correo de recuperación (24/11/2026):** en «Mi cuenta» → Seguridad se puede guardar un correo. Con `POST ?a=codigo {user}` el servidor envía un código de 6 cifras (caduca en 15 min, 1 por minuto, 5 intentos) y `POST ?a=recuperar_codigo {user, codigo, nueva}` pone la contraseña nueva. Las contraseñas están cifradas y nunca se envían. El envío usa Gmail (nodemailer) con las variables de Vercel `GMAIL_USER` y `GMAIL_APP_PASSWORD` (contraseña de aplicación). Sin ellas, `codigo` responde 503 y la web no ofrece el botón.
- **Avatares (24/11/2026):** agrupados por juego en desplegables (`AVG` de `cuenta.js`, clasificados a ojo; los dudosos están en «Otros»). Son los 148 iconos de perfil de la propia Switch (`img/avatares/*.webp`, 256x256, de github.com/vishans/Nintendo-Switch-Profile-Icons-Avatars); 30 con nombre y el resto como `icono-NNN`. Se quitaron los antiguos (carátulas, Kitty y logo). La lista está en `AV` de `cuenta.js`; el valor guardado es la ruta dentro de `img/`.
- **Mi cuenta:** el estado de guardado se actualiza en su sitio sin redibujar la ventana (antes borraba lo escrito y quitaba el foco). Los formularios con contraseña llevan un campo de usuario oculto para que el navegador no rellene el nombre de usuario en otros campos. Correo y pregunta se quedan escritos tras guardar.
- **Avatares de Mario Kart (24/11/2026):** grupos «Mario Kart 8 Deluxe» (75 personajes, objetos y copas), «Mario Kart 8 Deluxe: circuitos» (20 fondos), «Mario Kart World» (25) y «Super Mario Kart» (7), de las categorías de iconos de Mario Wiki (mariowiki.com, API de MediaWiki). «Super Mario Party» son los 7 iconos redondos del conjunto de la Switch. Los iconos de las secciones de «Mi cuenta» son SVG propios.

## Mis horas jugadas (24/11/2026)
- Botón «Mis horas» en la barra, antes de Ajustes (`horas.js`). Lista los juegos marcados como «ya tengo» con un campo de horas cada uno, buscador y total. Acepta `12,5`, `12 h 30 min` o `12h30m`; se guarda al salir del campo y con Intro pasa al siguiente. Escribe en el mismo dato que el campo «Horas jugadas» de cada ficha (`juegos-switch-mio`), así que se sincroniza con la cuenta. Al cerrar redibuja las tarjetas (`JS.redraw`, `JS.setMi` en `app.js`).
- No hay forma oficial de leer las horas de Nintendo: se copian a mano desde la consola (Perfil → Historial de juego).

## Menú lateral (24/11/2026)
- La barra de botones de la cabecera es ahora un cajón lateral (`drawer.js`): un botón redondo arriba a la izquierda (`#bmenu`) lo abre y se cierra con la X, tocando fuera, con Escape o al elegir algo. Dentro: tu perfil con estado de guardado, Los que quiero, Los que ya tengo, Estadísticas, Próximos lanzamientos (con la cantidad de juegos anunciados), Mis horas y Ajustes, cada uno con su icono. Los botones siguen siendo los mismos elementos (`#bstats`, `#bnext`, `#bhoras`, `#bset`, `#bcuenta`), solo cambia el estilo. El botón redondo de arriba a la derecha sigue siendo el de cambiar de lista.
- **Avatares (24/11/2026, 550 en total):** además de los 148 de la Switch y los de Mario Kart, se importaron los iconos de Nintendo Switch Online de Mario Wiki (Super Mario Odyssey, 3D World + Bowser's Fury, Mario Strikers, Mario vs. Donkey Kong, Super Mario RPG, Donkey Kong Country, DKC 2, DKC Returns HD y DK Challenge) y los de Animal Crossing de Nookipedia. Se descartaron los fondos, escenarios, marcos redondos, pegatinas de lugares y las imágenes sin transparencia; los circuitos de Mario Kart 8 Deluxe se quitaron. No hay fuente descargable de los iconos de Zelda, Pokémon, Splatoon, Kirby ni Metroid más allá de los 148 de la consola.

## Nintendo Switch Online (25/11/2026)
- Apartado «Nintendo Switch Online» en el menú lateral (`online.js`, con fondo animado, aro giratorio en el plan elegido, precio que cuenta hasta el nuevo valor, personas con color propio y frases clave en colores): elige entre la básica y la del Paquete de expansión, individual o familiar, la duración y, si es familiar, cuántas personas sois (2 a 8). Calcula lo que paga cada persona al mes y al año y lo que ahorráis frente a suscripciones individuales, redondeando hacia arriba al céntimo como hace Nintendo (1,67 €, 0,37 €, 3,34 € y 0,73 € coinciden con su web). Debajo lista lo que incluye cada una.
- Precios de la página de Nintendo España (nintendo.com/es-es, 25/11/2026), con IVA: individual 19,99 €/12 meses, familiar 34,99 €/12 meses; con Paquete de expansión, individual 39,99 € y familiar 69,99 €, ambos a 12 meses. Nintendo solo vende la familiar y el paquete por 12 meses. Los precios de 1 mes (3,99 €) y 3 meses (7,99 €) de la individual básica no salen en esa página: son de la eShop según Eurogamer e inLobby y la ventana lo avisa. Para actualizarlos, cambia `PRICE` en `online.js`.
- **Efectos en las ventanas (25/11/2026):** Estadísticas, Próximos lanzamientos, Mis horas, Ajustes y Mi cuenta comparten el estilo de Nintendo Switch Online: luces animadas arriba, título con degradado, frases clave en colores (`<mark class="m-cy|m-gr|m-or|m-pu|m-pk|m-go">`), entrada escalonada solo al abrir (clase `fx-open`), tarjetas con color propio, barras que crecen, aro de colores y zoom en las tarjetas de próximos lanzamientos, y el aviso «En N días» en naranja con pulso cuando faltan 60 días o menos. Respeta «reducir movimiento».
