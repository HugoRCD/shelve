import * as z from 'zod'

const baseProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional(),
  logo: z.string().refine(val => val.length <= 1 || z.string().url('Logo must be a valid URL').safeParse(val).success, {
    message: 'Logo must be a valid URL',
  }).optional(),
  repository: z.string().refine(val => val.length <= 1 || (z.string().url().includes('github.com').safeParse(val).success), {
    message: 'Repository must be a GitHub URL',
  }).optional(),
  projectManager: z.string().refine(val => val.length <= 1 || z.string().url('Project manager must be a valid URL').safeParse(val).success, {
    message: 'Project manager must be a valid URL',
  }).optional(),
  homepage: z.string().refine(val => val.length <= 1 || z.string().url('Homepage must be a valid URL').safeParse(val).success, {
    message: 'Homepage must be a valid URL',
  }).optional(),
  variablePrefix: z.string().optional(),
})

export const createProjectSchema = baseProjectSchema

export const updateProjectSchema = baseProjectSchema.extend({
  id: z.number({ message: 'Invalid project ID' }),
}).partial()

export type CreateProjectSchema = z.output<typeof createProjectSchema>
export type UpdateProjectSchema = z.output<typeof updateProjectSchema>
