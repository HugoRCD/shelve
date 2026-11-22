-- Better Auth's api-key plugin stores SHA-256(key) as unpadded base64url; Shelve stored the same digest as hex.
-- Re-encoding the digest keeps every existing `she_` token valid. Rows already in base64url are left alone.
UPDATE "tokens"
SET "hash" = rtrim(translate(encode(decode("hash", 'hex'), 'base64'), '+/', '-_'), '=')
WHERE "hash" ~ '^[0-9a-f]{64}$';
