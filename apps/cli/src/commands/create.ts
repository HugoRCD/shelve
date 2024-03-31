import { defineCommand, runCommand } from 'citty'
import consola from 'consola'
import { createProject } from '../utils/projects.ts'
import link from './link.ts'

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
      await createProject(name)
      consola.success(`Project ${ name } created successfully!`)
      const linkProject = await consola.prompt('Do you want to link the project? (y/n)', {
        default: 'y',
        type: 'confirm',
      })
      if (linkProject) {
        await runCommand(link, { rawArgs: [name] }).then(() => {
          consola.success('Project linked successfully!')
        }).catch(() => {
          consola.error('Failed to link the project')
        })
      }
    } catch (e) {
      consola.error('Failed to create project')
    }
  },
})
