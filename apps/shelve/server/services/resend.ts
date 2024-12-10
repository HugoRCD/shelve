/*
import { Resend } from 'resend'
import { render } from '@vue-email/render'
import verifyOtp from '~~/server/emails/verifyOtp.vue'
import welcomeEmail from '~~/server/emails/welcomeEmail.vue'

export class EmailService {

  private readonly resend: Resend
  private readonly SENDER = 'HugoRCD <contact@hrcd.fr>'

  constructor() {
    const config = useRuntimeConfig()
    this.resend = new Resend(config.private.resendApiKey)
  }

  async sendOtp(email: string, otp: string, appUrl: string): Promise<void> {
    const template = await this.generateOtpTemplate(email, otp, appUrl)

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

  async sendWelcomeEmail(email: string, username: string, appUrl: string): Promise<void> {
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
    } catch (error) {
      console.log('Error sending welcome email: ', error)
    }
  }

  private async generateOtpTemplate(email: string, otp: string, appUrl: string): Promise<string> {
    try {
      return await render(verifyOtp, {
        otp,
        redirectUrl: `${appUrl}/login?email=${email}&otp=${otp}`,
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
*/
