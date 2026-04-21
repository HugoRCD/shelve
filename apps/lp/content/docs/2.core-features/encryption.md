---
title: Encryption
description: How Shelve protects secrets at rest and in transit.
---

Shelve treats every secret value as encrypted data until the very moment you need it. This page describes the encryption scheme, the key hierarchy, and what actually hits the database.

## Two-tier envelope encryption

Secret values are never encrypted directly with the global server key. Instead Shelve uses an envelope scheme:

```
value ──seal──▶ ciphertext     (key = DEK, per-project)
DEK   ──seal──▶ encryptedDek   (key = KEK, platform-wide)
```

- **KEK** — *Key Encryption Key*. A single secret sourced from `NUXT_PRIVATE_ENCRYPTION_KEY` at boot. It never touches stored data directly; it is only used to seal and unseal DEKs.
- **DEK** — *Data Encryption Key*. Generated server-side on a project's first write (32 random bytes, base64-encoded), sealed with the KEK, and persisted in `projects.encryptedDek`. From then on every variable on that project is encrypted with that DEK.

The sealing primitive underneath is [`iron-webcrypto`](https://github.com/brc-dd/iron-webcrypto), configured with authenticated encryption (`aes-256-gcm`). A tampered ciphertext fails to decrypt — there is no silent downgrade.

## Why envelope encryption?

::card-group
  ::card{icon="i-lucide-zap"}
  #title
  Fast key rotation

  #description
  Rotating a project's DEK only re-encrypts that project's variables. A platform-wide rotation changes only the KEK; every sealed DEK is re-sealed once and business continues.
  ::

  ::card{icon="i-lucide-shield"}
  #title
  Scoped blast radius

  #description
  A leaked DEK compromises one project, not every secret on the instance. The KEK never leaves the server.
  ::

  ::card{icon="i-lucide-layers"}
  #title
  BYOK-ready

  #description
  The DEK layer is the seam where hardware-backed key storage (KMS, HSM, passkeys) will plug in without touching application code.
  ::
::

## Backward compatibility

Projects created before the envelope upgrade have no `encryptedDek` column value. Their variables keep decrypting directly with the KEK and the first new write provisions a DEK automatically. Reads tolerate mixed-state data: the service tries the project DEK first, then falls back to the KEK so no variable is left unreadable during the transition.

## What is stored in the database

| Column | What it holds |
|---|---|
| `variables.encryptedValue` | Sealed ciphertext of the secret value. Never plaintext. |
| `projects.encryptedDek` | Project DEK, sealed by the KEK. `null` for pre-envelope projects. |
| `tokens.hash` | `sha256(token)` as hex. The plaintext token is never stored. |
| `tokens.prefix` | Non-secret 12-char prefix used for display and audit logs. |

## API tokens

API tokens follow a different (but compatible) model: they are hashed, not encrypted. See [API Tokens](/docs/core-features/tokens) for the full story.

## In transit

Traffic to `app.shelve.cloud` uses TLS 1.3 end-to-end. The CLI pins the same endpoint and refuses downgrade. For self-hosted instances, configure HTTPS at your reverse proxy or platform.

## Self-host checklist

1. Generate a strong KEK: `openssl rand -base64 48`.
2. Set it as `NUXT_PRIVATE_ENCRYPTION_KEY` on your platform.
3. **Never** rotate the KEK in-place without re-sealing existing DEKs — existing data becomes unreadable. A safe rotation procedure is on the [roadmap](https://github.com/HugoRCD/shelve/issues).
4. Back up `projects.encryptedDek` alongside `variables.encryptedValue`; losing either makes the corresponding data unrecoverable.
