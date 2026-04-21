export type ParsedUserAgent = {
  label: string
  icon: string
}

const KNOWN_CLIENTS: Array<{ pattern: RegExp; label: (m: RegExpMatchArray) => string; icon: string }> = [
  { pattern: /shelve-cli\/([\d.]+|unknown)/i, label: m => `Shelve CLI ${m[1]}`, icon: 'lucide:terminal' },
  { pattern: /^node$/i, label: () => 'Node.js', icon: 'lucide:hexagon' },
  { pattern: /node\/?(v?\d+(?:\.\d+)*)?/i, label: m => (m[1] ? `Node.js ${m[1]}` : 'Node.js'), icon: 'lucide:hexagon' },
  { pattern: /curl\/([\d.]+)/i, label: m => `curl ${m[1]}`, icon: 'lucide:terminal' },
  { pattern: /wget\/([\d.]+)/i, label: m => `wget ${m[1]}`, icon: 'lucide:terminal' },
  { pattern: /postman/i, label: () => 'Postman', icon: 'lucide:send' },
  { pattern: /insomnia/i, label: () => 'Insomnia', icon: 'lucide:send' },
  { pattern: /github-actions/i, label: () => 'GitHub Actions', icon: 'lucide:github' },
]

const BROWSERS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /Edg\/([\d.]+)/, name: 'Edge' },
  { pattern: /OPR\/([\d.]+)/, name: 'Opera' },
  { pattern: /Firefox\/([\d.]+)/, name: 'Firefox' },
  { pattern: /Chrome\/([\d.]+)/, name: 'Chrome' },
  { pattern: /Version\/([\d.]+).*Safari/, name: 'Safari' },
]

const OS_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /Mac OS X ([\d_.]+)/, name: 'macOS' },
  { pattern: /Windows NT ([\d.]+)/, name: 'Windows' },
  { pattern: /Android ([\d.]+)/, name: 'Android' },
  { pattern: /iPhone OS ([\d_]+)/, name: 'iOS' },
  { pattern: /iPad/, name: 'iPadOS' },
  { pattern: /Linux/, name: 'Linux' },
]

export function parseUserAgent(raw: string | null | undefined): ParsedUserAgent | null {
  if (!raw) return null
  const ua = raw.trim()
  if (!ua) return null

  for (const client of KNOWN_CLIENTS) {
    const match = ua.match(client.pattern)
    if (match) return { label: client.label(match), icon: client.icon }
  }

  let browser: string | null = null
  for (const b of BROWSERS) {
    const match = ua.match(b.pattern)
    if (match) {
      const version = match[1]?.split('.')[0]
      browser = version ? `${b.name} ${version}` : b.name
      break
    }
  }

  let os: string | null = null
  for (const o of OS_PATTERNS) {
    if (o.pattern.test(ua)) {
      os = o.name
      break
    }
  }

  if (browser || os) {
    return {
      label: [browser, os].filter(Boolean).join(' · '),
      icon: 'lucide:globe',
    }
  }

  const head = ua.split(/[\s/]/)[0] ?? ua
  return { label: head.length > 24 ? `${head.slice(0, 24)}…` : head, icon: 'lucide:terminal' }
}
