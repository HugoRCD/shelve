import * as z from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional(),
  logo: z.string().url('Logo must be a valid URL').optional(),
  repository: z.string().url('Repository must be a valid URL').includes('github.com', {
    message: 'Repository must be a GitHub URL',
  }).optional(),
  projectManager: z.string().url('Project manager must be a valid URL').optional(),
  homepage: z.string().url('Homepage must be a valid URL').optional(),
  variablePrefix: z.string().optional(),
})

export type CreateProjectSchema = z.output<typeof createProjectSchema>
