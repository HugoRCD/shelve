import fs from 'fs'

export class FileService {

  static exists(filename: string): boolean {
    return fs.existsSync(filename)
  }

  static read(filename: string): string {
    return fs.readFileSync(filename, 'utf8')
  }

  static write(filename: string, content: string): void {
    fs.writeFileSync(filename, content, { encoding: 'utf8' })
  }

  static delete(filename: string): void {
    fs.unlinkSync(filename)
  }

}
