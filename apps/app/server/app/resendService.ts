import { useCompiler } from '#vue-email';
import { Resend } from "resend";

const resend = new Resend(process.env.NUXT_PRIVATE_RESEND_API_KEY);

export async function sendOtp(email: string, otp: string) {
  const runtimeConfig = useRuntimeConfig();
  const siteUrl = runtimeConfig.public.siteUrl;
  const template = await useCompiler('verify-otp.vue', {
    props: {
      otp,
      redirectUrl: `${siteUrl}/login?email=${email}&otp=${otp}`,
    }
  });

  try {
    await resend.emails.send({
      from: "HugoRCD <contact@hrcd.fr>",
      to: [email],
      subject: "Welcome to Shelve!",
      html: template.html,
    });
  } catch (error) {
    console.error(error);
  }
}
