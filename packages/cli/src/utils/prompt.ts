import { confirm } from '@clack/prompts'
import { handleCancel } from "./error-handler";

export async function askBoolean(message: string): Promise<symbol | boolean> {
  const response = await confirm({
    message,
  })
  if (!response) return handleCancel('Operation cancelled.')
  return response
}
