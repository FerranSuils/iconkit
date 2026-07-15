<!-- IconKit para Svelte. Uso: <Icon name="home" mode="solid" size={20} color="#e05b4c"/> -->
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
