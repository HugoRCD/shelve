import { name, version, description } from "../package.json";
import { checkForUpdates } from "./utils/update.ts";
import { projectPath } from "./utils/config.ts";
import { defineCommand } from "citty";
import consola from "consola";

export const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands: {
    upgrade: () => import("./commands/upgrade").then((r) => r.default),
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
    await checkForUpdates();
  },
  cleanup() {
    /*console.log('cleanup')*/
  }
}) as any;
