import { confirm } from '@clack/prompts'
import { onCancel } from './index'

export async function askBoolean(message: string): Promise<symbol | boolean> {
  const response = await confirm({
    message,
  })
  if (!response) return onCancel('Operation cancelled.')
  return response
}
