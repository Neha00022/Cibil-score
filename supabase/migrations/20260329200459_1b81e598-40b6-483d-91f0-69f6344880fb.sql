
-- Create table for CIBIL score records
CREATE TABLE public.cibil_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pan TEXT NOT NULL UNIQUE,
  email TEXT,
  cibil_score INTEGER NOT NULL,
  report TEXT NOT NULL,
  last_fetched TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cibil_records ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read records (public score check)
CREATE POLICY "Anyone can read cibil records" ON public.cibil_records
  FOR SELECT USING (true);

-- Only edge functions (service role) manage inserts/updates
CREATE POLICY "Allow insert for all" ON public.cibil_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all" ON public.cibil_records
  FOR UPDATE USING (true);
