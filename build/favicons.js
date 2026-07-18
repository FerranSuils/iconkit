// Genera los tamaños de favicon / apple-touch / logo del header a partir del
// logo maestro brand/iconkit-logo.png (1024×1024, PNG 8-bit). Repetible; ejecutar
// tras cambiar el logo maestro:  node build/favicons.js
// Salidas (en brand/, que build/gen/landing.js copia a dist/ en cada build):
//   favicon-32.png · favicon-48.png · apple-touch-icon.png · iconkit-logo-256.png
// Redimensionado por promedio de caja, sin dependencias (solo node:zlib).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = path.join(ROOT, 'brand');
const MASTER = path.join(BRAND, 'iconkit-logo.png');
const SIZES = [
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['iconkit-logo-256.png', 256],
];

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

// PNG 8-bit no entrelazado → {w,h,channels,data(RGB/RGBA/gris sin filtrar)}.
function readPng(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('no es PNG: ' + file);
  let off = 8, ihdr = null; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), bd: data[8], ct: data[9], interlace: data[12] };
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (ihdr.bd !== 8) throw new Error('solo PNG de 8 bits');
  if (ihdr.interlace !== 0) throw new Error('PNG entrelazado no soportado');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.ct];
  if (!channels) throw new Error('color type no soportado: ' + ihdr.ct);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { w, h } = ihdr, bpp = channels, stride = w * bpp, out = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++], row = raw.subarray(pos, pos + stride); pos += stride;
    const orow = out.subarray(y * stride, (y + 1) * stride);
    const prow = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? orow[x - bpp] : 0, b = prow ? prow[x] : 0, c = (prow && x >= bpp) ? prow[x - bpp] : 0;
      let vv = row[x];
      if (filter === 1) vv = (vv + a) & 255;
      else if (filter === 2) vv = (vv + b) & 255;
      else if (filter === 3) vv = (vv + ((a + b) >> 1)) & 255;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); vv = (vv + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
      orow[x] = vv;
    }
  }
  return { w, h, channels, data: out };
}

// Reducción por promedio de caja (buena calidad al bajar de tamaño).
function resize(img, tw, th) {
  const { w, h, channels, data } = img, out = Buffer.alloc(tw * th * channels);
  for (let ty = 0; ty < th; ty++) {
    const sy0 = Math.floor(ty * h / th), sy1 = Math.max(sy0 + 1, Math.floor((ty + 1) * h / th));
    for (let tx = 0; tx < tw; tx++) {
      const sx0 = Math.floor(tx * w / tw), sx1 = Math.max(sx0 + 1, Math.floor((tx + 1) * w / tw));
      for (let ch = 0; ch < channels; ch++) {
        let sum = 0, n = 0;
        for (let sy = sy0; sy < sy1; sy++) for (let sx = sx0; sx < sx1; sx++) { sum += data[(sy * w + sx) * channels + ch]; n++; }
        out[(ty * tw + tx) * channels + ch] = Math.round(sum / n);
      }
    }
  }
  return { w: tw, h: th, channels, data: out };
}

function writePng(img, file) {
  const { w, h, channels, data } = img, ct = { 1: 0, 2: 4, 3: 2, 4: 6 }[channels], stride = w * channels;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const comp = zlib.deflateSync(raw, { level: 9 });
  const chunk = (type, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(type, 4, 'ascii'); d.copy(b, 8); b.writeUInt32BE(crc32(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = ct;
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  fs.writeFileSync(file, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', comp), chunk('IEND', Buffer.alloc(0))]));
}

if (!fs.existsSync(MASTER)) throw new Error(`Falta el logo maestro: ${path.relative(ROOT, MASTER)}`);
const master = readPng(MASTER);
console.log(`favicons.js — maestro ${path.relative(ROOT, MASTER)} (${master.w}×${master.h}, ${master.channels}ch)`);
for (const [name, size] of SIZES) {
  const out = path.join(BRAND, name);
  writePng(resize(master, size, size), out);
  console.log(`  ✓ ${name} (${size}×${size}, ${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
}
