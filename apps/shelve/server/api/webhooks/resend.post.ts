import { z } from 'zod'
import crypto from 'crypto'

const resendEventSchema = z.object({
  type: z.enum([
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.complained',
    'email.bounced',
    'email.opened',
    'email.clicked',
  ]),
  created_at: z.string(),
  data: z.object({
    email_id: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    subject: z.string().optional(),
    bounce: z.object({
      message: z.string(),
    }).optional(),
  }),
})

type ResendEvent = z.infer<typeof resendEventSchema>

function verifyWebhookSignature(payload: string, signature: string | undefined, secret: string): boolean {
  if (!signature) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const webhookSecret = config.private.resendWebhookSecret

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing body' })
  }

  if (webhookSecret) {
    const signature = getHeader(event, 'svix-signature')
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn('Invalid webhook signature')
      throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }
  }

  let body: ResendEvent
  try {
    body = resendEventSchema.parse(JSON.parse(rawBody))
  } catch (error) {
    console.error('Invalid webhook payload:', error)
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const { type, data } = body

  switch (type) {
    case 'email.bounced':
      console.log(`[Resend Webhook] Bounce for ${data.to.join(', ')}: ${data.bounce?.message}`)
      // TODO: Add to suppression list or flag user
      // For hard bounces, consider marking the email as invalid
      for (const email of data.to) {
        console.warn(`Hard bounce detected for email: ${email}`)
        // You could add logic here to:
        // 1. Add to a suppression table
        // 2. Flag the user account
        // 3. Send alert to admin
      }
      break

    case 'email.complained':
      console.log(`[Resend Webhook] Complaint from ${data.to.join(', ')}`)
      // Complaints are serious - user marked email as spam
      for (const email of data.to) {
        console.warn(`Spam complaint from: ${email}`)
        // You could add logic here to:
        // 1. Immediately unsubscribe from all marketing emails
        // 2. Add to suppression list
        // 3. Alert admin
      }
      break

    case 'email.delivered':
      console.log(`[Resend Webhook] Delivered to ${data.to.join(', ')}`)
      break

    case 'email.delivery_delayed':
      console.log(`[Resend Webhook] Delivery delayed for ${data.to.join(', ')}`)
      break

    case 'email.sent':
    case 'email.opened':
    case 'email.clicked':
      // These are informational, log if needed
      break
  }

  return { received: true }
})
