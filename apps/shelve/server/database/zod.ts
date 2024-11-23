import { z } from 'zod'
import { AuthType, Role } from '@shelve/types'

export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  avatar: z.string(),
  role: z.nativeEnum(Role),
  authType: z.nativeEnum(AuthType),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const idParamsSchema = z.object({
  id: z.coerce.number({
    required_error: 'ID is required',
  }).int().positive()
})
