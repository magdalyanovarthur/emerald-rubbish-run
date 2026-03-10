
-- Admin needs to see all orders and chats
-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Add admin select policy for orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add admin update policy for orders
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add admin select policy for chats
CREATE POLICY "Admins can view all chats" ON public.chats
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add admin select policy for chat_messages
CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
