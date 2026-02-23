-- Canonical compatibility drift migration for Better Auth baseline post-0003.
ALTER TABLE IF EXISTS "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "users" CASCADE;--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" DROP CONSTRAINT IF EXISTS "github_app_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" DROP CONSTRAINT IF EXISTS "github_app_userId_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" DROP CONSTRAINT IF EXISTS "invitations_invitedById_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" DROP CONSTRAINT IF EXISTS "invitations_invitedById_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "members" DROP CONSTRAINT IF EXISTS "members_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "members" DROP CONSTRAINT IF EXISTS "members_userId_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" DROP CONSTRAINT IF EXISTS "tokens_userId_users_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" DROP CONSTRAINT IF EXISTS "tokens_userId_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "user" ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE IF EXISTS "user" ADD COLUMN IF NOT EXISTS "banReason" text;--> statement-breakpoint
ALTER TABLE IF EXISTS "user" ADD COLUMN IF NOT EXISTS "banExpires" timestamp;--> statement-breakpoint
ALTER TABLE IF EXISTS "user" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE IF EXISTS "session" ADD COLUMN IF NOT EXISTS "impersonatedBy" text;--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" ALTER COLUMN "invitedById" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE IF EXISTS "members" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
-- Avoid `DO $$ ... $$` blocks here: NuxtHub's SQL splitter does not handle them reliably.
ALTER TABLE IF EXISTS "github_app" DROP CONSTRAINT IF EXISTS "github_app_userId_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "github_app"
  ADD CONSTRAINT "github_app_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations" DROP CONSTRAINT IF EXISTS "invitations_invitedById_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "invitations"
  ADD CONSTRAINT "invitations_invitedById_user_id_fk"
  FOREIGN KEY ("invitedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "members" DROP CONSTRAINT IF EXISTS "members_userId_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "members"
  ADD CONSTRAINT "members_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens" DROP CONSTRAINT IF EXISTS "tokens_userId_user_id_fk";--> statement-breakpoint
ALTER TABLE IF EXISTS "tokens"
  ADD CONSTRAINT "tokens_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."auth_types";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."roles";
