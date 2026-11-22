-- API tokens become Better Auth's API keys: the table and its columns take the names of the api-key plugin's `apikey` model.
-- Renames keep every row, constraint and index; no data is copied.
ALTER TABLE "tokens" RENAME TO "api_keys";--> statement-breakpoint
ALTER SEQUENCE "tokens_id_seq" RENAME TO "api_keys_id_seq";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME CONSTRAINT "tokens_pkey" TO "api_keys_pkey";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "hash" TO "key";--> statement-breakpoint
-- `prefix` held the characters shown in the UI, which Better Auth calls `start`; its `prefix` is the plugin's own key prefix.
ALTER TABLE "api_keys" RENAME COLUMN "prefix" TO "start";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "keyPrefix" TO "prefix";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "userId" TO "referenceId";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "lastUsedAt" TO "lastRequest";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME CONSTRAINT "tokens_hash_unique" TO "api_keys_key_unique";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME CONSTRAINT "tokens_userId_users_id_fk" TO "api_keys_referenceId_users_id_fk";--> statement-breakpoint
ALTER INDEX "tokens_hash_idx" RENAME TO "api_keys_key_idx";--> statement-breakpoint
ALTER INDEX "tokens_user_idx" RENAME TO "api_keys_reference_idx";--> statement-breakpoint
ALTER INDEX "tokens_prefix_idx" RENAME TO "api_keys_start_idx";--> statement-breakpoint
ALTER TABLE "cli_device_auth" RENAME COLUMN "tokenId" TO "apiKeyId";--> statement-breakpoint
ALTER TABLE "cli_device_auth" RENAME CONSTRAINT "cli_device_auth_tokenId_tokens_id_fk" TO "cli_device_auth_apiKeyId_api_keys_id_fk";--> statement-breakpoint
-- Same conversion as 0015, for keys an instance still running the previous release saved with a hex hash after 0015 ran.
UPDATE "api_keys"
SET "key" = rtrim(translate(encode(decode("key", 'hex'), 'base64'), '+/', '-_'), '=')
WHERE "key" ~ '^[0-9a-f]{64}$';
