---
"@shelve/cli": patch
---

Add a self-contained `playground/run/` fixture and root `pnpm play` scripts so the full `shelve run` flow can be exercised end-to-end without leaving the repo, hitting the production API, or running the Shelve app.

- A tiny zero-dep `node:http` fake Shelve API (`server.mjs`) seeded with a team / project / 3 environments / variables / a fake token (`seed.json`). Implements the four endpoints `shelve run` calls.
- An orchestrator (`start.mjs`) that boots the server, waits for `/health`, then spawns the locally-stubbed CLI with the right `SHELVE_*` env vars injected and tears the server down on exit / Ctrl-C.
- Root scripts: `pnpm play` (= `shelve run dev`), `pnpm play:start`, `pnpm play:fail`, `pnpm play:watch`, `pnpm play:server` (server only). Each runs `pnpm -C packages/cli stub` first so edits in `packages/cli/src/**` are picked up without a rebuild.
- Two admin endpoints (`POST /__playground/variables`, `POST /__playground/reset`) let you trigger watch-mode reloads from another terminal with a single curl.
- Not part of the pnpm workspace — `pnpm install` ignores it, no host-project lockfile drift can swallow output.

Also fixes several long-standing `shelve run` correctness and cross-platform bugs the playground surfaced:

- **CLI orphaned its own child.** `runMain(main).then(() => process.exit(0))` resolved as soon as the `run` command function returned (right after spawn), killing the CLI before the child had done anything. With `stdio: 'inherit'` the orphaned child kept writing to the terminal so it *looked* fine, but signal forwarding, watch mode and exit-code propagation were all broken. Fix: the `run` command awaits a never-resolving promise; `child.on('exit')` is now the only path to `process.exit`.
- **`--watch --restart-on-change` killed the CLI on the first reload.** Killing the old child fired its exit handler which called `process.exit(143)` before the new child could spawn. Fix: mark the outgoing child with `__restarting` so its exit handler is a no-op while watch is swapping in a replacement.
- **Signal handler leak in watch mode.** Each respawn registered fresh `process.on(SIGINT|TERM|HUP)` listeners. After 10 reloads Node warned. Fix: register process-level signal handlers exactly once and have them target the current child via a module-level ref.
- **`process.kill(-pid, …)` doesn't work on Windows.** Replaced everywhere with `tree-kill`, which uses `taskkill /F /T` on Windows and process-group kill on Unix. Dropped `detached: true` on spawn — no longer needed for cleanup and was what made the CLI miss `SIGHUP` when the terminal closed.
- **Package-manager shims (`pnpm.cmd`, `npm.cmd`, `yarn.cmd`) didn't spawn on Windows.** Node's `spawn` doesn't resolve `.cmd` without a shell. Now uses `shell: true` on Windows (the shim chain is killed correctly thanks to `tree-kill`).
- **Parent-death watchdog.** Both the CLI's `run` command and the playground orchestrator poll their original `ppid` with `process.kill(ppid, 0)` every 2s. If the parent disappears (terminal force-quit, parent SIGKILL'd, Cursor crashed, …), the child tears down its own subtree instead of running orphaned forever and spamming `setRawMode EIO` into whatever terminal it ended up attached to.
- **Suspiciously-fast exit warning.** If a spawned child exits cleanly in <250ms (probably script-resolution went wrong), the CLI now prints a warning pointing at `--debug` and `shelve run -- <pm> <script>` to bypass script resolution. Script-resolution errors are debug-logged instead of swallowed.

Smoke-tested all variants — SIGINT, terminal SIGHUP, parent `kill -9`, watch+restart, failing exit codes — on macOS. No orphans, ports always released, exit codes always propagated.
