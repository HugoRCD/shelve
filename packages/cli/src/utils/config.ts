import { homedir, hostname } from 'os'
import cp from 'child_process'
import { updateUser, readUser, writeUser } from 'rc9'

export type UserConfig = {
  username: string
  email: string
  authToken: string | null
}

export function loadUserConfig(): UserConfig {
  return readUser('.shelve_config')
}

export function updateUserConfig(config: UserConfig): UserConfig {
  return updateUser(config, '.shelve_config')
}

export function writeUserConfig(config: UserConfig): void {
  return writeUser(config, '.shelve_config')
}

export function projectPath(): string {
  return withTilde(process.cwd())
}

export function withTilde(path: string): string {
  return path.replace(homedir(), '~')
}

export function getComputerName(): string {
  switch (process.platform) {
    case 'win32':
      return process.env.COMPUTERNAME || process.env.USERDOMAIN || 'localhost'
    case 'darwin':
      return cp.execSync('scutil --get ComputerName').toString().trim()
    case 'linux': {
      const prettyname = cp.execSync('hostnamectl --pretty').toString().trim()
      return prettyname === '' ? hostname() : prettyname
    }
    default:
      return hostname()
  }
}
