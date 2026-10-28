// Audita la geometría real de cada icono: mide getBBox() en un navegador y detecta
// los que se salen del lienzo 24x24 (se recortan al pintarse).
//
//   node build/audit-bbox.js            -> genera preview/audit.html
//   node build/audit-bbox.js --run      -> además lo ejecuta en Chrome headless y escribe preview/audit.json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadRegistry, markupFor, ROOT } from './lib/registry.js';
import { config } from './config.js';

const { icons, ids } = loadRegistry({ strict: false });

// Con stroke-width 2 el trazo se pinta 1 unidad a cada lado del path, así que
// cualquier geometría fuera de [1, 23] pierde parte del trazo contra el borde.
const STROKE_PAD = config.strokeWidth / 2;

const data = ids.map((id) => ({
  id,
  outline: markupFor(icons[id], 'outline'),
  solid: icons[id].solid ? markupFor(icons[id], 'solid') : null,
}));

const html = `<!doctype html><meta charset="utf8"><title>audit</title>
<body><pre id="out">pendiente</pre><div id="stage" style="position:absolute;visibility:hidden"></div>
<script>
const DATA = ${JSON.stringify(data)};
const GRID = ${config.grid}, PAD = ${STROKE_PAD};
const stage = document.getElementById('stage');
const NS = 'http://www.w3.org/2000/svg';
const report = [];

for (const item of DATA) {
  for (const mode of ['outline', 'solid']) {
    const markup = item[mode];
    if (!markup) continue;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + GRID + ' ' + GRID);
    svg.setAttribute('width', GRID);
    svg.setAttribute('height', GRID);
    svg.innerHTML = markup;
    stage.appendChild(svg);

    let bb;
    try { bb = svg.getBBox(); } catch (e) { bb = null; }

    if (!bb || !isFinite(bb.width)) {
      report.push({ id: item.id, mode, error: 'sin bbox' });
    } else {
      const pad = mode === 'outline' ? PAD : 0;   // el solid no lleva trazo
      const x1 = bb.x - pad, y1 = bb.y - pad;
      const x2 = bb.x + bb.width + pad, y2 = bb.y + bb.height + pad;
      const over = {
        izq:  +(0 - x1).toFixed(2),
        arr:  +(0 - y1).toFixed(2),
        der:  +(x2 - GRID).toFixed(2),
        abj:  +(y2 - GRID).toFixed(2),
      };
      const worst = Math.max(over.izq, over.arr, over.der, over.abj);
      report.push({
        id: item.id, mode,
        bbox: [+bb.x.toFixed(2), +bb.y.toFixed(2), +bb.width.toFixed(2), +bb.height.toFixed(2)],
        over, worst: +worst.toFixed(2),
        empty: bb.width < 0.5 || bb.height < 0.5,
      });
    }
    stage.removeChild(svg);
  }
}
document.getElementById('out').textContent = JSON.stringify(report);
</script></body>`;

const outHtml = path.join(ROOT, 'preview', 'audit.html');
fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, html);
console.log('preview/audit.html  (' + ids.length + ' iconos)');

if (!process.argv.includes('--run')) process.exit(0);

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
                'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('No hay Chrome/Edge para medir.'); process.exit(1); }

const dom = execFileSync(CHROME, [
  '--headless', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=60000',
  '--dump-dom', 'file:///' + outHtml.replace(/\\/g, '/'),
], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 200 });

const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
if (!m) { console.error('No se pudo leer el resultado del DOM.'); process.exit(1); }
const report = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));

fs.writeFileSync(path.join(ROOT, 'preview', 'audit.json'), JSON.stringify(report, null, 1));

const clipped = report.filter((r) => r.worst > 0.01).sort((a, b) => b.worst - a.worst);
const empty = report.filter((r) => r.empty);
const errored = report.filter((r) => r.error);

console.log(`\nMedidos ${report.length} renders de ${ids.length} iconos.`);
console.log(`  recortados: ${clipped.length}`);
console.log(`  vacios:     ${empty.length}`);
console.log(`  sin bbox:   ${errored.length}`);
console.log('\nPeores 40 (unidades fuera del lienzo de 24):');
for (const r of clipped.slice(0, 40)) {
  const lados = Object.entries(r.over).filter(([, v]) => v > 0.01).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`  ${r.worst.toFixed(2).padStart(6)}  ${r.id.padEnd(28)} ${r.mode.padEnd(8)} ${lados}`);
}
