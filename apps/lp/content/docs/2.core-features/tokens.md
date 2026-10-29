---
title: API Tokens
description: Create, scope, and revoke API tokens for the CLI and integrations.
---

API tokens let the CLI and any external system authenticate against Shelve. They are managed from your account settings at [app.shelve.cloud/user/tokens](https://app.shelve.cloud/user/tokens).

## How tokens are stored

- The plaintext value is **shown exactly once**, at creation. Copy it immediately — Shelve never stores it and cannot retrieve it later.
- Only the SHA-256 hash of the token is written to the database, alongside a non-secret prefix (`she_…` — the first 12 characters). The prefix is what you see in the token list and in audit logs; it is useful for identifying a token without revealing it.
- Lookups run in constant time (`timingSafeEqual` on the hash), so there is no side channel that leaks bit-by-bit comparisons.

::callout{type="info"}
Tokens are produced from `crypto.randomBytes(32)` and encoded in [Crockford base32](https://www.crockford.com/base32.html). They are 256 bits of entropy and cannot be brute-forced.
::

## Scoped tokens

By default a token inherits your account's full access. You can narrow it when creating the token:

::field-group
  ::field{name="permissions" type="('read' | 'write')[]"}
  At least one is required. `read` grants `GET` requests, `write` grants everything else (create, update, delete). A read-only token that tries to create a project or push a variable receives `403 Token missing 'write' permission`.
  ::

  ::field{name="teamIds" type="number[]"}
  Restrict the token to one or more teams. Requests targeting any other team return `403 Token not authorized for this team`, and the team list only shows the allowed teams.
  ::

  ::field{name="projectIds" type="number[]"}
  Restrict the token to specific projects. The token only reaches the teams that own them, and team-wide actions such as creating a project or reading audit logs return `403 Token is restricted to specific projects`.
  ::

  ::field{name="environmentIds" type="number[]"}
  Restrict the token to specific environments. The token only reads and writes variable values in those environments, and project-wide actions such as editing project settings or deleting a variable return `403 Token is restricted to specific environments`. Useful for CI tokens that should only read `production` secrets, for example.
  ::
::

Scopes are enforced server-side on every request, so a token can never outgrow the scope it was issued with.

Tokens only work on `GET /api/teams`, the team API (`/api/teams/**`) and `GET /api/user/me`. Creating or revoking tokens, changing your account, and admin actions need a signed-in session, so a leaked token can't mint new tokens or take over the account.

## Expiry

Every token may carry an `expiresAt`. After that date the token is refused with `401 Token expired` even before it is hashed and matched. Rotating a short-lived CI token is as simple as creating a new one; no restart or config push is required.

## IP allowlist

Optionally attach a list of CIDR blocks to a token. Requests originating outside those blocks are rejected with `401 Token not authorized for this network`. Both IPv4 and IPv6 notations are supported.

## Audit trail

Token lifecycle events (`token.create`, `token.delete`) and every authenticated request surface in [audit logs](/docs/core-features/audit-logs) with the token prefix, actor, IP, and user agent. When something looks wrong, revoke the token from the UI — the hash is deleted and the next request using it returns `401`.

## Sending tokens

The CLI and any integration should send the token as an `Authorization: Bearer <token>` header. The legacy `Cookie: authToken=…` path still works for older CLI builds but returns `Deprecation: true` / `Sunset: Wed, 01 Jul 2026 00:00:00 GMT` response headers — migrate clients before that date.
