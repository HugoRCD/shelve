import { defineCommand } from 'citty'
import consola from 'consola'
import { pushProjectVariable } from '../utils/env'
import { getProjectId } from '../utils/projects'
import { suggestLinkProjects } from '../utils/suggest'

export default defineCommand({
  meta: {
    name: 'push',
    description: 'Pushes the local environment variables to the remote project for the specified environment',
  },
  args: {
    env: {
      type: 'string',
      description: 'Environment to push to',
      valueHint: 'production|prod|preview|development|dev',
      default: 'development',
      alias: 'e',
    },
  },
  async run(ctx) {
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
    await pushProjectVariable(projectId, ctx.args.env)
    consola.success('Pushed successfully!')
  },
})
