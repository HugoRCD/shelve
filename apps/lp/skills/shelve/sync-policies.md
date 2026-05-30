# Sync policies (CLI)

Full docs: https://shelve.cloud/docs/cli/sync-policies

Control **who wins** when local `.env` and Shelve diverge.

## `shelve.json` example

```json
{
  "sync": {
    "protectedEnvironments": ["production", "preview"],
    "default": { "onPushConflict": "overwrite", "pullMode": "replace" },
    "environments": {
      "development": { "sourceOfTruth": "local", "onPushConflict": "overwrite" },
      "production": { "sourceOfTruth": "remote", "allowPush": false, "pullMode": "merge" }
    }
  }
}
```

## Fields

| Field | Values | Effect |
|-------|--------|--------|
| `sourceOfTruth` | `remote` \| `local` | `shelve sync`: pull vs push |
| `onPushConflict` | `overwrite` \| `skip` \| `fail` \| `prompt` | When remote value differs from local |
| `pullMode` | `replace` \| `merge` | `merge` keeps local-only keys |
| `allowPush` / `allowPull` | `boolean` | Hard block → `PUSH_BLOCKED` / `PULL_BLOCKED` |
| `protectedEnvironments` | `string[]` | Sets `allowPush: false` for those envs |

Server project policy **cannot be relaxed** from local config (stricter `allowPush: false` wins).

## Commands

```bash
shelve diff --env staging
shelve push --env staging
shelve sync --dry-run --env production
```

## Env overrides

- `SHELVE_SYNC_ALLOW_PUSH=0` — disable all pushes
- `SHELVE_SYNC_ALLOW_PULL=0` — disable all pulls
