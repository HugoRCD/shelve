import { agent as detectedAgent } from 'std-env'

let jsonMode = false
let quietMode = false
let yesMode = false
let nonInteractiveFlag = false

const GLOBAL_FLAG_NAMES = new Set([
  '--json',
  '--quiet',
  '-q',
  '--yes',
  '-y',
  '--non-interactive',
  '--debug',
])

export const GLOBAL_CLI_ARGS = {
  debug: {
    type: 'boolean' as const,
    description: 'Enable verbose debug logging (or set SHELVE_DEBUG=1)',
    default: false,
  },
  json: {
    type: 'boolean' as const,
    description: 'Output machine-readable JSON on stdout; errors on stderr as JSON',
    default: false,
  },
  quiet: {
    type: 'boolean' as const,
    alias: 'q',
    description: 'Suppress intro/outro/spinners; minimal text output',
    default: false,
  },
  yes: {
    type: 'boolean' as const,
    alias: 'y',
    description: 'Skip confirmation prompts',
    default: false,
  },
  'non-interactive': {
    type: 'boolean' as const,
    description: 'Fail instead of prompting when required input is missing',
    default: false,
  },
}

function hasFlag(argv: string[], ...flags: string[]): boolean {
  return flags.some(flag => argv.includes(flag))
}

export function initCliContextFromArgv(argv: string[] = process.argv): void {
  jsonMode = hasFlag(argv, '--json')
  quietMode = hasFlag(argv, '--quiet', '-q')
  yesMode = hasFlag(argv, '--yes', '-y')
  nonInteractiveFlag = hasFlag(argv, '--non-interactive')

  if (process.env.CI === 'true' || process.env.CI === '1') {
    nonInteractiveFlag = true
  }
}

export function isJson(): boolean {
  return jsonMode
}

export function isQuiet(): boolean {
  return quietMode
}

export function shouldSkipConfirm(): boolean {
  return yesMode
}

export function isAgentShell(): boolean {
  return Boolean(detectedAgent || process.env.AI_AGENT)
}

export function isNonInteractive(): boolean {
  return nonInteractiveFlag || isAgentShell()
}

export function isNonInteractiveExplicit(): boolean {
  return nonInteractiveFlag
}

export function getCommandFromArgv(argv: string[] = process.argv): string | undefined {
  for (const arg of argv.slice(2)) {
    if (GLOBAL_FLAG_NAMES.has(arg)) continue
    if (arg.startsWith('-')) continue
    return arg
  }
  return undefined
}

export function stripGlobalFlags(argv: string[]): string[] {
  return argv.filter(arg => !GLOBAL_FLAG_NAMES.has(arg))
}
