CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"authType" text DEFAULT 'email' NOT NULL,
	"onboarding" boolean DEFAULT false NOT NULL,
	"cliInstalled" boolean DEFAULT false NOT NULL,
	"legacyId" bigint,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_legacyId_unique" UNIQUE("legacyId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expiresAt" timestamp NOT NULL,
	"token" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "authType" text DEFAULT 'email';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cliInstalled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
UPDATE "users"
SET "username" = COALESCE(
	NULLIF("username", ''),
	NULLIF(TRIM(CONCAT_WS(' ', "firstName", "lastName")), ''),
	"email"
)
WHERE "username" IS NULL OR "username" = '';
--> statement-breakpoint
INSERT INTO "user" (
	"id",
	"name",
	"email",
	"emailVerified",
	"image",
	"role",
	"authType",
	"onboarding",
	"cliInstalled",
	"legacyId",
	"createdAt",
	"updatedAt"
)
SELECT
	gen_random_uuid(),
	"username",
	"email",
	true,
	"avatar",
	"role"::text,
	"authType"::text,
	"onboarding",
	"cliInstalled",
	"id"::bigint,
	"createdAt",
	"updatedAt"
	FROM "users";
--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" DROP CONSTRAINT IF EXISTS "github_app_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" RENAME COLUMN "userId" TO "legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" ADD COLUMN IF NOT EXISTS "userId" uuid;--> statement-breakpoint
UPDATE "github_app" SET "userId" = "user"."id" FROM "user" WHERE "user"."legacyId" = "github_app"."legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" ADD CONSTRAINT "github_app_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" DROP COLUMN IF EXISTS "legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "members" DROP CONSTRAINT IF EXISTS "members_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "members" RENAME COLUMN "userId" TO "legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "members" ADD COLUMN IF NOT EXISTS "userId" uuid;--> statement-breakpoint
UPDATE "members" SET "userId" = "user"."id" FROM "user" WHERE "user"."legacyId" = "members"."legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "members" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE IF EXISTS "members" ADD CONSTRAINT "members_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP INDEX IF EXISTS "members_user_team_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "members_user_team_idx" ON "members" USING btree ("userId","teamId");--> statement-breakpoint
ALTER TABLE IF EXISTS "members" DROP COLUMN IF EXISTS "legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" DROP CONSTRAINT IF EXISTS "tokens_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" RENAME COLUMN "userId" TO "legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" ADD COLUMN IF NOT EXISTS "userId" uuid;--> statement-breakpoint
UPDATE "tokens" SET "userId" = "user"."id" FROM "user" WHERE "user"."legacyId" = "tokens"."legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" ADD CONSTRAINT "tokens_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP INDEX IF EXISTS "tokens_user_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tokens_user_idx" ON "tokens" USING btree ("userId");--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" DROP COLUMN IF EXISTS "legacyUserId";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" DROP CONSTRAINT IF EXISTS "invitations_invitedById_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" RENAME COLUMN "invitedById" TO "legacyInvitedById";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" ADD COLUMN IF NOT EXISTS "invitedById" uuid;--> statement-breakpoint
UPDATE "invitations" SET "invitedById" = "user"."id" FROM "user" WHERE "user"."legacyId" = "invitations"."legacyInvitedById";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" ADD CONSTRAINT "invitations_invitedById_user_id_fk" FOREIGN KEY ("invitedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" DROP COLUMN IF EXISTS "legacyInvitedById";--> statement-breakpoint
	DROP TABLE IF EXISTS "users";--> statement-breakpoint
	DROP TYPE IF EXISTS "roles";--> statement-breakpoint
	DROP TYPE IF EXISTS "auth_types";--> statement-breakpoint
