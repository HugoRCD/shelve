import { Resend } from 'resend'
import { render } from '@vue-email/render'
import type { H3Event } from 'h3'
import welcomeEmail from '~~/server/emails/welcomeEmail.vue'
import verifyOtp from '~~/server/emails/verifyOtp.vue'

export class EmailService {

  private readonly resend: Resend | null
  private readonly SENDER: string

  constructor(event: H3Event) {
    const config = useRuntimeConfig(event)
    this.resend = config.private.resendApiKey ? new Resend(config.private.resendApiKey) : null
    this.SENDER = config.private.senderEmail || 'HugoRCD <contact@hrcd.fr>'
  }

  async sendOtp(email: string, otp: string, redirectUrl: string): Promise<void> {
    if (!this.resend) {
      console.warn('Resend API key not found, set NUXT_PRIVATE_RESEND_API_KEY in your environment variables to enable email sending')
      console.log('Development mode: OTP code is', otp)
      return
    }
    
    const template = await this.generateOtpTemplate(otp, redirectUrl)

    try {
      await this.resend.emails.send({
        from: this.SENDER,
        to: [email],
        subject: 'Your Shelve Login Code',
        html: template,
      }).then((response) => {
        console.log('OTP email sent: ', response)
      })
    } catch (error) {
      console.log('Error sending OTP email: ', error)
      throw error
    }
  }

  async sendWelcomeEmail(email: string, username: string, appUrl: string): Promise<void> {
    if (!this.resend) {
      console.warn('Resend API key not found, set NUXT_PRIVATE_RESEND_API_KEY in your environment variables to enable email sending')
      return
    }
    const template = await this.generateWelcomeTemplate(username, appUrl)

    try {
      await this.resend.emails.send({
        from: this.SENDER,
        to: [email],
        subject: 'Welcome to Shelve!',
        html: template,
      }).then((response) => {
        console.log('Welcome email sent: ', response)
      })
      await this.resend.emails.send({
        from: this.SENDER,
        to: ['contact@shelve.cloud'],
        subject: 'New user registered',
        html: `New user registered: ${username} - ${email}`,
      }).then((response) => {
        console.log('New user email sent: ', response)
      })
    } catch (error) {
      console.log('Error sending welcome email: ', error)
    }
  }

  private async generateOtpTemplate(otp: string, redirectUrl: string): Promise<string> {
    try {
      return await render(verifyOtp, {
        otp,
        redirectUrl,
      })
    } catch (error) {
      return `<h1>OTP: ${otp}</h1>`
    }
  }

  private async generateWelcomeTemplate(username: string, appUrl: string): Promise<string> {
    try {
      return await render(welcomeEmail, {
        username: username,
        redirectUrl: appUrl,
      })
    } catch (error) {
      return `<h1>Welcome to Shelve, ${username}!</h1>`
    }
  }

}
