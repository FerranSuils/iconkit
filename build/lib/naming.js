// Transformaciones de nombre id (kebab-case) → variantes por tecnología.

export function pascal(id) {
  const p = id.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  // Un identificador no puede empezar por dígito en JS/TS/C#/Swift (p.ej. 3d-glasses):
  // se antepone "I" (espejo del prefijo "i" que ya usa dartName en camel).
  return /^[0-9]/.test(p) ? 'I' + p : p;
}
export function camel(id) {
  const p = pascal(id);
  return p.charAt(0).toLowerCase() + p.slice(1);
}
export function constant(id) {
  return id.replace(/-/g, '_').toUpperCase();
}
export function snake(id) {
  return id.replace(/-/g, '_');
}
// Identificador Dart/Swift camel seguro (no puede empezar por dígito; ninguno lo hace hoy).
export function dartName(id) {
  const c = camel(id);
  return /^[0-9]/.test(c) ? 'i' + pascal(id) : c;
}
