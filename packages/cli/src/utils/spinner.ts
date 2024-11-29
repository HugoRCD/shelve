import { spinner } from '@clack/prompts'

const s = spinner()

export async function useSpinner<T>(
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
