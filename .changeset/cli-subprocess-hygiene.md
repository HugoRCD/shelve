---
"@shelve/cli": patch
---

Fix `shelve run` subprocess handling and add missing dependencies.

- Switch from `tinyexec` + `tree-kill` to `node:child_process.spawn` with proper process-group signal forwarding (`process.kill(-pid, signal)` on POSIX). Resolves the long-standing `childPid` bug where signals were never propagated and child trees were left as zombies.
- Drop the implicit `npx` fallback (~200 ms cold start, broken signals) and use the local `node_modules/.bin/nr` directly when shorthand commands like `pnpm dev` are passed.
- Declare `tinyexec` and `consola` as direct dependencies of `@shelve/cli`. They were transitive-only before, so installs under npm/yarn/bun broke as soon as pnpm hoisting wasn't there to save the day.
