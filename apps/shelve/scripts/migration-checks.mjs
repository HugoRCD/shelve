import postgres from 'postgres'

const mode = getMode(process.argv.slice(2))
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = createDbClient(databaseUrl)
const errors = []
const warnings = []

try {
  if (mode === 'pre') {
    await runPreChecks()
  } else {
    await runPostChecks()
  }
} catch (error) {
  errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
} finally {
  await sql.end({ timeout: 5 })
}

if (warnings.length) {
  console.warn('\nWarnings:')
  for (const warning of warnings) console.warn(`- ${warning}`)
}

if (errors.length) {
  console.error('\nErrors:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`\n${mode} checks passed.`)

function getMode(args) {
  const modeFlag = args.find((arg) => arg.startsWith('--mode='))
  const mode = modeFlag?.split('=')[1] || 'pre'
  if (!['pre', 'post'].includes(mode)) {
    console.error('Usage: node scripts/migration-checks.mjs --mode=pre|post')
    process.exit(1)
  }
  return mode
}

function createDbClient(url) {
  const host = new URL(url).hostname
  const useSsl = !['localhost', '127.0.0.1'].includes(host)
  return postgres(url, {
    max: 1,
    ssl: useSsl ? 'require' : false,
  })
}

async function tableExists(name) {
  const rows = await sql`select to_regclass(${`public.${name}`}) as name`
  return rows[0]?.name !== null
}

async function columnExists(table, column) {
  const rows = await sql`
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${table}
      and column_name = ${column}
    limit 1
  `
  return rows.length > 0
}

async function runPreChecks() {
  if (!await tableExists('users')) {
    errors.push('Legacy table "users" not found')
    return
  }

  const duplicates = await sql`
    select "email" as "email", count(*)::int as count
    from users
    group by "email"
    having count(*) > 1
    limit 5
  `
  if (duplicates.length) {
    errors.push(`Duplicate emails found: ${duplicates.map((row) => row.email).join(', ')}`)
  }

  const emailNull = await sql`
    select count(*)::int as count
    from users
    where "email" is null or "email" = ''
  `
  if (Number(emailNull[0]?.count) > 0) {
    errors.push('Users with null/empty email found')
  }

  if (await columnExists('users', 'username')) {
    const usernameNull = await sql`
      select count(*)::int as count
      from users
      where "username" is null or "username" = ''
    `
    if (Number(usernameNull[0]?.count) > 0) {
      errors.push('Users with null/empty username found')
    }
  } else {
    warnings.push('Legacy "users.username" column missing (will backfill from name/email)')
  }

  if (await columnExists('users', 'authType')) {
    const invalidAuthTypes = await sql`
      select "authType" as "authType", count(*)::int as count
      from users
      where "authType" not in ('github', 'google', 'email')
      group by "authType"
    `
    if (invalidAuthTypes.length) {
      errors.push(`Invalid authType values found: ${invalidAuthTypes.map((row) => row.authType).join(', ')}`)
    }
  } else {
    warnings.push('Legacy "users.authType" column missing (defaulting to email)')
  }

  const hasMembers = await tableExists('members')
  const hasTokens = await tableExists('tokens')
  const hasGithubApps = await tableExists('github_app')
  const hasInvitations = await tableExists('invitations')

  if (!hasMembers) warnings.push('Table "members" not found (skipping member checks)')
  if (!hasTokens) warnings.push('Table "tokens" not found (skipping token checks)')
  if (!hasGithubApps) warnings.push('Table "github_app" not found (skipping GitHub app checks)')
  if (!hasInvitations) warnings.push('Table "invitations" not found (skipping invitation checks)')

  const counts = await sql`
    select
      (select count(*)::int from users) as users,
      ${hasMembers ? sql`(select count(*)::int from members)` : sql`0`} as members,
      ${hasTokens ? sql`(select count(*)::int from tokens)` : sql`0`} as tokens,
      ${hasGithubApps ? sql`(select count(*)::int from github_app)` : sql`0`} as github_app,
      ${hasInvitations ? sql`(select count(*)::int from invitations)` : sql`0`} as invitations
  `

  console.log('Pre-migration baseline counts:')
  console.log(`- users: ${counts[0]?.users}`)
  console.log(`- members: ${counts[0]?.members}`)
  console.log(`- tokens: ${counts[0]?.tokens}`)
  console.log(`- github_app: ${counts[0]?.github_app}`)
  console.log(`- invitations: ${counts[0]?.invitations}`)
}

async function runPostChecks() {
  if (!await tableExists('user')) {
    errors.push('Table "user" not found after migration')
  }
  if (await tableExists('users')) {
    errors.push('Legacy table "users" still exists after migration')
  }

  const emailNull = await sql`
    select count(*)::int as count
    from "user"
    where email is null or email = ''
  `
  if (Number(emailNull[0]?.count) > 0) {
    errors.push('Users with null/empty email found in "user" table')
  }

  const legacyNull = await sql`
    select count(*)::int as count
    from "user"
    where "legacyId" is null
  `
  if (Number(legacyNull[0]?.count) > 0) {
    warnings.push('Some users have null legacyId (expected only for newly created users)')
  }

  const hasMembers = await tableExists('members')
  const hasTokens = await tableExists('tokens')
  const hasGithubApps = await tableExists('github_app')
  const hasInvitations = await tableExists('invitations')

  if (hasMembers) {
    const orphanMembers = await sql`
      select count(*)::int as count
      from members m
      left join "user" u on u.id = m."userId"
      where u.id is null
    `
    if (Number(orphanMembers[0]?.count) > 0) {
      errors.push('Members with missing user reference found')
    }
  } else {
    warnings.push('Table "members" not found post-migration (skipping member checks)')
  }

  if (hasTokens) {
    const orphanTokens = await sql`
      select count(*)::int as count
      from tokens t
      left join "user" u on u.id = t."userId"
      where u.id is null
    `
    if (Number(orphanTokens[0]?.count) > 0) {
      errors.push('Tokens with missing user reference found')
    }
  } else {
    warnings.push('Table "tokens" not found post-migration (skipping token checks)')
  }

  if (hasGithubApps) {
    const orphanGithubApps = await sql`
      select count(*)::int as count
      from github_app g
      left join "user" u on u.id = g."userId"
      where u.id is null
    `
    if (Number(orphanGithubApps[0]?.count) > 0) {
      errors.push('GitHub apps with missing user reference found')
    }
  } else {
    warnings.push('Table "github_app" not found post-migration (skipping GitHub app checks)')
  }

  if (hasInvitations) {
    const orphanInvitations = await sql`
      select count(*)::int as count
      from invitations i
      left join "user" u on u.id = i."invitedById"
      where i."invitedById" is not null and u.id is null
    `
    if (Number(orphanInvitations[0]?.count) > 0) {
      errors.push('Invitations with missing invitedById user reference found')
    }
  } else {
    warnings.push('Table "invitations" not found post-migration (skipping invitation checks)')
  }

  const counts = await sql`
    select
      (select count(*)::int from "user") as users,
      ${hasMembers ? sql`(select count(*)::int from members)` : sql`0`} as members,
      ${hasTokens ? sql`(select count(*)::int from tokens)` : sql`0`} as tokens,
      ${hasGithubApps ? sql`(select count(*)::int from github_app)` : sql`0`} as github_app,
      ${hasInvitations ? sql`(select count(*)::int from invitations)` : sql`0`} as invitations
  `

  console.log('Post-migration counts:')
  console.log(`- user: ${counts[0]?.users}`)
  console.log(`- members: ${counts[0]?.members}`)
  console.log(`- tokens: ${counts[0]?.tokens}`)
  console.log(`- github_app: ${counts[0]?.github_app}`)
  console.log(`- invitations: ${counts[0]?.invitations}`)
}
