import { findWorkspaceDir } from 'pkg-types'
import { glob } from 'tinyglobby'

export class PkgService {

  async isMonorepo(workspaceDir?: string): Promise<boolean> {
    workspaceDir = workspaceDir || await findWorkspaceDir().catch(() => process.cwd())
    const packagePaths = await glob(['**/package.json', '!**/node_modules/**'], {
      cwd: workspaceDir,
      absolute: true,
    })

    return packagePaths.length > 1
  }

}
