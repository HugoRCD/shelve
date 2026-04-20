-- Breaking change (Shelve v5):
-- Tokens were previously stored as reversible iron-webcrypto seals and
-- generated using Math.random(), which is cryptographically broken.
-- We rotate to: sha256(token) for storage, randomBytes(32) for generation,
-- per-token scopes, expiry, IP allowlist, and last-used metadata.
--
-- All pre-v5 tokens MUST be revoked because they cannot be migrated:
--   * we never stored their hash,
--   * we want to invalidate any leaked Math.random-derived tokens.
TRUNCATE TABLE "tokens" RESTART IDENTITY CASCADE;
--> statement-breakpoint
DROP INDEX IF EXISTS "tokens_token_idx";
--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "token";
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "hash" varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "prefix" varchar(16) NOT NULL;
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "scopes" jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "allowedCidrs" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "expiresAt" timestamp;
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "lastUsedAt" timestamp;
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "lastUsedIp" varchar(45);
--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_hash_unique" UNIQUE("hash");
--> statement-breakpoint
CREATE UNIQUE INDEX "tokens_hash_idx" ON "tokens" USING btree ("hash");
--> statement-breakpoint
CREATE INDEX "tokens_prefix_idx" ON "tokens" USING btree ("prefix");
