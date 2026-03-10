
-- Payments table to track YooKassa payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_type text NOT NULL DEFAULT 'order', -- 'order' or 'subscription'
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'RUB',
  status text NOT NULL DEFAULT 'pending', -- pending, waiting_for_capture, succeeded, canceled
  yookassa_payment_id text,
  order_id text, -- local order id for order payments
  subscription_type text, -- for subscription payments
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to update payments (for webhook)
CREATE POLICY "Service role can update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
