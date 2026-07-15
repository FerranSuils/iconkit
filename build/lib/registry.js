// Merge de src/authored/*.json → registro único validado, con codepoints deterministas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..', '..');
const AUTHORED = path.join(ROOT, 'src', 'authored');

const ALLOWED_TAGS = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];
// Atributos prohibidos en el markup interior (los pone el <svg> contenedor).
const FORBIDDEN_ATTR = /\b(stroke|fill|color|stroke-width|class|style|id)\s*=/;
// Excepción: fill-rule y clip-rule sí están permitidos.
function stripAllowed(markup) {
  return markup.replace(/fill-rule\s*=\s*"[^"]*"/g, '').replace(/clip-rule\s*=\s*"[^"]*"/g, '');
}

export function loadRegistry({ strict = true } = {}) {
  const files = fs.readdirSync(AUTHORED).filter((f) => f.endsWith('.json'));
  const merged = {};
  const problems = [];
  const skipped = [];
  const seen = {};

  for (const file of files.sort()) {
    let obj;
    try {
      obj = JSON.parse(fs.readFileSync(path.join(AUTHORED, file), 'utf8'));
    } catch (e) {
      // Fichero a medio escribir (autoría concurrente) o corrupto: se OMITE sin
      // abortar el build; la próxima reconstrucción lo recogerá.
      skipped.push(`${file}: ${e.message}`);
      continue;
    }
    for (const [id, icon] of Object.entries(obj)) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) problems.push(`[${file}] id no kebab-case: "${id}"`);
      if (seen[id]) problems.push(`id duplicado "${id}" en ${file} y ${seen[id]}`);
      seen[id] = file;
      validateIcon(id, icon, file, problems);
      merged[id] = normalizeIcon(id, icon);
    }
  }

  // Aliases → mapa alias→id, resuelto de forma determinista (primero-gana por
  // orden alfabético de id): se descarta el alias que choque con un id real o
  // que ya haya reclamado otro icono. No es fatal; se informa en droppedAliases.
  const aliasMap = {};
  const droppedAliases = [];
  for (const id of Object.keys(merged).sort()) {
    const kept = [];
    for (const a of merged[id].aliases) {
      if (merged[a]) droppedAliases.push(`${a} (de ${id}) = id real`);
      else if (aliasMap[a]) droppedAliases.push(`${a} (de ${id}) ya usado por ${aliasMap[a]}`);
      else { aliasMap[a] = id; kept.push(a); }
    }
    merged[id].aliases = kept; // deja solo los alias efectivos
  }

  // Codepoints deterministas por orden alfabético de id.
  const ids = Object.keys(merged).sort();
  ids.forEach((id, i) => { merged[id].codepoint = config.codepointStart + i; });

  if (skipped.length) {
    console.warn('Ficheros omitidos (parse inválido, se reintentará): ' + skipped.join(' · '));
  }
  if (problems.length && strict) {
    throw new Error('Registro inválido:\n - ' + problems.join('\n - '));
  }
  return { icons: merged, ids, aliasMap, problems, droppedAliases, skipped };
}

function validateIcon(id, icon, file, problems) {
  if (typeof icon !== 'object' || !icon) { problems.push(`[${file}] ${id}: no es objeto`); return; }
  if (!icon.outline || typeof icon.outline !== 'string') problems.push(`[${file}] ${id}: falta "outline"`);
  for (const mode of ['outline', 'solid']) {
    const m = icon[mode];
    if (!m) continue;
    // viewBox no debe ir dentro; ni <svg>.
    if (/<svg|viewBox|<\/svg>/.test(m)) problems.push(`[${file}] ${id}.${mode}: no incluyas <svg>/viewBox, solo el markup interior`);
    if (FORBIDDEN_ATTR.test(stripAllowed(m))) problems.push(`[${file}] ${id}.${mode}: atributo prohibido (stroke/fill/color/class/style/id) — usa currentColor heredado`);
    // etiquetas permitidas
    const tags = [...m.matchAll(/<([a-zA-Z]+)/g)].map((x) => x[1]);
    for (const t of tags) if (!ALLOWED_TAGS.includes(t)) problems.push(`[${file}] ${id}.${mode}: etiqueta no permitida <${t}>`);
    // Backstop de typo grosero en JSON. Nota: NO se puede acotar a ~[0,24]
    // porque los comandos SVG relativos usan deltas y el arco elíptico A usa
    // un ángulo de rotación de 0..360; el filtro real de geometría es la hoja
    // de contacto visual. Solo marcamos valores absurdos (dígito de más).
    const nums = [...m.matchAll(/-?(?:\d+\.?\d*|\.\d+)/g)].map((x) => parseFloat(x[0])).filter((n) => !Number.isNaN(n));
    if (nums.some((n) => n < -400 || n > 400)) problems.push(`[${file}] ${id}.${mode}: número absurdo (posible typo)`);
  }
}

function normalizeIcon(id, icon) {
  return {
    id,
    category: icon.category || 'misc',
    keywords: Array.isArray(icon.keywords) ? icon.keywords : [],
    aliases: Array.isArray(icon.aliases) ? icon.aliases : [],
    outline: (icon.outline || '').trim(),
    solid: icon.solid ? String(icon.solid).trim() : null,
  };
}

// Devuelve el markup para un modo, con fallback solid→outline.
export function markupFor(icon, mode) {
  if (mode === 'solid') return icon.solid || icon.outline;
  return icon.outline;
}

// SVG completo autónomo (para archivos .svg, previews, etc.).
export function svgFor(icon, mode, { size = 24, extra = '' } = {}) {
  const inner = markupFor(icon, mode);
  const w = config.wrapper[mode];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${config.grid} ${config.grid}" ${w}${extra ? ' ' + extra : ''}>${inner}</svg>`;
}
