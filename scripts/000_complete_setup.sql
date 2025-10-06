-- ============================================
-- SCRIPT COMPLET DE CONFIGURATION ROOMGO
-- Exécutez ce script UNE SEULE FOIS dans Supabase SQL Editor
-- ============================================

-- 1. CRÉER TOUTES LES TABLES
-- ============================================

-- Table users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'owner', 'admin')),
  phone TEXT,
  owner_key TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table listings (annonces)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_key TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chambre', 'studio', 'appartement')),
  price DECIMAL(10,2) NOT NULL,
  quartier TEXT NOT NULL,
  address TEXT NOT NULL,
  nearby_schools TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'validee', 'rejetee')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, student_id, owner_id)
);

-- Table messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table two_factor_codes
CREATE TABLE IF NOT EXISTS public.two_factor_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVER ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_codes ENABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER LES ANCIENNES POLITIQUES (si elles existent)
-- ============================================

DROP POLICY IF EXISTS "Public can view validated listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Owners can create listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can delete their own listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can manage their 2FA codes" ON public.two_factor_codes;

-- 4. CRÉER LES POLITIQUES RLS
-- ============================================

-- Politiques pour users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Politiques pour listings (IMPORTANT: accès public aux annonces validées)
CREATE POLICY "Public can view validated listings"
  ON public.listings FOR SELECT
  USING (status = 'validee' OR auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Owners can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id AND 
              EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'owner'));

CREATE POLICY "Owners can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all listings"
  ON public.listings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

-- Politiques pour conversations
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Politiques pour messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND (student_id = auth.uid() OR owner_id = auth.uid())
  ));

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Politiques pour two_factor_codes
CREATE POLICY "Users can manage their 2FA codes"
  ON public.two_factor_codes FOR ALL
  USING (auth.uid() = user_id);

-- 5. CRÉER LE COMPTE ADMIN
-- ============================================

-- Insérer dans auth.users (si n'existe pas déjà)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'wouemboahmed@gmail.com';
  
  IF admin_user_id IS NULL THEN
    -- Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'wouemboahmed@gmail.com',
      crypt('@135792!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"RoomGo Admin"}',
      false,
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO admin_user_id;
    
    RAISE NOTICE 'Compte admin créé avec succès';
  ELSE
    RAISE NOTICE 'Le compte admin existe déjà';
  END IF;
  
  -- Insérer ou mettre à jour dans public.users
  INSERT INTO public.users (id, email, username, user_type, is_active)
  VALUES (admin_user_id, 'wouemboahmed@gmail.com', 'RoomGo Admin', 'admin', true)
  ON CONFLICT (id) DO UPDATE
  SET user_type = 'admin', is_active = true;
  
  RAISE NOTICE 'Entrée admin créée dans public.users';
END $$;

-- 6. AJOUTER DES DONNÉES DE TEST (optionnel)
-- ============================================

-- Quelques annonces de test (vous pouvez les supprimer plus tard)
INSERT INTO public.listings (title, description, type, price, quartier, address, nearby_schools, amenities, images, status)
VALUES 
  ('Chambre meublée à Tokoin', 'Belle chambre meublée avec climatisation', 'chambre', 35000, 'Tokoin', 'Rue de Tokoin, Lomé', ARRAY['IAI Togo', 'LBS'], ARRAY['Climatisation', 'Wifi', 'Eau courante'], ARRAY['/placeholder.svg?height=400&width=600'], 'validee'),
  ('Studio moderne à Adidogomé', 'Studio tout équipé proche des universités', 'studio', 60000, 'Adidogomé', 'Adidogomé Carrefour, Lomé', ARRAY['EPL', 'IAI Togo'], ARRAY['Cuisine équipée', 'Salle de bain privée', 'Wifi'], ARRAY['/placeholder.svg?height=400&width=600'], 'validee'),
  ('Appartement 2 pièces à Bè', 'Appartement spacieux avec balcon', 'appartement', 85000, 'Bè', 'Bè Kpota, Lomé', ARRAY['LBS'], ARRAY['Balcon', 'Parking', 'Sécurité'], ARRAY['/placeholder.svg?height=400&width=600'], 'validee')
ON CONFLICT DO NOTHING;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Vérification finale
SELECT 'Configuration terminée avec succès!' as message;
SELECT 'Tables créées:', COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Compte admin:', email, user_type FROM public.users WHERE user_type = 'admin';
