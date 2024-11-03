import { Resend } from 'resend'
import { render } from '@vue-email/render'
import verifyOtp from '~~/server/emails/verifyOtp.vue'
import welcomeEmail from '~~/server/emails/welcomeEmail.vue'

export class EmailService {

  private readonly resend: Resend
  private readonly siteUrl: string
  private readonly SENDER = 'HugoRCD <contact@hrcd.fr>'

  constructor() {
    const config = useRuntimeConfig()
    this.resend = new Resend(config.private.resendApiKey)
    this.siteUrl = config.public.siteUrl
  }

  /**
   * Send OTP verification email
   */
  async sendOtp(email: string, otp: string): Promise<void> {
    const template = await this.generateOtpTemplate(email, otp)

    try {
      await this.resend.emails.send({
        from: this.SENDER,
        to: [email],
        subject: 'Welcome to Shelve!',
        html: template,
      }).then((response) => {
        console.log('Email sent: ', response)
      })
    } catch (error) {
      console.log('Error sending email: ', error)
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const template = await this.generateWelcomeTemplate(email, username)

    try {
      await this.resend.emails.send({
        from: this.SENDER,
        to: [email],
        subject: 'Welcome to Shelve!',
        html: template,
      }).then((response) => {
        console.log('Welcome email sent: ', response)
      })
    } catch (error) {
      console.log('Error sending welcome email: ', error)
    }
  }

  /**
   * Generate OTP email template
   */
  private async generateOtpTemplate(email: string, otp: string): Promise<string> {
    try {
      return await render(verifyOtp, {
        otp,
        redirectUrl: `${this.siteUrl}/login?email=${email}&otp=${otp}`,
      })
    } catch (error) {
      return `<h1>OTP: ${otp}</h1>`
    }
  }

  /**
   * Generate welcome email template
   */
  private async generateWelcomeTemplate(email: string, username: string): Promise<string> {
    try {
      return await render(welcomeEmail, {
        username,
        redirectUrl: this.siteUrl,
      })
    } catch (error) {
      return `<h1>Welcome to Shelve, ${username}!</h1>`
    }
  }

}
