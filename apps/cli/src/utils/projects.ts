import fs from 'fs'
import type { Project } from '@shelve/types'
import consola from 'consola'
import { $api } from './connection.ts'

export async function getProjects(): Promise<Project[]> {
  return await $api('/project', {
    method: 'GET',
  })
}

export async function getProjectByName(name: string): Promise<Project> {
  return await $api(`/project/name/${name}`, {
    method: 'GET',
  })
}

export function writeProjectConfig(project: Project): void {
  const projectData = {
    projectId: project.id,
    name: project.name,
    homepage: project.homepage,
    repository: project.repository,
    projectManager: project.projectManager,
  }
  if (!fs.existsSync('.shelve'))
    fs.mkdirSync('.shelve')
  fs.writeFileSync('.shelve/project.json', JSON.stringify(projectData))
  addDotShelveToGitignore()
}

export function loadProjectConfig(): { projectId: string, name: string, homepage: string, repository: string, projectManager: string } | { projectId?: undefined } {
  try {
    return JSON.parse(fs.readFileSync('.shelve/project.json', 'utf-8'))
  } catch {
    return {}
  }
}

export function getProjectId(): number | undefined {
  const projectId = loadProjectConfig().projectId
  if (projectId) return parseInt(projectId)
}

export function getCurrentProject(): { id: number, name: string, homepage: string, repository: string, projectManager: string } | undefined {
  const project = loadProjectConfig()
  if (project.projectId) {
    return {
      id: parseInt(project.projectId),
      name: project.name,
      homepage: project.homepage,
      repository: project.repository,
      projectManager: project.projectManager,
    }
  }
}

export function hasProjectId(): boolean {
  return !!getProjectId()
}

export function deleteProjectConfig(): void {
  if (!fs.existsSync('.shelve/project.json')) {
    consola.error('Project is not linked')
    return
  }
  fs.unlinkSync('.shelve/project.json')
  if (fs.readdirSync('.shelve').length === 0)
    fs.rmdirSync('.shelve')
}

export function addDotShelveToGitignore(): void {
  if (!fs.existsSync('.gitignore'))
    fs.writeFileSync('.gitignore', '.shelve')
  else {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8')
    if (!gitignore.includes('.shelve'))
      fs.writeFileSync('.gitignore', `${gitignore}\n# Shelve config\n.shelve`)
  }
}
