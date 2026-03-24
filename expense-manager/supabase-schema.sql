-- ═══════════════════════════════════════════
-- Expense Manager — Supabase Schema
-- ═══════════════════════════════════════════

-- Tabela wydatków
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela budżetów
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount NUMERIC NOT NULL,
  period TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela kategorii (własne kategorie użytkownika)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📌',
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Użytkownik widzi/modyfikuje tylko swoje wydatki
CREATE POLICY "Users see own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Użytkownik widzi/modyfikuje tylko swoje budżety
CREATE POLICY "Users see own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Użytkownik widzi/modyfikuje tylko swoje kategorie
CREATE POLICY "Users see own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);
