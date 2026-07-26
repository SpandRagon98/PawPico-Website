# Desktop costume integration

MewMuze owns all package validation and installation in Rust. The React Appearance Studio is a presentation layer and cannot bypass validation.

## Entry points

- `mewmuze://install-costume?token=<opaque-token>`
- Opening an associated `.mewcostume` file
- Choosing **Install package…** in Appearance Studio

All three show an explicit confirmation interface. A Store token is strictly character-, length-, expiry-, entitlement-, and replay-validated. It cannot contain a local path or arbitrary remote URL.

## Installation

Packages install beneath the Tauri per-user local application-data directory:

```text
<app-local-data>/Costumes/<costume-id>/<version>/
```

The application downloads or reads into temporary storage, verifies the package and receipt, extracts only allow-listed assets into a temporary directory, and atomically renames that directory. Failed operations clean temporary files and leave the registry and existing versions unchanged.

`installed-costumes.json` records only costume ID, version, installation time, local location, signature status, entitlement identifier, and enabled state.

## Rendering

The procedural cat remains the base. A selected costume contributes transparent view overlays that are composited into the sprite before normal scaling, mirroring, and mochi deformation. This preserves gaze, eyes, expressions, animation timing, cursor tracking, movement, dragging, and physics.

The user’s body is never changed silently. If the selected package does not support it, Appearance Studio lists supported bodies and requires the user to choose one.

## Lifecycle

- Select: loads verified local assets and persists the costume ID.
- Disable: unloads the visual without removing files.
- Uninstall: confirms, clears the selected costume if necessary, removes only the registered costume folder, and preserves all unrelated appearance settings.
- Update: manual or at most once daily; validates like a new install and promotes atomically.
- Offline: a successfully installed costume uses its signed local receipt without requiring a startup network check.
