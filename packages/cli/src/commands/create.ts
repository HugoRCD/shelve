import { defineCommand } from 'citty'
import {
  askText,
  cliIntro,
  cliSuccess,
  createShelveConfig,
  isNonInteractive,
  loadShelveConfig,
} from '../utils'
import { CliError } from '../services/api-error'
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
      description: 'The slug of the team to which you want the project to belong',
    },
  },
  async run({ args }) {
    let { name, slug } = args

    const { project, slug: teamSlug } = await loadShelveConfig()

    cliIntro(name ? `Creating project '${name}'` : 'Creating a new project')

    name = name || project
    slug = slug || teamSlug

    if (!name) {
      if (isNonInteractive()) {
        throw new CliError('Project name is required.', 'MISSING_PROJECT', undefined, 'Pass --name.')
      }
      name = await askText('Enter the name of the project:', 'my-project', project, 'Pass --name.')
    }

    if (!slug) {
      if (isNonInteractive()) {
        throw new CliError('Team slug is required.', 'MISSING_SLUG', undefined, 'Pass --slug or set SHELVE_TEAM_SLUG.')
      }
      slug = await askText('Enter the team slug:', 'my-team-slug', undefined, 'Pass --slug.')
    }

    await ProjectService.createProject(name, slug)

    await createShelveConfig({
      projectName: name,
      slug,
    })

    cliSuccess(
      { name, slug, configPath: 'shelve.json' },
      `Project ${name} created successfully`,
      'create',
    )
  },
})
