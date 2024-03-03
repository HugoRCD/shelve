import { useCompiler } from '#vue-email';
import { Resend } from "resend";

const resend = new Resend(process.env.NUXT_PRIVATE_RESEND_API_KEY);

// find your audience id here: https://resend.com/audiences
const nuxtLogAudienceId = "555dc1c1-1008-4182-be98-605be9d1ebf6";

type sendMailDto = {
  email: string;
  message: string;
  name: string;
}

export async function sendOtp(email: string, otp: string) {
  const runtimeConfig = useRuntimeConfig();
  const siteUrl = runtimeConfig.public.siteUrl;
  const template = await useCompiler('otp.vue', {
    props: {
      otp,
      redirectUrl: `${siteUrl}/login?email=${email}`,
    }
  });

  try {
    await resend.emails.send({
      from: "HugoRCD <contact@hrcd.fr>",
      to: [email],
      subject: "Welcome to Shelves!",
      html: template.html,
    });
  } catch (error) {
    console.error(error);
  }
}
