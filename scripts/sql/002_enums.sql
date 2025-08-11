-- Tipos ENUM utilizados no domínio

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
    CREATE TYPE vehicle_status AS ENUM ('aguardando', 'em_andamento', 'concluido', 'cancelado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'occurrence_status') THEN
    CREATE TYPE occurrence_status AS ENUM ('aberta', 'em_analise', 'resolvida', 'cancelada');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temperature_type') THEN
    CREATE TYPE temperature_type AS ENUM ('ambiente', 'refrigerado', 'congelado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kit_status') THEN
    CREATE TYPE kit_status AS ENUM ('pendente', 'em_processamento', 'finalizado', 'cancelado');
  END IF;
END$$;
