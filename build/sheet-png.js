// Renderiza iconos a PNG (hoja de contacto) para revisarlos a ojo.
//
//   node build/sheet-png.js salida.png id1,id2,id3
//   node build/sheet-png.js salida.png --all --page 0 --per 120
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadRegistry, markupFor, ROOT } from './lib/registry.js';
import { config } from './config.js';

const argv = process.argv.slice(2);
const out = path.resolve(argv[0] || path.join(ROOT, 'preview', 'sheet.png'));
const arg = (k, d) => { const i = argv.indexOf(k); return i === -1 ? d : argv[i + 1]; };

const { icons, ids: allIds } = loadRegistry({ strict: false });

let ids;
if (argv.includes('--all')) {
  const per = +arg('--per', 120), page = +arg('--page', 0);
  ids = allIds.slice(page * per, (page + 1) * per);
} else {
  ids = (argv[1] || '').split(',').filter(Boolean);
}
if (!ids.length) { console.error('Sin iconos que renderizar.'); process.exit(1); }

const cols = +arg('--cols', 10);
const cell = +arg('--cell', 96);

// Fondo claro y trazo oscuro: los defectos de trazo se ven mejor que en oscuro.
const figs = ids.map((id) => {
  const ic = icons[id];
  if (!ic) return `<figure><div class="miss">?</div><figcaption>${id}</figcaption></figure>`;
  const box = (markup, wrap, label) =>
    `<div class="box"><svg viewBox="0 0 ${config.grid} ${config.grid}" width="${cell}" height="${cell}" ${wrap}>${markup}</svg><b>${label}</b></div>`;
  const o = box(markupFor(ic, 'outline'), config.wrapper.outline, 'o');
  const s = ic.solid ? box(ic.solid, config.wrapper.solid, 's') : '';
  return `<figure>${o}${s}<figcaption>${id}</figcaption></figure>`;
}).join('');

const html = `<!doctype html><meta charset="utf8"><style>
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#111;font:12px system-ui;padding:16px}
.grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px}
figure{margin:0;border:1px solid #d8d8d8;border-radius:8px;padding:8px;text-align:center;display:flex;flex-direction:column;align-items:center}
.box{position:relative}
.box b{position:absolute;top:0;left:0;font-size:9px;color:#bbb;font-weight:400}
figure svg{display:block}
/* Marco al tamaño exacto del lienzo: lo que se salga, se ve que se sale. */
.box svg{outline:1px dashed #e3a0a0;outline-offset:0}
figcaption{margin-top:6px;font-size:10px;color:#555;word-break:break-all;line-height:1.25}
.miss{width:${cell}px;height:${cell}px;display:flex;align-items:center;justify-content:center;color:#c00;font-size:28px}
</style><div class="grid">${figs}</div>`;

const tmp = path.join(ROOT, 'preview', '_sheet.html');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, html);

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
                'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('No hay Chrome/Edge.'); process.exit(1); }

// El alto debe salir de las filas reales: con una ventana fija la captura corta la hoja.
const rows = Math.ceil(ids.length / cols);
const hasSolid = ids.some((id) => icons[id]?.solid);
const width = cols * (cell + 26) + 40;
const height = rows * (cell * (hasSolid ? 2 : 1) + 60) + 60;

execFileSync(CHROME, [
  '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--force-device-scale-factor=1', `--window-size=${width},${height}`,
  '--screenshot=' + out, '--virtual-time-budget=15000',
  'file:///' + tmp.replace(/\\/g, '/'),
], { stdio: 'pipe' });

console.log(`${out}  (${ids.length} iconos)`);
