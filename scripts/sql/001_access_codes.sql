-- Tabela de códigos de acesso
CREATE TABLE IF NOT EXISTS access_codes (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  owner       TEXT NOT NULL,
  role        TEXT CHECK (role IN ('admin','manager','viewer')),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Função/trigger de updated_at
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_access_codes'
  ) THEN
    CREATE TRIGGER set_timestamp_access_codes
    BEFORE UPDATE ON access_codes
    FOR EACH ROW
    EXECUTE PROCEDURE set_timestamp();
  END IF;
END $$;
