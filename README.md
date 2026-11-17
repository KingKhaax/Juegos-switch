# Juegos Switch

Mi lista de juegos de Nintendo Switch: los que quiero y los que ya tengo. Cada juego es un cartucho; al pulsarlo se abre su ficha con el resumen, el tamaño, las horas para completarlo, el rendimiento en Switch 2 y más.

**Web:** https://kingkhaax.github.io/Juegos-switch/

Este README recoge todo lo que está decidido y apuntado del proyecto, para que cualquiera que lo edite (añadir juegos, borrar, reordenar, cambiar el diseño) lo tenga en cuenta. **Se actualiza en cada cambio**, junto con `juegos-switch.txt` del escritorio de Rafael (copia en texto de la lista).

Última actualización: 17/11/2026.

## Cómo funciona la web

- Página estática sin servidor ni dependencias: `index.html` + `styles.css` + `app.js` + datos en `games.js` y `details.js`.
- Título "Mi colección de Nintendo Switch" con dos apartados en la misma página: **Los que quiero** (arriba, numerados por preferencia) y **Los que ya tengo** (al final, atenuados).
- Cada cartucho tiene el botón **Ya lo tengo**. Al pulsarlo el juego pasa al final del todo (apartado "Los que ya tengo"), se oscurece, y la lista de los que quiero se renumera: si se marca el 4.º, el 5.º pasa a ser el 4.º y así con todos. Pulsando de nuevo («Quitar de ya lo tengo») vuelve a su sitio original de la lista. Los números siempre son consecutivos entre las tarjetas visibles: con un filtro activo se renumeran (1, 2, 3…) en lugar de conservar el número que tendrían sin filtro, para que no haya saltos.
- Lo que se marca como "ya lo tengo" se guarda en el navegador (`localStorage`, clave `juegos-switch-tengo`). No se sincroniza entre dispositivos.
- Al pulsar un cartucho se abre la ficha (`<dialog>`). También se abre con la URL `#<slug>`, por ejemplo `#super-mario-odyssey`.
- **Mi consola** (Switch 1 / Switch 2, se guarda en `localStorage`, clave `juegos-switch-consola`, por defecto Switch 2): decide qué edición se usa para el tamaño, el precio y los totales. En Switch 1 se usa la edición Estándar; en Switch 2, la Switch 2 Edition si existe y si no la Estándar. Los juegos solo de Switch 2 (Donkey Kong Bananza, Mario Kart World) con Switch 1 elegida salen como "Solo Switch 2" y no cuentan en totales.
- **Buscador** por nombre (sin acentos ni mayúsculas) y **orden alternativo**: Mi orden, Metascore, Tamaño (menor o mayor primero), Historia (más corta o más larga), Precio (más barato o más caro). Los sin dato quedan al final. Con otro orden distinto de "Mi orden" los números son la posición en ese orden.
- **Resumen de arriba:** juegos, GB y euros de lo que quiero (por comprar) y de lo que tengo (gastados), y la **tarjeta SD recomendada** (la menor de 32/64/128/256/512/1024/2048 GB que cubre todo con un 8 % de margen).
- Cada tarjeta muestra tamaño y precio (PVPR de la edición elegida).
- **Mi almacenamiento:** memoria interna (32 GB Switch/Lite, 64 GB OLED, 256 GB Switch 2; por defecto según la consola elegida, `juegos-switch-interna`) y tarjeta SD (ninguna, 32, 64, 128, 256, 400, 512, 1 TB o 2 TB; `juegos-switch-sd`). Barra con lo que tengo, lo que quiero y la capacidad, y aviso de cuánto sobra o falta. Es una estimación: la interna cuenta al 85 % (la consola reserva espacio) y la SD al 93 % (los GB de la caja son decimales). La tarjeta que se recomienda arriba descuenta la memoria interna ("Ninguna" si todo cabe en ella).
- **Precio pagado:** al marcar «Ya lo tengo» se pregunta cuánto se pagó (por defecto el PVPR, o «Usar el PVPR»). El precio pagado sustituye al PVPR en esa tarjeta (con el PVPR tachado), en la ficha y en el total «gastados». Se puede cambiar con «Cambiar precio» (en la tarjeta y en la ficha). Se guarda en `localStorage`, clave `juegos-switch-pagado`; al quitar el juego de «ya lo tengo» se borra.
- Botón «Ya lo tengo» de la ficha con icono de cartucho que se convierte en check al marcarlo.
- Filtros de modo de juego (se pueden combinar, deben cumplirse todos): Singleplayer, Cooperativo local, Cooperativo online, Multijugador local, Multijugador online.
- Cada tarjeta lleva el Metascore con los colores de nswitchex.com: verde por encima de 74, amarillo de 50 a 74, rojo por debajo. El color de la franja superior del cartucho sale de la carátula (canvas; si el navegador no deja leer la imagen se usa el rojo por defecto).
- El icono de la pestaña (`favicon.ico`) es el de nswitchex.com. El logo de cabecera es el de Nintendo Switch en negro sobre transparente (`img/switch-logo.png`, de Wikimedia Commons: "Nintendo Switch Logo.svg"), mostrado en blanco con `filter:invert(1)` y brillo rojo. Sin el 2 y sin el cuadrado rojo.
- Fondo animado con la estética Switch (`bg.js`, canvas): luces roja y azul de los Joy-Con, botones A/B/X/Y, signos +/−, círculos y mandos flotando con parallax según el ratón, y un foco de luz que sigue al cursor. Con `prefers-reduced-motion` el fondo queda quieto.
- Efectos: logo que flota y brilla, título con destello, cartas que aparecen al hacer scroll, brillo que sigue al ratón sobre cada cartucho, pines dorados que se mueven al pasar por encima, el juego que se marca como "ya lo tengo" aterriza con animación en su sitio, contadores que rebotan al cambiar, barra de progreso de scroll arriba y, en la ficha, zoom lento en la carcasa y paneles que entran escalonados.
- **Cursor magnético** (`cursor.js`, elegido entre 16 efectos de cursor): punto y anillo con inercia que sustituyen al cursor del sistema solo con ratón (`hover:hover` y `pointer:fine`; en táctil no se activa). El anillo se ajusta al cartucho o botón que se toca y el cartucho se desplaza un poco hacia el cursor. Se oculta con las fichas abiertas y sobre campos de texto y desplegables, donde vuelve el cursor normal. Con `prefers-reduced-motion` el anillo sigue sin inercia y sin tirón.
- Estilo elegido: **Cartuchos** (cartucho con muesca, pines dorados y franja de color). Se probaron otros 24 estilos y se descartaron.

### Ficha del juego (rediseñada el 17/11/2026)

La ficha toma el color de acento de la carátula (el mismo que la franja del cartucho), tiene anillo animado de Metascore, flechas para pasar al juego anterior o siguiente (también con las teclas ← → y deslizando en el móvil), botón "Ya lo tengo" con animación, etiqueta de precio, barras animadas de horas y de espacio en la tarjeta SD (128 GB), y el subtítulo "desarrollador · fecha" y el título "Resumen" con colores propios. Paneles con brillo que sigue al cursor.

Datos tomados de la ficha de nswitchex.com de cada juego (`https://nswitchex.com/es/details/<slug>/`):

- Carcasa grande, Metascore, desarrollador, fecha, resumen (el texto de la web).
- **Género** y **jugadores locales / online** (panel oscuro con etiquetas rojas).
- **Tamaño** (panel dorado). **Siempre en GB, nunca en MB** (MB / 1024, un decimal). Si hay varias ediciones (por ejemplo Estándar y Switch 2 Edition) se muestra una por edición, con el PVPR. Se añade el tamaño de la actualización.
- **Horas para completarlo** (panel azul): Historia principal, Principal + Secundarias, Completista, Duración de jugador promedio (en la web de origen se llama "Todos los estilos"; es la media de todos los jugadores). Se llama siempre "Duración de jugador promedio" en la ficha, por petición de Rafael.
- **Rendimiento en Nintendo Switch 2** (panel verde), solo si la web lo tiene: etiqueta (Actualización gratuita / Switch 2 Edition), y para televisor y portátil: tasa de frames, resolución y tiempo de carga.
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

Modos: SP singleplayer, CL cooperativo local, CO cooperativo online, ML multijugador local, MO multijugador online.

| # | Juego | Slug | Consola | Modos |
|---|---|---|---|---|
| 1 | Pokémon Leyendas Z-A | `leyendas-pokemon-z-a` | s2e | SP, MO |
| 2 | Donkey Kong Bananza | `donkey-kong-bananza` | s2 | SP, CL |
| 3 | Super Mario Bros. Wonder | `super-mario-bros-wonder` | s2e | SP, CL, CO, MO |
| 4 | Mario + Rabbids Sparks of Hope | `mario-rabbids-sparks-of-hope` | s1 | SP, CL |
| 5 | Super Mario Party | `super-mario-party` | s1 | CL, ML, MO |
| 6 | Super Mario 3D World + Bowser Fury | `super-mario-3d-world-bowsers-fury` | upd | SP, CL, CO, MO |
| 7 | Super Smash Bros. Ultimate | `super-smash-bros-ultimate` | s1 | SP, ML, MO |
| 8 | Pokémon Diamante Brillante | `pokemon-diamante-brillante` | s1 | SP, MO |
| 9 | The Legend of Zelda: Breath of the Wild | `the-legend-of-zelda-breath-of-the-wild` | s2e | SP |
| 10 | Pokémon Let's Go, Eevee! | `pokemon-lets-go-eevee` | s1 | SP, CL, MO |
| 11 | Mario & Luigi: Conexión Fraternal | `mario-luigi-conexion-fraternal` | s1 | SP |
| 12 | The Legend of Zelda: Tears of the Kingdom | `the-legend-of-zelda-tears-of-the-kingdom` | s2e | SP |
| 13 | Mario Strikers: Battle League Football | `mario-strikers-battle-league-football` | s1 | SP, CL, CO, ML, MO |
| 14 | Mario Kart World | `mario-kart-world` | s2 | SP, ML, MO |
| 15 | Mario Kart 8 Deluxe | `mario-kart-8-deluxe` | s1 | SP, ML, MO |
| 16 | Pokémon Escarlata | `pokemon-escarlata` | s1 | SP, CL, CO, MO |
| 17 | Pokémon Leyendas: Arceus | `leyendas-pokemon-arceus` | s1 | SP, MO |
| 18 | Pokémon Espada | `pokemon-espada` | s1 | SP, CL, CO, MO |
| 19 | Super Mario Odyssey | `super-mario-odyssey` | upd | SP, CL |
| 20 | Super Mario Galaxy + Super Mario Galaxy 2 | `super-mario-galaxy-1-2` | s1 | SP, CL |
| 21 | Super Mario Maker 2 | `super-mario-maker-2` | s1 | SP, CL, CO, ML, MO |
| 22 | Pokkén Tournament DX | `pokken-tournament-dx` | s1 | SP, ML, MO |
| 23 | Animal Crossing: New Horizons | `animal-crossing-new-horizons` | s2e | SP, CL, MO |

Notas sobre los modos (apuntados de memoria, sin verificar en fuentes): Super Mario Party solo tiene historia en solitario en modos concretos y su online es limitado; los Pokémon Leyendas Z-A, Diamante Brillante y Arceus no tienen cooperativo propiamente dicho; en Smash el "cooperativo" son combates por equipos; en Galaxy el segundo jugador solo ayuda.

### Reglas de orden que ha pedido Rafael

- **Animal Crossing: New Horizons va siempre el último** de la lista.
- **Los Pokémon van siempre por encima de los 3 últimos Mario** (Odyssey, Galaxy y Maker 2).
- Pokkén Tournament DX se añadió el 17/11/2026 y se colocó justo antes de Animal Crossing para respetar la regla anterior.
- Los números que dice Rafael ("cambia el 6 por el 9", "el Zelda al 10"…) son posiciones actuales y se aplican **en el orden en que los dice**, cada uno sobre la lista tal como queda tras el anterior.
- Pokémon Leyendas Z-A es el 1 y Donkey Kong Bananza el 2 desde el 17/11/2026 (orden pedido a mano).

## Estructura del proyecto

```
index.html        página
styles.css        estilos (cartuchos, ficha, responsive móvil, prefers-reduced-motion)
app.js            lógica: render, "ya lo tengo", filtros, ficha, tono de color, efectos de aparición
cursor.js         cursor magnético (punto y anillo)
bg.js             fondo animado en canvas (sprites precalculados, se pausa con la ficha abierta)
img/t/<slug>.jpg  miniatura cuadrada 240 px de cada carcasa, para las tarjetas
img/hd/<slug>.jpg carcasa a 1660×832 px subida de resolución con IA (Real-ESRGAN x4plus), para la ficha
games.js          la lista en orden: slug, título, consola (k), modos (m)
details.js        datos de nswitchex.com por slug (generado, no editar a mano)
favicon.ico       icono de la pestaña (de nswitchex.com)
img/<slug>.jpg    carcasa de cada juego (de nswitchex.com)
img/corner-*.png  esquinas de Switch 2 y Switch 2 Edition
img/switch-logo.png  logo de la cabecera
tools/scrape.mjs  descarga datos y carcasas de nswitchex.com
```

## Cómo añadir, borrar o reordenar

1. **Reordenar o borrar:** editar el orden de `games.js` (el orden del array es el orden de preferencia). Si se borra un juego, quitarlo también de la tabla de este README y de `juegos-switch.txt`.
2. **Añadir un juego:** el slug es el de su ficha en nswitchex.com (`/es/details/<slug>/`; la lista completa está en `https://nswitchex.com/sitemap.xml`). Añadir el slug a la lista `slugs` de `tools/scrape.mjs`, ejecutar `node tools/scrape.mjs .` desde la raíz del proyecto (regenera `details.js` y descarga todas las carcasas), y añadir la línea en `games.js` con título, clase de consola y modos. Respetar las reglas de orden de arriba.
3. Actualizar este README (tabla, fecha) y `juegos-switch.txt`.
4. `app.js` no necesita cambios para añadir o quitar juegos. Probar abriendo `index.html` y una ficha (`index.html#<slug>`).

## Convenciones

- El código va **sin comentarios**.
- Los commits y este README **no mencionan a ningún asistente ni herramienta de IA**.
- Los commits van a nombre de Rafael.
- Las imágenes, textos y datos pertenecen a sus dueños (Nintendo y las demás compañías) y a nswitchex.com; se usan solo para esta lista personal.
- Los textos de la web están en español.

## Historial de decisiones

- Se pidió una web con las carcasas de los juegos con etiqueta de Switch 1 / Switch 2, filtros y animaciones; después se probaron 25 estilos con varios skills de diseño y se eligió **Cartuchos**.
- Los filtros de consola (Solo Switch 2, Switch 2 Edition…) se quitaron; quedan solo los 5 de modo de juego.
- Las carcasas y la compatibilidad con Switch 2 salen de nswitchex.com. Los datos de la ficha (los cuatro bloques de rendimiento, horas, tamaño y género/jugadores) también.
- Metascore: se añadió con los mismos colores que la web de origen.
- Pendiente de decidir: si se quiere sincronizar "ya lo tengo" entre dispositivos (ahora es solo local al navegador).
- Carcasas en HD (17/11/2026): las originales de nswitchex.com son de 415×208 px y se veían pixeladas en la ficha. Se subieron a 1660×832 con Real-ESRGAN (`realesrgan-ncnn-vulkan`, modelo `realesrgan-x4plus`, escala 4) y se recomprimieron a JPEG calidad 80 en `img/hd/`. La ficha usa las HD y las tarjetas las miniaturas `img/t/`. Al añadir un juego nuevo hay que repetir ese paso (Rafael autorizó ejecutar ese programa).
