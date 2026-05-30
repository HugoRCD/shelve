import { existsSync } from 'node:fs'
import { defineCommand } from 'citty'
import type { ShelveConfig } from '@types'
import {
  cacheFilePath,
  CacheService,
  EnvironmentService,
  ProjectService,
} from '../services'
import { BaseService } from '../services/base'
import { CLI_ERROR_CODES, EXIT_CODES } from '../utils/error-codes'
import {
  cliIntro,
  cliSuccess,
  cliSuccessLog,
  cliWarn,
  isAgentShell,
  isJson,
  isNonInteractive,
  isNonInteractiveExplicit,
  loadShelveConfig,
} from '../utils'

export type DoctorCheck = {
  id: string
  status: 'ok' | 'warn' | 'error'
  message: string
  hint?: string
}

const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export default defineCommand({
  meta: {
    name: 'doctor',
    description: 'Validate Shelve CLI setup (config, auth, API, cache) — ideal first step for agents and CI',
  },
  args: {
    env: {
      type: 'string',
      description: 'Environment to test (defaults to defaultEnv from config)',
      required: false,
    },
  },
  async run({ args }) {
    cliIntro('Checking Shelve CLI setup')

    const checks: DoctorCheck[] = []
    let config: ShelveConfig

    try {
      config = await loadShelveConfig(false)
    } catch (err) {
      checks.push({
        id: 'config',
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to load configuration',
        hint: CLI_ERROR_CODES.CONFIG_MISSING?.hint,
      })
      finishDoctor(checks)
      return
    }

    pushConfigChecks(config, checks)

    if (!config.token) {
      finishDoctor(checks)
      return
    }

    try {
      const user = await BaseService.whoAmI(config.url, config.token)
      checks.push({
        id: 'auth',
        status: 'ok',
        message: `Authenticated as ${user.username} <${user.email}>`,
      })
    } catch {
      checks.push({
        id: 'auth',
        status: 'error',
        message: 'Token is present but authentication failed',
        hint: CLI_ERROR_CODES.AUTH_REQUIRED?.hint,
      })
      finishDoctor(checks)
      return
    }

    const envName = args.env || config.defaultEnv
    if (!config.slug || !config.project) {
      finishDoctor(checks)
      return
    }

    if (!envName) {
      checks.push({
        id: 'environment',
        status: 'warn',
        message: 'No environment to test (pass --env or set defaultEnv)',
        hint: CLI_ERROR_CODES.MISSING_ENV?.hint,
      })
    } else {
      await pushApiChecks(config, envName, checks)
    }

    pushAgentChecks(checks)
    finishDoctor(checks)
  },
})

function pushConfigChecks(config: ShelveConfig, checks: DoctorCheck[]): void {
  if (!config.slug) {
    checks.push({
      id: 'slug',
      status: 'error',
      message: 'Team slug is missing',
      hint: CLI_ERROR_CODES.MISSING_SLUG?.hint,
    })
  } else {
    checks.push({ id: 'slug', status: 'ok', message: `Team slug: ${config.slug}` })
  }

  if (!config.project) {
    checks.push({
      id: 'project',
      status: 'error',
      message: 'Project name is missing',
      hint: CLI_ERROR_CODES.MISSING_PROJECT?.hint,
    })
  } else {
    checks.push({ id: 'project', status: 'ok', message: `Project: ${config.project}` })
  }

  if (!config.token) {
    checks.push({
      id: 'token',
      status: 'error',
      message: 'No API token configured',
      hint: CLI_ERROR_CODES.AUTH_REQUIRED?.hint,
    })
  } else {
    checks.push({ id: 'token', status: 'ok', message: 'API token is configured' })
  }

  checks.push({
    id: 'url',
    status: 'ok',
    message: `Shelve URL: ${config.url}`,
  })
}

async function pushApiChecks(
  config: ShelveConfig,
  envName: string,
  checks: DoctorCheck[],
): Promise<void> {
  try {
    const project = await ProjectService.getProjectByName(
      config.project,
      config.slug,
      config.autoCreateProject,
    )
    const environment = await EnvironmentService.getEnvironment(config.slug, envName)
    checks.push({
      id: 'environment',
      status: 'ok',
      message: `Environment "${environment.name}" is reachable`,
    })

    const cacheInput = {
      url: config.url,
      teamSlug: config.slug,
      projectName: config.project,
      environmentName: envName,
    }
    const cachePath = cacheFilePath(cacheInput)
    const cached = config.token
      ? CacheService.read(cacheInput, config.token, DEFAULT_CACHE_TTL_MS)
      : null

    if (cached) {
      checks.push({
        id: 'cache',
        status: 'ok',
        message: `Offline cache hit (${cached.length} variables)`,
      })
    } else if (existsSync(cachePath)) {
      checks.push({
        id: 'cache',
        status: 'warn',
        message: 'Cache file exists but is stale or unreadable with the current token',
        hint: 'Run `shelve run` online once to refresh the cache.',
      })
    } else {
      checks.push({
        id: 'cache',
        status: 'warn',
        message: 'No offline cache for this project/environment',
        hint: 'Run `shelve run` online once before using --offline.',
      })
    }

    checks.push({
      id: 'project_api',
      status: 'ok',
      message: `Project "${project.name}" resolved (id ${project.id})`,
    })
  } catch (err) {
    checks.push({
      id: 'api',
      status: 'error',
      message: err instanceof Error ? err.message : 'API check failed',
      hint: 'Run with --debug for HTTP details.',
    })
  }
}

function pushAgentChecks(checks: DoctorCheck[]): void {
  if (isAgentShell()) {
    checks.push({
      id: 'agent',
      status: 'warn',
      message: 'AI agent shell detected — prefer `shelve run -- <cmd>` over `shelve pull`',
      hint: 'See https://shelve.cloud/docs/cli/agents-automation',
    })
  }

  if (isNonInteractiveExplicit() || process.env.CI === 'true' || process.env.CI === '1') {
    checks.push({
      id: 'non_interactive',
      status: 'ok',
      message: 'Non-interactive mode active (CI or --non-interactive)',
    })
  } else if (isNonInteractive()) {
    checks.push({
      id: 'non_interactive',
      status: 'ok',
      message: 'Non-interactive mode active (agent auto-detection)',
    })
  }
}

function finishDoctor(checks: DoctorCheck[]): never | void {
  const healthy = !checks.some(c => c.status === 'error')
  const warnCount = checks.filter(c => c.status === 'warn').length

  const data = {
    healthy,
    checks,
    exitCodes: EXIT_CODES,
    errorCodes: Object.fromEntries(
      Object.entries(CLI_ERROR_CODES).map(([code, meta]) => [code, meta.meaning]),
    ),
  }

  if (isJson()) {
    cliSuccess(data, undefined, 'doctor')
  } else {
    for (const check of checks) {
      if (check.status === 'ok') cliSuccessLog(`✓ ${check.message}`)
      else if (check.status === 'warn') cliWarn(`${check.message}${check.hint ? ` — ${check.hint}` : ''}`)
      else cliWarn(`✗ ${check.message}${check.hint ? ` — ${check.hint}` : ''}`)
    }
    if (healthy && warnCount === 0) {
      cliSuccess(undefined, 'All checks passed', 'doctor')
    } else if (healthy) {
      cliSuccess(undefined, `Passed with ${warnCount} warning(s)`, 'doctor')
    }
  }

  if (!healthy) process.exit(1)
}
