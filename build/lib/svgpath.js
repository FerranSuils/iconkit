// Convierte el markup interior (path/circle/rect/line/polyline/polygon/ellipse)
// a una lista de cadenas `d` de <path>, para destinos que solo aceptan paths
// (Android vector drawable) o que prefieren datos de path puros (C/Rust/motores).

const num = (s) => parseFloat(s);
function attrs(tag) {
  const o = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) o[m[1]] = m[2];
  return o;
}

function roundedRect(x, y, w, h, rx, ry) {
  rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
  if (!rx && !ry) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
  return `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}` +
    `V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}` +
    `H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}` +
    `V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
}
function ellipsePath(cx, cy, rx, ry) {
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
}

export function primitivesToPaths(markup) {
  const out = [];
  for (const m of markup.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\b([^>]*)>/g)) {
    const tag = m[1]; const a = attrs(m[2]);
    if (tag === 'path') { if (a.d) out.push(a.d.trim()); }
    else if (tag === 'circle') out.push(ellipsePath(num(a.cx || 0), num(a.cy || 0), num(a.r || 0), num(a.r || 0)));
    else if (tag === 'ellipse') out.push(ellipsePath(num(a.cx || 0), num(a.cy || 0), num(a.rx || 0), num(a.ry || 0)));
    else if (tag === 'rect') out.push(roundedRect(num(a.x || 0), num(a.y || 0), num(a.width || 0), num(a.height || 0), num(a.rx || a.ry || 0), num(a.ry || a.rx || 0)));
    else if (tag === 'line') out.push(`M${num(a.x1 || 0)} ${num(a.y1 || 0)}L${num(a.x2 || 0)} ${num(a.y2 || 0)}`);
    else if (tag === 'polyline' || tag === 'polygon') {
      const pts = (a.points || '').trim().split(/\s+|,/).map(num);
      let d = '';
      for (let i = 0; i < pts.length; i += 2) d += (i === 0 ? 'M' : 'L') + pts[i] + ' ' + pts[i + 1];
      if (tag === 'polygon') d += 'Z';
      if (d) out.push(d);
    }
  }
  return out;
}

// ¿El markup lleva fill-rule evenodd en algún path? (para trasladar el relleno).
export function hasEvenOdd(markup) {
  return /fill-rule\s*=\s*"evenodd"/.test(markup);
}
