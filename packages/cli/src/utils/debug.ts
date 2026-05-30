import consola from 'consola'

let debugEnabled
  = process.env.DEBUG === 'true'
    || process.env.SHELVE_DEBUG === '1'
    || process.env.SHELVE_DEBUG === 'true'

export function isDebug(): boolean {
  return debugEnabled
}

export function setDebug(enabled: boolean): void {
  debugEnabled = enabled
}

export function initDebugFromArgv(argv: string[] = process.argv): void {
  if (argv.includes('--debug')) {
    setDebug(true)
  }
}

export function debugLog(message: string, detail?: unknown): void {
  if (!isDebug()) return
  if (detail === undefined) consola.debug(message)
  else consola.debug(message, detail)
}
