
-- Fix overly permissive update policy: only allow users to see updates to their own payments
DROP POLICY "Service role can update payments" ON public.payments;

-- Webhook updates will use service_role key which bypasses RLS
-- Users can only update their own payments (shouldn't normally need to)
CREATE POLICY "Users can update own payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
