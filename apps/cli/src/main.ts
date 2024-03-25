import { version, description } from "../package.json";
import { checkForUpdates } from "./utils/update.ts";
import { defineCommand } from "citty";

export const main = defineCommand({
  meta: {
    name: "shelve",
    version,
    description,
  },
  subCommands: {
    upgrade: () => import("./commands/upgrade").then((r) => r.default),
    link: () => import("./commands/link").then((r) => r.default),
    unlink: () => import("./commands/unlink").then((r) => r.default),
    pull: () => import("./commands/pull").then((r) => r.default),
    push: () => import("./commands/push").then((r) => r.default),
    whoami: () => import("./commands/whoami").then((r) => r.default),
    login: () => import("./commands/login").then((r) => r.default),
    logout: () => import("./commands/logout").then((r) => r.default),
    open: () => import("./commands/open").then((r) => r.default),
  },
  async setup(ctx) {
    await checkForUpdates();
  },
  cleanup() {
    /*console.log('cleanup')*/
  }
}) as any;
