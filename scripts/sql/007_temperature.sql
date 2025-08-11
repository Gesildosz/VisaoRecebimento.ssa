-- Limites de temperatura (admin/temperature-threshold-settings.tsx)
CREATE TABLE IF NOT EXISTS temperature_thresholds (
  id SERIAL PRIMARY KEY,
  temp_type temperature_type NOT NULL UNIQUE,
  min_c NUMERIC(5,2),
  max_c NUMERIC(5,2),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leituras de temperatura por veículo (opcional)
CREATE TABLE IF NOT EXISTS vehicle_temperature_readings (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  temp_type temperature_type NOT NULL,
  value_c NUMERIC(5,2) NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_temp_readings_vehicle_time ON vehicle_temperature_readings (vehicle_id, measured_at DESC);
