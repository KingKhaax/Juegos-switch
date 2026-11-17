# Juegos Switch

Mi lista de juegos de Nintendo Switch: los que quiero y los que ya tengo. Cada juego es un cartucho; al pulsarlo se abre su ficha con el resumen, el tamaño, las horas para completarlo, el rendimiento en Switch 2, el vídeo de presentación y más.

**Web:** https://kingkhaax.github.io/Juegos-switch/

Este README recoge todo lo que está decidido y apuntado del proyecto, para que cualquiera que lo edite (añadir juegos, borrar, reordenar, cambiar el diseño) lo tenga en cuenta. **Se actualiza en cada cambio**, junto con `juegos-switch.txt` del escritorio de Rafael (copia en texto de la lista).

Última actualización: 17/11/2026.

## Guía rápida para otra sesión

Antes de tocar nada, léelo entero. Después, en cada cambio:

1. Aplica el cambio en el código (`games.js`, `app.js`, `styles.css`…).
2. Si cambia la lista (orden, juegos, modos, sagas), actualiza también la tabla de este README y `C:\Users\Rafael\Desktop\juegos-switch.txt`.
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

## Cómo funciona la web

- Página estática sin servidor ni dependencias: `index.html` + `styles.css` + `app.js` + `bg.js` + `cursor.js` + datos en `games.js` y `details.js`.
- Título "Mi colección de Nintendo Switch" con dos apartados en la misma página: **Los que quiero** (arriba, numerados por preferencia) y **Los que ya tengo** (al final, atenuados).
- Cada cartucho tiene el botón **Ya lo tengo**. Al pulsarlo el juego pasa al final del todo (apartado "Los que ya tengo"), se oscurece, y la lista de los que quiero se renumera: si se marca el 4.º, el 5.º pasa a ser el 4.º y así con todos. Pulsando de nuevo («Quitar de ya lo tengo») vuelve a su sitio original de la lista. Los números siempre son consecutivos entre las tarjetas visibles: con un filtro activo se renumeran (1, 2, 3…) en lugar de conservar el número que tendrían sin filtro, para que no haya saltos.
- Lo que se marca como "ya lo tengo" se guarda en el navegador (`localStorage`, clave `juegos-switch-tengo`). No se sincroniza entre dispositivos.
- Al pulsar un cartucho se abre la ficha (`<dialog>`). También se abre con la URL `#<slug>`, por ejemplo `#super-mario-odyssey`. Con la ficha abierta la rueda del ratón mueve solo la ficha y no la página de detrás (`html:has(dialog[open])`, clase `lock` por JS y `overscroll-behavior:contain`).
- **Mi consola** (Switch 1 / Switch 2, se guarda en `localStorage`, clave `juegos-switch-consola`, por defecto Switch 2): decide qué edición se usa para el tamaño, el precio y los totales. En Switch 1 se usa la edición Estándar; en Switch 2, la Switch 2 Edition si existe y si no la Estándar. Los juegos solo de Switch 2 (Donkey Kong Bananza, Mario Kart World) con Switch 1 elegida salen como "Solo Switch 2" y no cuentan en totales.
- **Buscador** por nombre (sin acentos ni mayúsculas) y **orden alternativo**: Mi orden, Crítica (Metascore) mejor o peor primero, Tamaño (menor o mayor primero), Historia (más corta o más larga), Precio (más barato o más caro). Los sin dato quedan al final. Con otro orden distinto de "Mi orden" los números son la posición en ese orden.
- **Resumen de arriba:** juegos, GB y euros de lo que quiero (por comprar) y de lo que tengo (gastados), y la **tarjeta SD recomendada**.
- Cada tarjeta muestra tamaño y precio (PVPR de la edición elegida) y el Metascore.
- **Mi almacenamiento:** memoria interna (32 GB Switch/Lite, 64 GB OLED, 256 GB Switch 2; por defecto según la consola elegida, `juegos-switch-interna`) y tarjeta SD (ninguna, 32, 64, 128, 256, 400, 512, 1 TB o 2 TB; `juegos-switch-sd`). Barra de 8 bits (elegida entre 16 estilos): 20 bloques con borde de píxel, azules lo que tengo, rojos lo que quiero y apagados lo libre, que se encienden uno a uno; el borde parpadea en rojo si no cabe todo. Debajo, leyenda y aviso de cuánto sobra o falta. Es una estimación: la interna cuenta al 85 % (la consola reserva espacio) y la SD al 93 % (los GB de la caja son decimales). La tarjeta que se recomienda arriba es la menor de 32/64/128/256/400/512/1024/2048 GB que cubre todo descontando la memoria interna ("Ninguna" si todo cabe en ella).
- **Precio pagado:** al marcar «Ya lo tengo» se pregunta cuánto se pagó (por defecto el PVPR, o «Usar el PVPR»). El precio pagado sustituye al PVPR en esa tarjeta (con el PVPR tachado), en la ficha y en el total «gastados». Se puede cambiar con «Cambiar precio» (en la tarjeta y en la ficha). Se guarda en `localStorage`, clave `juegos-switch-pagado`; al quitar el juego de «ya lo tengo» se borra.
- **Filtros en tres ventanas** (botones Modo de juego, Saga y Género; cada botón abre su ventana, muestra cuántos juegos hay por opción y un botón «Ver N juegos»). Los filtros activos salen como etiquetas que se quitan con un clic, y hay «Quitar filtros». Entre categorías se combinan con Y. Dentro de **Modo de juego** deben cumplirse todos los marcados (Singleplayer, Cooperativo local, Cooperativo online, Multijugador local, Multijugador online); dentro de **Saga** y **Género** basta con uno. Sagas (campo `s` de `games.js`): pokemon (7), zelda (2), mario (11, incluye Kart, Party, Rabbids, Maker, Galaxy, Strikers, Mario & Luigi), dk, smash, ac. Géneros: los de `details.js` (Acción, Aventura, Carreras, Deportes, Estrategia, Lucha, Plataformas, RPG, Simulación, Tablero; no hay de disparos). Al añadir un juego hay que poner su `s` en `games.js`.
- El color de la franja superior del cartucho sale de la carátula (canvas; si el navegador no deja leer la imagen se usa el rojo por defecto). Metascore con los colores de nswitchex.com: verde por encima de 74, amarillo de 50 a 74, rojo por debajo.
- El icono de la pestaña (`favicon.ico`) es el de nswitchex.com. El logo de cabecera es el de Nintendo Switch en negro sobre transparente (`img/switch-logo.png`, de Wikimedia Commons: "Nintendo Switch Logo.svg"), mostrado en blanco con `filter:invert(1)` y brillo rojo. Sin el 2 y sin el cuadrado rojo.
- Fondo animado con la estética Switch (`bg.js`, canvas): luces roja y azul de los Joy-Con, botones A/B/X/Y, signos +/−, círculos y mandos flotando con parallax según el ratón, y un foco de luz que sigue al cursor (un `div` `.spot` movido con `transform`). Con `prefers-reduced-motion` el fondo queda quieto.
- Efectos: logo que flota y brilla, título con destello (3 pasadas), cartas que aparecen al hacer scroll, brillo que sigue al ratón sobre cada cartucho, pines dorados que se mueven al pasar por encima, el juego que se marca como "ya lo tengo" aterriza con animación en su sitio, contadores que rebotan al cambiar y barra de progreso de scroll arriba.
- **Cursor magnético** (`cursor.js`, elegido entre 16 efectos de cursor): punto y anillo con inercia que sustituyen al cursor del sistema solo con ratón (`hover:hover` y `pointer:fine`; en táctil no se activa). El anillo se ajusta al cartucho o botón que se toca y el cartucho se desplaza un poco hacia el cursor. Se oculta con las fichas abiertas y sobre campos de texto y desplegables, donde vuelve el cursor normal. Solo trabaja cuando hay movimiento. Con `prefers-reduced-motion` el anillo sigue sin inercia y sin tirón.
- La cabecera (título, resúmenes, almacenamiento), la barra de herramientas y los filtros no se pueden seleccionar ni copiar con el ratón (`user-select:none`); el buscador sí deja escribir y seleccionar. No es una protección real: el texto sigue en el código de la página.
- Estilo elegido: **Cartuchos** (cartucho con muesca, pines dorados y franja de color). Se probaron otros 24 estilos y se descartaron.

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

Modos: SP singleplayer, CL cooperativo local, CO cooperativo online, ML multijugador local, MO multijugador online. Sagas: pokemon, zelda, mario, dk, smash, ac.

| # | Juego | Slug | Consola | Saga | Modos |
|---|---|---|---|---|---|
| 1 | Pokémon Leyendas Z-A | `leyendas-pokemon-z-a` | s2e | pokemon | SP, MO |
| 2 | Donkey Kong Bananza | `donkey-kong-bananza` | s2 | dk | SP, CL |
| 3 | Super Mario Bros. Wonder | `super-mario-bros-wonder` | s2e | mario | SP, CL, CO, MO |
| 4 | Mario + Rabbids Sparks of Hope | `mario-rabbids-sparks-of-hope` | s1 | mario | SP, CL |
| 5 | Super Mario Party | `super-mario-party` | s1 | mario | CL, ML, MO |
| 6 | Super Mario 3D World + Bowser Fury | `super-mario-3d-world-bowsers-fury` | upd | mario | SP, CL, CO, MO |
| 7 | Super Smash Bros. Ultimate | `super-smash-bros-ultimate` | s1 | smash | SP, ML, MO |
| 8 | Pokémon Diamante Brillante | `pokemon-diamante-brillante` | s1 | pokemon | SP, MO |
| 9 | The Legend of Zelda: Breath of the Wild | `the-legend-of-zelda-breath-of-the-wild` | s2e | zelda | SP |
| 10 | Pokémon Let's Go, Eevee! | `pokemon-lets-go-eevee` | s1 | pokemon | SP, CL, MO |
| 11 | Mario & Luigi: Conexión Fraternal | `mario-luigi-conexion-fraternal` | s1 | mario | SP |
| 12 | The Legend of Zelda: Tears of the Kingdom | `the-legend-of-zelda-tears-of-the-kingdom` | s2e | zelda | SP |
| 13 | Mario Strikers: Battle League Football | `mario-strikers-battle-league-football` | s1 | mario | SP, CL, CO, ML, MO |
| 14 | Mario Kart World | `mario-kart-world` | s2 | mario | SP, ML, MO |
| 15 | Mario Kart 8 Deluxe | `mario-kart-8-deluxe` | s1 | mario | SP, ML, MO |
| 16 | Pokémon Escarlata | `pokemon-escarlata` | s1 | pokemon | SP, CL, CO, MO |
| 17 | Pokémon Leyendas: Arceus | `leyendas-pokemon-arceus` | s1 | pokemon | SP, MO |
| 18 | Pokémon Espada | `pokemon-espada` | s1 | pokemon | SP, CL, CO, MO |
| 19 | Super Mario Odyssey | `super-mario-odyssey` | upd | mario | SP, CL |
| 20 | Super Mario Galaxy + Super Mario Galaxy 2 | `super-mario-galaxy-1-2` | s1 | mario | SP, CL |
| 21 | Super Mario Maker 2 | `super-mario-maker-2` | s1 | mario | SP, CL, CO, ML, MO |
| 22 | Pokkén Tournament DX | `pokken-tournament-dx` | s1 | pokemon | SP, ML, MO |
| 23 | Animal Crossing: New Horizons | `animal-crossing-new-horizons` | s2e | ac | SP, CL, MO |

Notas sobre los modos (apuntados de memoria, sin verificar en fuentes): Super Mario Party solo tiene historia en solitario en modos concretos y su online es limitado; los Pokémon Leyendas Z-A, Diamante Brillante y Arceus no tienen cooperativo propiamente dicho; en Smash el "cooperativo" son combates por equipos; en Galaxy el segundo jugador solo ayuda.

### Reglas de orden que ha pedido Rafael

- **Animal Crossing: New Horizons va siempre el último** de la lista.
- **Los Pokémon van siempre por encima de los 3 últimos Mario** (Odyssey, Galaxy y Maker 2).
- Pokkén Tournament DX se añadió el 17/11/2026 y se colocó justo antes de Animal Crossing para respetar la regla anterior.
- Pokémon Leyendas Z-A es el 1 y Donkey Kong Bananza el 2 desde el 17/11/2026 (orden pedido a mano).

## Estructura del proyecto

```
index.html        página (cabecera, almacenamiento, herramientas, filtros, apartados, ventanas)
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
tools/scrape.mjs  descarga datos, vídeo y carcasas de nswitchex.com
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
- No se ha podido sincronizar «ya lo tengo» entre dispositivos (es `localStorage`).

## Historial de decisiones

- Se pidió una web con las carcasas de los juegos con etiqueta de Switch 1 / Switch 2, filtros y animaciones; después se probaron 25 estilos con varios skills de diseño y se eligió **Cartuchos**.
- Los filtros de consola (Solo Switch 2, Switch 2 Edition…) se quitaron; los filtros pasaron a tres ventanas (modo de juego, saga y género).
- Las carcasas, la compatibilidad con Switch 2, el vídeo y los datos de la ficha (rendimiento, horas, tamaño, género y jugadores) salen de nswitchex.com.
- Metascore con los mismos colores que la web de origen y orden por crítica en los dos sentidos.
- De 16 efectos de cursor se eligió el **cursor magnético**; de 16 estilos de barra, la de **8 bits**.
- Carcasas en HD con Real-ESRGAN (17/11/2026).
- Ideas pendientes que Rafael no ha pedido todavía: estado de cada juego (jugando, terminado…), «¿a qué juego?» al azar, aviso de Nintendo Switch Online, enlaces a la eShop, exportar o compartir la lista, instalar como app en el móvil y sincronizar «ya lo tengo» entre dispositivos.
