import fs from 'fs'
import { findFile as pkgFindFile } from 'pkg-types'

export class FileService {

  static exists(filename: string): boolean {
    return fs.existsSync(filename)
  }

  static read(filename: string): string {
    return fs.readFileSync(filename, 'utf8')
  }

  static write(filename: string, content: string, mode?: number): void {
    fs.writeFileSync(filename, content, { encoding: 'utf8', mode })
    // writeFileSync only applies `mode` to a file it creates
    if (mode !== undefined && process.platform !== 'win32') fs.chmodSync(filename, mode)
  }

  static delete(filename: string): void {
    fs.unlinkSync(filename)
  }

  static async findFile(
    patterns: string | string[],
    options: { startingFrom: string; stopOnFirst?: boolean }
  ): Promise<string | null> {
    const patternArray = Array.isArray(patterns) ? patterns : [patterns]

    for (const pattern of patternArray) {
      try {
        const result = await pkgFindFile(pattern, options)
        if (result && options.stopOnFirst) {
          return result
        }
      } catch { /* empty */ }
    }

    return null
  }

}
