import { readFileSync, existsSync } from 'node:fs'
import type { EnvVarExport } from '@types'

const SECRET_REF_RE = /^shelve:\/\/([\w.-]+)(?:\/([\w.-]+))?$/

export type SecretReference = {
  /** Path of the env var in the template, e.g. `DATABASE_URL`. */
  key: string
  /** Optional environment override (the part before the slash). */
  environment: string | null
  /** Variable key on the Shelve side. */
  remoteKey: string
}

export type ParsedTemplate = {
  references: SecretReference[]
  literals: { key: string; value: string }[]
}

/**
 * Parse a `.env.template`-style file. Each line is `KEY=value`. Values that
 * match `shelve://[<env>/]<key>` become references to be resolved at runtime;
 * everything else is treated as a literal value.
 *
 * Comments (`#`) and blank lines are ignored.
 */
export function parseEnvTemplate(content: string): ParsedTemplate {
  const references: SecretReference[] = []
  const literals: { key: string; value: string }[] = []

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let value = line.slice(eqIdx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1)
    }
    if (!key) continue

    const match = SECRET_REF_RE.exec(value)
    if (match) {
      const [, first, second] = match
      const environment = second ? first ?? null : null
      const remoteKey = second ?? first!
      references.push({ key, environment, remoteKey })
    } else {
      literals.push({ key, value })
    }
  }

  return { references, literals }
}

/**
 * Resolve `shelve://` references in a template against the variables fetched
 * for the current environment. Variables outside the current env (where
 * `reference.environment` is set and differs) are left as TODO and reported
 * to the caller — production code can pre-fetch those envs separately.
 */
export function resolveReferences(
  template: ParsedTemplate,
  variables: EnvVarExport[],
  currentEnvironment: string
): { resolved: EnvVarExport[]; missing: SecretReference[] } {
  const lookup = new Map(variables.map((v) => [v.key, v.value]))
  const resolved: EnvVarExport[] = []
  const missing: SecretReference[] = []

  for (const literal of template.literals) {
    resolved.push({ key: literal.key, value: literal.value })
  }

  for (const ref of template.references) {
    if (ref.environment && ref.environment !== currentEnvironment) {
      missing.push(ref)
      continue
    }
    const value = lookup.get(ref.remoteKey)
    if (value === undefined) {
      missing.push(ref)
      continue
    }
    resolved.push({ key: ref.key, value })
  }

  return { resolved, missing }
}

export function loadTemplate(path: string): ParsedTemplate | null {
  if (!existsSync(path)) return null
  const content = readFileSync(path, 'utf-8')
  return parseEnvTemplate(content)
}
