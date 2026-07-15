// Genera un catálogo SVG (rejilla etiquetada, cada icono como grupo nombrado por su id →
// al importar a Figma cada capa lleva el nombre del icono) y un JSON de identificadores
// por tecnología para el panel de Figma.
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { pascal, camel, dartName, snake } from '../lib/naming.js';
import { markupFor, ROOT } from '../lib/registry.js';

const DIST = path.join(ROOT, 'dist');
const w = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };

export function identifiersFor(id) {
  const p = config.prefix;
  return {
    id,
    css: `<i class="${p} ${p}-${id}"></i>`,
    webComponent: `<${p}-icon name="${id}"></${p}-icon>`,
    react: `<${pascal(id)} />`,
    vue: `<${pascal(id)} />`,
    angular: `<${p}-icon name="${id}" />`,
    svelte: `<${pascal(id)} />`,
    flutter: `IconKitIcon(IconKit.${dartName(id)})`,
    kotlin: `R.drawable.${p}_${snake(id)}`,
    swift: `IconKitIcon(.${dartName(id)})`,
    python: `iconkit.svg("${id}")`,
    php: `IconKit::svg('${id}')`,
    dotnet: `IconKit.Svg("${id}")`,
    camel: camel(id),
    pascal: pascal(id),
  };
}

export function genFigma({ icons, ids }) {
  // 1) identifiers.json
  const idents = {};
  for (const id of ids) idents[id] = { ...identifiersFor(id), category: icons[id].category, hasSolid: !!icons[id].solid };
  w(path.join(DIST, 'figma', 'identifiers.json'), JSON.stringify(idents, null, 2));

  // 2) catalog.svg — rejilla de iconos outline, cada uno como <g id> con etiqueta.
  const cols = 10, cell = 96, pad = 16, icon = 40, gridTop = 60;
  const rows = Math.ceil(ids.length / cols);
  const width = cols * cell + pad * 2;
  const height = gridTop + rows * cell + pad;
  const parts = [];
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#0e1613"/>`);
  parts.push(`<text x="${pad}" y="38" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="800" fill="#3ee6a0">${config.brand} — ${ids.length} iconos · currentColor · outline/solid</text>`);
  ids.forEach((id, i) => {
    const cx = pad + (i % cols) * cell + cell / 2;
    const cyTop = gridTop + Math.floor(i / cols) * cell;
    const ix = cx - icon / 2, iy = cyTop + 10;
    // grupo nombrado = id (Figma usa el id del <g> como nombre de capa)
    parts.push(`<g id="${id}" transform="translate(${ix} ${iy}) scale(${icon / 24})">` +
      `<g fill="none" stroke="#e8f0ec" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${markupFor(icons[id], 'outline')}</g></g>`);
    parts.push(`<text x="${cx}" y="${cyTop + 74}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="9" fill="#9fb8ac">${id}</text>`);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
  w(path.join(DIST, 'figma', 'catalog.svg'), svg);
}
