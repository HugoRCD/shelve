---
title: Audit Logs
description: Review every privileged action performed on your teams, projects, and secrets.
---

Every security-relevant action in Shelve is recorded in an audit log that no API can edit. The feed is scoped to a team and visible from **Team → Audit logs**.

## What gets logged

Among others:

- `team.update`, `team.member.invite`, `team.member.update`, `team.member.remove`
- `team.invitation.accept`, `team.invitation.cancel`
- `project.create`, `project.update` (including sync policy changes), `project.delete`
- `environment.create`, `environment.update`, `environment.delete`
- `variables.read` (from the app and the CLI), `variables.create`, `variables.update`, `variables.delete`
- `token.create`, `token.delete`

Every entry stores the actor, IP, user agent, resource type/id, and a metadata JSON blob. The API enriches each row with human-readable labels — project and environment names, API key prefix, user display name — so clients do not need extra lookups.

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
  Filter by action name (for example `variables.create`). Exact match.
  ::

  ::field{name="actorType" type="string"}
  Filter by actor type: `user`, `token` (an API key), or `system`.
  ::

  ::field{name="projectId" type="number"}
  Filter to events tied to a project (direct resource or metadata).
  ::
::

### Response shape

Each log entry includes enriched fields:

```json
{
  "logs": [
    {
      "id": 42,
      "action": "variables.read",
      "summary": "Read secrets from web-platform / production",
      "actor": { "type": "token", "label": "she_abc… · ci-deploy" },
      "resource": { "type": "environment", "label": "web-platform / production", "href": "/my-team/projects/13" },
      "client": { "label": "Shelve CLI · macOS", "icon": "lucide:terminal", "raw": "..." },
      "metadata": { "projectId": 13, "projectName": "web-platform", "environmentName": "production" }
    }
  ],
  "nextCursor": 41,
  "total": 128
}
```

Pass `nextCursor` back to fetch the next page until it is `null`.

::callout{type="info"}
An audit entry is written before the response is sent. If recording fails, the error is logged to the application logs and the request still succeeds.
::

## Retention

Audit entries are deleted 30 days after they are recorded, and all of a team's entries are deleted with the team. Shelve removes expired entries while it records new events, at most once an hour, so an entry can stay a little longer than 30 days.

On self-hosted deployments, set `NUXT_PRIVATE_AUDIT_RETENTION_DAYS` to keep entries for a different number of days, or to `0` to keep every entry and prune the `audit_logs` table yourself.
