import { defineCommand } from 'citty'
import consola from 'consola'
import { pushProjectVariable } from '../utils/env.ts'
import { getProjectId } from '../utils/projects.ts'

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
    const projectId = getProjectId()
    if (!projectId) {
      consola.error('Project is not linked run `shelve link` to link the project')
      return
    }
    await pushProjectVariable(projectId, ctx.args.env)
    consola.success('Pushed successfully!')
  },
})
