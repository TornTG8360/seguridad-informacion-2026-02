CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id),
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMPTZ NULL
);

INSERT INTO roles (nombre) VALUES ('Administrador'), ('Usuario');

INSERT INTO usuarios (username, password_hash, rol_id)
VALUES
  ('admin', '$2b$10$dL5syOxMcTmTXgjxHsQNHeCt0U4jSA4IBw.CFobRYMo9tXHYmP5De', (
      SELECT id FROM roles WHERE nombre = 'Administrador'
  )),
  ('usuario', '$2b$10$3m4BNk5akUMUF7nW1USDOeQchFqSoaMBWK9AU1aBAxXgS0nmtDSRC', (
      SELECT id FROM roles WHERE nombre = 'Usuario'
  )),
  ('invitado', '$2b$10$rNKIbueYB33onnct7XwP.uNWkjoXh2uZz5jtTYSudL4saBIRFIxZK', (
      SELECT id FROM roles WHERE nombre = 'Usuario'
));