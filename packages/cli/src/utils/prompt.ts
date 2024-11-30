import { confirm, isCancel, select } from '@clack/prompts'
import { handleCancel } from '.'

export async function askBoolean(message: string): Promise<symbol | boolean> {
  const response = await confirm({
    message,
  })
  if (!response) return handleCancel('Operation cancelled.')
  return response
}

export async function askSelect<T>(message: string, options: { value: T, label: string }[]): Promise<T> {
  const response = await select({
    message,
    // @ts-expect-error - TODO: fix this
    options,
  })
  if (isCancel(response)) handleCancel('Operation cancelled.')
  return response
}
