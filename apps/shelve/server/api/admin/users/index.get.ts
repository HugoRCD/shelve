import { user as userTable } from '../../../db/schema'


export default eventHandler(async (event) => {
  await requireAdmin(event)
  return db.select().from(userTable)
})
