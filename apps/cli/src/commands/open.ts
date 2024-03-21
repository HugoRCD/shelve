import { getProjectId } from "../utils/projects.ts";
import { defineCommand } from 'citty'
import { consola } from 'consola'
import open from 'open';

export default defineCommand({
  meta: {
    name: 'open',
    description: 'Open the project in the browser',
  },
  async setup() {
    consola.info('Opening the project in the browser...')
    const projectId = getProjectId();
    if (!projectId) {
      consola.error('No project linked run `shelve link` to link a project');
      return;
    }
    await open(`https://shelve.hrcd.fr/app/project/${ projectId }`);
  },
})
