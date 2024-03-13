import { createEnvFile, getEnvFile } from "./utils/env.ts";
import { defineCommand } from "citty";
import { name, version, description } from "../package.json";
import { checkForUpdates } from "./utils/update.ts";
import { resolve } from 'pathe'
import consola from "consola";
import { projectPath, writeUserConfig } from "./utils/config.ts";

export const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands: {
    pull: () => import("./commands/pull").then((r) => r.default),
    push: () => import("./commands/push").then((r) => r.default),
    whoami: () => import("./commands/whoami").then((r) => r.default),
    login: () => import("./commands/login").then((r) => r.default),
    logout: () => import("./commands/logout").then((r) => r.default),
  },
  async run() {
    consola.info('Welcome to Shelve CLI');
    consola.info(projectPath());
  },
  async setup(ctx) {
    /*const cwd = resolve(<string>ctx.args.cwd || '.')
    console.log('cwd', cwd)*/
    /*await getEnvFile();*/
    await checkForUpdates();
  },
  cleanup() {
    /*console.log('cleanup')*/
  }
}) as any;
