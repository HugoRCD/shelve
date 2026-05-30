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

function argvBeforeDoubleDash(argv: string[]): string[] {
  const index = argv.indexOf('--')
  return index >= 0 ? argv.slice(0, index) : argv
}

export function initCliContextFromArgv(argv: string[] = process.argv): void {
  const cliArgv = argvBeforeDoubleDash(argv)
  jsonMode = hasFlag(cliArgv, '--json')
  quietMode = hasFlag(cliArgv, '--quiet', '-q')
  yesMode = hasFlag(cliArgv, '--yes', '-y')
  nonInteractiveFlag = hasFlag(cliArgv, '--non-interactive')

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
    if (arg === '--') break
    if (GLOBAL_FLAG_NAMES.has(arg)) continue
    if (arg.startsWith('-')) continue
    return arg
  }
  return undefined
}

export function stripGlobalFlags(argv: string[]): string[] {
  const result: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === undefined) continue
    if (arg === '--') {
      result.push(...argv.slice(i))
      break
    }
    if (!GLOBAL_FLAG_NAMES.has(arg)) {
      result.push(arg)
    }
  }
  return result
}
