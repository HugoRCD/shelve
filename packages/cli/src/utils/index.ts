import { cancel } from '@clack/prompts'

export function onCancel(message: string, output: number = 0): never {
  cancel(message)
  process.exit(output)
}
