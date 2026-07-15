# IconKit for .NET

IconKit — 3000+ monochrome vector icons (outline & solid), single source of truth, currentColor, for every stack.

- **3039 icons** (1570 with a solid variant) across 73 categories, 24×24 grid.
- Zero dependencies, `netstandard2.0` — works on .NET Framework 4.6.2+, .NET Core, .NET 5+.
- Browse and search all icons: **[iconkit.suils.es](https://iconkit.suils.es)**

## Install

```sh
dotnet add package IconKit
```

## Usage

```csharp
using IconKitLib;

string svg = IconKit.Svg("home");                                        // outline, 24px, currentColor
string red = IconKit.Svg("heart", mode: "solid", size: 32, color: "#e05b4c");
IconKit.Names();                                                         // all 3039 names
IconKit.Has("rocket-launch");                                            // true
string name = IconKit.Home;                                              // catalog constants
```

Emit the string anywhere HTML is rendered — Razor Pages, MVC, minimal APIs, e-mail templates…
In Razor use `@Html.Raw(IconKit.Svg("home"))`.

## Blazor

A ready-made component ships inside the package as content (`IkIcon.razor`).
Copy it from the NuGet cache (or from `content/IkIcon.razor` in the package) into your project:

```razor
<IkIcon Name="home" />
<IkIcon Name="heart" Mode="solid" Size="32" Color="#e05b4c" />
```

Icons whose name starts with a digit are prefixed with `I`: `IconKit.I3dGlasses` → `"3d-glasses"`.

## License

MIT © Ferran Suils Mora · [suils.es](https://suils.es)
