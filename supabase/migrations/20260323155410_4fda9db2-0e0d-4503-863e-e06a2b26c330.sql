
-- Create service_zones table
CREATE TABLE public.service_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street text NOT NULL,
  houses text[] NOT NULL DEFAULT '{}',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;

-- Everyone can read active zones
CREATE POLICY "Anyone can view active zones" ON public.service_zones
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert zones" ON public.service_zones
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "Admins can update zones" ON public.service_zones
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins can delete zones" ON public.service_zones
  FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- Seed existing hardcoded data
INSERT INTO public.service_zones (street, houses, lat, lng) VALUES
  ('5-я просека', ARRAY['89','89а','89б','93','95','95а','95б','97','97а','97б','99','99а','99б','100к1','100к2','101','102','103','104','104а','104б','106','107','108','109','110','110а','110б','110в','110г','110д','110е','110к','111','113','115','117','119','121','123','125','129','132','133','135','137','139','141','142','145','147','149','151','153','155','343'], 53.2200, 50.1900),
  ('6-я просека', ARRAY['125','127','129','135','140','141','143','145','147','149','151','153','155','157','159','159а','159б','161','163','165','165б'], 53.2220, 50.1950),
  ('Улица Советской Армии', ARRAY['253','259','261','271','271а','275','277','281','283','285','291'], 53.2100, 50.1400),
  ('Улица Солнечная', ARRAY['1','2','3','4','5','6','7','8','9','9а','10','11','12','14','16','18','20','22','24б'], 53.2050, 50.1350),
  ('Улица Шверника', ARRAY['2','4','6','8','10','14','16','22','24'], 53.2150, 50.1500),
  ('Улица 22-го Партсъезда', ARRAY['188','192','194','196','198','221','223','225','227'], 53.2180, 50.1600);
