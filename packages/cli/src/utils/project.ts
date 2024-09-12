import type { Project } from '@shelve/types'
import { cancel, spinner } from '@clack/prompts'
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
    cancel('Failed to fetch project')
    process.exit(0)
  }
}

export async function createProject(name: string): Promise<Project | null> {
  const api = await useApi()

  s.start('Creating project')
  try {
    await api('/project', {
      method: 'POST',
      body: {
        name,
      }
    })
    s.stop('Creating project')
  } catch (e) {
    cancel('Failed to create project')
    process.exit(0)
  }
}
