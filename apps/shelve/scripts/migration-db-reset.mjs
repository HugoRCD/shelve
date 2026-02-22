import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import postgres from 'postgres'

const args = parseArgs(process.argv.slice(2))
const databaseUrl = requireArg(args, 'database-url')
const mode = String(args.mode || 'dry-run').toLowerCase()
const outputPath = args.out
const confirm = String(args.confirm || '')

if (!['dry-run', 'execute'].includes(mode)) {
  throw new Error('--mode must be one of: dry-run, execute')
}

if (mode === 'execute' && confirm !== 'RESET') {
  throw new Error('Execution requires --confirm=RESET')
}

const sql = createDbClient(databaseUrl)

try {
  const before = await listPublicTables(sql)
  const payload = {
    mode,
    checkedAt: new Date().toISOString(),
    before: {
      tableCount: before.length,
      tables: before,
    },
    executed: mode === 'execute',
    after: null,
  }

  if (mode === 'execute') {
    await sql.unsafe('drop schema if exists public cascade')
    await sql.unsafe('create schema public')
    await sql.unsafe('grant all on schema public to public')
    const after = await listPublicTables(sql)
    payload.after = {
      tableCount: after.length,
      tables: after,
    }
    if (after.length > 0) {
      throw new Error('Database reset did not produce an empty public schema')
    }
  }

  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8')
  }

  console.log(JSON.stringify(payload, null, 2))
} finally {
  await sql.end({ timeout: 5 })
}

function createDbClient(url) {
  const host = new URL(url).hostname
  const useSsl = !['localhost', '127.0.0.1'].includes(host)
  return postgres(url, {
    max: 1,
    ssl: useSsl ? 'require' : false,
    prepare: false,
  })
}

async function listPublicTables(sql) {
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `
  return rows.map(row => row.table_name)
}

function parseArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--') continue
    if (!arg.startsWith('--')) continue

    const stripped = arg.slice(2)
    const eqIndex = stripped.indexOf('=')
    if (eqIndex !== -1) {
      const key = stripped.slice(0, eqIndex)
      const value = stripped.slice(eqIndex + 1)
      parsed[key] = value === '' ? 'true' : value
      continue
    }

    const key = stripped
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      parsed[key] = next
      i++
    } else {
      parsed[key] = 'true'
    }
  }
  return parsed
}

function requireArg(parsed, key) {
  const value = parsed[key]
  if (!value) throw new Error(`--${key} is required`)
  return value
}
