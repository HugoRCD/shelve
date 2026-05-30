export { debugLog, initDebugFromArgv, isDebug, setDebug } from './utils/debug'
export {
  GLOBAL_CLI_ARGS,
  initCliContextFromArgv,
  isAgentShell,
  isJson,
  isNonInteractive,
  isNonInteractiveExplicit,
  isQuiet,
  shouldSkipConfirm,
} from './utils/cli-context'

export const DEFAULT_ENV_FILENAME = '.env'
