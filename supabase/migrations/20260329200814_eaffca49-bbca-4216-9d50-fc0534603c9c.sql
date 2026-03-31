
-- Create score history table
CREATE TABLE public.cibil_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pan TEXT NOT NULL,
  cibil_score INTEGER NOT NULL,
  report TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'api',
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast PAN lookups
CREATE INDEX idx_cibil_history_pan ON public.cibil_history(pan);

-- Enable RLS
ALTER TABLE public.cibil_history ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read cibil history" ON public.cibil_history
  FOR SELECT USING (true);

-- Insert via service role (edge function)
CREATE POLICY "Allow insert for all" ON public.cibil_history
  FOR INSERT WITH CHECK (true);
