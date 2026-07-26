# MewMuze Store backend contract

The GitHub Pages Store is a public static frontend. Its current checkout and library are explicitly mock-only. A production deployment needs a separately hosted HTTPS backend and must never place payment, webhook, entitlement, download-signing, or package-signing secrets in this repository.

## Authentication

Production endpoints require a short-lived authenticated user session. Browser cookies should be `Secure`, `HttpOnly`, and `SameSite=Lax`. Desktop installation tokens are bearer capabilities with a ten-minute maximum lifetime, a single use, and no payment details.

## Endpoints

### `POST /v1/checkout-sessions`

Request:

```json
{ "productId": "mewmuze.space-explorer.v1", "idempotencyKey": "uuid" }
```

Response:

```json
{ "sessionId": "checkout_123", "checkoutUrl": "https://provider.example/...", "expiresAt": 1785000000 }
```

The backend resolves price from its own product table. It never trusts a browser-supplied amount.

### `GET /v1/checkout-sessions/{sessionId}`

Returns `pending`, `paid`, `failed`, `expired`, or `refunded`. A `paid` state is issued only after a verified provider webhook.

### `GET /v1/me/costumes`

Returns owned costume IDs, current versions, entitlement state, update availability, package sizes, and release notes. It does not return provider transaction details.

### `POST /v1/install-tokens`

Request:

```json
{ "costumeId": "mewmuze.space-explorer.v1" }
```

Response:

```json
{ "token": "opaque-random-capability", "expiresAt": 1785000000, "installUrl": "mewmuze://install-costume?token=..." }
```

The endpoint verifies ownership before issuing a random, one-use token. Store only a hash of the token server-side.

### `POST /v1/install-tokens/{token}/exchange`

Called by the desktop app. It validates expiry, replay status, entitlement, product status, and compatible package version. On success it consumes the token and returns costume metadata, a short-lived signed download URL, expected package SHA-256, and a signed local entitlement receipt.

### `POST /v1/downloads`

Returns a short-lived signed package URL only for an owned, active entitlement. URLs should expire in five minutes or less and be scoped to one package version.

### `POST /v1/install-tokens/{token}/refresh`

Requires a valid authenticated session and active entitlement. Refreshes an expired, unused token; it never revives a consumed token.

## Payment webhook

1. Read the raw request body.
2. Verify the provider signature and timestamp.
3. Reject unsupported event types.
4. Deduplicate on provider event ID.
5. Resolve the product and server-owned amount.
6. Record payment and entitlement in one transaction.
7. Return a success response only after durable commit.

Refund or chargeback webhooks mark the entitlement revoked for future downloads. An already verified offline installation is not abruptly disabled; the desktop app may learn revocation during an occasional manual or daily check.

## Errors

Errors use:

```json
{ "error": { "code": "ENTITLEMENT_REQUIRED", "message": "This costume is not owned.", "requestId": "..." } }
```

Do not reveal whether another user owns a product. Common codes include `INVALID_PRODUCT`, `CHECKOUT_EXPIRED`, `ENTITLEMENT_REQUIRED`, `TOKEN_EXPIRED`, `TOKEN_REPLAYED`, `PACKAGE_UNAVAILABLE`, `RATE_LIMITED`, and `VERSION_INCOMPATIBLE`.

## Idempotency and rate limits

- Checkout creation: idempotent for 24 hours by user plus idempotency key.
- Webhooks: idempotent permanently by provider event ID.
- Installation-token creation: 10 per user per 10 minutes.
- Token exchange: 10 attempts per token and 60 per IP per hour.
- Download issuance: 30 per user per day per product.

Return HTTP `429` with `Retry-After` when limited.

## Package signing

Package-signing private keys live only in a restricted signing service. The desktop app and this public repository contain public verification keys only. Rotate keys through versioned `signatureKeyId` values and retain old public keys while supported packages remain installable.
