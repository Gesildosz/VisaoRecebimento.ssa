-- Criação da tabela de códigos de acesso no Neon/Postgres
CREATE TABLE IF NOT EXISTS access_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  owner TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','manager','viewer')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
