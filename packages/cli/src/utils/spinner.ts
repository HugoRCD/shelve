import { spinner } from '@clack/prompts'

const s = spinner()

export async function useLoading<T>(
  message: string,
  callback: () => Promise<T>
): Promise<T> {
  try {
    s.start(message)
    const result = await callback()
    s.stop(message)
    return result
  } catch (error) {
    s.stop(message)
    throw error
  }
}
