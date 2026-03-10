
-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  client_name text NOT NULL DEFAULT '',
  courier_id uuid,
  courier_name text,
  street text NOT NULL,
  house text NOT NULL,
  apartment text NOT NULL DEFAULT '',
  entrance text NOT NULL DEFAULT '',
  scheduled_date text NOT NULL,
  scheduled_time text NOT NULL,
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'searching',
  created_at timestamptz NOT NULL DEFAULT now(),
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Clients can see their own orders
CREATE POLICY "Clients can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

-- Couriers can see orders they're assigned to or searching orders
CREATE POLICY "Couriers can view available and own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    status = 'searching' OR courier_id = auth.uid()
  );

-- Clients can insert their own orders
CREATE POLICY "Clients can insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Clients can update own orders (e.g. cancel)
CREATE POLICY "Clients can update own orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = client_id);

-- Couriers can update orders (take/complete)
CREATE POLICY "Couriers can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (status = 'searching' OR courier_id = auth.uid());

-- Chats table
CREATE TABLE public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  participant_client uuid NOT NULL,
  participant_courier uuid NOT NULL,
  last_message text,
  last_message_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their chats" ON public.chats
  FOR SELECT TO authenticated
  USING (auth.uid() = participant_client OR auth.uid() = participant_courier);

CREATE POLICY "Participants can insert chats" ON public.chats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_client OR auth.uid() = participant_courier);

CREATE POLICY "Participants can update chats" ON public.chats
  FOR UPDATE TO authenticated
  USING (auth.uid() = participant_client OR auth.uid() = participant_courier);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL DEFAULT '',
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Messages visible to order participants
CREATE POLICY "Order participants can view messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
      AND (o.client_id = auth.uid() OR o.courier_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can send messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for orders and chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
