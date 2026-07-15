// Fuente TTF/WOFF2 de IconKit.
// Pipeline: glifo = contorno EXPANDIDO a relleno (oslllo-svg-fixer traza los trazos)
// → svgicons2svgfont (codepoints deterministas del registro) → svg2ttf → ttf2woff2.
// Uso: node build/font.js            (regenera dist/font/)
// Nota: el trazado de ~3000 glifos tarda varios minutos; es un paso aparte del build normal.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import svgicons2svgfont from 'svgicons2svgfont';
const SVGIcons2SVGFontStream = svgicons2svgfont.SVGIcons2SVGFontStream ?? svgicons2svgfont;
import svg2ttf from 'svg2ttf';
import ttf2woff2 from 'ttf2woff2';
import SVGFixer from 'oslllo-svg-fixer';
import { loadRegistry } from './lib/registry.js';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TMP = path.join(ROOT, '.font-tmp');
const SRC = path.join(TMP, 'src');
const FIXED = path.join(TMP, 'fixed');
const OUT = path.join(ROOT, 'dist', 'font');

const { icons, ids } = loadRegistry();

// 1) Emitir cada contorno como SVG autónomo con trazo negro (el fixer lo expande a relleno).
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(FIXED, { recursive: true });
for (const id of ids) {
  const inner = icons[id].outline;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  fs.writeFileSync(path.join(SRC, id + '.svg'), svg);
}
console.log(`Glifos fuente: ${ids.length} SVG emitidos. Expandiendo trazos (esto tarda)...`);

// 2) Expandir trazo → relleno.
const t0 = Date.now();
await SVGFixer(SRC, FIXED, { showProgressBar: false, throwIfDestinationDoesNotExist: false }).fix();
console.log(`Expansión completada en ${Math.round((Date.now() - t0) / 1000)}s.`);

// 3) SVG font con codepoints deterministas (mismos que manifest.json).
fs.mkdirSync(OUT, { recursive: true });
const fontStream = new SVGIcons2SVGFontStream({
  fontName: config.fontFamily,
  fontHeight: 1000,
  normalize: true,
  log() {},
});
const chunks = [];
const done = new Promise((res, rej) => {
  fontStream.on('data', (d) => chunks.push(d)).on('end', res).on('error', rej);
});
let missing = 0;
for (const id of ids) {
  const p = path.join(FIXED, id + '.svg');
  if (!fs.existsSync(p)) { missing++; continue; }
  const glyph = fs.createReadStream(p);
  glyph.metadata = { name: id, unicode: [String.fromCodePoint(icons[id].codepoint)] };
  fontStream.write(glyph);
}
fontStream.end();
await done;
if (missing) console.warn(`AVISO: ${missing} glifos no generados por el fixer.`);
const svgFont = Buffer.concat(chunks).toString('utf8');

// 4) TTF + WOFF2.
const ttf = Buffer.from(svg2ttf(svgFont, { version: '1.0', description: 'IconKit icon font', url: 'https://iconkit.suils.es' }).buffer);
fs.writeFileSync(path.join(OUT, 'iconkit.ttf'), ttf);
const woff2 = ttf2woff2(ttf);
fs.writeFileSync(path.join(OUT, 'iconkit.woff2'), woff2);

// 5) CSS @font-face + clases .ikf-<id> con los codepoints.
let css = `/* IconKit font — generado. ${ids.length} glifos (forma outline expandida). */
@font-face {
  font-family: "${config.fontFamily}";
  src: url("iconkit.woff2") format("woff2"), url("iconkit.ttf") format("truetype");
  font-weight: normal; font-style: normal; font-display: block;
}
.ikf {
  font-family: "${config.fontFamily}" !important;
  speak: never; font-style: normal; font-weight: normal; font-variant: normal;
  text-transform: none; line-height: 1; display: inline-block;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
`;
for (const id of ids) {
  css += `.ikf-${id}:before{content:"\\${icons[id].codepoint.toString(16)}"}\n`;
}
fs.writeFileSync(path.join(OUT, 'iconkit-font.css'), css);

// 6) Página de prueba.
const sample = ids.filter((_, i) => i % 97 === 0).slice(0, 40);
const cells = sample.map((id) => `<div class="c"><i class="ikf ikf-${id}"></i><span>${id}</span></div>`).join('');
fs.writeFileSync(path.join(OUT, 'test.html'), `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="iconkit-font.css"><style>body{font-family:system-ui;background:#111;color:#eee;padding:20px}.g{display:flex;flex-wrap:wrap;gap:12px}.c{width:110px;text-align:center;background:#1a1a1a;border-radius:8px;padding:10px}.ikf{font-size:32px;color:#7ce0b3}span{display:block;font-size:9px;color:#9ab;margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}</style><h2>IconKit font — muestra</h2><div class="g">${cells}</div>`);

console.log(`Fuente OK → dist/font/iconkit.ttf (${(ttf.length / 1024).toFixed(0)} KB), iconkit.woff2 (${(woff2.length / 1024).toFixed(0)} KB), iconkit-font.css, test.html`);
