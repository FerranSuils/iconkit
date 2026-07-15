# IconKit — reinicio semanal de la caché del CDN (tarea programada: domingos 03:00).
#
# Qué hace: cambia el token de caché "?c=" del CSS en el index.html YA DESPLEGADO.
# Como el CSS (4,5 MB) se cachea 7 días en el navegador y el index.html va con
# "no-cache" (revalida siempre → 304 si no cambió), al cambiar el token:
#   - los navegadores reciben el nuevo index.html al instante (304→200),
#   - vuelven a pedir el CSS una sola vez (nuevo ?c) y lo recachean fresco.
# Resultado: caché agresiva (carga rápida) que se "reinicia" cada domingo sin
# romper nada (nunca sirve una versión a medias).
$ErrorActionPreference = 'Stop'
$idx = 'C:\Inetpub\vhosts\suils.es\iconkit.suils.es\index.html'
$log = 'D:\Documents\iconkit\deploy\cache-refresh.log'
try {
  if (-not (Test-Path $idx)) { throw "no existe $idx" }
  $stamp = Get-Date -Format 'yyyyMMdd'
  $c = [System.IO.File]::ReadAllText($idx)
  # Reemplaza .css?c=<loquesea> por .css?c=<fecha>. Si no había token, lo añade.
  if ($c -match '\.css\?c=[^"'']*') {
    $new = [regex]::Replace($c, '(\.css)\?c=[^"'']*', ('${1}?c=' + $stamp))
  } else {
    $new = [regex]::Replace($c, '(\.css)(")', ('${1}?c=' + $stamp + '${2}'), 1)
  }
  if ($new -ne $c) {
    [System.IO.File]::WriteAllText($idx, $new)
    Add-Content $log ("{0}  reinicio OK -> ?c={1}" -f (Get-Date -Format 's'), $stamp)
  } else {
    Add-Content $log ("{0}  sin cambios (ya en ?c={1})" -f (Get-Date -Format 's'), $stamp)
  }
} catch {
  Add-Content $log ("{0}  ERROR: {1}" -f (Get-Date -Format 's'), $_.Exception.Message)
  exit 1
}
