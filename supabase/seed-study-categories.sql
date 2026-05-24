-- Run once in Supabase SQL editor to match auto-publish categories
INSERT INTO categories (name, slug) VALUES
  ('Study Notes', 'study-notes'),
  ('Practice Questions', 'practice-questions'),
  ('Mock Tests', 'mock-tests'),
  ('Vacancy Details', 'vacancy-details')
ON CONFLICT (slug) DO NOTHING;
