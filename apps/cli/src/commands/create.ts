import { defineCommand } from 'citty'
import consola from 'consola'
import { createProject } from '../utils/projects.ts'
import { suggestLinkProject } from '../utils/suggest.ts'

export default defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new project',
  },
  args: {
    name: {
      type: 'string',
      description: 'Project name',
      valueHint: 'my-project',
      required: true,
      alias: 'n',
    },
  },
  async setup(ctx) {
    const name = ctx.args.name
    consola.start(`Creating project ${ name }...`)
    try {
      let project = await createProject(name)
      consola.success(`Project ${ name } created successfully!`)
      const linkedProject = await suggestLinkProject(name)
      if (linkedProject) {
        project = linkedProject
      }
      return project
    } catch (e) {
      consola.error('Failed to create project')
    }
  },
})
