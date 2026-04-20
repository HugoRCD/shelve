import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Files written by `shelve init` to keep AI agents from reading
 * cached secrets or `.env*` files.
 */
export const AGENT_IGNORE_FILES = [
  '.cursorignore',
  '.aiderignore',
  '.codeiumignore',
  '.continueignore',
  '.aigignore', // generic
] as const

/**
 * Patterns added to each ignore file (and suggested in .gitignore).
 * Kept narrow on purpose — we don't want to over-block AI agents from
 * seeing the surrounding code.
 */
export const SECRET_IGNORE_PATTERNS = [
  '# Added by `shelve init` — do not let AI agents exfiltrate secrets',
  '.env',
  '.env.*',
  '!.env.template',
  '!.env.example',
  '.shelve/',
  '.shelve/cache/',
] as const

const HEADER_TAG = '# shelve-managed-block'
const FOOTER_TAG = '# end shelve-managed-block'

/** Returns the patterns Shelve manages, framed by tags so they can be updated. */
function buildBlock(): string {
  return [HEADER_TAG, ...SECRET_IGNORE_PATTERNS, FOOTER_TAG, ''].join('\n')
}

function upsertBlock(existing: string): string {
  const block = buildBlock()
  const headerIdx = existing.indexOf(HEADER_TAG)
  if (headerIdx === -1) {
    const sep = existing.endsWith('\n') || existing.length === 0 ? '' : '\n'
    return existing + sep + (existing.length === 0 ? '' : '\n') + block
  }
  const footerIdx = existing.indexOf(FOOTER_TAG, headerIdx)
  if (footerIdx === -1) return existing + '\n' + block
  const before = existing.slice(0, headerIdx)
  const after = existing.slice(footerIdx + FOOTER_TAG.length).replace(/^\n/, '')
  return before + block + after
}

export type WriteIgnoresResult = {
  writtenFiles: string[]
  skippedFiles: string[]
}

/**
 * Idempotently writes the Shelve-managed block to all known agent ignore files.
 * Existing user-added patterns are preserved; only the block between the
 * `shelve-managed-block` markers is rewritten.
 */
export function writeAgentIgnoreFiles(cwd: string = process.cwd()): WriteIgnoresResult {
  const writtenFiles: string[] = []
  const skippedFiles: string[] = []

  for (const filename of AGENT_IGNORE_FILES) {
    const path = join(cwd, filename)
    const existing = existsSync(path) ? readFileSync(path, 'utf-8') : ''
    const updated = upsertBlock(existing)
    if (updated === existing) {
      skippedFiles.push(filename)
      continue
    }
    writeFileSync(path, updated, 'utf-8')
    writtenFiles.push(filename)
  }

  return { writtenFiles, skippedFiles }
}
