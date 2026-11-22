---
title: API Keys
description: Create, scope, and revoke API keys for the CLI and integrations.
---

API keys let the CLI and any external system authenticate against Shelve. They are managed from your account settings at [app.shelve.cloud/user/api-keys](https://app.shelve.cloud/user/api-keys).

## How API keys are stored

- The plaintext key is **shown exactly once**, at creation. Copy it immediately — Shelve never stores it and cannot retrieve it later.
- Only the SHA-256 hash of the key is written to the database, alongside a non-secret prefix (`she_…` — the first 12 characters). The prefix is what you see in the API key list and in audit logs; it is useful for identifying a key without revealing it.
- A request's key is hashed and looked up by that hash, so the plaintext key is never compared or stored server-side.

::callout{type="info"}
API keys are produced from `crypto.randomBytes(32)` and encoded in [Crockford base32](https://www.crockford.com/base32.html). They are 256 bits of entropy and cannot be brute-forced.
::

## Scoped API keys

By default an API key inherits your account's full access. You can narrow it when creating the key:

::field-group
  ::field{name="permissions" type="('read' | 'write')[]"}
  At least one is required. `read` grants `GET` requests, `write` grants everything else (create, update, delete). A read-only key that tries to create a project or push a variable receives `403 Token missing 'write' permission`.
  ::

  ::field{name="teamIds" type="number[]"}
  Restrict the key to one or more teams. Requests targeting any other team return `403 Token not authorized for this team`, and the team list only shows the allowed teams.
  ::

  ::field{name="projectIds" type="number[]"}
  Restrict the key to specific projects. The key only reaches the teams that own them, and team-wide actions such as creating a project or reading audit logs return `403 Token is restricted to specific projects`.
  ::

  ::field{name="environmentIds" type="number[]"}
  Restrict the key to specific environments. The key only reads and writes variable values in those environments, and project-wide actions such as editing project settings or deleting a variable return `403 Token is restricted to specific environments`. Useful for CI keys that should only read `production` secrets, for example.
  ::
::

Scopes are enforced server-side on every request, so an API key can never outgrow the scope it was issued with. Error messages still say "Token", so scripts that match them keep working.

API keys only work on `GET /api/teams`, the team API (`/api/teams/**`) and `GET /api/user/me`. Creating or revoking API keys, changing your account, and admin actions need a signed-in session, so a leaked key can't mint new keys or take over the account.

## Expiry

Every API key may carry an `expiresAt`. After that date the key is refused with `401` and deleted. Rotating a short-lived CI key is as simple as creating a new one; no restart or config push is required.

## IP allowlist

Optionally attach a list of CIDR blocks to an API key. Requests originating outside those blocks are refused with `401`. Both IPv4 and IPv6 notations are supported.

On self-hosted instances behind a reverse proxy, set [`NUXT_PRIVATE_TRUST_PROXY`](/docs/self-hosting/environment-variables#nuxt_private_trust_proxy) so Shelve checks the client's address instead of the proxy's.

## Audit trail

API key lifecycle events (`token.create`, `token.delete`) and the writes and variable reads made with a key surface in [audit logs](/docs/core-features/audit-logs) with the key prefix, actor, IP, and user agent. Other reads, such as listing teams or `GET /api/user/me`, are not logged. When something looks wrong, revoke the key from the UI — the hash is deleted and the next request using it returns `401`.

## Sending API keys

The CLI and any integration should send the key as an `Authorization: Bearer <key>` header. The CLI reads it from `SHELVE_TOKEN` or `shelve login --token`. The legacy `Cookie: authToken=…` path still works for older CLI builds, but it returns `Deprecation: true` / `Sunset: Wed, 01 Jul 2026 00:00:00 GMT` response headers. That date has passed and the path can be removed at any time — migrate clients to the `Authorization` header now.
