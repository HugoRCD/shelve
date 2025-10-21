import { hasOwnProperties } from "@utils";

type Config = ReturnType<typeof useRuntimeConfig>

type WithNodeMailer = {private: {smtp: NonNullable<Config['private']['smtp']>}}

export function isNodemailer(env: any): env is WithNodeMailer  {
  if(env.private.resendApiKey) {
    return false
  }

  return hasOwnProperties<Config['private']['smtp']>(env?.private?.smtp, ['host', 'pass', 'user'])
}

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const isGithubEnabled = !!(
    config.oauth.github.clientSecret && config.oauth.github.clientId
  );
  const isGoogleEnabled = !!(
    config.oauth.github.clientSecret && config.oauth.github.clientId
  );
  const isEmailEnabled = isNodemailer(config) ? true : !!process.env.NUXT_PRIVATE_RESEND_API_KEY;

  return {
    isGoogleEnabled,
    isGithubEnabled,
    isEmailEnabled,
  };
})
