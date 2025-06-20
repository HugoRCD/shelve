export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { installation_id } = query
  const { user } = await requireUserSession(event)

  if (!installation_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing installation_id'
    })
  }

  try {
    await useDrizzle().insert(tables.githubApp).values({
      installationId: +installation_id,
      userId: user.id
    })

    return sendRedirect(event, '/user/integrations?integration=github&setup=success')
  } catch (error: any) {
    console.error('Error saving GitHub installation:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save GitHub installation'
    })
  }
})
