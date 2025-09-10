-- Amplía longitud de criticidad y alinea valores permitidos
-- y hace opcional fuente_plan para compatibilidad con el frontend actual

BEGIN;

-- Quitar constraint antiguo si existe (nombre por defecto de Postgres)
ALTER TABLE equipos DROP CONSTRAINT IF EXISTS equipos_criticidad_check;

-- Aumentar tamaño del campo criticidad
ALTER TABLE equipos ALTER COLUMN criticidad TYPE VARCHAR(50);

-- Crear nuevo constraint con los valores usados por el frontend
ALTER TABLE equipos
  ADD CONSTRAINT equipos_criticidad_check
  CHECK (
    criticidad IN (
      'crítico',
      'relevante',
      'instalación relevante',
      'equipo ni crítico ni relevante',
      'instalación no relevante'
    )
    OR criticidad IS NULL
  );

-- Hacer opcional fuente_plan solo si existe la columna
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'equipos' AND column_name = 'fuente_plan'
  ) THEN
    EXECUTE 'ALTER TABLE equipos ALTER COLUMN fuente_plan DROP NOT NULL';
  END IF;
END $$;

COMMIT;
