import type { VariableGroup, CreateVariableGroupInput, UpdateVariableGroupInput } from '@types'

export class VariableGroupsService {

  async getGroupForProject(groupId: number, projectId: number): Promise<VariableGroup> {
    const group = await db.query.variableGroups.findFirst({
      where: and(
        eq(schema.variableGroups.id, groupId),
        eq(schema.variableGroups.projectId, projectId),
      ),
    })
    if (!group) throw createError({ statusCode: 404, statusMessage: 'Variable group not found' })
    return group
  }

  async getGroups(projectId: number): Promise<VariableGroup[]> {
    return await db.query.variableGroups.findMany({
      where: eq(schema.variableGroups.projectId, projectId),
      orderBy: [asc(schema.variableGroups.position)],
    })
  }

  async createGroup(input: CreateVariableGroupInput): Promise<VariableGroup> {
    const [group] = await db.insert(schema.variableGroups)
      .values({
        name: input.name,
        description: input.description || '',
        position: input.position ?? 0,
        projectId: input.projectId,
      })
      .returning()

    if (!group) throw createError({ statusCode: 422, statusMessage: 'Failed to create variable group' })

    return group
  }

  async updateGroup(input: UpdateVariableGroupInput, projectId: number): Promise<VariableGroup> {
    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.position !== undefined) updates.position = input.position

    const [group] = await db.update(schema.variableGroups)
      .set(updates)
      .where(and(
        eq(schema.variableGroups.id, input.id),
        eq(schema.variableGroups.projectId, projectId),
      ))
      .returning()

    if (!group) throw createError({ statusCode: 404, statusMessage: 'Variable group not found' })

    return group
  }

  async deleteGroup(id: number, projectId: number): Promise<void> {
    const [deleted] = await db.delete(schema.variableGroups)
      .where(and(
        eq(schema.variableGroups.id, id),
        eq(schema.variableGroups.projectId, projectId),
      ))
      .returning()

    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Variable group not found' })

    await clearCache('Variables', deleted.projectId)
  }

}
