// Página de inicio del CDN (dist/index.html): catálogo con buscador + guía de
// import por tecnología. Usa el CSS de máscara ya generado.
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { ROOT } from '../lib/registry.js';
import { identifiersFor } from './figma.js';

const DIST = path.join(ROOT, 'dist');

export function genLanding({ icons, ids }) {
  const p = config.prefix;
  const cdn = config.cdnBase;
  // Datos para el buscador (id + keywords + aliases + hasSolid).
  const index = ids.map((id) => ({
    n: id,
    k: (icons[id].keywords || []).concat(icons[id].aliases || []).join(' '),
    s: icons[id].solid ? 1 : 0,
  }));

  const cards = ids.map((id) =>
    `<button class="c" data-n="${id}" data-k="${(icons[id].keywords || []).join(' ')}" title="${id}">` +
    `<i class="${p} ${p}-${id}"></i><span>${id}</span></button>`
  ).join('');

  const ex = identifiersFor('home');
  const techRows = [
    ['HTML / CSS', `&lt;link rel="stylesheet" href="${cdn}/css/${config.brand.toLowerCase()}.css"&gt;\n${ex.css.replace(/</g, '&lt;').replace(/>/g, '&gt;')}\n&lt;i class="${p} ${p}-home-solid"&gt;&lt;/i&gt;`],
    ['Web Component', `&lt;script type="module" src="${cdn}/web-component/${config.brand.toLowerCase()}.js"&gt;&lt;/script&gt;\n${ex.webComponent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`],
    ['React', `import { Home } from '${cdn}/react/index.js';\n&lt;Home color="#e05b4c" /&gt;`],
    ['Vue 3', `import { Home } from '${cdn}/vue/index.js';\n&lt;Home :size="24" /&gt;`],
    ['Angular', `// copia ${cdn}/angular/ · &lt;${p}-icon name="home" mode="solid"&gt;&lt;/${p}-icon&gt;`],
    ['Svelte', `import Icon from '${cdn}/svelte/Icon.svelte';\n&lt;Icon name="home" mode="solid" /&gt;`],
    ['Flutter', `# pubspec: iconkit (git/path a dist/flutter) — usa flutter_svg\nIconKitIcon(IconKit.home, mode: IconKitMode.solid, color: Colors.red)`],
    ['Kotlin / Android', `# copia ${cdn}/kotlin/res/drawable/*.xml\nIcon(painterResource(R.drawable.${p}_home), null)`],
    ['SwiftUI', `# añade ${cdn}/swift/IconKit.xcassets + IconKit.swift\nIconKitIcon(.home).foregroundColor(.red)`],
    ['Python', `# pip: usa ${cdn}/python/ · import iconkit\niconkit.svg("home", mode="solid", color="#e05b4c")`],
    ['PHP', `require '${cdn.replace('https://', '')}/php/IconKit.php';\necho IconKit::svg('home', ['mode'=&gt;'solid']);`],
    ['C# / .NET / Blazor', `// copia ${cdn}/dotnet/\nIconKit.Svg("home", mode:"solid");  // Blazor: &lt;IkIcon Name="home" /&gt;`],
    ['C / C++ / Rust / Go / cualquiera', `// descarga y parsea ${cdn}/manifest.json\n// trae outline/solid (SVG) y paths (datos de path puro) por icono`],
  ].map(([t, code]) => `<div class="tech"><h4>${t}</h4><pre>${code}</pre></div>`).join('');

  const html = `<!doctype html><html lang="es"><head><meta charset="utf8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${config.brand} — ${ids.length} iconos universales</title>
<meta name="description" content="${config.brand}: ${ids.length} iconos vectoriales para web, Flutter, Kotlin, Swift, React, Vue, Angular, Python, PHP, .NET y más. currentColor, cualquier tamaño, outline/solid.">
<link rel="stylesheet" href="css/${config.brand.toLowerCase()}.css?c=${config.version}">
<style>
:root{--bg:#0a1512;--sf:#11211b;--cd:#16211d;--jade:#3ee6a0;--gold:#e0a83f;--tx:#e8f0ec;--dim:#9fb8ac}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.5 system-ui,sans-serif}
header{padding:40px 24px 20px;text-align:center;background:radial-gradient(circle at top,#11211b,#0a1512)}
h1{margin:0;font-size:34px;color:var(--jade)}h1 i{font-size:34px;vertical-align:-4px}
.sub{color:var(--dim);margin:8px 0 0}.links{margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.links a{color:#0a1512;background:var(--gold);padding:8px 16px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px}
.links a.ghost{background:transparent;color:var(--jade);border:1px solid var(--jade)}
main{max-width:1080px;margin:0 auto;padding:20px}
.search{width:100%;padding:14px 16px;font-size:16px;background:var(--cd);border:1px solid #2a3a33;border-radius:12px;color:var(--tx);margin:10px 0 6px}
.count{color:var(--dim);font-size:13px;margin-bottom:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.c{background:var(--cd);border:1px solid transparent;border-radius:12px;padding:14px 6px;color:var(--tx);cursor:pointer;text-align:center;transition:.12s;content-visibility:auto;contain-intrinsic-size:92px 78px}
.c:hover{border-color:var(--jade);background:#1b2c25}.c i{font-size:26px}.c span{display:block;font-size:9px;color:var(--dim);margin-top:8px;word-break:break-word}
h2{color:var(--gold);margin:36px 0 6px;border-bottom:1px solid #2a3a33;padding-bottom:6px}
.fair{color:var(--dim);font-size:13px}
.tech{background:var(--cd);border-radius:12px;padding:14px 16px;margin:10px 0}
.tech h4{margin:0 0 8px;color:var(--jade)}pre{margin:0;white-space:pre-wrap;word-break:break-word;font:12px/1.5 ui-monospace,monospace;color:#cfe}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--jade);color:#0a1512;padding:10px 18px;border-radius:10px;font-weight:700;opacity:0;transition:.2s;pointer-events:none}
.toast.show{opacity:1}
footer{text-align:center;color:var(--dim);padding:30px;font-size:13px}
</style></head><body>
<header>
  <h1><i class="${p} ${p}-mahjong-tile-solid" style="color:var(--jade)"></i> ${config.brand}</h1>
  <p class="sub">${ids.length} iconos universales · <b>currentColor</b> · cualquier tamaño · <b>outline</b> + <b>solid</b> · una fuente, todas las tecnologías</p>
  <div class="links">
    <a href="${config.figmaUrl}" target="_blank">Ver en Figma</a>
    <a class="ghost" href="manifest.json">manifest.json</a>
    <a class="ghost" href="css/demo.html">demo CSS</a>
    <a class="ghost" href="README.md">guía completa</a>
  </div>
</header>
<main>
  <input class="search" id="q" placeholder="Buscar icono (nombre o palabra clave)…" autofocus>
  <div class="count" id="count"></div>
  <div class="grid" id="grid">${cards}</div>

  <h2>Cómo importarlo en tu proyecto</h2>
  <p class="fair">Base del CDN: <code>${cdn}</code> · haz clic en cualquier icono para copiar su nombre.</p>
  ${techRows}
</main>
<footer>${config.brand} v${config.version} · ${ids.length} iconos · MIT-friendly · alojado en ${cdn}</footer>
<div class="toast" id="toast"></div>
<script>
const IDX=${JSON.stringify(index)};
const grid=document.getElementById('grid'),q=document.getElementById('q'),count=document.getElementById('count'),toast=document.getElementById('toast');
const cards=[...grid.children];
function render(){const t=q.value.trim().toLowerCase();let n=0;
  for(const c of cards){const id=c.dataset.n,k=c.dataset.k;const hit=!t||id.includes(t)||k.includes(t);c.style.display=hit?'':'none';if(hit)n++;}
  count.textContent=n+' / '+IDX.length+' iconos';}
q.addEventListener('input',render);render();
grid.addEventListener('click',e=>{const b=e.target.closest('.c');if(!b)return;
  navigator.clipboard&&navigator.clipboard.writeText(b.dataset.n);
  toast.textContent='Copiado: '+b.dataset.n;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1200);});
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
}
