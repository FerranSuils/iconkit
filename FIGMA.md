# IconKit — Figma Catalog

Catálogo visual de la librería **IconKit** (196 iconos) generado en Figma vía MCP.
Cada icono aparece **dibujado como vector editable** junto a su **id** y, si procede, una marca **● solid**.
La cubierta incluye la leyenda de cómo se llama el mismo icono en **12 tecnologías**.

## Archivo

| Campo | Valor |
|---|---|
| **Nombre** | IconKit — Universal Icon Library |
| **URL** | https://www.figma.com/design/s6gdfELjbdK3lUikrd1j3i |
| **File key** | `s6gdfELjbdK3lUikrd1j3i` |
| **Editor** | Figma design |
| **Página** | `IconKit` (fondo oscuro `#0A100D`) |
| **Cuenta** | Ferran · info@nordicbyte.co.uk · team "info's team" |
| **Estética** | Dark, limpia · superficie `#0E1512` / tarjeta `#131D18` · iconos `#E8F0EC` · acento mint `#5FD0A3` |

## Iconos colocados como vectores: **196 / 196** (el catálogo completo)

Todos los iconos se dibujaron como vectores editables con la Plugin API
(`figma.createNodeFromSvg` a partir de `manifest.icons[id].paths.outline`), trazo 2,
`stroke-linecap/linejoin = round`, reescalados a 42 px sobre tarjeta oscura.
Cada tarjeta se llama `card/<id>` y muestra el **id visible** debajo del icono.

## Frames creados

Nodo → abre con `…/design/s6gdfELjbdK3lUikrd1j3i?node-id=<nodo>`

| Frame | Nodo | Posición (x,y) | Contenido |
|---|---|---|---|
| **IconKit — Cover** | `2-2` | 0, 0 | Título, subtítulo, **tabla-leyenda 12 tecnologías × 3 ejemplos** (arrow-right, heart, home), bloque **Modos outline/solid**, chips **Color = currentColor** y **Tamaño = libre**, nota de pie |
| Catalog — Files · Data · Time | `3-2` | 1340, 0 | 22 iconos (5 solid) |
| Catalog — Media | `4-2` | 2506, 0 | 24 iconos (5 solid) |
| Catalog — Commerce · Status | `5-2` | 1340, 1100 | 22 iconos (17 solid) |
| Catalog — Essentials · UI | `6-2` | 2506, 1100 | 23 iconos (1 solid) |
| Catalog — Arrows | `7-2` | 1340, 2200 | 26 iconos (2 solid) |
| Catalog — Communication · Social | `8-2` | 2506, 2200 | 22 iconos (14 solid) |
| Catalog — Tech · Weather · Game | `9-2` | 1340, 3300 | 30 iconos (14 solid) |
| Catalog — Actions · Edit | `10-2` | 2506, 3300 | 27 iconos (6 solid) |

**Total catálogo:** 22+24+22+23+26+22+30+27 = **196 iconos** · **64** con variante solid.

La cubierta usa los identificadores reales de `dist/figma/identifiers.json` para las filas:
CSS `<i class="ik ik-arrow-right"></i>` · Web Component `<ik-icon name="arrow-right"></ik-icon>` ·
React/Vue/Svelte `<ArrowRight />` · Angular `<ik-icon name="arrow-right" />` ·
Flutter `IconKitIcon(IconKit.arrowRight)` · Kotlin `R.drawable.ik_arrow_right` ·
Swift `IconKitIcon(.arrowRight)` · Python `iconkit.svg("arrow-right")` ·
PHP `IconKit::svg('arrow-right')` · .NET `IconKit.Svg("arrow-right")`.

## Screenshots exportados (en `dist/figma/`)

| Archivo | Frame |
|---|---|
| `figma-cover.png` | Cubierta + leyenda completa (nodo 2-2) |
| `figma-catalog.png` | Catalog — Files · Data · Time (nodo 3-2) |
| `figma-catalog-tech.png` | Catalog — Tech · Weather · Game, 30 iconos (nodo 9-2) |

## Catálogo completo de 196 en `dist/figma/catalog.svg`

Los 196 iconos se colocaron como vectores dentro del propio archivo Figma (arriba).
Además, `dist/figma/catalog.svg` es la referencia grid del catálogo completo (196 iconos
etiquetados) y es **importable a Figma con las capas ya nombradas por id** — útil como
fuente alternativa o para regenerar componentes con nombres consistentes.

## Notas técnicas

- **Sizing / auto-layout:** en la Plugin API, `resize()` sobre un frame con auto-layout
  fuerza los `sizingMode` a `FIXED`. Por eso los helpers fijan `primary/counterAxisSizingMode`
  **después** de `resize()` (fixed width + hug height). Si no, los frames quedan en altura 10
  y el contenido se recorta.
- **Rejilla:** cada frame de categoría usa auto-layout `HORIZONTAL` + `layoutWrap="WRAP"`
  (ancho fijo 1006, 6 tarjetas por fila) para colocar las tarjetas automáticamente.
- **Iconos:** `createNodeFromSvg` con `viewBox 0 0 24 24`, `stroke-width 2`, `round`,
  luego `rescale(42/24)`. Editables (vector network) y con color modificable.
- **Fuentes:** Inter (Regular/Medium/Semi Bold/Bold) + Roboto Mono para ids y snippets de código.
