# Costume security model

## Trust boundaries

The website catalog is public presentation data and is not trusted for price, entitlement, package hash, or signing decisions. The production commerce backend owns payment and entitlement truth. The Rust desktop installer owns local archive and asset validation.

## Threats and controls

| Threat | Control |
|---|---|
| Executable or active content | Fixed allow-list: JSON, Base64 signature text, PNG, and WebP only |
| ZIP path traversal | Relative forward-slash paths only; reject `.`, `..`, absolute paths, drives, colons, and backslashes |
| ZIP bombs | Bounds on compressed size, expanded size, individual files, entry count, image dimensions, and layer count |
| Tampered package | Ed25519 manifest signature plus SHA-256 for every declared image |
| Fake ownership | Separately signed local entitlement receipt and production token exchange |
| Partial installation | Temporary extraction and atomic directory promotion |
| Downgrade | Semantic-version comparison and explicit user approval policy |
| Token replay | Server-side one-use token state; in-app memory replay protection for mock tokens |
| Arbitrary URL launch | Fixed `mewmuze` scheme, fixed command, bounded token alphabet; no URL or path token parameters |
| Folder deletion escape | Registry-derived path must canonicalize beneath the app costume root |

The Store package verification key is separate from the base-app license key and updater key. Private keys and provider secrets never ship in the executable, public website, sample package, or repository.

## Offline receipts

A receipt includes only costume ID, entitlement ID, issue time, and mode. It contains no card data or payment-provider secrets. Its signature permits offline use after one verified installation. Revocation is checked only during occasional online operations, so temporary connectivity loss never removes a legitimate costume.

## Mock-mode boundary

The current website’s $1–$2 checkout uses browser-local mock ownership. Desktop mock tokens demonstrate safe app launch and confirmation but do not create a production entitlement or download. Signed `.mewcostume` files exercise the complete local verification and installation path.
