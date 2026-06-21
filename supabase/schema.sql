-- =================================================================
-- Ligue d'Obala — Schéma de base de données (v2 — Phase 3)
-- Copiez-collez ce script dans l'éditeur SQL de votre console Supabase.
-- =================================================================

-- =================================================================
-- 0. STORAGE — Bucket pour les logos de clubs
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('logos', 'logos', true)
  ON CONFLICT DO NOTHING;

CREATE POLICY "logos_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "logos_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND (SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "logos_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'logos' AND (SELECT auth.uid()) IS NOT NULL);

-- =================================================================
-- 1. CLUBS
-- =================================================================
CREATE TABLE clubs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  logo       TEXT,
  stadium    TEXT,
  officials  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clubs_select_public" ON clubs FOR SELECT USING (true);
CREATE POLICY "clubs_all_authenticated" ON clubs FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- =================================================================
-- 2. MATCHES  (+ colonne season)
-- =================================================================
CREATE TABLE matches (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  away_team_id UUID        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  date         TIMESTAMPTZ NOT NULL,
  home_score   INT         CHECK (home_score >= 0),
  away_score   INT         CHECK (away_score >= 0),
  matchday     INT         NOT NULL DEFAULT 1 CHECK (matchday >= 1),
  status       TEXT        NOT NULL DEFAULT 'UPCOMING'
                           CHECK (status IN ('UPCOMING', 'LIVE', 'FINISHED')),
  season       TEXT        NOT NULL DEFAULT '2024-2025',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select_public" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_all_authenticated" ON matches FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- =================================================================
-- 3. ACTUALITES
-- =================================================================
CREATE TABLE actualites (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  image_url  TEXT,
  date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE actualites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "actualites_select_public" ON actualites FOR SELECT USING (true);
CREATE POLICY "actualites_all_authenticated" ON actualites FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- =================================================================
-- 4. PLAYERS  (joueurs par club et par saison)
-- =================================================================
CREATE TABLE players (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  position   TEXT        NOT NULL DEFAULT 'Milieu'
                         CHECK (position IN ('Gardien', 'Défenseur', 'Milieu', 'Attaquant')),
  number     INT         NOT NULL DEFAULT 1 CHECK (number >= 1 AND number <= 99),
  photo_url  TEXT,
  season     TEXT        NOT NULL DEFAULT '2024-2025',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_select_public" ON players FOR SELECT USING (true);
CREATE POLICY "players_all_authenticated" ON players FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- =================================================================
-- 5. GOALS  (buts liés aux matchs et joueurs)
-- =================================================================
CREATE TABLE goals (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id  UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id    UUID        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  minute     INT         CHECK (minute >= 1 AND minute <= 120),
  season     TEXT        NOT NULL DEFAULT '2024-2025',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_select_public" ON goals FOR SELECT USING (true);
CREATE POLICY "goals_all_authenticated" ON goals FOR ALL
  USING ((SELECT auth.uid()) IS NOT NULL)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- =================================================================
-- DONNÉES D'EXEMPLE (seed)
-- =================================================================

INSERT INTO clubs (id, name, logo, stadium, officials) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Obala FC',            '/logos/obala.png',  'Stade Municipal d''Obala', '["Jean Etoa (Président)", "Marc Ndi (Entraîneur)"]'),
  ('22222222-2222-2222-2222-222222222222', 'Lékié AC',            '/logos/lekie.png',  'Stade Annexe',             '["Paul Mbia (Président)"]'),
  ('33333333-3333-3333-3333-333333333333', 'AS Mefou',            '/logos/mefou.png',  'Terrain Communal',         '["Simon Zogo"]'),
  ('44444444-4444-4444-4444-444444444444', 'Camer Football Club', '/logos/camer.png',  'Arena de la Lekié',        '["Jacques Mbarga"]'),
  ('55555555-5555-5555-5555-555555555555', 'Etoile d''Obala',     '/logos/etoile.png', 'Stade Municipal d''Obala', '[]'),
  ('66666666-6666-6666-6666-666666666666', 'Panthers Nkol',       '/logos/nkol.png',   'Stade de Nkol',            '[]');

INSERT INTO matches (home_team_id, away_team_id, date, home_score, away_score, matchday, status, season) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days', 2,    1,    1, 'FINISHED', '2024-2025'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '10 days', 0,    0,    1, 'FINISHED', '2024-2025'),
  ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '9 days',  3,    0,    1, 'FINISHED', '2024-2025'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3 days',  1,    2,    2, 'FINISHED', '2024-2025'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days',  1,    1,    2, 'FINISHED', '2024-2025'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NOW() + INTERVAL '1 day',   NULL, NULL, 2, 'UPCOMING', '2024-2025'),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW() + INTERVAL '7 days',  NULL, NULL, 3, 'UPCOMING', '2024-2025');

INSERT INTO actualites (title, content, date) VALUES
  ('Ouverture de la saison 2024-2025',
   'La Ligue Départementale de Football d''Obala a le plaisir d''annoncer le début officiel du championnat. Tous les clubs sont invités à retirer leurs licences au secrétariat.',
   NOW() - INTERVAL '20 days'),
  ('Le Règlement Intérieur Mis à Jour',
   'Le nouveau règlement de la compétition est désormais disponible en téléchargement dans la section À propos. Veuillez noter les modifications concernant les remplacements.',
   NOW() - INTERVAL '15 days'),
  ('Suspension du Stade Municipal',
   'En raison des fortes pluies de la nuit dernière, le match prévu au Stade Municipal ce week-end est reporté à une date ultérieure.',
   NOW() - INTERVAL '2 days');

-- Quelques joueurs d'exemple
INSERT INTO players (club_id, name, position, number, season) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Paul Etoa',   'Gardien',    1,  '2024-2025'),
  ('11111111-1111-1111-1111-111111111111', 'Marc Essama', 'Défenseur',  5,  '2024-2025'),
  ('11111111-1111-1111-1111-111111111111', 'Jean Nkomo',  'Milieu',     8,  '2024-2025'),
  ('11111111-1111-1111-1111-111111111111', 'Alain Owona', 'Attaquant',  9,  '2024-2025'),
  ('22222222-2222-2222-2222-222222222222', 'Pierre Mbia', 'Gardien',    1,  '2024-2025'),
  ('22222222-2222-2222-2222-222222222222', 'Serge Ndi',   'Attaquant',  11, '2024-2025');
