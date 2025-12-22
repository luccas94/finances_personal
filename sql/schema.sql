-- SQL schema for Supabase/Postgres

create table if not exists despesas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  valor numeric not null,
  data date,
  descricao text,
  categoria text,
  subcategoria text,
  estabelecimento text,
  imagem_url text,
  shared boolean default false,
  criado_em timestamp with time zone default now()
);

create table if not exists faturas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  banco text,
  mes_referencia date,
  pdf_url text,
  criado_em timestamp with time zone default now()
);

create table if not exists lancamentos_fatura (
  id uuid default gen_random_uuid() primary key,
  fatura_id uuid references faturas(id) on delete cascade,
  data date,
  descricao text,
  valor numeric,
  parcela_atual int,
  parcela_total int,
  categoria text,
  subcategoria text
);

-- RLS guidance included as comments below

-- ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "despesas_owner_or_shared" ON despesas
--   FOR SELECT USING (shared = true OR user_id = auth.uid());
-- CREATE POLICY "despesas_insert" ON despesas
--   FOR INSERT WITH CHECK (user_id = auth.uid());

-- categorias table and seed (hierarchical)
CREATE TABLE IF NOT EXISTS categorias (
  id serial primary key,
  nome text not null,
  slug text unique not null,
  parent_id int references categorias(id) on delete set null
);

-- seed categories according to requested hierarchy
INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('ALIMENTAÇÃO','alimentacao', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('IFOOD','ifood', (SELECT id FROM categorias WHERE slug='alimentacao'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('MERCADO','mercado', (SELECT id FROM categorias WHERE slug='alimentacao'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('LAZER','lazer', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('TABACO/SEDA','tabaco_seda', (SELECT id FROM categorias WHERE slug='lazer'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('BARES','bares', (SELECT id FROM categorias WHERE slug='lazer'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('RESTAURANTES','restaurantes', (SELECT id FROM categorias WHERE slug='lazer'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('CARRO','carro', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('COMBUSTIVEL','combustivel', (SELECT id FROM categorias WHERE slug='carro'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('MANUTENÇÃO','manutencao', (SELECT id FROM categorias WHERE slug='carro'))
  ON CONFLICT DO NOTHING;

-- Additional seeds per user's new list
INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('RESTAURANTES','restaurantes', (SELECT id FROM categorias WHERE slug='alimentacao'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('BARES','bares', (SELECT id FROM categorias WHERE slug='alimentacao'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('DISTRIBUIDORA','distribuidora', (SELECT id FROM categorias WHERE slug='lazer'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('UNHA','unha', (SELECT id FROM categorias WHERE slug='lazer'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('FARMÁCIA','farmacia', (SELECT id FROM categorias WHERE slug='lazer'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('ESTACIONAMENTO','estacionamento', (SELECT id FROM categorias WHERE slug='carro'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('LAVA CAR','lava_car', (SELECT id FROM categorias WHERE slug='carro'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('PIX NO CREDITO','pix_no_credito', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('PICPAY','picpay', (SELECT id FROM categorias WHERE slug='pix_no_credito'))
  ON CONFLICT DO NOTHING;

-- CUIDADOS PESSOAIS
INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('CUIDADOS PESSOAIS','cuidados_pessoais', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('UNHA','unha', (SELECT id FROM categorias WHERE slug='cuidados_pessoais'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('CABELO','cabelo', (SELECT id FROM categorias WHERE slug='cuidados_pessoais'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('CILIOS','cilios', (SELECT id FROM categorias WHERE slug='cuidados_pessoais'))
  ON CONFLICT DO NOTHING;

-- DIVERSOS
INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('DIVERSOS','diversos', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('SHOPEE','shopee', (SELECT id FROM categorias WHERE slug='diversos'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('MERCADO LIVRE','mercado_livre', (SELECT id FROM categorias WHERE slug='diversos'))
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('COMPRAS GERAIS','compras_gerais', (SELECT id FROM categorias WHERE slug='diversos'))
  ON CONFLICT DO NOTHING;

-- Add new GATOS category and PETLOVE subcategory
INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('GATOS','gatos', NULL)
  ON CONFLICT DO NOTHING;

INSERT INTO categorias (nome, slug, parent_id) VALUES
  ('PETLOVE - VETERINARIO','petlove_veterinario', (SELECT id FROM categorias WHERE slug='gatos'))
  ON CONFLICT DO NOTHING;

-- Example query: totals per category (top-level)
-- SELECT c.nome, SUM(d.valor) as total
-- FROM categorias c
-- LEFT JOIN categorias sub ON sub.parent_id = c.id
-- LEFT JOIN despesas d ON (UPPER(d.categoria) = UPPER(c.nome) OR (sub.id IS NOT NULL AND UPPER(d.subcategoria) = UPPER(sub.nome)))
-- GROUP BY c.nome
-- ORDER BY total DESC;

-- Example: detailed entries for a category
-- SELECT d.* FROM despesas d WHERE UPPER(d.categoria) = 'ALIMENTAÇÃO' OR UPPER(d.subcategoria) IN ('IFOOD','MERCADO') ORDER BY d.data DESC;

-- ==========================
-- Migration: connect despesas to categorias by id
-- ==========================
-- Add columns (nullable until backfill)
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS categoria_id int;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS subcategoria_id int;

-- Backfill categoria_id/subcategoria_id from text fields when possible
-- Note: run inside a transaction on your Postgres/Supabase DB
-- Example:
-- BEGIN;
-- UPDATE despesas SET categoria_id = c.id
-- FROM categorias c
-- WHERE UPPER(despesas.categoria) = UPPER(c.nome) AND despesas.categoria_id IS NULL;
--
-- UPDATE despesas SET subcategoria_id = c.id
-- FROM categorias c
-- WHERE UPPER(despesas.subcategoria) = UPPER(c.nome) AND despesas.subcategoria_id IS NULL;
-- COMMIT;

-- After validating, add foreign keys (optional)
-- ALTER TABLE despesas ADD CONSTRAINT despesas_categoria_fk FOREIGN KEY (categoria_id) REFERENCES categorias(id);
-- ALTER TABLE despesas ADD CONSTRAINT despesas_subcategoria_fk FOREIGN KEY (subcategoria_id) REFERENCES categorias(id);

-- Optional: remove old text columns once migration is validated
-- ALTER TABLE despesas DROP COLUMN categoria;
-- ALTER TABLE despesas DROP COLUMN subcategoria;

