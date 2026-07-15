# 🎨 IconKit — biblioteca de iconos universal

**3039 iconos** vectoriales, monocromo, definidos **una sola vez** y exportados a **todas** las
tecnologías por un *build* determinista. Cada icono hereda el color (`currentColor`), escala a
cualquier tamaño y viene en dos modos: **outline** (contorno) y **solid** (relleno, 1568 iconos
con variante dedicada; el resto reutiliza el contorno).

En línea (CDN): **https://iconkit.suils.es** · Catálogo en Figma completo (una página por
categoría, cada icono como vector nombrado por su id). Cobertura al estilo de Font Awesome /
Line Awesome en **73 categorías**: UI, flechas, acciones, multimedia, comunicación, archivos,
comercio, estado, tecnología/clima/juego, brands (tech/social/logos), weather, medical,
transport, food, e-commerce, devices, editor, charts, security, nature, animals, sports, tools,
finance, gaming, ui-controls, crypto, payment, accessibility, science, education, travel,
landmarks, buildings, hands, shapes, photography, instruments, video-film, faces, clothing,
furniture, delivery, kitchen, bathroom, cleaning, office, agriculture, construction, energy,
automotive, aviation, nautical, space, religion, zodiac, date-time, fitness, beauty, baby-kids,
industrial, objects, garden, camping, party, wedding, holidays, board-games, performance,
martial-arts, plants, music, maps, smart-home…

- **Fuente única de verdad:** `src/authored/*.json` → `src/registry.json` (vía `build/`).
- **Salidas** en `dist/` para: Web (HTML/CSS/JS), Web Component, React, Vue, Angular, Svelte,
  Flutter, Kotlin/Android, Swift/SwiftUI, Python, PHP, C#/.NET/Blazor, y un `manifest.json`
  universal (con datos de *path* puro) para cualquier otro lenguaje (C, C++, Rust, Go, ASP.NET…).

## Uso rápido

```html
<!-- Web -->
<link rel="stylesheet" href="dist/css/iconkit.css">
<i class="ik ik-home"></i>              <!-- outline -->
<i class="ik ik-heart-solid" style="color:#e05b4c;font-size:32px"></i>
```
```dart
// Flutter
IconKitIcon(IconKit.home, size: 24, color: Colors.red)
IconKitIcon(IconKit.heart, mode: IconKitMode.solid)
```
```jsx
// React            // Vue              // Angular / Web Component
<Home color="#e05b4c" />               <ik-icon name="home" mode="solid"></ik-icon>
```
```python
iconkit.svg("home", mode="solid", size=20, color="#e05b4c")   # PHP: IconKit::svg('home', [...])  ·  .NET: IconKit.Svg("home")
```

Guía completa por tecnología: [`dist/README.md`](dist/README.md).

## Estructura

```
docs/DESIGN-SPEC.md      Reglas de dibujo (grid 24, trazo 2, currentColor, modos)
src/authored/*.json      Iconos por categoría (fuente de verdad; markup interior SVG)
build/                   Generadores (Node, ESM): registry, validate, gen/*, index
dist/                    Salida por tecnología (se regenera con `npm run build`)
dist/figma/catalog.svg   Catálogo completo (cada capa nombrada por su id → importable a Figma)
dist/figma/identifiers.json  Cómo se llama cada icono en cada tecnología
FIGMA.md                 Enlace al archivo de Figma del catálogo
```

## Desarrollo

```bash
npm install            # deps de build (solo para generar la fuente tipográfica opcional)
npm run validate       # valida el registro (nombres, markup, colisiones de alias)
npm run build          # regenera dist/ para todas las tecnologías
npm run sheet          # hoja de contacto HTML para revisar todos los iconos
```

## Diseño

- Lienzo **24×24**, área viva **[2,22]**, trazo visual **2** con remates redondos.
- El markup interior **no** lleva color/stroke/fill: los pone el `<svg>` contenedor, por eso el
  color se hereda (`currentColor`) en cualquier destino.
- 8 categorías: essentials-ui, arrows, actions-edit, media, communication-social, files-data-time,
  commerce-status, tech-weather-game.

## Cómo añadir o cambiar un icono

1. Edita/añade en `src/authored/<categoría>.json` respetando `docs/DESIGN-SPEC.md`.
2. `npm run validate` → `npm run sheet` (revisa visualmente) → `npm run build`.
3. Los identificadores (clase CSS, componente, constante Dart/Swift/C#, drawable Android…) se
   derivan automáticamente del `id` kebab-case.

## Renombrar la marca / prefijo

Todo sale de `build/config.js` (`brand`, `prefix`, `fontFamily`). Cámbialo y reconstruye.

## Roadmap

- Fuente tipográfica TTF/WOFF2 (`@font-face` + `content:"\ue0xx"`): requiere expansión de trazo a
  relleno para los iconos de contorno; las dependencias ya están instaladas. Hoy el uso `<i class>`
  ya funciona vía máscara CSS (mejor: soporta contorno + `currentColor` sin fuente).
- Variante duotono y pesos de trazo adicionales.
- Publicación en npm / pub.dev / NuGet / PyPI / Packagist.
