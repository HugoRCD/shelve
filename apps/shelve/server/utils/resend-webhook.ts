import { Resend } from 'resend'

/**
 * Verifies a Resend webhook, which Resend signs with Svix: `svix-signature` lists `v1,<base64>`
 * entries, each an HMAC-SHA256 of `${svix-id}.${svix-timestamp}.${body}` keyed with the base64
 * part of the `whsec_` secret. Timestamps more than 5 minutes away from now are refused.
 */
export function verifyResendSignature(
  secret: string,
  headers: { id?: string; timestamp?: string; signature?: string },
  body: string,
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature) return false
  try {
    // Verifying a webhook doesn't use the API key, but the client needs one to be created.
    new Resend('re_webhook_verification').webhooks.verify({
      payload: body,
      headers: { id, timestamp, signature },
      webhookSecret: secret,
    })
    return true
  } catch {
    return false
  }
}
