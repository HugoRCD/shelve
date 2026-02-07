import { z } from 'zod'
import { AuthType, Role } from '@types'

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  email: z.email(),
  image: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  role: z.enum(Role),
  authType: z.enum(AuthType),
  onboarding: z.boolean(),
  cliInstalled: z.boolean(),
  legacyId: z.number().int().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const idParamsSchema = z.object({
  id: z.coerce.number({
    error: 'ID is required',
  }).int().positive()
})

export const userIdParamsSchema = z.object({
  id: z.string({
    error: 'ID is required',
  }).uuid(),
})

export const variableIdParamsSchema = z.object({
  variableId: z.coerce.number({
    error: 'Variable ID is required',
  }).int().positive()
})

export const projectIdParamsSchema = z.object({
  projectId: z.coerce.number({
    error: 'Project ID is required',
  }).int().positive(),
})
