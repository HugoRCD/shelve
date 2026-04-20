-- Envelope encryption preparation:
-- Each project may carry its own Data Encryption Key (DEK), itself sealed
-- with the global encryption key (KEK). New variables are encrypted with
-- the DEK; existing variables continue to decrypt with the KEK directly.
-- This unlocks per-project key rotation, scoped blast radius, and BYOK.
ALTER TABLE "projects" ADD COLUMN "encryptedDek" varchar(1024);
