export function parseEnvFile(content: string, withIndex: boolean = false):
  { index?: number; key: string; value: string }[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '')
  const filteredLines = lines.filter((line) => !line.startsWith('#'))
  return filteredLines.map((line, index) => {
    const [key, value] = line.split(/=(.+)/) // split on the first = and the rest of the line
    if (!key || !value) {
      throw new Error('Invalid .env')
    }
    if (withIndex) {
      return {
        index,
        key: key.replace(/[\n\r'"]+/g, ''),
        value: value.replace(/[\n\r'"]+/g, ''),
      }
    }
    return {
      index,
      key: key.replace(/[\n\r'"]+/g, ''),
      value: value.replace(/[\n\r'"]+/g, ''),
    }
  })
}
