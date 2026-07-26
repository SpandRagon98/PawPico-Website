# Publishing a MewMuze costume

1. Create wholly original or properly licensed transparent PNG/WebP overlays.
2. Author front, side, and back layers on a 128 × 128 transparent canvas. Keep eyes and facial areas open unless the design intentionally frames them.
3. Test every supported body, movement, rest pose, left/right mirroring, and mochi drag.
4. Create thumbnail and preview images.
5. Compute lowercase SHA-256 for every declared image and add exact entries to `assetHashes`.
6. Validate `manifest.json` against `public/store/specs/costume-manifest.schema.json`.
7. Issue a minimal entitlement receipt from the approved commerce service.
8. Sign the exact manifest and entitlement JSON bytes with the restricted Ed25519 Store signing service.
9. ZIP only the approved files and rename the archive to `.mewcostume`.
10. Test invalid hash, signature, traversal, oversize, incompatible-app, duplicate-install, update, rollback, disable, uninstall, and offline behavior before release.

Never include private signing keys, scripts, HTML, SVG, DLLs, executables, installers, source code, absolute paths, or remote-code references. Never publish third-party characters, logos, or costume designs without documented permission.

Use a new semantic version for every released package. Never replace bytes behind an existing version. Production catalog metadata, signed package hash, and entitlement product ID must agree before release.
