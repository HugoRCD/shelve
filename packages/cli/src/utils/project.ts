import fs from 'fs'
import type { Project } from '@shelve/types'
import consola from 'consola'
import { $api } from './connection'
import { suggestLinkProject } from './suggest'
import { useApi } from './api'

const api = await useApi()

export async function getProjects(): Promise<Project[]> {
  try {
    return await api('/project', {
      method: 'GET',
    })
  } catch (e) {
    return []
  }
}

export async function getProjectByName(name: string): Promise<Project> {
  return await api(`/project/name/${name}`, {
    method: 'GET',
  })
}

export async function createProject(name: string): Promise<Project | null> {
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
