# IconKit

IconKit — 3000+ monochrome vector icons (outline & solid), single source of truth, currentColor, for every stack.

- **3039 icons** (1570 with a solid variant) across 73 categories, 24×24 grid, stroke width 2.
- Everything inherits `currentColor` and scales to any size.
- One source of truth — the same shapes ship for CSS, web components, React, Vue, Angular,
  Svelte, raw SVG, an icon font and a machine-readable `manifest.json`.
- Browse and search all icons: **[iconkit.suils.es](https://iconkit.suils.es)**

## Install

```sh
npm install iconkit
```

Or straight from the CDN: `https://iconkit.suils.es` (same layout as this package).

## CSS (mask, zero JS)

```html
<link rel="stylesheet" href="node_modules/iconkit/css/iconkit.css">
<i class="ik ik-home"></i>                <!-- outline -->
<i class="ik ik-home-solid"></i>          <!-- solid -->
<i class="ik ik-heart-solid" style="color:#e05b4c;font-size:32px"></i>
```

Icons are `mask-image` based: they are 1em squares that follow `color` and `font-size`.
With a bundler, `import 'iconkit/css';` works too.

## Web component

```html
<script type="module" src="node_modules/iconkit/web-component/iconkit.js"></script>
<ik-icon name="home"></ik-icon>
<ik-icon name="heart" mode="solid" size="32" style="color:#e05b4c"></ik-icon>
```

(Also available from the CDN: `<script type="module" src="https://iconkit.suils.es/web-component/iconkit.js"></script>`.)

## React

```jsx
import { Home, Heart, Icon } from 'iconkit/react';

<Home size={24} />
<Heart mode="solid" color="#e05b4c" />
<Icon name="arrow-right" size={20} />
```

TypeScript definitions included. Named exports are tree-shakeable wrappers over `Icon`.

## Vue 3

```js
import { Home, Icon } from 'iconkit/vue';
```

```html
<Home :size="24" />
<Icon name="heart" mode="solid" color="#e05b4c" />
```

## Svelte

```svelte
<script>
  import Icon from 'iconkit/svelte';
</script>
<Icon name="home" mode="solid" size={24} color="#e05b4c" />
```

## Angular (standalone)

The component ships as TypeScript source. Import it from the package (or copy
`angular/ik-icon.component.ts` + `angular/iconkit.data.ts` into your app):

```ts
import { IkIconComponent } from 'iconkit/angular/ik-icon.component';
// template: <ik-icon name="home" mode="solid" size="24"></ik-icon>
```

## Raw SVG & sprite

- Single files: `iconkit/svg/outline/home.svg`, `iconkit/svg/solid/home.svg`
- Sprite: `iconkit/svg/sprite.svg`

```html
<svg width="24" height="24"><use href="svg/sprite.svg#ik-home"/></svg>
<svg width="24" height="24"><use href="svg/sprite.svg#ik-home-solid"/></svg>
```

## Icon font

An icon font (outline shapes, deterministic codepoints) is included under `font/`:

```html
<link rel="stylesheet" href="node_modules/iconkit/font/iconkit-font.css">
<i class="ikf ikf-home"></i>
```

`font/iconkit.woff2` and `font/iconkit.ttf` are referenced by that stylesheet; size with
`font-size`, color with `color`. Codepoints match `manifest.json` (`icons[name].codepoint`).

## Any other stack

`iconkit/manifest.json` describes every icon: `outline`/`solid` SVG markup, pure path data
(`paths`), category, keywords, aliases and codepoint. Render it however you like — color and
size are always yours.

> Note: the two icons whose name starts with a digit (`3d-glasses`, `3d-printer`) are exported
> to code as `I3dGlasses` / `I3dPrinter`.

## License

[MIT](./LICENSE) © Ferran Suils Mora · [suils.es](https://suils.es)
