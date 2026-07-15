# IconKit for Flutter

IconKit — 3000+ monochrome vector icons (outline & solid), single source of truth, currentColor, for every stack.

- **3039 icons** (1570 with a solid variant) across 73 categories, 24×24 grid.
- Tint with any `Color`, scale to any size — rendered with `flutter_svg`.
- Browse and search all icons: **[iconkit.suils.es](https://iconkit.suils.es)**

## Install

```sh
flutter pub add iconkit
```

## Usage

```dart
import 'package:iconkit/iconkit.dart';

IconKitIcon(IconKit.home, size: 24)
IconKitIcon(IconKit.heart, mode: IconKitMode.solid, color: Colors.red)
IconKitIcon('rocket-launch', size: 40) // names are plain strings too
```

- `IconKit.<name>` — the full catalog as constants (e.g. `IconKit.arrowRight` → `'arrow-right'`).
- `IconKitIcon` inherits the ambient `IconTheme` color when `color` is omitted.
- `IconKit.svg(name, mode: …, color: …)` returns the raw SVG string for advanced uses.

Icons whose name starts with a digit are prefixed with `i`: `IconKit.i3dGlasses` → `'3d-glasses'`.

## License

MIT © Ferran Suils Mora · [suils.es](https://suils.es)
