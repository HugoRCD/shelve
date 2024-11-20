export function getEachLines(content: string): string[] {
  return content.split('\n').filter((line) => line.trim() !== '') // remove empty lines
}

export function removeComments(content: string[]): string[] {
  return content.filter((line) => !line.startsWith('#'))
}

export function getKeyValue(content: string): { key: string; value: string } {
  const [key, value] = content.split(/=(.+)/) // split on the first = and the rest of the line
  if (!key || !value) {
    throw new Error('Invalid .env')
  }
  return {
    key: key.replace(/[\n\r'"]+/g, ''),
    value: value.replace(/[\n\r'"]+/g, ''),
  }
}

export function parseEnvFile(content: string, withIndex: boolean = false):
  { index?: number; key: string; value: string }[] {
  const lines = getEachLines(content)
  const filteredLines = removeComments(lines)
  return filteredLines.map((line, index) => {
    const { key, value } = getKeyValue(line)
    if (withIndex) {
      return { index, key, value }
    }
    return { key, value }
  })
}
