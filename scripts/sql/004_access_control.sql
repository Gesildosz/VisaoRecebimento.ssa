-- Códigos de acesso cadastrados pelo administrador
CREATE TABLE IF NOT EXISTS access_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,     -- armazena o código em texto (pode ser trocado por hash no futuro)
  owner TEXT NOT NULL,           -- nome do dono do código
  role user_role,                -- role aplicada automaticamente quando esse código é usado (opcional)
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logs de validação de acesso (auditoria)
CREATE TABLE IF NOT EXISTS access_logs (
  id BIGSERIAL PRIMARY KEY,
  access_code_id BIGINT REFERENCES access_codes(id) ON DELETE SET NULL,
  code_used TEXT,                -- cópia do código digitado (avalie anonimizá-lo/hasheá-lo em produção)
  applied_role user_role,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes (active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs (created_at DESC);
