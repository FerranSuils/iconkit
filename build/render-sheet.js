// Hoja de contacto HTML para revisar todos los iconos (outline + solid) de un vistazo.
import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry, markupFor, ROOT } from './lib/registry.js';
import { config } from './config.js';

const { icons, ids } = loadRegistry({ strict: false });

function cell(id, mode) {
  const icon = icons[id];
  const has = mode === 'outline' ? true : !!icon.solid;
  const w = config.wrapper[mode];
  const inner = markupFor(icon, mode);
  const dim = has ? '' : 'opacity:.25';
  return `<figure style="${dim}"><svg viewBox="0 0 24 24" ${w} width="30" height="30">${inner}</svg><figcaption>${id}${mode === 'solid' && !icon.solid ? ' ·(=outline)' : ''}</figcaption></figure>`;
}

const cats = {};
for (const id of ids) (cats[icons[id].category] ||= []).push(id);

const sections = Object.entries(cats).map(([cat, list]) => `
  <h2>${cat} <small>(${list.length})</small></h2>
  <h3>Outline</h3><div class="grid">${list.map((id) => cell(id, 'outline')).join('')}</div>
  <h3>Solid</h3><div class="grid">${list.map((id) => cell(id, 'solid')).join('')}</div>
`).join('');

const html = `<!doctype html><meta charset="utf8"><title>${config.brand} — hoja de contacto</title>
<style>
  body{margin:0;background:#0e1613;color:#e8f0ec;font:13px system-ui;padding:20px}
  h1{color:#3ee6a0} h2{color:#e0a83f;border-bottom:1px solid #2a3a33;padding-bottom:4px;margin-top:28px}
  h3{color:#9fb8ac;font-weight:600;margin:12px 0 6px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,84px);gap:8px}
  figure{margin:0;padding:8px 2px;text-align:center;background:#16211d;border-radius:8px;color:#cfe}
  figcaption{font-size:9px;color:#9fb8ac;margin-top:4px;word-break:break-word}
  svg{color:#eef}
</style>
<h1>${config.brand} — ${ids.length} iconos</h1>${sections}`;

const out = path.join(ROOT, 'preview');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'contact-sheet.html'), html);
console.log('Hoja de contacto:', path.join(out, 'contact-sheet.html'));
