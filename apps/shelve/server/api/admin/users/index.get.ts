import { user as authUser } from '../../../db/schema/better-auth.postgresql'

export default eventHandler(async (event) => {
  await requireAdmin(event)
  return db.select().from(authUser)
})
