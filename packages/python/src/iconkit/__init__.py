"""IconKit — iconos SVG. iconkit.svg("home", mode="solid", size=20, color="#e05b4c")"""
from ._data import ICONS

_OUTLINE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
_SOLID = 'fill="currentColor" stroke="none"'

def names():
    return sorted(ICONS.keys())

def svg(name, mode="outline", size=24, color="currentColor"):
    rec = ICONS.get(name)
    if rec is None:
        raise KeyError(f"icono desconocido: {name}")
    solid = mode == "solid" and rec[1] is not None
    inner = rec[1] if solid else rec[0]
    if solid:
        wrap = f'fill="{color}" stroke="none"'
    else:
        wrap = f'fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
            f'viewBox="0 0 24 24" {wrap} aria-hidden="true">{inner}</svg>')

__version__ = "1.0.1"

def manifest():
    """Return the full icon manifest (icons, categories, keywords, aliases) as a dict."""
    import json, os
    with open(os.path.join(os.path.dirname(__file__), "manifest.json"), encoding="utf-8") as f:
        return json.load(f)
