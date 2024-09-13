import type { Project } from '@shelve/types'
import { cancel, confirm, isCancel, spinner } from '@clack/prompts'
import { useApi } from './api'

const s = spinner()

export async function getProjects(): Promise<Project[]> {
  const api = await useApi()

  s.start('Loading projects')
  try {
    const projects = await api('/project', {
      method: 'GET',
    })
    s.stop('Loading projects')
    return projects
  } catch (e) {
    cancel('Failed to load projects')
    process.exit(0)
  }
}

export async function getProjectByName(name: string): Promise<Project> {
  const api = await useApi()

  s.start('Fetching project')
  try {
    const project = await api(`/project/name/${ name }`, {
      method: 'GET',
    })
    s.stop('Fetching project')
    return project
  } catch (e) {
    // @ts-expect-error unknown error
    if (e.response?.status === 400) {
      s.stop('Fetching project')
      const shouldCreate = await confirm({
        message: 'Project not found, do you want to create it?',
      })

      if (isCancel(shouldCreate) || !shouldCreate) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      if (shouldCreate) {
        return await createProject(name)
      }
    }
    cancel('Failed to fetch project')
    process.exit(0)
  }
}

export async function createProject(name: string): Promise<Project> {
  const api = await useApi()

  s.start('Creating project')
  try {
    const project = await api('/project', {
      method: 'POST',
      body: {
        name,
      }
    })
    s.stop('Creating project')
    return project
  } catch (e) {
    cancel('Failed to create project')
    process.exit(0)
  }
}
