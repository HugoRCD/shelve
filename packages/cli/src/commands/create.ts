import { Command } from 'commander'
import { intro, outro } from '@clack/prompts'
import { readPackageJSON } from 'pkg-types'
import { askText, createShelveConfig } from '../utils'
import { ProjectService } from '../services'

export function createCommand(program: Command): void {
  program
    .command('create')
    .alias('c')
    .alias('init')
    .description('Create a new project')
    .option('-n, --name <name>', 'Name of the project')
    .action(async (options) => {
      let { name } = options
      const { name: packageName } = await readPackageJSON()
      intro(name ? `Creating project '${name}'` : 'Creating a new project')

      if (!name)
        name = await askText('Enter the name of the project:', 'my-project', packageName)

      const teamId = await askText('Enter the team ID:', '1')

      await ProjectService.createProject(name, +teamId)

      outro(`Project ${name} created successfully`)

      await createShelveConfig(teamId, name)
    })
}
