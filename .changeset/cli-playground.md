---
"@shelve/cli": patch
---

Add a self-contained `playground/run/` fixture and root `pnpm play` scripts so the full `shelve run` flow can be exercised end-to-end without leaving the repo, hitting the production API, or running the Shelve app.

- A tiny zero-dep `node:http` fake Shelve API (`server.mjs`) seeded with a team / project / 3 environments / variables / a fake token (`seed.json`). Implements the four endpoints `shelve run` calls.
- An orchestrator (`start.mjs`) that boots the server, waits for `/health`, then spawns the locally-stubbed CLI with the right `SHELVE_*` env vars injected and tears the server down on exit / Ctrl-C.
- Root scripts: `pnpm play` (= `shelve run dev`), `pnpm play:start`, `pnpm play:fail`, `pnpm play:watch`, `pnpm play:server` (server only). Each runs `pnpm -C packages/cli stub` first so edits in `packages/cli/src/**` are picked up without a rebuild.
- Two admin endpoints (`POST /__playground/variables`, `POST /__playground/reset`) let you trigger watch-mode reloads from another terminal with a single curl.
- Not part of the pnpm workspace — `pnpm install` ignores it, no host-project lockfile drift can swallow output.

Also fixes two long-standing `shelve run` bugs that the playground surfaced:

- **`shelve run` exited as soon as it had spawned the child, orphaning it.** `runMain(main).then(() => process.exit(0))` in `index.ts` resolved as soon as the `run` command function returned (right after spawn), killing the CLI before the child had done anything. With `stdio: 'inherit'` the orphaned child kept writing to the terminal so things *looked* fine, but signal forwarding, watch mode, exit-code propagation were all broken. Fix: the `run` command now awaits a never-resolving promise; `attachLifecycle`'s `child.on('exit')` is now the only path to `process.exit`, so the CLI lives exactly as long as its child.
- **`--watch --restart-on-change` killed the CLI on the first reload.** Killing the old child fired `child.on('exit')` which called `process.exit(143)` before the new child could spawn. Fix: mark the outgoing child with an `__restarting` flag so its exit handler becomes a no-op while watch is swapping in a replacement.

And a clearer signal when `shelve run <script>` exits suspiciously fast (code 0, < 250ms): the CLI prints a warning pointing at `--debug` and `shelve run -- <pm> <script>` to bypass script resolution. Script-resolution errors are debug-logged instead of being swallowed.
