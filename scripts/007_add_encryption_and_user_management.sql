-- Ajouter le champ is_active pour gérer l'activation/désactivation des comptes
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_owner_key ON public.users(owner_key);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Ajouter une contrainte pour empêcher la suppression du dernier admin
CREATE OR REPLACE FUNCTION prevent_last_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_type = 'admin' THEN
    IF (SELECT COUNT(*) FROM public.users WHERE user_type = 'admin' AND id != OLD.id) = 0 THEN
      RAISE EXCEPTION 'Cannot delete the last admin user';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_last_admin_before_delete
BEFORE DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION prevent_last_admin_deletion();

-- Mettre à jour la politique RLS pour permettre aux admins de voir tous les utilisateurs
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_type = 'admin'
  )
);

-- Permettre aux admins de modifier les utilisateurs
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_type = 'admin'
  )
);

-- Permettre aux admins de supprimer les utilisateurs (sauf le dernier admin via trigger)
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_type = 'admin'
  )
);

COMMENT ON COLUMN public.users.phone IS 'Encrypted with AES-256-GCM';
COMMENT ON COLUMN public.users.is_active IS 'User account status - can be disabled by admin';
