import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * Two-tier encryption (envelope encryption):
 *
 *   value ──seal──▶ ciphertext        (key = DEK)
 *   DEK   ──seal──▶ encryptedDek      (key = KEK)
 *
 * - **KEK** (Key Encryption Key): single global secret, sourced from runtime
 *   config (`private.encryptionKey`). Rotated at the platform level.
 * - **DEK** (Data Encryption Key): generated per project on first write.
 *   Stored sealed alongside the project. Rotated by re-encrypting variable
 *   values for that project alone — no platform-wide downtime needed.
 *
 * **Backward compatibility**: projects without a DEK keep using the KEK
 * directly. Existing variables stay readable. New writes on a project that
 * has been "envelope-upgraded" use the DEK going forward.
 */
export class EncryptionService {

  private readonly kek: string
  private readonly dekCache = new Map<number, string>()

  constructor(event: H3Event) {
    this.kek = useRuntimeConfig(event).private.encryptionKey
  }

  /**
   * Returns the project's DEK, lazily provisioning one on first call.
   *
   * Pass `provisionIfMissing: false` to look up only — useful when you
   * want to read existing variables without forcing an upgrade.
   */
  async getProjectKey(
    projectId: number,
    options: { provisionIfMissing?: boolean } = {}
  ): Promise<{ key: string; isProjectKey: boolean }> {
    const cached = this.dekCache.get(projectId)
    if (cached) return { key: cached, isProjectKey: true }

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
      columns: { id: true, encryptedDek: true },
    })
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    if (project.encryptedDek) {
      const dek = await unseal(project.encryptedDek, this.kek) as string
      this.dekCache.set(projectId, dek)
      return { key: dek, isProjectKey: true }
    }

    if (!options.provisionIfMissing) return { key: this.kek, isProjectKey: false }

    const dek = randomBytes(32).toString('base64')
    const encryptedDek = await seal(dek, this.kek)
    await db.update(schema.projects)
      .set({ encryptedDek })
      .where(eq(schema.projects.id, projectId))
    this.dekCache.set(projectId, dek)
    return { key: dek, isProjectKey: true }
  }

  /**
   * Encrypt a value for a project. Provisions a DEK on the project if it
   * doesn't have one yet (envelope upgrade is automatic on first write).
   */
  async encrypt(projectId: number, value: string): Promise<string> {
    const { key } = await this.getProjectKey(projectId, { provisionIfMissing: true })
    return seal(value, key)
  }

  /**
   * Decrypt a value for a project. Tries the project DEK first (if it
   * has one), then falls back to the KEK so variables created before the
   * envelope upgrade keep working.
   */
  async decrypt(projectId: number, ciphertext: string): Promise<string> {
    const { key, isProjectKey } = await this.getProjectKey(projectId, { provisionIfMissing: false })
    try {
      return await unseal(ciphertext, key) as string
    } catch (err) {
      if (!isProjectKey) throw err
      return await unseal(ciphertext, this.kek) as string
    }
  }

}
