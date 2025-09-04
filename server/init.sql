-- Tabla: roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT,
  rol_id INTEGER REFERENCES roles(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: planes de mantenimiento
CREATE TABLE IF NOT EXISTS planes_mantenimiento (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('interno', 'externo')),
  frecuencia VARCHAR(20) CHECK (frecuencia IN ('mensual', 'trimestral', 'semestral', 'anual')),
  protocolo_base TEXT,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla: equipos
CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  familia VARCHAR(50),
  criticidad VARCHAR(20) CHECK (criticidad IN ('baja', 'media', 'alta')),
  ubicacion VARCHAR(100),
  marca VARCHAR(50),
  modelo VARCHAR(50),
  serie VARCHAR(50) UNIQUE,
  fecha_ingreso DATE,
  fuente_plan VARCHAR(20) NOT NULL CHECK (fuente_plan IN ('garantia', 'contrato', 'interno')),
  plan_id INTEGER REFERENCES planes_mantenimiento(id)
);

-- Tabla: órdenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id SERIAL PRIMARY KEY,
  equipo_id INTEGER REFERENCES equipos(id),
  plan_id INTEGER REFERENCES planes_mantenimiento(id),
  fecha_programada DATE NOT NULL,
  fecha_ejecucion DATE,
  responsable VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'realizada', 'reprogramada', 'omitida')),
  observaciones TEXT
);

-- Tabla: tipos_alerta
CREATE TABLE IF NOT EXISTS tipos_alerta (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT
);

-- Asegurar que la tabla de alertas utilice equipo_id
ALTER TABLE IF EXISTS alertas
  ADD COLUMN IF NOT EXISTS equipo_id INTEGER REFERENCES equipos(id);

ALTER TABLE IF EXISTS alertas
  DROP COLUMN IF EXISTS orden_id;

CREATE TABLE IF NOT EXISTS alertas (
  id SERIAL PRIMARY KEY,
  equipo_id INTEGER REFERENCES equipos(id),
  tipo_id INTEGER REFERENCES tipos_alerta(id),
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  generada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS alertas_equipo_tipo_unq
  ON alertas (equipo_id, tipo_id)
  WHERE leida = FALSE;

-- Tabla: evidencias
CREATE TABLE IF NOT EXISTS evidencias (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id),
  url TEXT NOT NULL,
  tipo VARCHAR(20),
  subido_por INTEGER REFERENCES usuarios(id),
  subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: logs_auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  tabla_afectada VARCHAR(50),
  registro_id INTEGER,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserción inicial de roles
INSERT INTO roles (nombre) VALUES
  ('administrador'),
  ('técnico'),
  ('supervisor')
ON CONFLICT (nombre) DO NOTHING;

-- Inserción inicial de tipos de alerta
INSERT INTO tipos_alerta (nombre, descripcion) VALUES
  ('vencimiento mantenimiento', 'El mantenimiento programado ha superado su fecha de ejecución'),
  ('orden omitida', 'Orden de trabajo programada no fue registrada ni ejecutada'),
  ('criticidad sin plan', 'Equipo de alta criticidad sin plan de mantenimiento asignado'),
  ('mantenimiento reprogramado', 'Una orden fue desplazada de su fecha original')
ON CONFLICT (nombre) DO NOTHING;

-- Inserción inicial de planes de mantenimiento
INSERT INTO planes_mantenimiento (nombre, tipo, frecuencia, protocolo_base, activo) VALUES
  ('PMP Interno básico', 'interno', 'mensual', 'Según normativa MINSAL 136 y PG-AD-006-12', TRUE),
  ('PMP Garantía estándar', 'externo', 'semestral', 'Supervisión del proveedor según condiciones de garantía', TRUE),
  ('PMP Contrato externo', 'externo', 'trimestral', 'Supervisión técnica mediante contrato vigente externo', TRUE)
ON CONFLICT (nombre) DO NOTHING;

