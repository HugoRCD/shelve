import { defineCommand } from 'citty'
import { consola } from 'consola'
import type { Project } from '@shelve/types'
import { getProjectByName, getProjects, writeProjectConfig } from '../utils/projects'
import { suggestCreateProject } from '../utils/suggest'

export default defineCommand({
  meta: {
    name: 'link',
    description: 'Link current project to a remote project',
  },
  args: {
    name: {
      type: 'string',
      description: 'Name of the project to link',
      valueHint: 'project-name (case-insensitive)',
      default: '',
      alias: 'n',
    }
  },
  async run(ctx) {
    const { name } = ctx.args
    if (name) {
      consola.start(`Fetching project ${name}...`)
      const project = await getProjectByName(name)
      if (!project) {
        consola.error(`Project with name ${name} not found`)
        await suggestCreateProject(name)
        return
      }
      writeProjectConfig(project)
      consola.success(`Project ${name} linked successfully`)
      process.exit(0)
    }
    consola.start('Fetching projects...')
    const projects = await getProjects()
    if (!projects.length) {
      consola.error('No projects found')
      await suggestCreateProject(name)
      return
    }

    try {
      const selectedProject = await consola.prompt('Select a project to link', {
        type: 'select',
        options: projects.map((project: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          label: project.name,
          value: project.id
        })),
      }) as unknown as number

      const project = projects.find((project: Project) => project.id === selectedProject)
      if (!project) {
        consola.error('An error occurred while selecting the project')
        return
      }

      writeProjectConfig(project)
      consola.success('Project linked successfully')
      return project
    } catch (e) {
      consola.error('An error occurred while selecting the project')
    }
  },
})
