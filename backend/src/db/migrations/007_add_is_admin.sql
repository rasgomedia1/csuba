-- Admin role: checked in the DB on every admin request, never trusted from the JWT.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
