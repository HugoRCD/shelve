import { Command } from 'commander'
import { intro, isCancel, outro, text } from '@clack/prompts'
import { readPackageJSON } from 'pkg-types'
import { createShelveConfig, handleCancel } from '../utils'
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

      if (!name) {
        name = await text({
          message: 'Enter the name of the project:',
          placeholder: 'my-project',
          initialValue: packageName,
          validate(value) {
            if (value.length === 0) return `Value is required!`
          },
        })

        if (isCancel(name)) handleCancel('Operation cancelled.')
      }

      await ProjectService.createProject(name)

      outro(`Project ${name} created successfully`)

      await createShelveConfig(name)
    })
}
