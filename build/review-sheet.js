// Hoja de revisión ampliada de un subconjunto (iconos complejos/dudosos) a 64px.
import fs from 'node:fs';
import path from 'node:path';
import { loadRegistry, markupFor, ROOT } from './lib/registry.js';
import { config } from './config.js';

const PICK = (process.argv[2] || '').split(',').filter(Boolean);
const SUSPECTS = PICK.length ? PICK : [
  'smile', 'gift', 'users', 'bell-off', 'phone-off', 'shuffle', 'mic-off', 'chart-pie', 'unlink', 'magnet',
  'settings', 'trophy', 'gem', 'crown', 'mahjong-tile', 'camera', 'dice', 'puzzle', 'gamepad', 'compass',
  'flame', 'zap', 'wifi', 'bug', 'git-branch', 'store', 'wallet', 'credit-card', 'shield-check', 'badge-check',
  'sparkles', 'loader', 'globe', 'database', 'hourglass', 'headphones', 'at-sign', 'send', 'inbox', 'moon',
];
const { icons } = loadRegistry({ strict: false });

function cell(id) {
  const ic = icons[id];
  if (!ic) return `<figure><div style="color:#e05b4c">?${id}</div></figure>`;
  const o = `<svg viewBox="0 0 24 24" ${config.wrapper.outline} width="60" height="60">${markupFor(ic, 'outline')}</svg>`;
  const s = ic.solid ? `<svg viewBox="0 0 24 24" ${config.wrapper.solid} width="60" height="60">${ic.solid}</svg>` : `<span style="opacity:.2">—</span>`;
  return `<figure><div class="pair">${o}${s}</div><figcaption>${id}</figcaption></figure>`;
}
const html = `<!doctype html><meta charset="utf8"><style>
body{margin:0;background:#0e1613;color:#cfe;font:13px system-ui;padding:20px}
h1{color:#3ee6a0}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
figure{margin:0;background:#16211d;border-radius:10px;padding:12px;text-align:center}
.pair{display:flex;justify-content:center;gap:14px;color:#eef}
figcaption{margin-top:8px;font-size:12px;color:#9fb8ac}
</style><h1>Revisión — outline / solid @60px</h1><div class="grid">${SUSPECTS.map(cell).join('')}</div>`;
fs.writeFileSync(path.join(ROOT, 'preview', 'review.html'), html);
console.log('review.html');
