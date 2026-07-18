// Configuración única de la biblioteca. Renombra la marca aquí.
export const config = {
  brand: 'IconKit',          // nombre visible
  prefix: 'ik',              // prefijo CSS/clase/tag → <i class="ik ik-home">, <ik-icon>
  fontFamily: 'IconKit',     // familia tipográfica de la fuente de iconos
  cssVar: 'ik',              // prefijo de variables CSS
  codepointStart: 0xe000,    // inicio del rango PUA para la fuente
  grid: 24,                  // viewBox 0..24
  strokeWidth: 2,
  version: '1.0.1',
  cdnBase: 'https://iconkit.suils.es',   // CDN público donde se aloja dist/
  figmaUrl: 'https://www.figma.com/proto/s6gdfELjbdK3lUikrd1j3i/IconKit-%E2%80%94-Universal-Icon-Library?node-id=125-7903&p=f&t=KSFD5sIqDsBzy2xL-0&scaling=min-zoom&content-scaling=fixed&page-id=125%3A2',
  // Registros donde está publicado el paquete (una entrada por ecosistema).
  packages: [
    { registry: 'npm',     icon: 'package-box', id: '@ferran_suils/iconkit', install: 'npm install @ferran_suils/iconkit', url: 'https://www.npmjs.com/package/@ferran_suils/iconkit', techs: 'React · Vue · Angular · Svelte · Web Component' },
    { registry: 'PyPI',    icon: 'snake',       id: 'iconkit',               install: 'pip install iconkit',               url: 'https://pypi.org/project/iconkit/',                   techs: 'Python · Django · Flask · Jinja2' },
    { registry: 'NuGet',   icon: 'code',        id: 'IconKit',               install: 'dotnet add package IconKit',        url: 'https://www.nuget.org/packages/IconKit/',             techs: 'C# · .NET · Blazor / Razor' },
    { registry: 'pub.dev', icon: 'smartphone',  id: 'iconkit',               install: 'flutter pub add iconkit',           url: 'https://pub.dev/packages/iconkit',                    techs: 'Flutter · Dart' },
  ],
  // atributos del <svg> por modo (el markup interior hereda de aquí)
  wrapper: {
    outline: 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',
    solid: 'fill="currentColor" stroke="none"',
  },
};
