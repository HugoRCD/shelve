import consola from 'consola'
import { runCommand } from 'citty'
import type { Project } from '@shelve/types'
import link from '../commands/link'
import login from '../commands/login'
import { createProject } from './projects'

export async function suggestCreateProject(name?: string): Promise<Project | null> {
  const accept = await consola.prompt(`Do you want to create ${name ? 'the project' : 'a project'}? (y/n)`, {
    default: 'y',
    type: 'confirm',
  })
  if (accept) {
    if (name) {
      return await createProject(name)
    }
    const projectName = await consola.prompt('Give your project a name', {
      placeholder: 'my-project'
    })
    return await createProject(projectName)
  }
  return null
}

export async function suggestLinkProject(name: string): Promise<Project | null> {
  const linkProject = await consola.prompt('Do you want to link the project? (y/n)', {
    default: 'y',
    type: 'confirm',
  })
  if (linkProject) {
    const res = await runCommand(link, {rawArgs: ['--name', name]}) as { result: Project }
    return res.result
  }
  return null
}

export async function suggestLinkProjects(): Promise<Project | null> {
  const linkProject = await consola.prompt('Do you want to link a project? (y/n)', {
    default: 'y',
    type: 'confirm',
  })
  if (linkProject) {
    const res = await runCommand(link, {rawArgs: []}) as { result: Project }
    return res.result
  }
  return null
}

export async function suggestLogin(): Promise<void> {
  const accept = await consola.prompt('Do you want to login? (y/n)', {
    default: 'y',
    type: 'confirm',
  })
  if (accept) {
    await runCommand(login, {rawArgs: []})
  }
}
