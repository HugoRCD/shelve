import { z } from 'zod'

export const syncPolicyFieldsSchema = z.object({
  sourceOfTruth: z.enum(['remote', 'local']).optional(),
  onPushConflict: z.enum(['overwrite', 'skip', 'fail', 'prompt']).optional(),
  pullMode: z.enum(['replace', 'merge']).optional(),
  allowPush: z.boolean().optional(),
  allowPull: z.boolean().optional(),
  requireConfirmation: z.boolean().optional(),
}).strict()

export const shelveSyncConfigSchema = z.object({
  default: syncPolicyFieldsSchema.optional(),
  environments: z.record(z.string().min(1), syncPolicyFieldsSchema).optional(),
  protectedEnvironments: z.array(z.string().min(1)).optional(),
}).strict()
