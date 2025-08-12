-- Fix policy guards using pg_policies.policyname
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE policyname = 'admin write bf_category';
  IF NOT FOUND THEN
    CREATE POLICY "admin write bf_category" ON public.bf_category FOR ALL
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE policyname = 'admin write bf_offer';
  IF NOT FOUND THEN
    CREATE POLICY "admin write bf_offer" ON public.bf_offer FOR ALL
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;