-- Índices complementares e otimizações
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers (name);
CREATE INDEX IF NOT EXISTS idx_vehicles_placa_ci ON vehicles ((lower(placa)));
CREATE INDEX IF NOT EXISTS idx_occurrences_type ON occurrences (type_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_created ON access_codes (created_at DESC);
