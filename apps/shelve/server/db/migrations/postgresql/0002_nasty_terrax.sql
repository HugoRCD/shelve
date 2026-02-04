ALTER TABLE "users" ADD COLUMN "otpToken" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otpAttempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otpLastRequestAt" timestamp;