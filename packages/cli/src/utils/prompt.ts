import { confirm } from '@clack/prompts'
import { ErrorHandler } from './error-handler'

export async function askBoolean(message: string): Promise<symbol | boolean> {
  const response = await confirm({
    message,
  })
  if (!response) return ErrorHandler.handleCancel('Operation cancelled.')
  return response
}
