import { $api } from "../utils/connection.ts";
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { deleteProjectConfig, getProjects, writeProjectConfig } from "../utils/projects.ts";

export default defineCommand({
  meta: {
    name: 'unlink',
    description: 'unlink current project to a remote project',
  },
  async setup() {
    consola.start("Unlinking project...");
    deleteProjectConfig();
    consola.success("Project unlinked successfully");
  },
})
