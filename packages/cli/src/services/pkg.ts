import { readFile } from 'fs/promises'
import { join } from 'path'
import type { PackageJson } from 'pkg-types'
import { globby } from 'globby'
import { findWorkspaceDir } from 'pkg-types'

export class PkgService {

  async getAllPackageJsons(workspaceDir?: string): Promise<{ path: string, dir: string, pkg: PackageJson }[]> {
    workspaceDir = workspaceDir || await findWorkspaceDir()
    const packagePaths = await globby(['**/package.json', '!**/node_modules/**'], {
      cwd: workspaceDir,
      absolute: true,
    })

    return await Promise.all(
      packagePaths.map(async (path) => {
        const content = await readFile(path, 'utf-8')
        return {
          path,
          dir: join(path, '..'),
          pkg: JSON.parse(content)
        }
      })
    )
  }

  async isMonorepo(workspaceDir?: string): Promise<boolean> {
    workspaceDir = workspaceDir || await findWorkspaceDir()
    const packagePaths = await globby(['**/package.json', '!**/node_modules/**'], {
      cwd: workspaceDir,
      absolute: true,
    })

    return packagePaths.length > 1
  }

}
