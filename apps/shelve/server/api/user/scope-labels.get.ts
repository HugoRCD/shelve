import { eq, inArray } from 'drizzle-orm'

export type ScopeLabels = {
  teams: Record<number, string>
  projects: Record<number, string>
  environments: Record<number, string>
}

export default defineEventHandler(async (event): Promise<ScopeLabels> => {
  const { user } = await requireUserSession(event)

  const memberships = await db.query.members.findMany({
    where: eq(schema.members.userId, user.id),
    columns: { teamId: true },
    with: {
      team: {
        columns: { id: true, name: true },
      },
    },
  })

  const teamIds = memberships.map(m => m.teamId)
  const teams: Record<number, string> = {}
  for (const m of memberships) teams[m.team.id] = m.team.name

  const projects: Record<number, string> = {}
  const environments: Record<number, string> = {}

  if (teamIds.length) {
    const projectRows = await db.query.projects.findMany({
      where: inArray(schema.projects.teamId, teamIds),
      columns: { id: true, name: true },
    })
    for (const p of projectRows) projects[p.id] = p.name

    const envRows = await db.query.environments.findMany({
      where: inArray(schema.environments.teamId, teamIds),
      columns: { id: true, name: true },
    })
    for (const e of envRows) environments[e.id] = e.name
  }

  return { teams, projects, environments }
})
