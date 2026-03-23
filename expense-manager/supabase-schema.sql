-- ============================================
-- Expense Manager – schemat bazy danych
-- Wklej ten SQL w: Supabase → SQL Editor → New query → Run
-- ============================================

-- Tabela wydatków
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  currency TEXT DEFAULT 'PLN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela budżetów
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  category TEXT NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  period TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wyłącz RLS tymczasowo (włączymy po dodaniu auth)
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
