import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import postgres from 'postgres'

const args = parseArgs(process.argv.slice(2))
normalizeArgs(args)
const runId = requireArg(args, 'run-id')
const mode = args.mode || 'pre'
const databaseUrl = requireArg(args, 'database-url')
const outputPath = requireArg(args, 'out')

if (!['pre', 'post'].includes(mode)) {
  throw new Error('--mode must be one of: pre, post')
}

const sql = createDbClient(databaseUrl)

try {
  const payload = {
    runId,
    mode,
    capturedAt: new Date().toISOString(),
    counts: await collectCounts(sql),
    runScopedCounts: await collectRunScopedCounts(sql, runId),
    orphans: await collectOrphans(sql),
    constraints: await collectConstraints(sql),
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(payload, null, 2))
  console.log(JSON.stringify(payload, null, 2))
} finally {
  await sql.end({ timeout: 5 })
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

function normalizeArgs(args) {
  if (!args['database-url'] && args['db-url']) args['database-url'] = args['db-url']
}

function requireArg(args, key) {
  const value = args[key]
  if (!value) throw new Error(`--${key} is required`)
  return value
}

function createDbClient(url) {
  const host = new URL(url).hostname
  const useSsl = !['localhost', '127.0.0.1'].includes(host)
  return postgres(url, {
    max: 1,
    ssl: useSsl ? 'require' : false,
  })
}

async function tableExists(sql, name) {
  const rows = await sql`select to_regclass(${`public.${name}`}) as name`
  return rows[0]?.name !== null
}

async function countTable(sql, table) {
  if (!await tableExists(sql, table)) return null
  const rows = await sql.unsafe(`select count(*)::int as count from "${table}"`)
  return Number(rows[0]?.count || 0)
}

async function collectCounts(sql) {
  const tables = [
    'users',
    'user',
    'session',
    'members',
    'tokens',
    'invitations',
    'github_app',
    'teams',
    'projects',
    'environments',
    'variables',
    'variable_values',
  ]

  const counts = {}
  for (const table of tables) {
    counts[table] = await countTable(sql, table)
  }
  return counts
}

async function collectRunScopedCounts(sql, runId) {
  const pattern = `%${runId}%`
  const shortPattern = `%${runId.slice(-6)}%`
  const scoped = {}

  if (await tableExists(sql, 'users')) {
    scoped.usersByEmail = Number((await sql`
      select count(*)::int as count
      from users
      where lower(email) like lower(${pattern})
         or lower(email) like lower(${shortPattern})
    `)[0]?.count || 0)
  } else {
    scoped.usersByEmail = null
  }

  if (await tableExists(sql, 'user')) {
    scoped.userByEmail = Number((await sql`
      select count(*)::int as count
      from "user"
      where lower(email) like lower(${pattern})
         or lower(email) like lower(${shortPattern})
    `)[0]?.count || 0)
  } else {
    scoped.userByEmail = null
  }

  scoped.teamsBySlug = await scopedCount(sql, 'teams', 'slug', pattern)
  scoped.projectsByName = await scopedCount(sql, 'projects', 'name', pattern)
  scoped.variablesByKey = await scopedCount(sql, 'variables', 'key', `%${runId.toUpperCase()}%`)
  scoped.tokensByName = await scopedCount(sql, 'tokens', 'name', pattern)
  scoped.invitationsByEmail = await scopedCount(sql, 'invitations', 'email', pattern, shortPattern)
  scoped.environmentsByName = await scopedCount(sql, 'environments', 'name', pattern)

  return scoped
}

async function scopedCount(sql, table, column, likePattern, likePattern2) {
  if (!await tableExists(sql, table)) return null
  const where = likePattern2
    ? `lower("${column}") like lower($1) or lower("${column}") like lower($2)`
    : `lower("${column}") like lower($1)`

  const params = likePattern2 ? [likePattern, likePattern2] : [likePattern]
  const rows = await sql.unsafe(`select count(*)::int as count from "${table}" where ${where}`, params)
  return Number(rows[0]?.count || 0)
}

async function collectOrphans(sql) {
  const checks = {}

  if (await tableExists(sql, 'users')) {
    checks.membersToUsers = await orphanCount(sql, 'members', 'userId', 'users', 'id')
    checks.tokensToUsers = await orphanCount(sql, 'tokens', 'userId', 'users', 'id')
    checks.githubAppToUsers = await orphanCount(sql, 'github_app', 'userId', 'users', 'id')
    checks.invitationsToUsers = await orphanCount(sql, 'invitations', 'invitedById', 'users', 'id', true)
  } else {
    checks.membersToUsers = null
    checks.tokensToUsers = null
    checks.githubAppToUsers = null
    checks.invitationsToUsers = null
  }

  if (await tableExists(sql, 'user')) {
    checks.sessionToUser = await orphanCount(sql, 'session', 'userId', 'user', 'id')
    checks.membersToUser = await orphanCount(sql, 'members', 'userId', 'user', 'id')
    checks.tokensToUser = await orphanCount(sql, 'tokens', 'userId', 'user', 'id')
    checks.githubAppToUser = await orphanCount(sql, 'github_app', 'userId', 'user', 'id')
    checks.invitationsToUser = await orphanCount(sql, 'invitations', 'invitedById', 'user', 'id', true)
  } else {
    checks.sessionToUser = null
    checks.membersToUser = null
    checks.tokensToUser = null
    checks.githubAppToUser = null
    checks.invitationsToUser = null
  }

  checks.variablesToProjects = await orphanCount(sql, 'variables', 'projectId', 'projects', 'id')
  checks.variableValuesToVariables = await orphanCount(sql, 'variable_values', 'variableId', 'variables', 'id')
  checks.variableValuesToEnvironments = await orphanCount(sql, 'variable_values', 'environmentId', 'environments', 'id')
  checks.projectsToTeams = await orphanCount(sql, 'projects', 'teamId', 'teams', 'id')
  checks.environmentsToTeams = await orphanCount(sql, 'environments', 'teamId', 'teams', 'id')
  checks.membersToTeams = await orphanCount(sql, 'members', 'teamId', 'teams', 'id')

  return checks
}

async function orphanCount(sql, sourceTable, sourceColumn, targetTable, targetColumn, nullable = false) {
  if (!await tableExists(sql, sourceTable) || !await tableExists(sql, targetTable)) return null
  const nullableClause = nullable ? `and s."${sourceColumn}" is not null` : ''
  const rows = await sql.unsafe(`
    select count(*)::int as count
    from "${sourceTable}" s
    left join "${targetTable}" t
      on t."${targetColumn}" = s."${sourceColumn}"
    where t."${targetColumn}" is null
      ${nullableClause}
  `)
  return Number(rows[0]?.count || 0)
}

async function collectConstraints(sql) {
  const rows = await sql`
    select
      tc.table_name as table_name,
      kcu.column_name as column_name,
      ccu.table_name as ref_table,
      ccu.column_name as ref_column
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on tc.constraint_name = ccu.constraint_name
     and tc.table_schema = ccu.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name in ('session', 'members', 'tokens', 'invitations', 'github_app', 'projects', 'variables', 'variable_values', 'environments')
    order by tc.table_name, kcu.column_name
  `
  return rows
}
