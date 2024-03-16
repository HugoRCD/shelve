import { updateUser, readUser, writeUser } from 'rc9'
import { homedir, hostname } from 'os'
import cp from "child_process";

export type userConfig = {
  username: string
  email: string
  authToken: string | null
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

export function getComputerName() {
  switch (process.platform) {
    case "win32":
      return process.env.COMPUTERNAME;
    case "darwin":
      return cp.execSync("scutil --get ComputerName").toString().trim();
    case "linux":
      const prettyname = cp.execSync("hostnamectl --pretty").toString().trim();
      return prettyname === "" ? hostname() : prettyname;
    default:
      return hostname();
  }
}
