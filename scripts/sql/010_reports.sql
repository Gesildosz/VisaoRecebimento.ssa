-- Tabela de relatórios diários (agregados/snapshot)
CREATE TABLE IF NOT EXISTS daily_reports (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  total_vehicles INT NOT NULL DEFAULT 0,
  total_occurrences INT NOT NULL DEFAULT 0,
  total_kits INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
