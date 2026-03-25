-- ═══════════════════════════════════════════
-- Expense Manager — Income Table
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

CREATE TABLE income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'weekly' | 'monthly' | 'yearly'
  recurring_next_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own income" ON income;
CREATE POLICY "Users see own income" ON income
  FOR ALL USING (auth.uid() = user_id);
