import { cancel } from '@clack/prompts'

export function onCancel(message: string, output?: number = 0): void {
  cancel(message)
  process.exit(output)
}
