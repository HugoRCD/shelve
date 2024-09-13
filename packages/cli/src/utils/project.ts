import type { Project } from '@shelve/types'
import { confirm, isCancel, spinner } from '@clack/prompts'
import { useApi } from './api'
import { onCancel } from './index'

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
    onCancel('Failed to load projects')
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

      if (isCancel(shouldCreate) || !shouldCreate) onCancel('Operation cancelled.')

      if (shouldCreate) {
        return await createProject(name)
      }
    }
    onCancel('Failed to fetch project')
  }
}

export async function createProject(name: string): Promise<Project> {
  const api = await useApi()

  s.start('Creating project')
  try {
    const project = await api('/project', {
      method: 'POST',
      body: {
        name: name.charAt(0).toUpperCase() + name.slice(1),
      }
    })
    s.stop('Creating project')
    return project
  } catch (e) {
    onCancel('Failed to create project')
  }
}
