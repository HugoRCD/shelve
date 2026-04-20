---
"@shelve/cli": patch
---

Add test coverage for the v5 additions — encrypted offline cache (roundtrip / TTL / token rotation / tampering), OS-keychain credentials with XDG file fallback and legacy `~/.shelve` migration, agent-ignore files, `shelve://` secret references, and `parseDuration`. Along the way, `CredentialsService` now creates `$XDG_CONFIG_HOME` on demand so writes no longer fail on freshly provisioned machines.
