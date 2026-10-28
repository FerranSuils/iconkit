// Generador del plugin de WordPress: reutiliza la clase PHP y la envuelve en un plugin.
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { ROOT } from '../lib/registry.js';

const DIST = path.join(ROOT, 'dist');
const w = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };

export function genWordpress({ ids }) {
  const brand = config.brand;                 // IconKit
  const p = config.prefix;                    // ik
  const slug = brand.toLowerCase();           // iconkit
  const tag = `${p}-icon`;                    // <ik-icon>
  const fn = `${p}_icon`;                     // ik_icon() / [ik_icon]
  const PLUGIN = path.join(DIST, 'wordpress', slug);

  // La clase PHP es la misma que genera genPhp: se reutiliza para no duplicar la fuente de verdad.
  // Se le quita el helper global de conveniencia, porque el plugin declara su propio ${fn}()
  // (con sanitizado, accesibilidad y clases CSS) y dos funciones con ese nombre serían un fatal.
  const phpClass = fs.readFileSync(path.join(DIST, 'php', 'IconKit.php'), 'utf8')
    .replace(/\n\/\*\* Helper de conveniencia\. \*\/\nfunction \w+\([^\n]*\n?/, '\n');
  if (phpClass.includes(`function ${fn}(`)) {
    throw new Error(`genWordpress: el helper ${fn}() sigue en la clase y chocaría con el del plugin.`);
  }
  w(path.join(PLUGIN, 'lib', `${brand}.php`), phpClass);

  w(path.join(PLUGIN, `${slug}.php`), `<?php
/**
 * Plugin Name:       ${brand}
 * Description:       ${ids.length} iconos SVG propios, renderizados en el servidor. Sin CDN, sin fuentes externas, sin emojis.
 * Version:           ${config.version}
 * Requires PHP:      8.0
 * Author:            ${brand}
 * License:           MIT
 *
 * GENERADO por build/gen/wordpress.js. No editar a mano: se regenera con \`npm run build\`.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) { exit; }

define('${p.toUpperCase()}_VERSION', '${config.version}');
define('${p.toUpperCase()}_TAG', '${tag}');

/**
 * La clase pesa ~1 MB (${ids.length} iconos en un array estático). Se carga en cuanto
 * hace falta el primer icono, no en cada petición: una página sin iconos no la toca.
 */
function ${p}_boot(): void
{
    static $loaded = false;
    if ($loaded) { return; }
    require_once __DIR__ . '/lib/${brand}.php';
    $loaded = true;
}

/**
 * Devuelve el markup SVG inline de un icono.
 *
 * @param array{mode?:string,size?:int|string,color?:string,class?:string,label?:string} $opts
 */
function ${fn}(string $name, array $opts = []): string
{
    ${p}_boot();

    $name = sanitize_key($name);
    if (!${brand}::has($name)) {
        return '';
    }

    $label = isset($opts['label']) ? trim((string) $opts['label']) : '';
    $classes = trim('${p}-icon ' . (string) ($opts['class'] ?? ''));

    $svg = ${brand}::svg($name, [
        'mode'  => (($opts['mode'] ?? 'outline') === 'solid') ? 'solid' : 'outline',
        'size'  => (int) ($opts['size'] ?? 24),
        'color' => (string) ($opts['color'] ?? 'currentColor'),
        'class' => $classes,
    ]);

    // Decorativo por defecto (aria-hidden, como sale de la clase). Con label pasa a ser
    // contenido con significado y se anuncia en lectores de pantalla.
    if ($label !== '') {
        $svg = str_replace(
            'aria-hidden="true"',
            'role="img" aria-label="' . esc_attr($label) . '"',
            $svg
        );
    }

    return $svg;
}

/**
 * Sustituye <${tag} name="..."> por el SVG inline.
 *
 * Se aplica sobre HTML ya renderizado, así que funciona igual en temas de bloques
 * (wp:html), en el editor clásico, en widgets y en plantillas PHP.
 */
function ${p}_render_tags(string $html): string
{
    if (stripos($html, '<${tag}') === false) {
        return $html;
    }

    return (string) preg_replace_callback(
        '#<${tag}\\b([^>]*)\\s*/?>(?:\\s*</${tag}>)?#i',
        static function (array $m): string {
            $attrs = [];
            if (preg_match_all('/([a-zA-Z-]+)\\s*=\\s*("[^"]*"|\\'[^\\']*\\')/', $m[1], $found, PREG_SET_ORDER)) {
                foreach ($found as $a) {
                    $attrs[strtolower($a[1])] = trim($a[2], '"\\'');
                }
            }
            if (empty($attrs['name'])) { return ''; }

            return ${fn}($attrs['name'], [
                'mode'  => $attrs['mode']  ?? 'outline',
                'size'  => $attrs['size']  ?? 24,
                'color' => $attrs['color'] ?? 'currentColor',
                'class' => $attrs['class'] ?? '',
                'label' => $attrs['label'] ?? '',
            ]);
        },
        $html
    );
}

// Temas de bloques (incluye los bloques wp:html de las plantillas FSE).
add_filter('render_block', static fn($html) => ${p}_render_tags((string) $html), 20);
// Editor clásico, extractos, widgets y texto de comentarios.
foreach (['the_content', 'the_excerpt', 'widget_text', 'widget_block_content', 'comment_text'] as $hook) {
    add_filter($hook, '${p}_render_tags', 20);
}

// Shortcode: [${fn} name="rocket-launch" mode="solid" size="32"]
add_shortcode('${fn}', static function ($atts): string {
    $a = shortcode_atts([
        'name'  => '',
        'mode'  => 'outline',
        'size'  => 24,
        'color' => 'currentColor',
        'class' => '',
        'label' => '',
    ], $atts, '${fn}');

    return ${fn}((string) $a['name'], $a);
});

/**
 * Alineación óptica con el texto. Es lo único que el plugin inyecta en la página:
 * ni fuentes, ni hojas de estilo externas, ni JavaScript.
 */
add_action('wp_head', static function (): void {
    echo '<style>.${p}-icon{display:inline-block;vertical-align:-.125em;flex-shrink:0}</style>' . "\\n";
}, 1);

/**
 * WordPress convierte emojis en <img> servidos desde s.w.org. Este plugin existe
 * para que no haya iconografía externa, así que se desactiva ese pipeline.
 */
add_action('init', static function (): void {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    add_filter('tiny_mce_plugins', static function ($plugins) {
        return is_array($plugins) ? array_diff($plugins, ['wpemoji']) : [];
    });
    add_filter('wp_resource_hints', static function ($urls, $relation) {
        return ($relation === 'dns-prefetch')
            ? array_filter($urls, static fn($u) => !str_contains(is_array($u) ? ($u['href'] ?? '') : (string) $u, 's.w.org'))
            : $urls;
    }, 10, 2);
});

/**
 * Referencia de iconos en el admin: Herramientas → ${brand}.
 * Buscador sobre los ${ids.length} nombres, con el markup listo para copiar.
 */
add_action('admin_menu', static function (): void {
    add_management_page('${brand}', '${brand}', 'edit_posts', '${slug}', static function (): void {
        ${p}_boot();
        $q = isset($_GET['q']) ? sanitize_text_field(wp_unslash($_GET['q'])) : '';
        $all = ${brand}::names();
        $hits = $q === '' ? array_slice($all, 0, 120) : array_slice(array_values(array_filter(
            $all,
            static fn($n) => str_contains($n, strtolower($q))
        )), 0, 300);

        echo '<div class="wrap"><h1>${brand}</h1>';
        printf('<p>%s iconos disponibles. Uso: <code>&lt;${tag} name="%s"&gt;&lt;/${tag}&gt;</code> o <code>[${fn} name="%s"]</code>.</p>',
            count($all), 'rocket-launch', 'rocket-launch');
        echo '<form method="get"><input type="hidden" name="page" value="${slug}">';
        printf('<p><input type="search" name="q" value="%s" placeholder="Buscar icono…" class="regular-text"> <button class="button">Buscar</button></p>',
            esc_attr($q));
        echo '</form><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">';
        foreach ($hits as $n) {
            printf(
                '<div style="border:1px solid #dcdcde;border-radius:6px;padding:12px;text-align:center;background:#fff">%s<div style="font-size:11px;margin-top:8px;word-break:break-all"><code>%s</code></div></div>',
                ${fn}($n, ['size' => 28]),
                esc_html($n)
            );
        }
        echo '</div>';
        if ($q === '') { echo '<p><em>Mostrando los primeros 120. Busca para ver el resto.</em></p>'; }
        echo '</div>';
    });
});
`);

  w(path.join(PLUGIN, 'readme.txt'), `=== ${brand} ===
Requires PHP: 8.0
Stable tag: ${config.version}
License: MIT

${ids.length} iconos SVG propios renderizados en el servidor. Sin CDN, sin fuentes de iconos
externas y sin emojis: el markup sale ya como SVG inline en el HTML.

== Uso ==

Etiqueta (funciona en temas de bloques, editor clásico, widgets y plantillas):

    <${tag} name="rocket-launch"></${tag}>
    <${tag} name="lock" mode="solid" size="32"></${tag}>
    <${tag} name="chart-line" size="20" label="Analítica"></${tag}>

Shortcode:

    [${fn} name="rocket-launch" mode="solid" size="32"]

Desde PHP:

    <?php echo ${fn}('rocket-launch', ['mode' => 'solid', 'size' => 32]); ?>

== Atributos ==

* name  — id del icono (obligatorio). Referencia completa en Herramientas → ${brand}.
* mode  — outline (por defecto) o solid.
* size  — píxeles. Por defecto 24.
* color — por defecto currentColor, así que hereda el color del texto.
* class — clases CSS extra.
* label — texto accesible. Sin él el icono es decorativo (aria-hidden).

== Notas ==

Los iconos son decorativos por defecto, que es lo correcto cuando acompañan a un texto
que ya dice lo mismo. Usa label sólo cuando el icono sea la única fuente de información.

El plugin desactiva el conversor de emojis de WordPress, que sustituye emojis por
imágenes servidas desde s.w.org.
`);
}
