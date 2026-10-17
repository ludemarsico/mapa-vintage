CREATE TABLE IF NOT EXISTS aportes (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('recibiendo','pendiente','aprobado','descartado')),
  nombre_alias TEXT NOT NULL,
  texto TEXT NOT NULL,
  red_url TEXT NOT NULL DEFAULT '',
  imagen_key TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  creado TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS aportes_estado_fecha ON aportes (estado, creado);
