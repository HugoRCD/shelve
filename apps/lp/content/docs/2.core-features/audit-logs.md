---
title: Audit Logs
description: Review every privileged action performed on your teams, projects, and secrets.
---

Every security-relevant action in Shelve is recorded in an append-only audit log. The feed is scoped to a team and visible from **Team → Audit logs**.

## What gets logged

Among others:

- `team.member.invite`, `team.member.remove`
- `project.create`, `project.delete`
- `environment.create`, `environment.update`, `environment.delete`
- `variables.read`, `variables.create`, `variables.update`, `variables.delete`
- `token.create`, `token.delete`

Every entry stores the actor, IP, user agent, resource type/id, and a metadata JSON blob. The API enriches each row with human-readable labels — project and environment names, token prefix, user display name — so clients do not need extra lookups.

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
  Filter by actor type: `user`, `token`, or `system`.
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
Audit writes are fire-and-forget: they never block the originating request. If recording fails, the event is logged to the application logs and the request still succeeds.
::

## Retention

Audit logs are retained indefinitely on the hosted instance. On self-hosted deployments you control the retention policy by pruning the `audit_logs` table directly.
