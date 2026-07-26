# MewMuze costume package format

`.mewcostume` is a ZIP container treated as untrusted, declarative input. It is not a plugin system and never contains executable code.

## Version 1 layout

```text
sample.mewcostume
├── manifest.json
├── signature.ed25519
├── entitlement.json
├── entitlement.ed25519
├── thumbnail.png
├── preview.png
└── assets/
    ├── body-front.png
    ├── body-side.png
    └── body-back.png
```

The canonical manifest schema is published at `public/store/specs/costume-manifest.schema.json`. Manifest and entitlement signatures are Base64-encoded Ed25519 signatures over the exact corresponding JSON bytes.

## Visual layers

Each package declares at most one overlay for each `front`, `side`, `back`, or `all` view. A layer is a transparent PNG or WebP drawn over the procedural cat. `offsetX`, `offsetY`, `scale`, and `opacity` are bounded declarative values. Eyes, facial expressions, physics, movement, props, and application behavior remain owned by MewMuze.

## Limits

- Compressed package: 20 MB maximum
- Expanded package: 32 MB maximum
- Individual file: 5 MB maximum
- Archive entries: 64 maximum
- Image dimension: 2048 × 2048 maximum
- Visual layers: 12 maximum
- Image formats: PNG and WebP only

Absolute paths, `..`, backslashes, executable formats, scripts, HTML, SVG, DLLs, native plugins, remote code, and undeclared files are rejected. Every declared image must have an exact lowercase SHA-256 hash in `assetHashes`.

## Compatibility and updates

`minimumAppVersion` and optional `maximumAppVersion` use semantic versioning. Package updates use the same validation path as first installation. The old installed version remains available until the new version has validated and been atomically promoted.

The base MewMuze installer does not bundle commercial package assets.
