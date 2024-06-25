import { Resend } from 'resend'
import { useCompiler } from '#vue-email'

const resend = new Resend(process.env.NUXT_PRIVATE_RESEND_API_KEY)

export async function sendOtp(email: string, otp: string) {
  const runtimeConfig = useRuntimeConfig()
  const { siteUrl } = runtimeConfig.public
  let template = { html: '' }
  try {
    template = await useCompiler('verify-otp.vue', {
      props: {
        otp,
        redirectUrl: `${siteUrl}/login?email=${email}&otp=${otp}`,
      }
    })
  } catch (error) {
    template.html = `<h1>OTP: ${otp}</h1>`
  }

  try {
    await resend.emails.send({
      from: 'HugoRCD <contact@hrcd.fr>',
      to: [email],
      subject: 'Welcome to Shelve!',
      html: template.html,
    })
  } catch (error) { /* empty */ }
}
