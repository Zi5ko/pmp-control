-- Actualiza valores existentes y constraint de tipo en planes_mantenimiento
DO $$
BEGIN
  -- Mapear valores antiguos a los nuevos donde sea posible
  -- Si existe columna tipo con 'interno' => 'ninguno', 'externo' => inferir según nombre
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'planes_mantenimiento' AND column_name = 'tipo'
  ) THEN
    -- Primero, probar mapear por nombre
    UPDATE planes_mantenimiento
      SET tipo = 'garantía'
      WHERE lower(tipo) = 'externo' AND lower(nombre) LIKE '%garant%';

    UPDATE planes_mantenimiento
      SET tipo = 'contrato'
      WHERE lower(tipo) = 'externo' AND lower(nombre) LIKE '%contrat%';

    -- Restante externo => contrato por defecto
    UPDATE planes_mantenimiento
      SET tipo = 'contrato'
      WHERE lower(tipo) = 'externo' AND lower(nombre) NOT LIKE '%garant%'
        AND lower(nombre) NOT LIKE '%contrat%';

    -- Interno => ninguno
    UPDATE planes_mantenimiento
      SET tipo = 'ninguno'
      WHERE lower(tipo) = 'interno';
  END IF;

  -- Eliminar constraint previo si existe
  BEGIN
    ALTER TABLE public.planes_mantenimiento DROP CONSTRAINT IF EXISTS planes_mantenimiento_tipo_check;
  EXCEPTION WHEN undefined_object THEN
    -- ignore
    NULL;
  END;

  -- Crear el nuevo constraint
  ALTER TABLE public.planes_mantenimiento
    ADD CONSTRAINT planes_mantenimiento_tipo_check
    CHECK ( (tipo)::text = ANY (ARRAY['garantía','contrato','ninguno']) );
END
$$;

