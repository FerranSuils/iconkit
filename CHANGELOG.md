# Changelog

## 1.0.1 — 2026-07-15

- Fixed malformed SVG in 3 icons (`folder-star`, `folder-heart` outline; `face-robot-face` solid):
  a subpath sat outside its `<path>` element, so the star/heart mark and the robot antenna dot
  didn't render in that mode. No API changes.

## 1.0.0 — 2026-07-15

- Initial public release.
- 3039 icons across 73 categories; outline mode for every icon plus 1568 solid variants.
- All icons on a 24×24 grid, stroke width 2, `currentColor` — tint with any color, scale to any size.
- Outputs from a single source of truth: raw SVG + sprite, CSS (mask), web component,
  React, Vue 3, Angular, Svelte, Flutter, Kotlin/Android, Swift/SwiftUI, Python, PHP,
  C#/.NET/Blazor, Figma catalog, `manifest.json` for any other stack, and an icon font.
