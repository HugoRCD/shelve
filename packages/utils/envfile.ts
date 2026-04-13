const LINE_RE = /^\s*(?:export\s+)?(?<key>[a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?<val>.*?)\s*$/

function unquote(val: string): string {
  if (
    (val.startsWith('"') && val.endsWith('"'))
    || (val.startsWith("'") && val.endsWith("'"))
  ) {
    return val.slice(1, -1)
  }
  return val
}

function parseEnvContent(src: string): Record<string, string> {
  const result: Record<string, string> = {}

  for (const line of src.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const match = LINE_RE.exec(line)
    if (!match?.groups) continue
    const key = match.groups.key!
    const raw = match.groups.val!
    result[key] = unquote(raw)
  }

  return result
}

export function parseEnvFile(content: string, withIndex: boolean = false):
  { index?: number; key: string; value: string }[] {
  try {
    const parsed = parseEnvContent(content)

    return Object.entries(parsed).map(([key, value], index) => {
      const result: { index?: number; key: string; value: string } = {
        key,
        value: value || ''
      }

      if (withIndex) {
        result.index = index
      }

      return result
    })
  } catch (error) {
    throw new Error('Invalid .env file format')
  }
}
