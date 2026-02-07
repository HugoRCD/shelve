export function getRandomGithubAppName(): string {
  const adjectives = [
    'swift',
    'rapid',
    'secure',
    'smart',
    'agile',
    'quantum',
    'dynamic',
    'cosmic',
    'stellar',
    'atomic',
    'cyber',
    'digital',
    'hyper',
    'mega',
    'ultra',
    'turbo',
    'nexus',
    'nova',
    'pulse',
    'flux'
  ]

  const nouns = [
    'sync',
    'flow',
    'hub',
    'link',
    'bridge',
    'port',
    'gate',
    'core',
    'node',
    'mesh',
    'wave',
    'grid',
    'forge',
    'vault',
    'space',
    'cloud',
    'base',
    'sphere',
    'matrix',
    'nexus'
  ]

  const suffixes = [
    'pro',
    'plus',
    'hub',
    'lab',
    'net',
    'dev',
    'api',
    'bot',
    'ops',
    'sys',
    'io'
  ]

  const getUniqueRandom = (arr: string[]): string => {
    const randomIndex = Math.floor(Math.random() * arr.length)
    return arr[randomIndex]!
  }

  const adj = getUniqueRandom(adjectives)
  let noun
  do {
    noun = getUniqueRandom(nouns)
  } while (noun === adj.toLowerCase())

  const shouldAddSuffix = Math.random() < 0.3
  const suffix = shouldAddSuffix ? `-${getUniqueRandom(suffixes)}` : ''

  const uniqueId = Math.random() < 0.2 ? `-${Math.floor(Math.random() * 999) + 1}` : ''

  return `shelve-${adj.toLowerCase()}-${noun.toLowerCase()}${suffix}${uniqueId}`
}
