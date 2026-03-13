
-- Confirm admin email
UPDATE auth.users SET email_confirmed_at = now() WHERE id = '01e0eb20-f609-46f7-a462-9eedc418ab7f';

-- Set admin role
UPDATE public.profiles SET role = 'admin' WHERE user_id = '01e0eb20-f609-46f7-a462-9eedc418ab7f';
