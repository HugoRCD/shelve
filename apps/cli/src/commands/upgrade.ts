import { isLatestVersion } from "../utils/update.ts";
import { name, version } from "../../package.json";
import { defineCommand } from "citty";
import { exec } from "child_process";
import consola from "consola";

export default defineCommand({
  meta: {
    name: 'upgrade',
    description: 'Upgrade the CLI to the latest version',
  },
  async setup() {
    const latestVersion = await isLatestVersion();
    if (!latestVersion) {
      consola.success('You are using the latest version of Shelve CLI');
    } else {
      consola.start(`Upgrading from ${version} to the latest version...`);
      exec(`npm install -g ${name}`, (err, stdout, stderr) => {
        consola.success('Upgrade completed');
      });
    }
  },
})
