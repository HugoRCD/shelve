import { Resend } from 'resend'
import { render } from '@vue-email/render'
import verifyOtp from '../emails/verifyOtp.vue'

const resend = new Resend(process.env.NUXT_PRIVATE_RESEND_API_KEY)

export async function sendOtp(email: string, otp: string) {
  const runtimeConfig = useRuntimeConfig()
  const { siteUrl } = runtimeConfig.public
  let template
  try {
    template = await render(verifyOtp, {
      otp,
      redirectUrl: `${siteUrl}/login?email=${email}&otp=${otp}`,
    })
  } catch (error) {
    template = `<h1>OTP: ${otp}</h1>`
  }

  try {
    await resend.emails.send({
      from: 'HugoRCD <contact@hrcd.fr>',
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
