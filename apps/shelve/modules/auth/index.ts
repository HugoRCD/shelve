import { defineNuxtModule } from "nuxt/kit";
import { z } from "zod";
import {hasOwnProperties} from "utils"

// eslint-disable-next-line
function validateOAuthPair(
  data: Record<string, any>,
  ctx: any,
  clientIdKey: string,
  clientSecretKey: string,
  providerName: string,
) {
  const hasId = !!data[clientIdKey];
  const hasSecret = !!data[clientSecretKey];

  if (hasId !== hasSecret) {
    const missingKey = hasId ? clientSecretKey : clientIdKey;
    const existingKey = hasId ? clientIdKey : clientSecretKey;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${missingKey} is required when ${existingKey} is set for ${providerName} OAuth.`,
      path: [missingKey],
    });
  }
}

const commaSeparatedStringToArray = z.preprocess((val) => {
  if (typeof val === "string" && val.length > 0) {
    return val.split(",").map((s) => s.trim());
  }
  return [];
}, z.array(z.string()).optional());

const requiredCoreSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .startsWith("postgres", "Must be a valid PostgreSQL URL."),
  NUXT_SESSION_PASSWORD: z
    .string()
    .min(32, "Session password must be at least 32 characters long."),
  NUXT_PRIVATE_ENCRYPTION_KEY: z
    .string()
    .min(32, "Encryption key must be at least 32 characters long."),
});

const authProvidersSchema = z.object({
  NUXT_OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  NUXT_PRIVATE_GITHUB_PRIVATE_KEY: z.string().optional(),
});

const resendSchema = z.object({
  NUXT_PRIVATE_RESEND_API_KEY: z
    .string()
    .startsWith("re_", 'Resend API key must start with "re_"').or(z.literal("")),
  NUXT_PRIVATE_SENDER_EMAIL: z.string().email(),
});

const nodemailerSchema = z.object({
  NUXT_PRIVATE_SMTP_HOST: z.string().min(1),
  NUXT_PRIVATE_SMTP_PORT: z.string().transform(Number),
  NUXT_PRIVATE_SMTP_USER: z.string().min(1),
  NUXT_PRIVATE_SMTP_PASS: z.string().min(1),
  NUXT_PRIVATE_SENDER_EMAIL: z.string().email(),
});

const emailSchema = z.union([resendSchema, nodemailerSchema])

const adminAndSecuritySchema = z.object({
  NUXT_PRIVATE_ADMIN_EMAILS: commaSeparatedStringToArray.pipe(
    z.array(z.string().email("One of the admin emails is invalid.")),
  ),
  NUXT_PRIVATE_ALLOWED_ORIGINS: commaSeparatedStringToArray.pipe(
    z.array(z.string().url("One of the allowed origins is an invalid URL.")),
  ),
});

export const envSchema = requiredCoreSchema
  .merge(authProvidersSchema)
  .merge(adminAndSecuritySchema)
  .and(emailSchema)
  .superRefine((data, ctx) => {
    validateOAuthPair(
      data,
      ctx,
      "NUXT_OAUTH_GITHUB_CLIENT_ID",
      "NUXT_OAUTH_GITHUB_CLIENT_SECRET",
      "GitHub",
    );
    validateOAuthPair(
      data,
      ctx,
      "NUXT_OAUTH_GOOGLE_CLIENT_ID",
      "NUXT_OAUTH_GOOGLE_CLIENT_SECRET",
      "Google",
    );
  });

function handleValidationError(error: z.ZodError) {
  console.error("❌ Environment variables validation failed:");
  const { fieldErrors } = error.flatten();

  for (const field in fieldErrors) {
    const messages = fieldErrors[field as keyof typeof fieldErrors];
    if (messages) {
      console.error(`  - ${field}: ${messages.join(", ")}`);
    }
  }
  process.exit(1);
}

function isNodemailer<T extends z.infer<typeof nodemailerSchema>, Q extends z.infer<typeof resendSchema>>(env: any): env is T {
  if((env as Q).NUXT_PRIVATE_RESEND_API_KEY) {
    return false
  }

  return hasOwnProperties<T>(env, ['NUXT_PRIVATE_SMTP_HOST', 'NUXT_PRIVATE_SMTP_PASS', 'NUXT_PRIVATE_SMTP_USER'])
}

export default defineNuxtModule({
  meta: {
    name: "@shelve/auth",
  },
  setup(options, nuxt) {
    try {
      const skipValidation = process.env.SKIP_ENV_VALIDATION;
      const isNonVercelCI = process.env.CI && !process.env.VERCEL;
      if (isNonVercelCI || skipValidation) {
        console.log(
          "Non-Vercel CI environment detected or SKIP_ENV_VALIDATION is set. Skipping environment variable validation.",
        );
        return;
      }
      let { data: env, error } = envSchema.safeParse(process.env);

      if (!env) {
        env = {} as any;
        console.warn(error)
      }

      if (!env) {
        console.error("No env object, this was never supposed to be reached");
        throw error
      }

      const isGithubEnabled = !!(
        env.NUXT_OAUTH_GITHUB_CLIENT_ID && env.NUXT_OAUTH_GITHUB_CLIENT_SECRET
      );
      const isGoogleEnabled = !!(
        env.NUXT_OAUTH_GOOGLE_CLIENT_ID && env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      );
      const isEmailEnabled = isNodemailer(process.env) ? true : !!process.env.NUXT_PRIVATE_RESEND_API_KEY

      console.log("🔐 Auth configuration on startup:");
      console.log(`  GitHub OAuth: ${isGithubEnabled ? "✅" : "❌"}`);
      console.log(`  Google OAuth: ${isGoogleEnabled ? "✅" : "❌"}`);
      console.log(`  Email Service: ${isEmailEnabled ? "✅" : "❌"}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        handleValidationError(error);
      }
      throw error;
    }
  },
});
