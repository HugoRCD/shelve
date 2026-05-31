export const EXIT_CODES = {
  0: 'Success',
  1: 'CLI, API, or validation error',
  129: 'Parent process gone or stdin EIO',
  130: 'SIGINT (user interrupt, often normalized to 0 in run)',
  143: 'SIGTERM',
} as const

export const CLI_ERROR_CODES: Record<string, { meaning: string, hint?: string }> = {
  AGENT_BLOCKED: {
    meaning: 'shelve pull refused in an AI agent shell without --yes',
    hint: 'Prefer `shelve run -- <cmd>` or pass --yes to write secrets to disk.',
  },
  AUTH_REQUIRED: {
    meaning: 'No API token available',
    hint: 'Set SHELVE_TOKEN or run `shelve login`.',
  },
  DEVICE_LOGIN_DENIED: {
    meaning: 'Browser authorization was denied',
    hint: 'Run `shelve login` again and choose Authorize in the browser.',
  },
  DEVICE_LOGIN_EXPIRED: {
    meaning: 'Device login session expired before approval',
    hint: 'Run `shelve login` again and complete approval within 15 minutes.',
  },
  DEVICE_LOGIN_TIMEOUT: {
    meaning: 'Device login timed out or failed while polling',
    hint: 'Check network and Shelve URL, then run `shelve login` again.',
  },
  CONFIG_MISSING: {
    meaning: 'No shelve.json and required config not provided via env',
    hint: 'Create shelve.json or set SHELVE_TEAM_SLUG and SHELVE_PROJECT.',
  },
  CONFIRMATION_REQUIRED: {
    meaning: 'A confirmation prompt would be shown in interactive mode',
    hint: 'Pass --yes or --non-interactive.',
  },
  FETCH_FAILED: {
    meaning: 'Could not fetch secrets from Shelve',
    hint: 'Check network, token scopes, and offline cache.',
  },
  FORBIDDEN: {
    meaning: 'Token lacks permission for this action',
  },
  INVALID_INPUT: {
    meaning: 'Invalid flag or argument value',
  },
  MISSING_ENV: {
    meaning: 'Environment name is required',
    hint: 'Pass --env or set defaultEnv / SHELVE_DEFAULT_ENV.',
  },
  MISSING_INPUT: {
    meaning: 'Required value missing in non-interactive mode',
  },
  MISSING_PROJECT: {
    meaning: 'Project name is required',
    hint: 'Set project in shelve.json or SHELVE_PROJECT.',
  },
  MISSING_SLUG: {
    meaning: 'Team slug is required',
    hint: 'Set slug in shelve.json or SHELVE_TEAM_SLUG.',
  },
  NOT_FOUND: {
    meaning: 'Resource not found on Shelve',
  },
  OPERATION_FAILED: {
    meaning: 'Generic operation failure',
  },
  PROJECT_NOT_FOUND: {
    meaning: 'Project does not exist and was not auto-created',
  },
  USER_CANCELLED: {
    meaning: 'User aborted an interactive prompt',
  },
  PUSH_BLOCKED: {
    meaning: 'Push is disabled for this environment by sync policy',
    hint: 'Check sync.protectedEnvironments or sync.environments.<env>.allowPush.',
  },
  PULL_BLOCKED: {
    meaning: 'Pull is disabled for this environment by sync policy',
    hint: 'Set sync.environments.<env>.allowPull to true.',
  },
  SYNC_CONFLICT: {
    meaning: 'Local and remote values differ and onPushConflict prevented the push',
    hint: 'Run `shelve diff` or use onPushConflict overwrite/skip/prompt with --yes.',
  },
  ENV_PROTECTED: {
    meaning: 'Server rejected a write to a protected environment',
    hint: 'Update project sync policy in Shelve settings or use a different environment.',
  },
}

export function formatErrorCodesHelp(): string {
  const lines = ['Structured error codes (JSON stderr or `shelve doctor`):']
  for (const [code, { meaning }] of Object.entries(CLI_ERROR_CODES)) {
    lines.push(`  ${code} — ${meaning}`)
  }
  lines.push('')
  lines.push('Exit codes: 0 ok · 1 error · 129 parent/EIO · 130 SIGINT · 143 SIGTERM · 128+n child signal (run)')
  return lines.join('\n')
}
