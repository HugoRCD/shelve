import { join } from 'path'
import { findWorkspaceDir, type PackageJson } from 'pkg-types'
import { glob } from 'tinyglobby'
import { FileService } from './file'

export class PkgService {

  async getAllPackageJsons(workspaceDir?: string): Promise<{ path: string, dir: string, pkg: PackageJson }[]> {
    workspaceDir = workspaceDir || await findWorkspaceDir()
    const packagePaths = await glob(['**/package.json', '!**/node_modules/**'], {
      cwd: workspaceDir,
      absolute: true,
    })

    return await Promise.all(
      packagePaths.map((path) => {
        const content = FileService.read(path)
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
    const packagePaths = await glob(['**/package.json', '!**/node_modules/**'], {
      cwd: workspaceDir,
      absolute: true,
    })

    return packagePaths.length > 1
  }

}
