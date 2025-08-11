-- Tipos de veículos
CREATE TABLE IF NOT EXISTS vehicle_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Motoristas
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT,         -- CPF/CNPJ
  phone TEXT,
  company TEXT,
  license_number TEXT,   -- CNH
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  type_id INT REFERENCES vehicle_types(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status vehicle_status NOT NULL DEFAULT 'aguardando',
  temperature_profile temperature_type, -- perfil térmico predominante do veículo
  arrival_at TIMESTAMPTZ,
  departure_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de status do veículo (opcional)
CREATE TABLE IF NOT EXISTS vehicle_status_history (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  from_status vehicle_status,
  to_status vehicle_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_arrival ON vehicles (arrival_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_status_history_vehicle ON vehicle_status_history (vehicle_id, changed_at DESC);
