import { sql } from "./neon"

// Tipos usados no app
export type UserRole = "admin" | "manager" | "viewer"

// Cria a tabela de códigos de acesso se não existir e garante índice/trigger.
export async function ensureAccessCodesTable() {
  await sql /* sql */`
    CREATE TABLE IF NOT EXISTS access_codes (
      id          BIGSERIAL PRIMARY KEY,
      code        TEXT NOT NULL UNIQUE,
      owner       TEXT NOT NULL,
      role        TEXT CHECK (role IN ('admin','manager','viewer')),
      active      BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  // Função/trigger para atualizar updated_at antes de UPDATE
  await sql /* sql */`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $fn$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $fn$ LANGUAGE plpgsql;
      END IF;
    END $$;
  `

  await sql /* sql */`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_access_codes_updated_at') THEN
        CREATE TRIGGER trg_access_codes_updated_at
        BEFORE UPDATE ON access_codes
        FOR EACH ROW
        EXECUTE PROCEDURE set_updated_at();
      END IF;
    END $$;
  `

  // Índice para buscas por code/active
  await sql /* sql */`
    CREATE INDEX IF NOT EXISTS idx_access_codes_code_active
      ON access_codes (code, active);
  `
}
