# IconKit — especificación de diseño (VINCULANTE)

Reglas de dibujo obligatorias para que todos los iconos sean **visualmente consistentes** y se
generen sin tocar cada salida. Un icono incoherente rompe la biblioteca entera.

## 1. Lienzo y rejilla

- `viewBox="0 0 24 24"`. **Nunca** otro viewBox.
- **Área viva 20×20**: el contenido vive en `x,y ∈ [2, 22]` (2px de margen a cada lado). Los iconos
  "llenos" ópticamente (círculos) pueden llegar a ~[2,22]; los altos/anchos, centrados.
- Coordenadas alineadas a la rejilla: usa enteros o `.5`. Los trazos verticales/horizontales caen en
  coordenadas **enteras** para nitidez; evita decimales largos (máx 2 decimales).
- Centro óptico en `12,12`. Equilibra el peso visual, no solo el geométrico.

## 2. Trazo (modo `outline`)

- El `<svg>` contenedor (lo pone el generador) fija: `fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`.
- Por tanto el **markup interior NO lleva `stroke`, `fill`, `color` ni `stroke-width`** — hereda todo.
- Grosor visual único: 2. No mezcles grosores. Detalles internos también a 2 (o usa formas, no medios trazos).
- Remates y uniones **redondos** siempre.
- Radios de esquina coherentes: ~2 para cajas medianas, ~1 para pequeñas. Nada de esquinas vivas salvo intención.

## 3. Relleno (modo `solid`)

- El `<svg>` contenedor fija `fill="currentColor" stroke="none"`.
- El markup interior **no lleva `fill` ni `stroke`** (hereda `fill`).
- Los "huecos" (p. ej. el hueco de una lupa, el check knock-out) se hacen con **`fill-rule="evenodd"`**
  en el `<path>` (ese atributo SÍ se permite) combinando subrutas, no con color blanco.
- Aporta `solid` **solo** cuando mejora al icono (corazón, estrella, campana, usuario, círculos de
  estado, play/pause, marcador, pin, bandera, nube, gema, trofeo, medalla, corona, escudo, chat,
  sobre, etiqueta, smile, pulgares…). Para iconos puramente lineales (flechas, chevrons, wifi, code…)
  **omite `solid`**: el build usará el `outline` para el modo solid.

## 4. Formato del markup

Cada variante es el **markup interior** del SVG (sin la etiqueta `<svg>`), una sola línea, comillas
dobles escapables en JSON. Usa solo estos elementos: `<path>`, `<circle>`, `<rect>`, `<line>`,
`<polyline>`, `<polygon>`, `<ellipse>`. Prohibido: `<style>`, `id`, `class`, `transform` con
`matrix`, gradientes, `stroke-*`/`fill`/`color` (salvo `fill-rule="evenodd"` en solid).

Prefiere `<path d="...">` compacto. Ejemplo outline flecha derecha:
`<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>`

## 5. Nombres

- `id` en **kebab-case**, en inglés, singular salvo colectivos (`users`). Sin abreviaturas oscuras.
- Familias con sufijo: variantes por relleno = mismo id (dos variantes), no `-fill`. Direcciones:
  `arrow-up`, `chevron-right`. Estados: `alert-circle`, `check-circle`, `x-circle`.
- `aliases`: nombres alternativos que resuelven al mismo icono (p. ej. `trash` alias `delete`,
  `bin`). `keywords`: términos de búsqueda (es/en).

## 6. Registry (salida de cada categoría → `src/authored/<grupo>.json`)

```json
{
  "arrow-right": {
    "category": "arrows",
    "keywords": ["direction", "next", "forward", "flecha", "derecha"],
    "aliases": ["forward"],
    "outline": "<path d=\"M4 12h15\"/><path d=\"m13 6 6 6-6 6\"/>",
    "solid": null
  }
}
```
`solid` = `null` u omitido si no aplica. Claves = `id`. No repitas ids entre categorías.

## 7. Exemplars (estilo de referencia — cópialo)

Estos están autorizados y fijan el estilo. Míralos antes de dibujar; iguala su peso y construcción.

- **home** outline: `<path d="M4 11 12 4l8 7"/><path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5"/><path d="M10 20v-5h4v5"/>`
- **search** outline: `<circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>`
- **settings** outline: `<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6"/>`
- **check** outline: `<path d="m4.5 12.5 5 5 10-11"/>`
- **x** outline: `<path d="M6 6l12 12M18 6 6 18"/>`
- **plus** outline: `<path d="M12 5v14M5 12h14"/>`
- **chevron-right** outline: `<path d="m9 5 7 7-7 7"/>`
- **trash** outline: `<path d="M4.5 7h15"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M6.5 7 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7"/><path d="M10 11v6M14 11v6"/>`
- **heart** outline: `<path d="M12 20.3C12 20.3 3.5 15 3.5 8.9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.5 2.9C20.5 15 12 20.3 12 20.3Z"/>`
- **heart** solid: `<path d="M12 20.6C12 20.6 3 15 3 8.7A4.9 4.9 0 0 1 12 5.9a4.9 4.9 0 0 1 9 2.8C21 15 12 20.6 12 20.6Z"/>`
- **star** outline: `<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>`
- **star** solid: same path as star outline (se rellenará).
- **user** outline: `<circle cx="12" cy="8" r="3.6"/><path d="M5.5 20c0-3.4 3-5.4 6.5-5.4s6.5 2 6.5 5.4"/>`
- **user** solid: `<path d="M12 12a3.8 3.8 0 1 0 0-7.6A3.8 3.8 0 0 0 12 12Z"/><path d="M4.8 20.2c0-3.6 3.2-5.9 7.2-5.9s7.2 2.3 7.2 5.9a.9.9 0 0 1-.9.8H5.7a.9.9 0 0 1-.9-.8Z"/>`
- **bell** outline: `<path d="M7 10a5 5 0 0 1 10 0c0 4.5 2 6 2 6H5s2-1.5 2-6Z"/><path d="M10.2 20a2 2 0 0 0 3.6 0"/>`
- **circle-check** outline: `<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.4 2.4 4.6-5"/>`
- **circle-check** solid: `<path d="M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4Zm4.4 6.9-5.1 5.6a1 1 0 0 1-1.45.02L7.7 13.2a1 1 0 1 1 1.42-1.4l1.44 1.45 4.4-4.85a1 1 0 0 1 1.48 1.34Z" fill-rule="evenodd"/>`
- **play** solid: `<path d="M7.5 5.2v13.6a1 1 0 0 0 1.52.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 7.5 5.2Z"/>`
- **arrow-right** outline: `<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>`

## 8. Lista maestra (~190 iconos — qué dibujar)

Cada agente recibe su grupo. `*` = conviene también variante `solid`.

**A · essentials-ui:** home*, search, menu, close(x), settings*, filter, sort-ascending, sort-descending,
more-horizontal, more-vertical, grid, list, layout-dashboard, apps, refresh-cw, sync, external-link,
maximize, minimize, drag-handle, sidebar, columns, expand, collapse.

**B · arrows:** arrow-up, arrow-down, arrow-left, arrow-right, arrow-up-right, arrow-up-left,
arrow-down-right, arrow-down-left, chevron-up, chevron-down, chevron-left, chevron-right,
chevrons-left, chevrons-right, caret-up*, caret-down*, corner-down-right, move, swap-horizontal,
swap-vertical, download, upload, log-in, log-out, undo, redo.

**C · actions-edit:** plus, minus, edit(pencil), trash*, copy, scissors, save, share, share-nodes,
link, unlink, lock*, unlock, eye, eye-off, pin*, bookmark*, flag*, tag*, clipboard, check,
check-double, duplicate, magnet, crop, filter-x.

**D · media:** play*, pause*, stop*, skip-forward, skip-back, fast-forward, rewind, volume,
volume-low, volume-high, volume-x, shuffle, repeat, repeat-1, record*, camera*, video, image, music,
headphones, mic, mic-off, cast, airplay.

**E · communication-social:** mail*, mail-open, message-circle*, message-square*, comment-dots, bell*,
bell-off, send*, at-sign, phone*, phone-off, inbox, user*, users*, user-plus, user-minus, heart*,
thumbs-up*, thumbs-down*, smile*, star*, gift*.

**F · files-data-time:** file, file-text, folder*, folder-open, archive, database, cloud*,
cloud-upload, cloud-download, book*, calendar*, clock, history, hourglass, chart-bar, chart-line,
chart-pie*, activity, trending-up, trending-down, layers, paperclip.

**G · commerce-status:** shopping-cart*, shopping-bag*, credit-card*, wallet*, coin*, gem*, store*,
receipt, percent, dollar-sign, info*, alert-triangle*, alert-circle*, check-circle*, x-circle*,
help-circle*, shield*, shield-check*, badge-check*, ban, loader, sparkles*.

**H · tech-weather-game:** wifi, bluetooth, battery, power, cpu, server, code, terminal, bug,
git-branch, monitor, smartphone, sun*, moon*, cloud-rain, zap*, flame*, leaf*, droplet*, map-pin*,
globe, compass*, trophy*, medal*, crown*, target, dice*, gamepad, puzzle*, mahjong-tile*.

> `mahjong-tile`: una ficha de mahjong vertical (rectángulo redondeado alto ~ratio 3:4) con un
> pequeño glifo interior; outline = contorno + marca; solid = ficha rellena con la marca en negativo
> (evenodd).
