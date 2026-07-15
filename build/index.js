// Orquestador del build: registry → dist/ para todas las tecnologías + README.
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { loadRegistry, ROOT } from './lib/registry.js';
import { genSvg, genManifest, genCss, genWebComponent, genDemo } from './gen/web.js';
import { genReact, genVue, genAngular, genSvelte } from './gen/frameworks.js';
import { genFlutter, genKotlin, genSwift } from './gen/native.js';
import { genPython, genPhp, genDotnet } from './gen/backends.js';
import { genFigma } from './gen/figma.js';
import { genLanding } from './gen/landing.js';

const DIST = path.join(ROOT, 'dist');
fs.rmSync(DIST, { recursive: true, force: true });

const reg = loadRegistry({ strict: true });
console.log(`Registro: ${reg.ids.length} iconos (${reg.ids.filter((i) => reg.icons[i].solid).length} con solid).`);

const steps = [
  ['svg', genSvg], ['manifest', genManifest], ['css', genCss], ['web-component', genWebComponent], ['demo', genDemo],
  ['react', genReact], ['vue', genVue], ['angular', genAngular], ['svelte', genSvelte],
  ['flutter', genFlutter], ['kotlin', genKotlin], ['swift', genSwift],
  ['python', genPython], ['php', genPhp], ['dotnet', genDotnet],
  ['figma', genFigma],
  ['landing', genLanding],
];
for (const [name, fn] of steps) { fn(reg); console.log('  ✓', name); }

// README de uso por tecnología en dist/
const p = config.prefix;
fs.writeFileSync(path.join(DIST, 'README.md'), `# ${config.brand} — ${reg.ids.length} iconos

Una fuente, todas las tecnologías. Todos los iconos usan **currentColor** (heredan el color del texto),
cualquier **tamaño**, y dos **modos**: \`outline\` y \`solid\`.

## Web (HTML/CSS/JS)
\`\`\`html
<link rel="stylesheet" href="css/${config.brand.toLowerCase()}.css">
<i class="${p} ${p}-home"></i>            <!-- outline -->
<i class="${p} ${p}-home-solid"></i>      <!-- relleno -->
<i class="${p} ${p}-heart-solid" style="color:#e05b4c;font-size:32px"></i>
\`\`\`
Web Component: \`<script type="module" src="web-component/${config.brand.toLowerCase()}.js"></script>\` → \`<${p}-icon name="home" mode="solid" size="24"></${p}-icon>\`
SVG sueltos en \`svg/outline/\` y \`svg/solid/\`; sprite en \`svg/sprite.svg\` (\`<svg><use href="svg/sprite.svg#${p}-home"/></svg>\`).

## React
\`\`\`jsx
import { Home, Icon } from './react';
<Home size={24} color="#e05b4c" /> ;  <Icon name="home" mode="solid" />
\`\`\`
## Vue 3
\`\`\`vue
import { Home } from './vue';
<Home :size="24" /> ;  <Icon name="home" mode="solid" />
\`\`\`
## Angular (standalone)
\`\`\`ts
import { IkIconComponent } from './angular/ik-icon.component';
// <${p}-icon name="home" mode="solid" size="24"></${p}-icon>
\`\`\`
## Svelte
\`\`\`svelte
import Icon from './svelte/Icon.svelte';
<Icon name="home" mode="solid" size={24} color="#e05b4c" />
\`\`\`
## Flutter
\`\`\`dart
// pubspec: iconkit (path: dist/flutter) — requiere flutter_svg
IconKitIcon(IconKit.home, size: 24, color: Colors.red)
IconKitIcon(IconKit.heart, mode: IconKitMode.solid)
\`\`\`
## Kotlin / Android
Copia \`kotlin/res/drawable/*.xml\` a tu módulo. \`Icon(painterResource(R.drawable.${p}_home), null)\` (Compose)
o \`android:src="@drawable/${p}_home"\`. Tinta con \`android:tint\`.
## Swift / SwiftUI
Añade \`swift/IconKit.xcassets\` y \`IconKit.swift\`. \`IconKitIcon(.home).foregroundColor(.red)\`
## Python
\`\`\`python
import iconkit
iconkit.svg("home", mode="solid", size=20, color="#e05b4c")
\`\`\`
## PHP
\`\`\`php
require 'IconKit.php';
echo IconKit::svg('home', ['mode'=>'solid','size'=>20,'color'=>'#e05b4c']);
\`\`\`
## C# / .NET / Blazor
\`\`\`csharp
IconKit.Svg("home", mode:"solid", size:20, color:"#e05b4c");
// Blazor: <IkIcon Name="home" Mode="solid" />
\`\`\`
## Cualquier otro lenguaje (C, C++, Rust, Go, ASP.NET…)
Usa \`manifest.json\`: por cada icono trae \`outline\`/\`solid\` (markup SVG) y \`paths\` (datos de path
puro, sin circle/rect) para renderizadores vectoriales propios. El color y el tamaño los pones tú.
`);

console.log('\nBuild completo →', DIST);
