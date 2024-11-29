import { cancel } from '@clack/prompts'

export function handleCancel(message: string): never {
  cancel(message)
  process.exit(1)
}
