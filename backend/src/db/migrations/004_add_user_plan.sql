-- Add user_plan to track the signup choice: free tier vs. donor
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_plan VARCHAR(20) NOT NULL DEFAULT 'free';
