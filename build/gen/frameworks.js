// Generadores de componentes para frameworks JS: React, Vue 3, Angular, Svelte.
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { pascal } from '../lib/naming.js';
import { ROOT } from '../lib/registry.js';

const DIST = path.join(ROOT, 'dist');
const w = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };

function dataMap(icons, ids) {
  const o = {};
  for (const id of ids) o[id] = [icons[id].outline, icons[id].solid || null];
  return o;
}
const WRAP = () => `{outline:${JSON.stringify(config.wrapper.outline)},solid:${JSON.stringify(config.wrapper.solid)}}`;

export function genReact({ icons, ids }) {
  const data = dataMap(icons, ids);
  const base = `// ${config.brand} para React. Uso: import { Home } from 'iconkit-react'; <Home/>  o  <Icon name="home" mode="solid" size={20} color="#e05b4c"/>
import { createElement as h } from 'react';
const ICONS = ${JSON.stringify(data)};
const WRAP = ${WRAP()};
export function Icon({ name, mode = 'outline', size = 24, color = 'currentColor', ...rest }) {
  const rec = ICONS[name]; if (!rec) return null;
  const solid = mode === 'solid' && rec[1];
  const inner = solid ? rec[1] : rec[0];
  const wrap = solid ? WRAP.solid : WRAP.outline;
  const attrs = Object.fromEntries(wrap.split(' ').map(kv => { const [k, v] = kv.split('='); return [k.replace(/-(\\w)/g, (_, c) => c.toUpperCase()), v ? v.replace(/"/g, '') : true]; }));
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24', ...attrs, stroke: mode === 'solid' && rec[1] ? 'none' : color, fill: solid ? color : 'none', 'aria-hidden': true, ...rest, dangerouslySetInnerHTML: { __html: inner } });
}
`;
  const named = ids.map((id) => `export const ${pascal(id)} = (p) => Icon({ name: '${id}', ...p });`).join('\n');
  w(path.join(DIST, 'react', 'index.js'), base + named + '\n');
  // Tipos TS
  const dts = `import { FC, SVGProps } from 'react';
export interface IconProps extends SVGProps<SVGSVGElement> { name?: string; mode?: 'outline' | 'solid'; size?: number | string; color?: string; }
export declare const Icon: FC<IconProps>;
${ids.map((id) => `export declare const ${pascal(id)}: FC<Omit<IconProps,'name'>>;`).join('\n')}
`;
  w(path.join(DIST, 'react', 'index.d.ts'), dts);
}

export function genVue({ icons, ids }) {
  const data = dataMap(icons, ids);
  const base = `// ${config.brand} para Vue 3. Uso: import { Home } from 'iconkit-vue'; <Home/>  o  <Icon name="home" mode="solid" :size="20"/>
import { h, defineComponent } from 'vue';
const ICONS = ${JSON.stringify(data)};
const WRAP = ${WRAP()};
export const Icon = defineComponent({
  name: 'IkIcon',
  props: { name: String, mode: { type: String, default: 'outline' }, size: { type: [Number, String], default: 24 }, color: { type: String, default: 'currentColor' } },
  setup(p) {
    return () => {
      const rec = ICONS[p.name]; if (!rec) return null;
      const solid = p.mode === 'solid' && rec[1];
      const wrap = solid ? WRAP.solid : WRAP.outline;
      const attrs = Object.fromEntries(wrap.split(' ').map(kv => { const [k, v] = kv.split('='); return [k, v ? v.replace(/"/g, '') : true]; }));
      return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: p.size, height: p.size, viewBox: '0 0 24 24', ...attrs, stroke: solid ? 'none' : p.color, fill: solid ? p.color : 'none', 'aria-hidden': 'true', innerHTML: solid ? rec[1] : rec[0] });
    };
  },
});
`;
  const named = ids.map((id) => `export const ${pascal(id)} = defineComponent({ name: '${pascal(id)}', setup: (p) => () => h(Icon, { name: '${id}', ...p }) });`).join('\n');
  w(path.join(DIST, 'vue', 'index.js'), base + named + '\n');
}

export function genAngular({ icons, ids }) {
  const data = dataMap(icons, ids);
  w(path.join(DIST, 'angular', 'iconkit.data.ts'), `export const IK_ICONS: Record<string,[string,string|null]> = ${JSON.stringify(data)};
export const IK_WRAP = { outline: '${config.wrapper.outline}', solid: '${config.wrapper.solid}' };\n`);
  const comp = `// ${config.brand} para Angular (standalone). Uso: <${config.prefix}-icon name="home" mode="solid" size="20"></${config.prefix}-icon>
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IK_ICONS, IK_WRAP } from './iconkit.data';

@Component({
  selector: '${config.prefix}-icon',
  standalone: true,
  template: \`<svg xmlns="http://www.w3.org/2000/svg" [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="solid ? color : 'none'" [attr.stroke]="solid ? 'none' : color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" [innerHTML]="svg"></svg>\`,
})
export class IkIconComponent {
  @Input() name = '';
  @Input() mode: 'outline' | 'solid' = 'outline';
  @Input() size: number | string = 24;
  @Input() color = 'currentColor';
  constructor(private s: DomSanitizer) {}
  get rec() { return IK_ICONS[this.name]; }
  get solid() { return this.mode === 'solid' && !!this.rec?.[1]; }
  get svg(): SafeHtml { const r = this.rec; return this.s.bypassSecurityTrustHtml(r ? (this.solid ? r[1]! : r[0]) : ''); }
}
`;
  w(path.join(DIST, 'angular', 'ik-icon.component.ts'), comp);
}

export function genSvelte({ icons, ids }) {
  const data = dataMap(icons, ids);
  w(path.join(DIST, 'svelte', 'icons.js'), `export const ICONS = ${JSON.stringify(data)};
export const WRAP = { outline: '${config.wrapper.outline}', solid: '${config.wrapper.solid}' };\n`);
  const comp = `<!-- ${config.brand} para Svelte. Uso: <Icon name="home" mode="solid" size={20} color="#e05b4c"/> -->
<script>
  import { ICONS } from './icons.js';
  export let name = '';
  export let mode = 'outline';
  export let size = 24;
  export let color = 'currentColor';
  $: rec = ICONS[name];
  $: solid = mode === 'solid' && rec && rec[1];
</script>
{#if rec}
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
  fill={solid ? color : 'none'} stroke={solid ? 'none' : color} stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {@html solid ? rec[1] : rec[0]}
</svg>
{/if}
`;
  w(path.join(DIST, 'svelte', 'Icon.svelte'), comp);
}
