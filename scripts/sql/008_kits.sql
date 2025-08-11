-- Kits (ex.: Kit Festa)
CREATE TABLE IF NOT EXISTS kit_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Vínculo do veículo com um kit específico
CREATE TABLE IF NOT EXISTS kit_vehicle (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  kit_type_id INT NOT NULL REFERENCES kit_types(id) ON DELETE RESTRICT,
  status kit_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ocorrências relacionadas ao kit do veículo (opcional)
CREATE TABLE IF NOT EXISTS kit_occurrences (
  id BIGSERIAL PRIMARY KEY,
  kit_vehicle_id BIGINT NOT NULL REFERENCES kit_vehicle(id) ON DELETE CASCADE,
  occurrence_type_id INT REFERENCES occurrence_types(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_kit_vehicle_vehicle ON kit_vehicle (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_kit_vehicle_status ON kit_vehicle (status);
