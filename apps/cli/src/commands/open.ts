import { defineCommand } from 'citty'
import { consola } from 'consola'
import open from 'open'
import { getProjectId } from '../utils/projects.ts'
import { suggestLinkProjects } from '../utils/suggest.ts'

export default defineCommand({
  meta: {
    name: 'open',
    description: 'Open the project in the browser',
  },
  async setup() {
    consola.info('Opening the project in the browser...')
    let projectId = getProjectId()
    if (!projectId) {
      consola.error('The current project is not linked to a remote project')
      const linkedProject = await suggestLinkProjects()
      if (linkedProject) {
        projectId = linkedProject.id
      } else {
        return
      }
    }
    open(`https://shelve.hrcd.fr/app/project/${ projectId }`).then(r => r)
  },
})
