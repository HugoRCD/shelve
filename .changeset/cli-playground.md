---
"@shelve/cli": patch
---

Add a self-contained playground (`playground/run/`) and root `pnpm play` script for iterating on `shelve run` locally without publishing.

- `pnpm play` rebuilds the CLI in stub mode (so edits in `packages/cli/src/**` are picked up live) and runs `shelve run dev` inside the playground fixture.
- Variants: `pnpm play:start`, `pnpm play:fail`, `pnpm play:watch`.
- The playground is **not** part of the pnpm workspace — `pnpm install` ignores it, so the host lockfile can't trigger node-modules reinstall prompts that hide silent failures.

Also surface a clearer signal when `shelve run <script>` exits suspiciously fast (code 0, < 250ms): the CLI now prints a warning suggesting `--debug` and `shelve run -- <pm> <script>` to bypass script resolution. Script-resolution errors are also logged in debug mode instead of being swallowed.
