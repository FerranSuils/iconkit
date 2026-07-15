// Generadores de backend: Python, PHP, C#/.NET (+ Blazor).
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { pascal } from '../lib/naming.js';
import { ROOT } from '../lib/registry.js';

const DIST = path.join(ROOT, 'dist');
const w = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };
const OUT = config.wrapper.outline, SOL = config.wrapper.solid;

/* ------------------------------- Python ------------------------------- */
export function genPython({ icons, ids }) {
  const py = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const data = ids.map((id) => `    "${id}": ("${py(icons[id].outline)}", ${icons[id].solid ? `"${py(icons[id].solid)}"` : 'None'}),`).join('\n');
  w(path.join(DIST, 'python', 'iconkit', '_data.py'), `# GENERADO. No editar.\nICONS = {\n${data}\n}\n`);
  w(path.join(DIST, 'python', 'iconkit', '__init__.py'), `"""${config.brand} — iconos SVG. iconkit.svg("home", mode="solid", size=20, color="#e05b4c")"""
from ._data import ICONS

_OUTLINE = '${OUT}'
_SOLID = '${SOL}'

def names():
    return sorted(ICONS.keys())

def svg(name, mode="outline", size=24, color="currentColor"):
    rec = ICONS.get(name)
    if rec is None:
        raise KeyError(f"icono desconocido: {name}")
    solid = mode == "solid" and rec[1] is not None
    inner = rec[1] if solid else rec[0]
    if solid:
        wrap = f'fill="{color}" stroke="none"'
    else:
        wrap = f'fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
            f'viewBox="0 0 24 24" {wrap} aria-hidden="true">{inner}</svg>')
`);
  w(path.join(DIST, 'python', 'pyproject.toml'), `[project]
name = "iconkit"
version = "${config.version}"
description = "${config.brand} — ${ids.length} iconos SVG"
requires-python = ">=3.7"
`);
}

/* -------------------------------- PHP -------------------------------- */
export function genPhp({ icons, ids }) {
  const php = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const data = ids.map((id) => `    '${id}' => ['${php(icons[id].outline)}', ${icons[id].solid ? `'${php(icons[id].solid)}'` : 'null'}],`).join('\n');
  w(path.join(DIST, 'php', 'IconKit.php'), `<?php
// ${config.brand} — iconos SVG. Uso: echo IconKit::svg('home', ['mode'=>'solid','size'=>20,'color'=>'#e05b4c']);
declare(strict_types=1);

final class IconKit
{
    /** @var array<string,array{0:string,1:?string}> */
    private static array \$icons = [
${data}
    ];

    /** @return string[] */
    public static function names(): array { \$k = array_keys(self::\$icons); sort(\$k); return \$k; }

    public static function has(string \$name): bool { return isset(self::\$icons[\$name]); }

    /** @param array{mode?:string,size?:int|string,color?:string,class?:string} \$opts */
    public static function svg(string \$name, array \$opts = []): string
    {
        if (!isset(self::\$icons[\$name])) { return ''; }
        [\$outline, \$solid] = self::\$icons[\$name];
        \$mode = \$opts['mode'] ?? 'outline';
        \$size = \$opts['size'] ?? 24;
        \$color = \$opts['color'] ?? 'currentColor';
        \$isSolid = \$mode === 'solid' && \$solid !== null;
        \$inner = \$isSolid ? \$solid : \$outline;
        \$wrap = \$isSolid
            ? 'fill="' . \$color . '" stroke="none"'
            : 'fill="none" stroke="' . \$color . '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
        \$cls = isset(\$opts['class']) ? ' class="' . htmlspecialchars(\$opts['class']) . '"' : '';
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' . \$size . '" height="' . \$size .
            '" viewBox="0 0 24 24" ' . \$wrap . \$cls . ' aria-hidden="true">' . \$inner . '</svg>';
    }
}

/** Helper de conveniencia. */
function ik_icon(string \$name, array \$opts = []): string { return IconKit::svg(\$name, \$opts); }
`);
}

/* ------------------------------ C#/.NET ------------------------------ */
export function genDotnet({ icons, ids }) {
  const cs = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const data = ids.map((id) => `        ["${id}"] = ("${cs(icons[id].outline)}", ${icons[id].solid ? `"${cs(icons[id].solid)}"` : 'null'}),`).join('\n');
  w(path.join(DIST, 'dotnet', 'IconKitData.cs'), `// GENERADO. No editar.
using System.Collections.Generic;
namespace IconKitLib;
public static partial class IconKit
{
    internal static readonly Dictionary<string, (string Outline, string? Solid)> Data = new()
    {
${data}
    };
}
`);
  const consts = ids.map((id) => `    public const string ${pascal(id)} = "${id}";`).join('\n');
  w(path.join(DIST, 'dotnet', 'IconKit.cs'), `// ${config.brand} — iconos SVG. Uso: IconKit.Svg("home", mode:"solid", size:20, color:"#e05b4c");
using System.Collections.Generic;
using System.Linq;
namespace IconKitLib;

public static partial class IconKit
{
${consts}

    public static IEnumerable<string> Names() => Data.Keys.OrderBy(k => k);
    public static bool Has(string name) => Data.ContainsKey(name);

    public static string Svg(string name, string mode = "outline", object? size = null, string color = "currentColor")
    {
        if (!Data.TryGetValue(name, out var rec)) return string.Empty;
        var solid = mode == "solid" && rec.Solid != null;
        var inner = solid ? rec.Solid : rec.Outline;
        var sz = size?.ToString() ?? "24";
        var wrap = solid
            ? $"fill=\\"{color}\\" stroke=\\"none\\""
            : $"fill=\\"none\\" stroke=\\"{color}\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"";
        return $"<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"{sz}\\" height=\\"{sz}\\" viewBox=\\"0 0 24 24\\" {wrap} aria-hidden=\\"true\\">{inner}</svg>";
    }
}
`);
  // Componente Blazor
  w(path.join(DIST, 'dotnet', 'IkIcon.razor'), `@* ${config.brand} Blazor. Uso: <IkIcon Name="home" Mode="solid" Size="20" Color="#e05b4c" /> *@
@((MarkupString)IconKitLib.IconKit.Svg(Name, Mode, Size, Color))
@code {
    [Parameter] public string Name { get; set; } = "";
    [Parameter] public string Mode { get; set; } = "outline";
    [Parameter] public object? Size { get; set; }
    [Parameter] public string Color { get; set; } = "currentColor";
}
`);
}
