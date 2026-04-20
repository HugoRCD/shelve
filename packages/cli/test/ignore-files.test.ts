import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AGENT_IGNORE_FILES, writeAgentIgnoreFiles } from '../src/utils/ignore-files'

describe('writeAgentIgnoreFiles', () => {
  let cwd: string

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), 'shelve-ignore-'))
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
  })

  it('writes every agent ignore file on a fresh workspace', () => {
    const { writtenFiles, skippedFiles } = writeAgentIgnoreFiles(cwd)
    expect(writtenFiles.sort()).toEqual([...AGENT_IGNORE_FILES].sort())
    expect(skippedFiles).toHaveLength(0)
  })

  it('includes the shelve-managed block with .env patterns', () => {
    writeAgentIgnoreFiles(cwd)
    for (const file of AGENT_IGNORE_FILES) {
      const content = readFileSync(join(cwd, file), 'utf-8')
      expect(content).toContain('# shelve-managed-block')
      expect(content).toContain('# end shelve-managed-block')
      expect(content).toContain('.env')
      expect(content).toContain('.env.*')
      expect(content).toContain('!.env.template')
      expect(content).toContain('.shelve/')
    }
  })

  it('is idempotent on a second run', () => {
    writeAgentIgnoreFiles(cwd)
    const { writtenFiles, skippedFiles } = writeAgentIgnoreFiles(cwd)
    expect(writtenFiles).toHaveLength(0)
    expect(skippedFiles.sort()).toEqual([...AGENT_IGNORE_FILES].sort())
  })

  it('preserves pre-existing user content above the block', () => {
    const target = join(cwd, '.cursorignore')
    writeFileSync(target, 'node_modules\ndist\n', 'utf-8')
    writeAgentIgnoreFiles(cwd)
    const content = readFileSync(target, 'utf-8')
    expect(content.startsWith('node_modules\ndist\n')).toBe(true)
    expect(content).toContain('# shelve-managed-block')
  })

  it('updates the managed block without touching surrounding content', () => {
    const target = join(cwd, '.cursorignore')
    const before = [
      '# top',
      'node_modules',
      '',
      '# shelve-managed-block',
      '# stale line that should be replaced',
      '# end shelve-managed-block',
      'my-extra-entry',
      '',
    ].join('\n')
    writeFileSync(target, before, 'utf-8')

    writeAgentIgnoreFiles(cwd)
    const after = readFileSync(target, 'utf-8')

    expect(after).toContain('# top')
    expect(after).toContain('node_modules')
    expect(after).toContain('my-extra-entry')
    expect(after).toContain('.env')
    expect(after).not.toContain('stale line that should be replaced')
  })
})
