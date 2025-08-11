-- Arquivos (metadados)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,    -- caminho no storage (ex.: Blob, S3, etc.)
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vínculos de arquivos por entidade (mais seguro que uma tabela polimórfica)
CREATE TABLE IF NOT EXISTS vehicle_files (
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, file_id)
);

CREATE TABLE IF NOT EXISTS driver_files (
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (driver_id, file_id)
);

CREATE TABLE IF NOT EXISTS occurrence_files (
  occurrence_id UUID NOT NULL REFERENCES occurrences(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (occurrence_id, file_id)
);

CREATE TABLE IF NOT EXISTS kit_vehicle_files (
  kit_vehicle_id BIGINT NOT NULL REFERENCES kit_vehicle(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (kit_vehicle_id, file_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_files_created ON files (created_at DESC);
