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
