# IconKit — biblioteca de iconos universal

> Un icono se define **una sola vez** (SVG vectorial en rejilla de 24) y un *build* determinista lo
> exporta a **todas** las tecnologías. Máxima compatibilidad: color heredado (`currentColor`),
> cualquier tamaño, y modos **outline** (contorno) y **solid** (relleno).

Carpeta: `D:\Documents\iconkit` (paralela a `D:\Documents\mahjong`). Uso **global** (cualquier proyecto)
y luego integrado en el juego Jade Mahjong.

## Nombre y prefijo

- Marca: **IconKit** · prefijo CSS/clase: **`ik`** · fuente tipográfica: **"IconKit"**.
- Renombrable en un único sitio: `build/config.js` (`brand`, `prefix`, `fontFamily`).

## Principio de compatibilidad

- **Fuente única de verdad:** `src/registry.json` (id, categoría, keywords, aliases, markup `outline`
  y opcional `solid`). Todo lo demás se **genera**.
- **Color:** cada icono usa `currentColor` (el `stroke` en outline, el `fill` en solid) → hereda el
  color del texto en cualquier tecnología, sin variantes de color.
- **Tamaño:** SVG sin tamaño fijo (escala a `1em` o al que se le dé) → cualquier dimensión, nítido.
- **Modos:** `outline` (trazo 2px, remates redondos) y `solid` (relleno). Ampliable a duotone.

## Salidas (todas generadas desde el registry)

| Tecnología | Entregable | Uso |
|---|---|---|
| SVG crudo | `dist/svg/{outline,solid}/<id>.svg` + `sprite.svg` | universal |
| Manifest | `dist/manifest.json` (paths + metadatos) | cualquier lenguaje (Python, C, Rust, C#…) |
| HTML/CSS | `dist/css/iconkit.css` (máscara `currentColor`) + `demo.html` | `<i class="ik ik-home">` |
| Fuente | `dist/font/iconkit.{ttf,woff2}` + `iconkit-font.css` | `<i class="ik ik-home">` clásico / Flutter IconData |
| Web Component | `dist/web-component/iconkit.js` | `<ik-icon name="home">` |
| React | `dist/react/` (TSX + JSX, tree-shakeable) | `<Home/>` |
| Vue 3 | `dist/vue/` (SFC) | `<Home/>` / `<ik-icon name="home">` |
| Angular | `dist/angular/` (componente standalone) | `<ik-icon name="home">` |
| Svelte | `dist/svelte/` | `<Home/>` |
| Flutter | `dist/flutter/` (paquete: fuente + `IconKit.home` + `IconKitIcon`) | `IconKitIcon(IconKit.home)` |
| Kotlin/Android | `dist/kotlin/` (Compose `ImageVector` + `res/drawable/ik_*.xml`) | `Icon(IconKit.Home, null)` |
| Swift/SwiftUI | `dist/swift/` (Shape/Image ext.) | `IconKitIcon(.home)` |
| Python | `dist/python/iconkit/` | `iconkit.svg("home")` |
| PHP | `dist/php/IconKit.php` | `IconKit::svg('home')` / `ik_icon('home')` |
| .NET / Blazor | `dist/dotnet/` (helper + componente Blazor) | `<IkIcon Name="home"/>` / `IconKit.Home` |

## Identificadores por tecnología (mismo icono `arrow-right`)

- id: `arrow-right` · Pascal `ArrowRight` · camel `arrowRight` · CONST `ARROW_RIGHT` · snake `arrow_right`
- HTML/CSS: `<i class="ik ik-arrow-right"></i>`
- Web Component: `<ik-icon name="arrow-right"></ik-icon>`
- React/Svelte: `<ArrowRight />`
- Vue: `<ArrowRight />` o `<ik-icon name="arrow-right" />`
- Angular: `<ik-icon name="arrow-right" />`
- Flutter: `IconKitIcon(IconKit.arrowRight)`
- Kotlin (Compose): `Icon(IconKit.ArrowRight, null)` · drawable `R.drawable.ik_arrow_right`
- SwiftUI: `IconKitIcon(.arrowRight)`
- Python: `iconkit.svg("arrow-right")`
- PHP: `IconKit::svg('arrow-right')`
- C#/.NET: `IconKit.ArrowRight` · Blazor `<IkIcon Name="arrow-right" />`
- Fuente/Unicode: `\uE0xx` (familia "IconKit")

## Fases

1. **Contrato** — este PLAN, `docs/DESIGN-SPEC.md`, exemplars y lista maestra (~190 iconos).
2. **Autoría** — subagentes dibujan los SVG por categoría en `src/authored/*.json`.
3. **Validación** — merge → `src/registry.json`, validador y hoja de contacto para revisión visual.
4. **Figma MCP** — catálogo con nombres e identificadores por tecnología (outline/solid, tamaños, color).
5. **Generadores** — `build/` produce `dist/` para todas las tecnologías + READMEs de uso.
6. **Integración** — paquete Flutter en Jade Mahjong sustituyendo iconos de Material.

## No objetivos (v1)

- Iconos a color/ilustraciones (esto es monocromo con `currentColor`).
- Animaciones (se pueden añadir por CSS por encima).
- Publicación en npm/pub.dev/NuGet (los paquetes quedan listos en `dist/`; publicar es un paso aparte).
