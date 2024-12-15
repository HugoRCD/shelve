import { Command } from 'commander'
import { intro, outro } from '@clack/prompts'
import { askText, createShelveConfig, loadShelveConfig } from '../utils'
import { ProjectService } from '../services'

export function createCommand(program: Command): void {
  program
    .command('create')
    .alias('c')
    .alias('init')
    .description('Create a new project')
    .option('-n, --name <name>', 'Name of the project')
    .option('-s, --slug <slug>', 'Team slug')
    .action(async (options) => {
      let { name, slug } = options

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
    })
}
