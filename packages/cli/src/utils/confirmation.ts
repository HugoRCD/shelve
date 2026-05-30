import { CliError } from '../services/api-error'
import { isNonInteractive } from './cli-context'

export function assertSyncConfirmationAllowed(
  confirmChanges: boolean,
  requireConfirmation: boolean,
  skipConfirm: boolean,
  message = 'Sync confirmation is required.',
): void {
  if ((confirmChanges || requireConfirmation) && !skipConfirm && isNonInteractive()) {
    throw new CliError(
      message,
      'CONFIRMATION_REQUIRED',
      undefined,
      'Pass --yes in non-interactive mode.',
    )
  }
}
