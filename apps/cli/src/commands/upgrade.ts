import { name, version } from "../../package.json";
import { defineCommand } from "citty";
import consola from "consola";
import { isLatestVersion } from "../utils/update.ts";
import { exec } from "child_process";

export default defineCommand({
  meta: {
    name: 'upgrade',
    description: 'Upgrade the CLI to the latest version',
  },
  async setup() {
    const latestVersion = await isLatestVersion();
    console.log(version);
    if (latestVersion) {
      consola.success('You are using the latest version of Shelve CLI');
    } else {
      consola.start(`Upgrading from ${version} to the latest version...`);
      exec(`npm install -g ${name}`, (error, stdout, stderr) => {
        if (error) {
          consola.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          consola.error(`Error: ${stderr}`);
          return;
        }
        consola.success(`Upgraded to the latest version: ${version}`);
      });
    }
  },
})
