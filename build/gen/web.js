// Generadores web: SVG sueltos, sprite, manifest universal, CSS (máscara currentColor),
// web component y demo.html.
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { markupFor, svgFor, ROOT } from '../lib/registry.js';
import { primitivesToPaths } from '../lib/svgpath.js';

const DIST = path.join(ROOT, 'dist');
const w = (o) => fs.writeFileSync(o.file, o.content);
const mk = (d) => fs.mkdirSync(d, { recursive: true });

// SVG con color negro sólido para usar como máscara (la máscara ignora el color;
// luego el elemento lo pinta con background-color:currentColor).
function maskDataUri(icon, mode) {
  const wrap = mode === 'solid'
    ? 'fill="#000" stroke="none"'
    : 'fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${wrap}>${markupFor(icon, mode)}</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/%20/g, ' ').replace(/'/g, '%27');
}

export function genSvg({ icons, ids }) {
  for (const mode of ['outline', 'solid']) {
    const dir = path.join(DIST, 'svg', mode);
    mk(dir);
    for (const id of ids) {
      if (mode === 'solid' && !icons[id].solid) continue;
      w({ file: path.join(dir, `${id}.svg`), content: svgFor(icons[id], mode) + '\n' });
    }
  }
  // Sprite con <symbol> por icono y modo (id: ik-<name> / ik-<name>-solid).
  const symbols = [];
  for (const id of ids) {
    symbols.push(`<symbol id="${config.prefix}-${id}" viewBox="0 0 24 24" ${config.wrapper.outline}>${markupFor(icons[id], 'outline')}</symbol>`);
    if (icons[id].solid) symbols.push(`<symbol id="${config.prefix}-${id}-solid" viewBox="0 0 24 24" ${config.wrapper.solid}>${markupFor(icons[id], 'solid')}</symbol>`);
  }
  mk(path.join(DIST, 'svg'));
  w({ file: path.join(DIST, 'svg', 'sprite.svg'), content: `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>\n` });
}

export function genManifest({ icons, ids, aliasMap }) {
  const out = { name: config.brand, version: config.version, grid: config.grid, count: ids.length, icons: {}, aliases: aliasMap };
  for (const id of ids) {
    const ic = icons[id];
    out.icons[id] = {
      category: ic.category, keywords: ic.keywords, aliases: ic.aliases,
      codepoint: 'U+' + ic.codepoint.toString(16).toUpperCase(),
      outline: ic.outline, solid: ic.solid,
      // Datos de path puro (sin circle/rect/line) para renderizadores no-SVG (C/Rust/motores).
      paths: { outline: primitivesToPaths(ic.outline), solid: ic.solid ? primitivesToPaths(ic.solid) : null },
    };
  }
  mk(DIST);
  w({ file: path.join(DIST, 'manifest.json'), content: JSON.stringify(out, null, 2) });
}

export function genCss({ icons, ids }) {
  const p = config.prefix;
  const base = `.${p}{display:inline-block;width:1em;height:1em;vertical-align:-0.125em;background-color:currentColor;` +
    `-webkit-mask-position:center;mask-position:center;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;` +
    `-webkit-mask-size:contain;mask-size:contain}`;
  const rules = [base];
  for (const id of ids) {
    const uriO = maskDataUri(icons[id], 'outline');
    rules.push(`.${p}-${id}{-webkit-mask-image:url("${uriO}");mask-image:url("${uriO}")}`);
    if (icons[id].solid) {
      const uriS = maskDataUri(icons[id], 'solid');
      rules.push(`.${p}-${id}-solid{-webkit-mask-image:url("${uriS}");mask-image:url("${uriS}")}`);
    }
  }
  mk(path.join(DIST, 'css'));
  w({ file: path.join(DIST, 'css', `${config.brand.toLowerCase()}.css`), content: rules.join('\n') + '\n' });
}

export function genWebComponent({ icons, ids }) {
  // <ik-icon name="home" mode="outline|solid" size="24"></ik-icon>
  const data = {};
  for (const id of ids) data[id] = [icons[id].outline, icons[id].solid || null];
  const js = `// ${config.brand} Web Component — <${config.prefix}-icon name="home"></${config.prefix}-icon>
const ICONS = ${JSON.stringify(data)};
const WRAP = { outline: '${config.wrapper.outline}', solid: '${config.wrapper.solid}' };
class IkIcon extends HTMLElement {
  static get observedAttributes() { return ['name', 'mode', 'size']; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() {
    const name = this.getAttribute('name');
    let mode = this.getAttribute('mode') === 'solid' ? 'solid' : 'outline';
    const size = this.getAttribute('size') || '1em';
    const rec = ICONS[name];
    if (!rec) { this.innerHTML = ''; return; }
    let inner = mode === 'solid' ? (rec[1] || rec[0]) : rec[0];
    const wrap = mode === 'solid' && rec[1] ? WRAP.solid : WRAP.outline;
    this.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 24 24" \${wrap} aria-hidden="true">\${inner}</svg>\`;
  }
}
customElements.define('${config.prefix}-icon', IkIcon);
export { IkIcon };
`;
  mk(path.join(DIST, 'web-component'));
  w({ file: path.join(DIST, 'web-component', `${config.brand.toLowerCase()}.js`), content: js });
}

export function genDemo({ icons, ids }) {
  const p = config.prefix;
  const chips = ids.map((id) => `<div class="c"><i class="${p} ${p}-${id}"></i><i class="${p} ${p}-${id}${icons[id].solid ? '-solid' : ''}"></i><span>${id}</span></div>`).join('');
  const html = `<!doctype html><meta charset="utf8"><title>${config.brand} demo</title>
<link rel="stylesheet" href="../css/${config.brand.toLowerCase()}.css">
<style>body{background:#0e1613;color:#cfe;font:14px system-ui;padding:24px}
h1{color:#3ee6a0}.grid{display:grid;grid-template-columns:repeat(auto-fill,110px);gap:10px}
.c{background:#16211d;border-radius:8px;padding:10px;text-align:center}
.c i{font-size:26px;margin:0 3px;color:#e8f0ec}.c span{display:block;font-size:9px;color:#9fb8ac;margin-top:6px;word-break:break-word}
.big i{font-size:48px}.colors i{font-size:30px}</style>
<h1>${config.brand} — ${ids.length} iconos</h1>
<p>Uso: <code>&lt;i class="${p} ${p}-home"&gt;&lt;/i&gt;</code> (outline) · <code>${p}-home-solid</code> (relleno). Color = <code>currentColor</code>, tamaño = <code>font-size</code>.</p>
<p class="colors">Colores: <i class="${p} ${p}-heart-solid" style="color:#e05b4c"></i><i class="${p} ${p}-star-solid" style="color:#f2c94c"></i><i class="${p} ${p}-check" style="color:#3ee6a0"></i><i class="${p} ${p}-bell" style="color:#2d9cdb"></i></p>
<div class="grid">${chips}</div>`;
  mk(path.join(DIST, 'css'));
  w({ file: path.join(DIST, 'css', 'demo.html'), content: html });
}
