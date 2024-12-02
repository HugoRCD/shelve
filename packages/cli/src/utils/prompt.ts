import { confirm, isCancel, select, text, password } from '@clack/prompts'
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

export async function askText(message: string, placeholder?: string, initialValue?: string): Promise<string> {
  const response = await text({
    message,
    placeholder,
    initialValue,
    validate(value) {
      if (value.length === 0) return 'Value is required!'
    },
  })
  if (isCancel(response)) handleCancel('Operation cancelled.')
  return response
}

export async function askPassword(message: string): Promise<string> {
  const response = await password({
    message,
    validate(value) {
      if (value.length === 0) return 'Value is required!'
    },
  })
  if (isCancel(response)) handleCancel('Operation cancelled.')
  return response
}
