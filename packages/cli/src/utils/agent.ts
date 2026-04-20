/**
 * Detect whether the current process is running under a known AI coding agent.
 * Used to refuse or warn before writing plaintext secrets to disk.
 *
 * The list is best-effort: any new agent that wraps a shell will eventually
 * leak some env var. Pull requests welcome to extend it.
 */
const AGENT_ENV_FLAGS = [
  'CURSOR_TRACE_ID',
  'CLAUDECODE',
  'CLAUDE_CODE',
  'AIDER_VERSION',
  'AIDER_WORKING_DIR',
  'CONTINUE_DEV',
  'CODEIUM_API_KEY',
  'WINDSURF_DEV',
  'COPILOT_AGENT',
  'CODEX_CLI',
] as const

export function detectAgent(env: NodeJS.ProcessEnv = process.env): string | null {
  for (const key of AGENT_ENV_FLAGS) {
    if (env[key]) return key.toLowerCase().replace(/_.*/, '')
  }
  if (env.TERM_PROGRAM === 'vscode' && env.VSCODE_GIT_IPC_HANDLE && env.CURSOR_USER) return 'cursor'
  if (env.TERM_PROGRAM === 'vscode' && env.GITHUB_COPILOT_AGENT) return 'copilot'
  return null
}

export function isAgentEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return detectAgent(env) !== null
}
