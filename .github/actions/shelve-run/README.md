# Shelve Run GitHub Action

Composite action that runs a command with secrets injected from [Shelve](https://shelve.cloud) via `@shelve/cli run`.

## Usage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: ./.github/actions/shelve-run
        with:
          token: ${{ secrets.SHELVE_TOKEN }}
          team-slug: my-team
          project: my-app
          env: ci
          command: pnpm test
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `command` | yes | — | Command after `--` |
| `token` | yes | — | API token |
| `team-slug` | yes | — | Team slug |
| `project` | yes | — | Project name |
| `env` | no | `''` | Environment (or set repo variable `SHELVE_DEFAULT_ENV`) |
| `url` | no | `https://app.shelve.cloud` | Shelve instance URL |
| `cli-version` | no | `5` | `@shelve/cli` npm version (major pin) |

## Notes

- Uses `SHELVE_*` environment variables internally — no token on the command line.
- Passes `--non-interactive` so CI never hangs on prompts.
- Prefer scoped, expiring tokens from [app.shelve.cloud/user/tokens](https://app.shelve.cloud/user/tokens).

## Validate setup first

```yaml
- run: npx @shelve/cli doctor --json
  env:
    SHELVE_TOKEN: ${{ secrets.SHELVE_TOKEN }}
    SHELVE_TEAM_SLUG: my-team
    SHELVE_PROJECT: my-app
```
