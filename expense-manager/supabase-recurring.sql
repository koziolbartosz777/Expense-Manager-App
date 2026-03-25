-- ═══════════════════════════════════════════
-- Expense Manager — Recurring columns for expenses
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring_frequency TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring_next_date DATE;
