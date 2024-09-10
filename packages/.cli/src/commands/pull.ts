import { defineCommand } from 'citty'
import consola from 'consola'
import { createEnvFile, getProjectVariable } from '../utils/env'
import { getProjectId } from '../utils/projects'
import { suggestLinkProjects } from '../utils/suggest'

export default defineCommand({
  meta: {
    name: 'pull',
    description: 'Pull variables from the remote project for the specified environment',
  },
  args: {
    env: {
      type: 'string',
      description: 'Environment to pull from',
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
    const variables = await getProjectVariable(projectId, ctx.args.env)
    createEnvFile(variables)
    consola.success('Pulled successfully!')
  },
})
