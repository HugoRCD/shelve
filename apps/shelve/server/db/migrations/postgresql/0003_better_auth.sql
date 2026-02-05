CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TABLE "user" (
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
CREATE TABLE "session" (
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
CREATE TABLE "account" (
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
CREATE TABLE "verification" (
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
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
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
	"id",
	"createdAt",
	"updatedAt"
FROM "users";
--> statement-breakpoint
ALTER TABLE "github_app" DROP CONSTRAINT "github_app_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "members_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE "github_app" RENAME COLUMN "userId" TO "legacyUserId";--> statement-breakpoint
ALTER TABLE "members" RENAME COLUMN "userId" TO "legacyUserId";--> statement-breakpoint
ALTER TABLE "tokens" RENAME COLUMN "userId" TO "legacyUserId";--> statement-breakpoint
ALTER TABLE "github_app" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "userId" uuid;--> statement-breakpoint
UPDATE "github_app" SET "userId" = "user"."id" FROM "user" WHERE "user"."legacyId" = "github_app"."legacyUserId";--> statement-breakpoint
UPDATE "members" SET "userId" = "user"."id" FROM "user" WHERE "user"."legacyId" = "members"."legacyUserId";--> statement-breakpoint
UPDATE "tokens" SET "userId" = "user"."id" FROM "user" WHERE "user"."legacyId" = "tokens"."legacyUserId";--> statement-breakpoint
ALTER TABLE "github_app" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "github_app" ADD CONSTRAINT "github_app_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP INDEX IF EXISTS "members_user_team_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "tokens_user_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "members_user_team_idx" ON "members" USING btree ("userId","teamId");--> statement-breakpoint
CREATE INDEX "tokens_user_idx" ON "tokens" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "github_app" DROP COLUMN "legacyUserId";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "legacyUserId";--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN "legacyUserId";--> statement-breakpoint
DROP TABLE "users";--> statement-breakpoint
DROP TYPE "roles";--> statement-breakpoint
DROP TYPE "auth_types";--> statement-breakpoint
