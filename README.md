# Cifrador César con React + Vite

Aplicación web en JavaScript con Vite y React para cifrar y descifrar texto con el algoritmo César.

## Características

- Cifrado y descifrado César con desplazamiento configurable.
- Interfaz simple de colores planos.
- Estructura extensible para incorporar nuevos algoritmos en `src/algorithms`.

## Desarrollo

```bash
npm install
npm run dev
```

## Validación

```bash
npm run lint
npm run build
```

## Backend de autenticación

El módulo de autenticación quedó separado en la carpeta `backend/` siguiendo la especificación técnica del documento [autenticacion-backend.md](autenticacion-backend.md).

Para iniciar el backend:

```bash
cd backend
npm install
npm run dev
```
