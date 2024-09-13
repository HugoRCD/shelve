import { Command } from 'commander'
import { intro, isCancel, outro, text } from '@clack/prompts'
import { createProject } from '../utils/project'
import { onCancel } from '../utils'
import { createShelveConfig } from '../utils/config'

export function createCommand(program: Command): void {
  program
    .command('create')
    .alias('c')
    .alias('init')
    .description('Create a new project')
    .option('-n, --name <name>', 'Name of the project')
    .action(async (options) => {
      let { name } = options
      intro(name ? `Creating project ${name}` : 'Creating a new project')

      if (!name) {
        name = await text({
          message: 'Enter the name of the project:',
          placeholder: 'my-project',
          validate(value) {
            if (value.length === 0) return `Value is required!`
          },
        })

        if (isCancel(name)) onCancel('Operation cancelled.')
      }

      await createProject(name)

      outro(`Project ${name} created successfully`)

      await createShelveConfig(name)
    })
}
