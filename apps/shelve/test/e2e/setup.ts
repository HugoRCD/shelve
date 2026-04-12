import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envFile = readFileSync(resolve(__dirname, '../../.env.test'), 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const [, key, value] = match
    if (!process.env[key!.trim()] || key!.trim() === 'DATABASE_URL') {
      process.env[key!.trim()] = value!.trim()
    }
  }
}

delete process.env.DATABASE_URL
delete process.env.POSTGRES_URL
delete process.env.POSTGRESQL_URL
