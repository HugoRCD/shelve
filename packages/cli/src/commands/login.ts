import { Command } from 'commander'
import inquirer from 'inquirer'

export function loginCommand(program: Command) {
  program
    .command('login')
    .description('Login to Shelve')
    .action(async () => {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Enter your username:'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password:'
        }
      ])

      console.log('Successfully logged in as', answers.username)
    })
}
