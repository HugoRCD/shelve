import { z } from 'zod'
import { AuthType, Role, TeamRole } from '@shelve/types'

export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  avatar: z.string(),
  role: z.nativeEnum(Role),
  authType: z.nativeEnum(AuthType),
  createdAt: z.date(),
  updatedAt: z.date(),
})


export const teamSchema = z.object({
  id: z.number(),
  name: z.string().min(3).max(50),
  private: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  members: z.array(
    z.object({
      id: z.number(),
      userId: z.number(),
      teamId: z.number(),
      role: z.nativeEnum(TeamRole),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
})
