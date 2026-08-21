-- Migration: Allow Admins to Read All Orders
-- Enables admins (profiles.is_admin = true) to view all platform transactions

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'orders' 
          AND policyname = 'Admin orders read'
    ) THEN
        CREATE POLICY "Admin orders read" ON public.orders
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.is_admin = true
            )
        );
    END IF;
END $$;
