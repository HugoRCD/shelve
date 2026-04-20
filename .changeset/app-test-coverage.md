---
"@shelve/app": patch
---

Add test coverage for the v5 token + auth surface: token generation and hashing invariants, `requireTokenScope` permission / team / project / environment matching, the tokens REST API (plaintext returned once, list hides secrets, bearer auth, cookie deprecation headers, read-only scope enforcement, expiry, revocation), and the `/audit-logs` endpoint (filtering + pagination). The CLI E2E flow now passes `--yes` to `pull` so it stays non-interactive when the harness runs inside an AI-agent environment.
