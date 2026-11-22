-- Users from before Better Auth proved their email with a code or an OAuth provider. Better Auth deletes the
-- linked accounts of an unverified user who signs in with an email code, so they are marked verified.
UPDATE "users" SET "emailVerified" = true WHERE "emailVerified" = false;--> statement-breakpoint
-- Better Auth looks emails up lowercased. Stored ones are lowercased too, except two users whose emails only
-- differ by case: the unique index keeps one of them as it is.
UPDATE "users" u SET "email" = lower(u."email")
WHERE u."email" <> lower(u."email")
  AND NOT EXISTS (SELECT 1 FROM "users" o WHERE o."id" <> u."id" AND lower(o."email") = lower(u."email"));
