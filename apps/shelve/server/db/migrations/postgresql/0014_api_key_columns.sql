ALTER TABLE "tokens" ALTER COLUMN "scopes" SET DEFAULT '{"permissions":[]}'::jsonb;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "configId" varchar(32) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "keyPrefix" varchar(32);--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "rateLimitEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "rateLimitTimeWindow" integer;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "rateLimitMax" integer;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "requestCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "remaining" integer;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "refillInterval" integer;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "refillAmount" integer;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "lastRefillAt" timestamp;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "permissions" varchar(2048);--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "metadata" varchar(2048);