---
title: Run
description: Inject secrets from Shelve into your application process
---

The `run` command allows you to inject secrets from Shelve into your application process.
This command uses [`ni`](https://github.com/antfu-collective/ni) from [antfu](https://antfu.me/) under the hood to automatically detect you package manager and run the command.

::warning
This command is still experimental and may not work as expected.
::

## Usage

```bash [terminal]
shelve run <command> [options]
```

### Options

::field-group
  ::field{name="command" type="string" required}
  The command to run (e.g. `npm run dev` or `pnpm dev`)
  ::

  ::field{name="env" type="string"}
  The environment to use (e.g. `development`, `staging`, `production`). Defaults to `development`.
  ::
::
