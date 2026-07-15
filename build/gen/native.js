// Generadores nativos: Flutter (flutter_svg), Kotlin/Android (vector drawables), Swift (xcassets).
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { dartName, snake } from '../lib/naming.js';
import { markupFor, svgFor, ROOT } from '../lib/registry.js';
import { primitivesToPaths, hasEvenOdd } from '../lib/svgpath.js';

const DIST = path.join(ROOT, 'dist');
const w = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };

/* ----------------------------- Flutter ----------------------------- */
export function genFlutter({ icons, ids }) {
  // Datos: map id -> [outlineInner, solidInner|null]
  const entries = ids.map((id) => {
    const esc = (s) => s.replace(/\$/g, '\\$').replace(/'/g, "\\'");
    return `  '${id}': ['${esc(icons[id].outline)}', ${icons[id].solid ? `'${esc(icons[id].solid)}'` : 'null'}],`;
  }).join('\n');
  w(path.join(DIST, 'flutter', 'lib', 'src', 'iconkit_data.g.dart'), `// GENERADO. No editar.
const Map<String, List<String?>> kIconKitData = {
${entries}
};
`);
  const consts = ids.map((id) => `  static const String ${dartName(id)} = '${id}';`).join('\n');
  w(path.join(DIST, 'flutter', 'lib', 'iconkit.dart'), `library iconkit;

import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'src/iconkit_data.g.dart';

/// Modo de dibujo del icono.
enum IconKitMode { outline, solid }

/// Catálogo de nombres. Uso: IconKitIcon(IconKit.home)
class IconKit {
${consts}

  /// Devuelve el SVG completo de un icono (para usos avanzados).
  static String? svg(String name, {IconKitMode mode = IconKitMode.outline, String color = 'currentColor'}) {
    final rec = kIconKitData[name];
    if (rec == null) return null;
    final solid = mode == IconKitMode.solid && rec[1] != null;
    final inner = solid ? rec[1]! : rec[0]!;
    final wrap = solid
        ? 'fill="\$color" stroke="none"'
        : 'fill="none" stroke="\$color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" \$wrap>\$inner</svg>';
  }
}

/// Widget de icono. Hereda el color de [color] (o IconTheme) y escala a [size].
class IconKitIcon extends StatelessWidget {
  const IconKitIcon(this.name, {super.key, this.size = 24, this.color, this.mode = IconKitMode.outline});
  final String name;
  final double size;
  final Color? color;
  final IconKitMode mode;

  @override
  Widget build(BuildContext context) {
    final rec = kIconKitData[name];
    if (rec == null) return SizedBox(width: size, height: size);
    final c = color ?? IconTheme.of(context).color ?? const Color(0xFF000000);
    final solid = mode == IconKitMode.solid && rec[1] != null;
    final inner = solid ? rec[1]! : rec[0]!;
    final wrap = solid
        ? 'fill="#000" stroke="none"'
        : 'fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    final svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" \$wrap>\$inner</svg>';
    return SvgPicture.string(svg, width: size, height: size,
        colorFilter: ColorFilter.mode(c, BlendMode.srcIn));
  }
}
`);
  w(path.join(DIST, 'flutter', 'pubspec.yaml'), `name: iconkit
description: ${config.brand} — iconos vectoriales (${ids.length}) con color y tamaño libres, modos outline/solid.
version: ${config.version}
environment:
  sdk: ">=3.0.0 <4.0.0"
  flutter: ">=3.10.0"
dependencies:
  flutter:
    sdk: flutter
  flutter_svg: ">=2.0.0 <3.0.0"
`);
}

/* --------------------------- Kotlin/Android --------------------------- */
export function genKotlin({ icons, ids }) {
  const dir = path.join(DIST, 'kotlin', 'res', 'drawable');
  for (const id of ids) {
    for (const mode of ['outline', 'solid']) {
      if (mode === 'solid' && !icons[id].solid) continue;
      const paths = primitivesToPaths(markupFor(icons[id], mode));
      const evenodd = hasEvenOdd(markupFor(icons[id], mode));
      const body = paths.map((d) => mode === 'solid'
        ? `    <path android:pathData="${d.replace(/"/g, '&quot;')}" android:fillColor="#FF000000"${evenodd ? ' android:fillType="evenOdd"' : ''}/>`
        : `    <path android:pathData="${d.replace(/"/g, '&quot;')}" android:strokeColor="#FF000000" android:strokeWidth="2" android:strokeLineCap="round" android:strokeLineJoin="round"/>`
      ).join('\n');
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- ${config.brand}: ${id} (${mode}). Tinta con android:tint o setTint(). -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"
    android:tint="?attr/colorControlNormal">
${body}
</vector>
`;
      const suffix = mode === 'solid' ? '_solid' : '';
      w(path.join(dir, `${config.prefix}_${snake(id)}${suffix}.xml`), xml);
    }
  }
}

/* ------------------------------- Swift ------------------------------- */
export function genSwift({ icons, ids }) {
  const assets = path.join(DIST, 'swift', 'IconKit.xcassets');
  w(path.join(assets, 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 } }, null, 2));
  for (const id of ids) {
    for (const mode of ['outline', 'solid']) {
      if (mode === 'solid' && !icons[id].solid) continue;
      const suffix = mode === 'solid' ? '-solid' : '';
      const setDir = path.join(assets, `${id}${suffix}.imageset`);
      const fname = `${id}${suffix}.svg`;
      w(path.join(setDir, fname), svgFor(icons[id], mode));
      w(path.join(setDir, 'Contents.json'), JSON.stringify({
        images: [{ filename: fname, idiom: 'universal' }],
        info: { author: 'xcode', version: 1 },
        properties: { 'preserves-vector-representation': true, 'template-rendering-intent': 'template' },
      }, null, 2));
    }
  }
  const cases = ids.map((id) => `    case ${dartName(id)} = "${id}"`).join('\n');
  w(path.join(DIST, 'swift', 'IconKit.swift'), `// ${config.brand} para SwiftUI. Añade IconKit.xcassets al target.
// Uso: IconKitIcon(.home).foregroundColor(.red).font(.system(size: 20))
import SwiftUI

public enum IconKitName: String, CaseIterable {
${cases}
}

public struct IconKitIcon: View {
    let name: IconKitName
    var solid: Bool = false
    public init(_ name: IconKitName, solid: Bool = false) { self.name = name; self.solid = solid }
    public var body: some View {
        Image("\\(name.rawValue)\\(solid ? "-solid" : "")", bundle: .main)
            .renderingMode(.template)
            .resizable()
            .aspectRatio(contentMode: .fit)
    }
}
`);
}
