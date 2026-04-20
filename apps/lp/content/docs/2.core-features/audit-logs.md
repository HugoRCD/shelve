---
title: Audit Logs
description: Review every privileged action performed on your teams, projects, and secrets.
---

Every security-relevant action in Shelve is recorded in an append-only audit log. The feed is scoped to a team and visible to members with at least the required role.

## What gets logged

Among others:

- `team.create`, `team.update`, `team.delete`, `team.member.add`, `team.member.role.update`, `team.member.remove`
- `project.create`, `project.update`, `project.delete`
- `environment.create`, `environment.update`, `environment.delete`
- `variable.create`, `variable.update`, `variable.delete`, `variable.pull`, `variable.sync.github`
- `token.create`, `token.delete`

Every entry stores:

- the **actor** (`user` with an id, `token` with the non-secret prefix, or `system` for scheduled jobs);
- the **IP** (respecting the `X-Forwarded-For` chain on serverless / edge hosts);
- the **user agent** (truncated to 256 chars);
- the **resource** type and id;
- an opaque **metadata** JSON blob — for example `{ "scopes": { "permissions": ["read"] } }` on `token.create` or `{ "count": 4 }` on `variable.create`.

::callout{type="info"}
Audit writes are fire-and-forget: they never block the originating request. If recording fails, the event is logged to the application logs and the request still succeeds.
::

## API

Retrieve logs via the REST API:

```bash [terminal]
curl https://app.shelve.cloud/api/teams/<slug>/audit-logs \
  -H "Authorization: Bearer $SHELVE_TOKEN"
```

### Query parameters

::field-group
  ::field{name="limit" type="number" default="50"}
  Number of entries to return. Between 1 and 100.
  ::

  ::field{name="cursor" type="number"}
  `id` of the last entry seen on the previous page. The API returns entries with smaller ids (newest first).
  ::

  ::field{name="action" type="string"}
  Filter by action name (for example `variable.create`). Exact match.
  ::
::

The response includes a `nextCursor` field — pass it back to fetch the next page until it is `null`.

## Retention

Audit logs are retained indefinitely on the hosted instance. On self-hosted deployments you control the retention policy by pruning the `audit_logs` table directly.
