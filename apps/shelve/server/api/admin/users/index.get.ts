import { requireAdmin } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  await requireAdmin(event)
  return db.query.users.findMany()
})
