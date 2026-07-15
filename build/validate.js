// Valida el registro y muestra un resumen. Sale con código !=0 si hay problemas.
import { loadRegistry } from './lib/registry.js';

const { icons, ids, aliasMap, problems, droppedAliases } = loadRegistry({ strict: false });
const withSolid = ids.filter((id) => icons[id].solid).length;
const cats = {};
for (const id of ids) cats[icons[id].category] = (cats[icons[id].category] || 0) + 1;

console.log(`IconKit — ${ids.length} iconos, ${withSolid} con variante solid, ${Object.keys(aliasMap).length} alias.`);
console.log('Por categoría:', Object.entries(cats).map(([c, n]) => `${c}:${n}`).join('  '));
if (droppedAliases?.length) console.log(`\n${droppedAliases.length} alias descartados por colisión (no fatal): ${droppedAliases.join(', ')}`);
if (problems.length) {
  console.log(`\n${problems.length} PROBLEMAS:`);
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('\nOK — registro válido.');
