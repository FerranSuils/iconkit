# IconKit for Python

IconKit — 3000+ monochrome vector icons (outline & solid), single source of truth, currentColor, for every stack.

- **3039 icons** (1570 with a solid variant) across 73 categories, 24×24 grid.
- `iconkit.svg()` returns a self-contained `<svg>` string — drop it into any template.
- Browse and search all icons: **[iconkit.suils.es](https://iconkit.suils.es)**

## Install

```sh
pip install iconkit
```

## Usage

```python
import iconkit

iconkit.svg("home")                                        # outline, 24px, currentColor
iconkit.svg("heart", mode="solid", size=32, color="#e05b4c")
iconkit.names()                                            # all 3039 icon names
iconkit.manifest()                                         # full manifest (categories, keywords, aliases)
```

Works with Django, Flask, Jinja2, FastAPI… mark the string as safe HTML in your template engine.

## License

MIT © Ferran Suils Mora · [suils.es](https://suils.es)
