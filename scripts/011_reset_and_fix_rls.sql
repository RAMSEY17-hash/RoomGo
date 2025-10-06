-- Script pour réinitialiser et corriger les politiques RLS
-- Supprime toutes les anciennes politiques et les recrée correctement

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent consulter leur propre profil" ON users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON users;
DROP POLICY IF EXISTS "Les admins peuvent tout voir" ON users;
DROP POLICY IF EXISTS "Les admins peuvent tout modifier" ON users;
DROP POLICY IF EXISTS "Tout le monde peut voir les annonces approuvées" ON listings;
DROP POLICY IF EXISTS "Les propriétaires peuvent créer des annonces" ON listings;
DROP POLICY IF EXISTS "Les propriétaires peuvent modifier leurs annonces" ON listings;
DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer leurs annonces" ON listings;
DROP POLICY IF EXISTS "Les admins peuvent tout voir sur les annonces" ON listings;
DROP POLICY IF EXISTS "Les admins peuvent tout modifier sur les annonces" ON listings;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des conversations" ON conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs messages" ON messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages" ON messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs codes 2FA" ON two_factor_codes;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des codes 2FA" ON two_factor_codes;
DROP POLICY IF EXISTS "Tout le monde peut voir les clés propriétaires" ON owner_keys;
DROP POLICY IF EXISTS "Les admins peuvent gérer les clés propriétaires" ON owner_keys;

-- Recréer les politiques correctement

-- Politiques pour la table users
CREATE POLICY "Les utilisateurs peuvent consulter leur propre profil"
  ON users FOR SELECT
  USING (auth.uid() = id OR user_type = 'admin');

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Les admins peuvent tout voir"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent tout modifier"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

-- Politiques pour la table listings (CORRIGÉ : utilise 'validee' au lieu de 'approved')
CREATE POLICY "Tout le monde peut voir les annonces validées"
  ON listings FOR SELECT
  USING (status = 'validee');

CREATE POLICY "Les propriétaires peuvent créer des annonces"
  ON listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'owner'
    )
  );

CREATE POLICY "Les propriétaires peuvent voir leurs annonces"
  ON listings FOR SELECT
  USING (
    owner_id = auth.uid() OR
    status = 'validee' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Les propriétaires peuvent modifier leurs annonces"
  ON listings FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Les propriétaires peuvent supprimer leurs annonces"
  ON listings FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Les admins peuvent tout voir sur les annonces"
  ON listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Les admins peuvent tout modifier sur les annonces"
  ON listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

-- Politiques pour la table conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations"
  ON conversations FOR SELECT
  USING (user_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent créer des conversations"
  ON conversations FOR INSERT
  WITH CHECK (user_id = auth.uid() OR owner_id = auth.uid());

-- Politiques pour la table messages
CREATE POLICY "Les utilisateurs peuvent voir leurs messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.owner_id = auth.uid())
    )
  );

CREATE POLICY "Les utilisateurs peuvent envoyer des messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Politiques pour la table two_factor_codes
CREATE POLICY "Les utilisateurs peuvent voir leurs codes 2FA"
  ON two_factor_codes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent créer des codes 2FA"
  ON two_factor_codes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Politiques pour la table owner_keys
CREATE POLICY "Tout le monde peut voir les clés propriétaires"
  ON owner_keys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les admins peuvent gérer les clés propriétaires"
  ON owner_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.user_type = 'admin'
    )
  );

-- Permettre l'accès anonyme aux annonces validées
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès public aux annonces validées" ON listings;
CREATE POLICY "Accès public aux annonces validées"
  ON listings FOR SELECT
  TO anon
  USING (status = 'validee');
