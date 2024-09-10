import type { Project } from '@shelve/types'
import consola from 'consola'
import { useApi } from './api'

export async function getProjects(): Promise<Project[]> {
  const api = await useApi()
  try {
    return await api('/project', {
      method: 'GET',
    })
  } catch (e) {
    return []
  }
}

export async function getProjectByName(name: string): Promise<Project> {
  const api = await useApi()
  return await api(`/project/name/${name}`, {
    method: 'GET',
  })
}

export async function createProject(name: string): Promise<Project | null> {
  const api = await useApi()
  try {
    await api('/project', {
      method: 'POST',
      body: {
        name,
      }
    })
    consola.success(`Project ${ name } created successfully!`)
  } catch (e) {
    consola.error('Failed to create project')
    return null
  }
}
