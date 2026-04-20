---
"@shelve/cli": patch
"@shelve/app": patch
---

Fix `she_…undefined…` tokens: the Crockford base32 alphabet was missing two
symbols (only 30 chars instead of 32), so two random bits per token mapped to
`undefined` and ended up baked into the literal token string. Switched to the
standard 32-char Crockford alphabet (`0-9` + `A-Z` minus `I/L/O/U`).

Tokens generated before this fix (with `undefined` baked in) keep working —
the hash is deterministic against whatever string was issued — but you should
rotate them: they're shorter than advertised in entropy and noticeably ugly.
