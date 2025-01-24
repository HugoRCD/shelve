import { z } from 'zod'
import { AuthType, Role } from '~~/packages/types'

export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  avatar: z.string(),
  role: z.nativeEnum(Role),
  authType: z.nativeEnum(AuthType),
  onboarding: z.boolean(),
  cliInstalled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const idParamsSchema = z.object({
  id: z.coerce.number({
    required_error: 'ID is required',
  }).int().positive()
})

export const variableIdParamsSchema = z.object({
  variableId: z.coerce.number({
    required_error: 'Variable ID is required',
  }).int().positive()
})

export const projectIdParamsSchema = z.object({
  projectId: z.coerce.number({
    required_error: 'Project ID is required',
  }).int().positive(),
})
