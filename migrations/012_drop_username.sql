-- Drop username column from users table
-- The username feature has been removed from the app

-- 1. Drop the unique index on username
DROP INDEX IF EXISTS "IDX_username_unique";

-- 2. Drop the column
ALTER TABLE "users" DROP COLUMN IF EXISTS "username";
