import { parse } from 'dotenv'

export function parseEnvFile(content: string, withIndex: boolean = false):
  { index?: number; key: string; value: string }[] {
  try {
    const parsed = parse(content)
    
    const variables = Object.entries(parsed).map(([key, value], index) => {
      const result: { index?: number; key: string; value: string } = {
        key,
        value: value || ''
      }
      
      if (withIndex) {
        result.index = index
      }
      
      return result
    })
    
    return variables
  } catch (error) {
    throw new Error('Invalid .env file format')
  }
}
