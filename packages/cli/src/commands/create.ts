import { intro, outro } from '@clack/prompts'
import { defineCommand } from 'citty'
import { askText, createShelveConfig, loadShelveConfig } from '../utils'
import { ProjectService } from '../services'

export default defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new project and its config',
  },
  args: {
    name: {
      type: 'string',
      description: 'The name of the project you want to create',
      required: false,
    },
    slug: {
      type: 'string',
      description: 'The slug of the team to which you want the project to belong'
    }
  },
  async run({ args }) {
    let { name, slug } = args

    const { project, slug: teamSlug } = await loadShelveConfig()

    intro(name ? `Creating project '${name}'` : 'Creating a new project')

    name = name || project
    slug = slug || teamSlug

    if (!name) name = await askText('Enter the name of the project:', 'my-project', project)

    if (!slug) slug = await askText('Enter the team slug:', 'my-team-slug')

    await ProjectService.createProject(name, slug)

    outro(`Project ${name} created successfully`)

    await createShelveConfig({
      projectName: name,
      slug,
    })
  }
})
