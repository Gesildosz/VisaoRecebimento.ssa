-- Tipos de ocorrência
CREATE TABLE IF NOT EXISTS occurrence_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  severity SMALLINT DEFAULT 1 CHECK (severity BETWEEN 1 AND 5)
);

-- Ocorrências (relacionadas a veículo e/ou motorista)
CREATE TABLE IF NOT EXISTS occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  type_id INT NOT NULL REFERENCES occurrence_types(id) ON DELETE RESTRICT,
  status occurrence_status NOT NULL DEFAULT 'aberta',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_occurrences_vehicle ON occurrences (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_status ON occurrences (status);
CREATE INDEX IF NOT EXISTS idx_occurrences_created ON occurrences (created_at DESC);
