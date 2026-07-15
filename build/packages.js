// Ensambla los paquetes publicables (packages/) a partir de dist/.
// Repetible: ejecutar tras cada `node build/index.js` (y `node build/font.js` si procede):
//   node build/packages.js
// Salidas:
//   packages/npm/     → npm   (npm pack / npm publish)
//   packages/dart/    → pub.dev (dart pub publish)
//   packages/python/  → PyPI  (wheel construido aquí mismo, sin Python: packages/python/dist/*.whl)
//   packages/dotnet/  → NuGet (dotnet pack -c Release)
// Solo LEE dist/, LICENSE y CHANGELOG.md; no toca src/ ni dist/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'packages');

const VERSION = '1.0.1';
const AUTHOR = 'Ferran Suils Mora';
const EMAIL = 'ferran@suils.es';
const HOMEPAGE = 'https://suils.es';
const DOCS = 'https://iconkit.suils.es';
const DESC = 'IconKit — 3000+ monochrome vector icons (outline & solid), single source of truth, currentColor, for every stack.';

// ---------- prerequisitos ----------
for (const f of ['LICENSE', 'CHANGELOG.md']) {
  if (!fs.existsSync(path.join(ROOT, f))) throw new Error(`Falta ${f} en la raíz del repo.`);
}
if (!fs.existsSync(path.join(DIST, 'manifest.json'))) throw new Error('Falta dist/manifest.json — ejecuta antes node build/index.js');
const LICENSE = fs.readFileSync(path.join(ROOT, 'LICENSE'), 'utf8');
const CHANGELOG = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
const COUNT = manifest.count ?? Object.keys(manifest.icons).length;
const SOLID = Object.values(manifest.icons).filter((i) => i.solid).length;
const CATS = new Set(Object.values(manifest.icons).map((i) => i.category)).size;
const FONT_DIR = path.join(DIST, 'font');
const hasFont = fs.existsSync(path.join(FONT_DIR, 'iconkit.woff2')) && fs.existsSync(path.join(FONT_DIR, 'iconkit-font.css'));

// ---------- utilidades ----------
const w = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const fresh = (dir) => { fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); };
const cp = (src, dst, filter) => fs.cpSync(src, dst, { recursive: true, filter });
// Dos ids empiezan por dígito (3d-glasses, 3d-printer): identificador inválido en JS/TS/C#.
// Convención: prefijo "I" en contextos Pascal (espejo del prefijo "i" que usa el generador Dart).
const fixIdents = (s) => s.replace(/\b3d(Glasses|Printer)\b/g, 'I3d$1');
const cpFixed = (src, dst) => w(dst, fixIdents(fs.readFileSync(src, 'utf8')));

// Comprobación de sintaxis ESM: importa el módulo desde una data: URL con stubs de entorno.
async function esmCheck(label, file, stubs = '') {
  let src = fs.readFileSync(file, 'utf8')
    .replace(/^import\s*\{[^}]*\}\s*from\s*'react';?/m, "const h = () => null;")
    .replace(/^import\s*\{[^}]*\}\s*from\s*'vue';?/m, "const h = () => null, defineComponent = (o) => o;");
  src = stubs + src;
  await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
  console.log(`    sintaxis OK: ${label}`);
}

// ---------- zip mínimo (STORE/DEFLATE) para el wheel ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const DOS_TIME = (12 << 11) | (0 << 5) | 0;                       // 12:00:00
const DOS_DATE = ((2026 - 1980) << 9) | (7 << 5) | 15;            // 2026-07-15 (fecha del release)

function zipCreate(entries) { // entries: [{name, data:Buffer}] — nombres SIEMPRE con '/'
  const local = []; const central = []; let offset = 0;
  for (const e of entries) {
    if (e.name.includes('\\')) throw new Error(`Entrada zip con backslash: ${e.name}`);
    const raw = e.data; const crc = crc32(raw);
    let method = 8; let comp = zlib.deflateRawSync(raw, { level: 9 });
    if (comp.length >= raw.length) { method = 0; comp = raw; }
    const name = Buffer.from(e.name, 'utf8');
    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0); lfh.writeUInt16LE(20, 4); lfh.writeUInt16LE(0x0800, 6);
    lfh.writeUInt16LE(method, 8); lfh.writeUInt16LE(DOS_TIME, 10); lfh.writeUInt16LE(DOS_DATE, 12);
    lfh.writeUInt32LE(crc, 14); lfh.writeUInt32LE(comp.length, 18); lfh.writeUInt32LE(raw.length, 22);
    lfh.writeUInt16LE(name.length, 26); lfh.writeUInt16LE(0, 28);
    local.push(lfh, name, comp);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(method, 10); cd.writeUInt16LE(DOS_TIME, 12); cd.writeUInt16LE(DOS_DATE, 14);
    cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(raw.length, 24);
    cd.writeUInt16LE(name.length, 28); cd.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([cd, name]));
    offset += 30 + name.length + comp.length;
  }
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cdBuf, eocd]);
}

function zipRead(buf) { // lector para autoverificación
  let p = buf.length - 22;
  while (p >= 0 && buf.readUInt32LE(p) !== 0x06054b50) p--;
  if (p < 0) throw new Error('EOCD no encontrado');
  const count = buf.readUInt16LE(p + 10); let cd = buf.readUInt32LE(p + 16);
  const out = [];
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(cd) !== 0x02014b50) throw new Error('firma central inválida');
    const method = buf.readUInt16LE(cd + 10);
    const compSize = buf.readUInt32LE(cd + 20); const size = buf.readUInt32LE(cd + 24);
    const nameLen = buf.readUInt16LE(cd + 28); const extraLen = buf.readUInt16LE(cd + 30); const cmtLen = buf.readUInt16LE(cd + 32);
    const lho = buf.readUInt32LE(cd + 42);
    const name = buf.toString('utf8', cd + 46, cd + 46 + nameLen);
    const lNameLen = buf.readUInt16LE(lho + 26); const lExtraLen = buf.readUInt16LE(lho + 28);
    const start = lho + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);
    const data = method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw);
    if (data.length !== size) throw new Error(`tamaño incoherente en ${name}`);
    out.push({ name, data });
    cd += 46 + nameLen + extraLen + cmtLen;
  }
  return out;
}

const sha256b64url = (buf) => crypto.createHash('sha256').update(buf).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ============================================================ npm
function buildNpm() {
  const dir = path.join(OUT, 'npm');
  fresh(dir);
  cp(path.join(DIST, 'css', 'iconkit.css'), path.join(dir, 'css', 'iconkit.css'));
  cp(path.join(DIST, 'svg'), path.join(dir, 'svg'));
  cp(path.join(DIST, 'web-component'), path.join(dir, 'web-component'));
  cp(path.join(DIST, 'manifest.json'), path.join(dir, 'manifest.json'));
  cpFixed(path.join(DIST, 'react', 'index.js'), path.join(dir, 'react', 'index.js'));
  cpFixed(path.join(DIST, 'react', 'index.d.ts'), path.join(dir, 'react', 'index.d.ts'));
  cpFixed(path.join(DIST, 'vue', 'index.js'), path.join(dir, 'vue', 'index.js'));
  cp(path.join(DIST, 'angular'), path.join(dir, 'angular'));
  cp(path.join(DIST, 'svelte'), path.join(dir, 'svelte'));
  if (hasFont) cp(FONT_DIR, path.join(dir, 'font'), (src) => !src.endsWith('test.html'));

  const exportsMap = {
    '.': './web-component/iconkit.js',
    './web-component': './web-component/iconkit.js',
    './react': { types: './react/index.d.ts', default: './react/index.js' },
    './vue': './vue/index.js',
    './svelte': { svelte: './svelte/Icon.svelte', default: './svelte/Icon.svelte' },
    './svelte/icons': './svelte/icons.js',
    './angular/*': './angular/*',
    './css': './css/iconkit.css',
    './css/*': './css/*',
    './svg/*': './svg/*',
    './manifest.json': './manifest.json',
    './package.json': './package.json',
  };
  if (hasFont) exportsMap['./font/*'] = './font/*';

  const pkg = {
    // npm bloquea el nombre suelto "iconkit" (typosquatting vs "icon-kit"),
    // así que el paquete npm va con scope de la cuenta del autor.
    name: '@ferran_suils/iconkit',
    version: VERSION,
    description: DESC,
    author: `${AUTHOR} <${EMAIL}>`,
    license: 'MIT',
    homepage: HOMEPAGE,
    keywords: ['icons', 'icon', 'svg', 'icon-font', 'outline', 'solid', 'react', 'vue', 'angular', 'svelte',
      'web-components', 'flutter', 'currentcolor', 'vector', 'sprite', 'mask', 'ui', 'design-system'],
    type: 'module',
    // Nota: array en vez de `false` para que `import 'iconkit/css'` y el web component
    // no sean eliminados por tree-shaking; los módulos JS de datos siguen siendo tree-shakeables.
    sideEffects: ['**/*.css', './web-component/iconkit.js'],
    main: './web-component/iconkit.js',
    unpkg: './web-component/iconkit.js',
    jsdelivr: './web-component/iconkit.js',
    svelte: './svelte/Icon.svelte',
    exports: exportsMap,
    publishConfig: { access: 'public' },
    peerDependencies: { react: '>=17', vue: '>=3.2', svelte: '>=3.55' },
    peerDependenciesMeta: { react: { optional: true }, vue: { optional: true }, svelte: { optional: true } },
  };
  w(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  w(path.join(dir, 'LICENSE'), LICENSE);

  const fontSection = hasFont ? `
## Icon font

An icon font (outline shapes, deterministic codepoints) is included under \`font/\`:

\`\`\`html
<link rel="stylesheet" href="node_modules/iconkit/font/iconkit-font.css">
<i class="ikf ikf-home"></i>
\`\`\`

\`font/iconkit.woff2\` and \`font/iconkit.ttf\` are referenced by that stylesheet; size with
\`font-size\`, color with \`color\`. Codepoints match \`manifest.json\` (\`icons[name].codepoint\`).
` : '';

  w(path.join(dir, 'README.md'), `# IconKit

${DESC}

- **${COUNT} icons** (${SOLID} with a solid variant) across ${CATS} categories, 24×24 grid, stroke width 2.
- Everything inherits \`currentColor\` and scales to any size.
- One source of truth — the same shapes ship for CSS, web components, React, Vue, Angular,
  Svelte, raw SVG${hasFont ? ', an icon font' : ''} and a machine-readable \`manifest.json\`.
- Browse and search all icons: **[iconkit.suils.es](${DOCS})**

## Install

\`\`\`sh
npm install iconkit
\`\`\`

Or straight from the CDN: \`${DOCS}\` (same layout as this package).

## CSS (mask, zero JS)

\`\`\`html
<link rel="stylesheet" href="node_modules/iconkit/css/iconkit.css">
<i class="ik ik-home"></i>                <!-- outline -->
<i class="ik ik-home-solid"></i>          <!-- solid -->
<i class="ik ik-heart-solid" style="color:#e05b4c;font-size:32px"></i>
\`\`\`

Icons are \`mask-image\` based: they are 1em squares that follow \`color\` and \`font-size\`.
With a bundler, \`import 'iconkit/css';\` works too.

## Web component

\`\`\`html
<script type="module" src="node_modules/iconkit/web-component/iconkit.js"></script>
<ik-icon name="home"></ik-icon>
<ik-icon name="heart" mode="solid" size="32" style="color:#e05b4c"></ik-icon>
\`\`\`

(Also available from the CDN: \`<script type="module" src="${DOCS}/web-component/iconkit.js"></script>\`.)

## React

\`\`\`jsx
import { Home, Heart, Icon } from 'iconkit/react';

<Home size={24} />
<Heart mode="solid" color="#e05b4c" />
<Icon name="arrow-right" size={20} />
\`\`\`

TypeScript definitions included. Named exports are tree-shakeable wrappers over \`Icon\`.

## Vue 3

\`\`\`js
import { Home, Icon } from 'iconkit/vue';
\`\`\`

\`\`\`html
<Home :size="24" />
<Icon name="heart" mode="solid" color="#e05b4c" />
\`\`\`

## Svelte

\`\`\`svelte
<script>
  import Icon from 'iconkit/svelte';
</script>
<Icon name="home" mode="solid" size={24} color="#e05b4c" />
\`\`\`

## Angular (standalone)

The component ships as TypeScript source. Import it from the package (or copy
\`angular/ik-icon.component.ts\` + \`angular/iconkit.data.ts\` into your app):

\`\`\`ts
import { IkIconComponent } from 'iconkit/angular/ik-icon.component';
// template: <ik-icon name="home" mode="solid" size="24"></ik-icon>
\`\`\`

## Raw SVG & sprite

- Single files: \`iconkit/svg/outline/home.svg\`, \`iconkit/svg/solid/home.svg\`
- Sprite: \`iconkit/svg/sprite.svg\`

\`\`\`html
<svg width="24" height="24"><use href="svg/sprite.svg#ik-home"/></svg>
<svg width="24" height="24"><use href="svg/sprite.svg#ik-home-solid"/></svg>
\`\`\`
${fontSection}
## Any other stack

\`iconkit/manifest.json\` describes every icon: \`outline\`/\`solid\` SVG markup, pure path data
(\`paths\`), category, keywords, aliases and codepoint. Render it however you like — color and
size are always yours.

> Note: the two icons whose name starts with a digit (\`3d-glasses\`, \`3d-printer\`) are exported
> to code as \`I3dGlasses\` / \`I3dPrinter\`.

## License

[MIT](./LICENSE) © ${AUTHOR} · [suils.es](${HOMEPAGE})
`);
  console.log(`  npm → ${path.relative(ROOT, dir)}${hasFont ? ' (con font/)' : ' (sin font/ — aún no generada)'}`);
  return dir;
}

// ============================================================ pub.dev (Dart/Flutter)
function buildDart() {
  const dir = path.join(OUT, 'dart');
  fresh(dir);
  cp(path.join(DIST, 'flutter', 'lib'), path.join(dir, 'lib'));

  // description pub.dev: 60–180 caracteres, en inglés.
  const dartDesc = 'IconKit: 3000+ monochrome vector icons (outline and solid) as Flutter widgets. One source of truth, tint with any color, scale to any size.';
  w(path.join(dir, 'pubspec.yaml'), `name: iconkit
description: >-
  ${dartDesc}
version: ${VERSION}
homepage: ${HOMEPAGE}
documentation: ${DOCS}
topics:
  - icons
  - svg
  - ui
  - widgets
environment:
  sdk: ^3.0.0
  flutter: ">=3.10.0"
dependencies:
  flutter:
    sdk: flutter
  flutter_svg: ^2.0.0
`);
  w(path.join(dir, 'LICENSE'), LICENSE);
  w(path.join(dir, 'CHANGELOG.md'), CHANGELOG);
  w(path.join(dir, '.pubignore'), `example/pubspec.lock
example/.dart_tool/
example/build/
`);
  w(path.join(dir, 'README.md'), `# IconKit for Flutter

${DESC}

- **${COUNT} icons** (${SOLID} with a solid variant) across ${CATS} categories, 24×24 grid.
- Tint with any \`Color\`, scale to any size — rendered with \`flutter_svg\`.
- Browse and search all icons: **[iconkit.suils.es](${DOCS})**

## Install

\`\`\`sh
flutter pub add iconkit
\`\`\`

## Usage

\`\`\`dart
import 'package:iconkit/iconkit.dart';

IconKitIcon(IconKit.home, size: 24)
IconKitIcon(IconKit.heart, mode: IconKitMode.solid, color: Colors.red)
IconKitIcon('rocket-launch', size: 40) // names are plain strings too
\`\`\`

- \`IconKit.<name>\` — the full catalog as constants (e.g. \`IconKit.arrowRight\` → \`'arrow-right'\`).
- \`IconKitIcon\` inherits the ambient \`IconTheme\` color when \`color\` is omitted.
- \`IconKit.svg(name, mode: …, color: …)\` returns the raw SVG string for advanced uses.

Icons whose name starts with a digit are prefixed with \`i\`: \`IconKit.i3dGlasses\` → \`'3d-glasses'\`.

## License

MIT © ${AUTHOR} · [suils.es](${HOMEPAGE})
`);

  // example/ mínimo, usable.
  w(path.join(dir, 'example', 'pubspec.yaml'), `name: iconkit_example
description: Minimal example app for the iconkit package.
publish_to: none
environment:
  sdk: ^3.0.0
dependencies:
  flutter:
    sdk: flutter
  iconkit:
    path: ..
`);
  w(path.join(dir, 'example', 'lib', 'main.dart'), `import 'package:flutter/material.dart';
import 'package:iconkit/iconkit.dart';

void main() => runApp(const IconKitExampleApp());

class IconKitExampleApp extends StatelessWidget {
  const IconKitExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IconKit example',
      theme: ThemeData(colorSchemeSeed: Colors.teal, useMaterial3: true),
      home: Scaffold(
        appBar: AppBar(title: const Text('IconKit')),
        body: const Center(
          child: Wrap(
            spacing: 24,
            runSpacing: 24,
            children: [
              IconKitIcon(IconKit.home, size: 40),
              IconKitIcon(IconKit.heart, size: 40, mode: IconKitMode.solid, color: Colors.red),
              IconKitIcon(IconKit.star, size: 40, mode: IconKitMode.solid, color: Colors.amber),
              IconKitIcon(IconKit.camera, size: 40, color: Colors.teal),
              IconKitIcon(IconKit.bell, size: 40, color: Colors.indigo),
              IconKitIcon(IconKit.search, size: 40),
            ],
          ),
        ),
      ),
    );
  }
}
`);
  console.log(`  dart → ${path.relative(ROOT, dir)}`);
  return dir;
}

// ============================================================ PyPI (wheel construido sin Python)
function buildPython() {
  const dir = path.join(OUT, 'python');
  fresh(dir);
  const pkgDir = path.join(dir, 'src', 'iconkit');
  cp(path.join(DIST, 'python', 'iconkit', '__init__.py'), path.join(pkgDir, '__init__.py'));
  cp(path.join(DIST, 'python', 'iconkit', '_data.py'), path.join(pkgDir, '_data.py'));
  cp(path.join(DIST, 'manifest.json'), path.join(pkgDir, 'manifest.json'));
  // Completa la API pública: __version__ + acceso al manifest embebido.
  fs.appendFileSync(path.join(pkgDir, '__init__.py'), `
__version__ = "${VERSION}"

def manifest():
    """Return the full icon manifest (icons, categories, keywords, aliases) as a dict."""
    import json, os
    with open(os.path.join(os.path.dirname(__file__), "manifest.json"), encoding="utf-8") as f:
        return json.load(f)
`);

  const readme = `# IconKit for Python

${DESC}

- **${COUNT} icons** (${SOLID} with a solid variant) across ${CATS} categories, 24×24 grid.
- \`iconkit.svg()\` returns a self-contained \`<svg>\` string — drop it into any template.
- Browse and search all icons: **[iconkit.suils.es](${DOCS})**

## Install

\`\`\`sh
pip install iconkit
\`\`\`

## Usage

\`\`\`python
import iconkit

iconkit.svg("home")                                        # outline, 24px, currentColor
iconkit.svg("heart", mode="solid", size=32, color="#e05b4c")
iconkit.names()                                            # all ${COUNT} icon names
iconkit.manifest()                                         # full manifest (categories, keywords, aliases)
\`\`\`

Works with Django, Flask, Jinja2, FastAPI… mark the string as safe HTML in your template engine.

## License

MIT © ${AUTHOR} · [suils.es](${HOMEPAGE})
`;
  w(path.join(dir, 'README.md'), readme);
  w(path.join(dir, 'LICENSE'), LICENSE);
  w(path.join(dir, 'pyproject.toml'), `[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "iconkit"
version = "${VERSION}"
description = "${DESC}"
readme = "README.md"
license = "MIT"
license-files = ["LICENSE"]
requires-python = ">=3.8"
authors = [{ name = "${AUTHOR}", email = "${EMAIL}" }]
keywords = ["icons", "svg", "vector", "outline", "solid", "currentcolor"]
classifiers = [
  "Development Status :: 5 - Production/Stable",
  "Intended Audience :: Developers",
  "Operating System :: OS Independent",
  "Programming Language :: Python :: 3",
  "Topic :: Multimedia :: Graphics",
  "Topic :: Software Development :: User Interfaces",
]

[project.urls]
Homepage = "${HOMEPAGE}"
Documentation = "${DOCS}"

[tool.hatch.build.targets.wheel]
packages = ["src/iconkit"]
`);

  // ---- wheel: iconkit-1.0.0-py3-none-any.whl (zip escrito a mano, RECORD con sha256) ----
  const distInfo = `iconkit-${VERSION}.dist-info`;
  const metadata = `Metadata-Version: 2.1
Name: iconkit
Version: ${VERSION}
Summary: ${DESC}
Home-page: ${HOMEPAGE}
Author: ${AUTHOR}
Author-email: ${EMAIL}
License: MIT
Project-URL: Homepage, ${HOMEPAGE}
Project-URL: Documentation, ${DOCS}
Keywords: icons,svg,vector,outline,solid,currentcolor
Classifier: Development Status :: 5 - Production/Stable
Classifier: Intended Audience :: Developers
Classifier: License :: OSI Approved :: MIT License
Classifier: Operating System :: OS Independent
Classifier: Programming Language :: Python :: 3
Classifier: Topic :: Multimedia :: Graphics
Classifier: Topic :: Software Development :: User Interfaces
Requires-Python: >=3.8
Description-Content-Type: text/markdown
License-File: LICENSE

${readme}`;
  const wheelMeta = `Wheel-Version: 1.0
Generator: iconkit-packages (${VERSION})
Root-Is-Purelib: true
Tag: py3-none-any
`;
  const files = [
    ['iconkit/__init__.py', fs.readFileSync(path.join(pkgDir, '__init__.py'))],
    ['iconkit/_data.py', fs.readFileSync(path.join(pkgDir, '_data.py'))],
    ['iconkit/manifest.json', fs.readFileSync(path.join(pkgDir, 'manifest.json'))],
    [`${distInfo}/LICENSE`, Buffer.from(LICENSE)],
    [`${distInfo}/METADATA`, Buffer.from(metadata)],
    [`${distInfo}/WHEEL`, Buffer.from(wheelMeta)],
    [`${distInfo}/top_level.txt`, Buffer.from('iconkit\n')],
  ];
  const record = files.map(([name, data]) => `${name},sha256=${sha256b64url(data)},${data.length}`).join('\n')
    + `\n${distInfo}/RECORD,,\n`;
  const entries = [...files, [`${distInfo}/RECORD`, Buffer.from(record)]].map(([name, data]) => ({ name, data }));
  const whl = zipCreate(entries);
  const whlPath = path.join(dir, 'dist', `iconkit-${VERSION}-py3-none-any.whl`);
  w(whlPath, whl);

  // Autoverificación: reabrir el zip, comprobar nombres, hashes y tamaños contra RECORD.
  const back = zipRead(fs.readFileSync(whlPath));
  if (back.length !== entries.length) throw new Error('wheel: número de entradas inesperado');
  const recTxt = back.find((e) => e.name === `${distInfo}/RECORD`).data.toString('utf8');
  for (const e of back) {
    const want = entries.find((x) => x.name === e.name);
    if (!want || !want.data.equals(e.data)) throw new Error(`wheel: contenido difiere en ${e.name}`);
    if (e.name.endsWith('/RECORD')) continue;
    const line = recTxt.split('\n').find((l) => l.startsWith(e.name + ','));
    const [, hash, size] = line.split(',');
    if (hash !== `sha256=${sha256b64url(e.data)}` || Number(size) !== e.data.length) {
      throw new Error(`wheel: RECORD incoherente para ${e.name}`);
    }
  }
  console.log(`  python → ${path.relative(ROOT, dir)} (wheel verificado: ${back.length} entradas, ${(whl.length / 1024 / 1024).toFixed(2)} MB)`);
  return dir;
}

// ============================================================ NuGet (.NET)
function buildDotnet() {
  const dir = path.join(OUT, 'dotnet');
  fresh(dir);
  cpFixed(path.join(DIST, 'dotnet', 'IconKit.cs'), path.join(dir, 'IconKit.cs'));       // 3dGlasses → I3dGlasses
  cp(path.join(DIST, 'dotnet', 'IconKitData.cs'), path.join(dir, 'IconKitData.cs'));    // datos embebidos en C#
  cp(path.join(DIST, 'dotnet', 'IkIcon.razor'), path.join(dir, 'IkIcon.razor'));
  w(path.join(dir, 'LICENSE'), LICENSE);
  w(path.join(dir, 'README.md'), `# IconKit for .NET

${DESC}

- **${COUNT} icons** (${SOLID} with a solid variant) across ${CATS} categories, 24×24 grid.
- Zero dependencies, \`netstandard2.0\` — works on .NET Framework 4.6.2+, .NET Core, .NET 5+.
- Browse and search all icons: **[iconkit.suils.es](${DOCS})**

## Install

\`\`\`sh
dotnet add package IconKit
\`\`\`

## Usage

\`\`\`csharp
using IconKitLib;

string svg = IconKit.Svg("home");                                        // outline, 24px, currentColor
string red = IconKit.Svg("heart", mode: "solid", size: 32, color: "#e05b4c");
IconKit.Names();                                                         // all ${COUNT} names
IconKit.Has("rocket-launch");                                            // true
string name = IconKit.Home;                                              // catalog constants
\`\`\`

Emit the string anywhere HTML is rendered — Razor Pages, MVC, minimal APIs, e-mail templates…
In Razor use \`@Html.Raw(IconKit.Svg("home"))\`.

## Blazor

A ready-made component ships inside the package as content (\`IkIcon.razor\`).
Copy it from the NuGet cache (or from \`content/IkIcon.razor\` in the package) into your project:

\`\`\`razor
<IkIcon Name="home" />
<IkIcon Name="heart" Mode="solid" Size="32" Color="#e05b4c" />
\`\`\`

Icons whose name starts with a digit are prefixed with \`I\`: \`IconKit.I3dGlasses\` → \`"3d-glasses"\`.

## License

MIT © ${AUTHOR} · [suils.es](${HOMEPAGE})
`);
  w(path.join(dir, 'IconKit.csproj'), `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <RootNamespace>IconKitLib</RootNamespace>
    <AssemblyName>IconKit</AssemblyName>

    <PackageId>IconKit</PackageId>
    <Version>${VERSION}</Version>
    <Authors>${AUTHOR}</Authors>
    <Description>${DESC.replace(/&/g, '&amp;')}</Description>
    <Copyright>Copyright (c) 2026 ${AUTHOR}</Copyright>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <PackageProjectUrl>${HOMEPAGE}</PackageProjectUrl>
    <RepositoryUrl>${DOCS}</RepositoryUrl>
    <PackageReadmeFile>README.md</PackageReadmeFile>
    <PackageTags>icons;svg;vector;outline;solid;blazor;razor;ui</PackageTags>
    <GeneratePackageOnBuild>false</GeneratePackageOnBuild>
  </PropertyGroup>

  <ItemGroup>
    <None Include="README.md" Pack="true" PackagePath="\\" />
    <None Include="LICENSE" Pack="true" PackagePath="\\" />
    <!-- Componente Blazor como contenido: el consumidor lo copia a su proyecto. -->
    <None Include="IkIcon.razor" Pack="true" PackagePath="content\\IkIcon.razor;contentFiles\\any\\any\\IkIcon.razor" />
  </ItemGroup>

</Project>
`);
  console.log(`  dotnet → ${path.relative(ROOT, dir)}`);
  return dir;
}

// ============================================================ run
console.log(`packages.js — dist: ${COUNT} iconos (${SOLID} solid, ${CATS} categorías). font/: ${hasFont ? 'sí' : 'no (se incluirá cuando exista)'}`);
fs.mkdirSync(OUT, { recursive: true });
const npmDir = buildNpm();
buildDart();
buildPython();
buildDotnet();

// Autoverificación de sintaxis de los JS patchados del paquete npm.
await esmCheck('npm/react/index.js', path.join(npmDir, 'react', 'index.js'));
await esmCheck('npm/vue/index.js', path.join(npmDir, 'vue', 'index.js'));
await esmCheck('npm/svelte/icons.js', path.join(npmDir, 'svelte', 'icons.js'));
await esmCheck('npm/web-component/iconkit.js', path.join(npmDir, 'web-component', 'iconkit.js'),
  'globalThis.customElements ??= { define() {} }; globalThis.HTMLElement ??= class {};\n');

console.log('\npackages/ listo. Verificación externa:');
console.log('  npm:    cd packages/npm && npm pack --dry-run');
console.log('  pub:    cd packages/dart && dart pub get && dart pub publish --dry-run');
console.log('  PyPI:   wheel ya verificado (packages/python/dist/*.whl); con Python: python -m build && twine check');
console.log('  NuGet:  dotnet pack packages/dotnet/IconKit.csproj -c Release');
