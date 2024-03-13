import { updateUser, readUser, writeUser } from 'rc9'
import { homedir } from 'os'

export type userConfig = {
  username: string
  token?: string
}

export function loadUserConfig(): userConfig {
  return readUser('.shelve_config')
}

export function updateUserConfig(config: userConfig): userConfig {
  return updateUser(config, '.shelve_config')
}

export function writeUserConfig(config: userConfig) {
  return writeUser(config, '.shelve_config')
}

export function projectPath() {
  return withTilde(process.cwd())
}

export function withTilde(path: string) {
  return path.replace(homedir(), '~')
}
