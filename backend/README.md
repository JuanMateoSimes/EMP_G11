# LogExpress Backend MVP

Backend funcional para el MVP de LogExpress, una plataforma logística que conecta PyMEs con transportistas independientes habilitados.

Stack:

- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Alembic
- JWT con Bearer token
- Passlib/bcrypt
- Pytest
- Docker Compose

## Estructura

```text
app/
  core/             Configuracion, DB y seguridad
  models/           Modelos SQLAlchemy y enums
  schemas/          DTOs Pydantic
  routers/          Endpoints por modulo
  dependencies/     Auth y roles
  exceptions/       Handlers globales
  seed/             Datos iniciales
alembic/            Migraciones
tests/              Tests de flujo MVP
```

## Ejecutar en local

Desde `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
docker compose up -d
alembic upgrade head
python -m app.seed.seed_data
uvicorn app.main:app --reload
```

API:

- Healthcheck: `http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Tests

Los tests usan SQLite en memoria, no requieren PostgreSQL:

```powershell
pytest
```

Cubren:

- Registro de usuario
- Login y token JWT
- Creacion de carga por PyME
- Oferta por transportista verificado
- Aceptacion de oferta y creacion automatica de viaje
- Avance de estado de viaje
- Registro y consulta de tracking
- Finalizacion del viaje
- Pago simulado
- Calificaciones posteriores a entrega

## Credenciales seed

Admin:

- Email: `admin@logexpress.com`
- Password: `Admin123!`

PyMEs:

- `pyme1@logexpress.com` / `Pyme123!`
- `pyme2@logexpress.com` / `Pyme123!`

Transportistas:

- `transportista1@logexpress.com` / `Trans123!`
- `transportista2@logexpress.com` / `Trans123!`
- `transportista3@logexpress.com` / `Trans123!`

## Flujo principal para probar en Swagger/Postman

1. `POST /api/auth/register` para una PyME.
2. `POST /api/auth/register` para un transportista.
3. `POST /api/auth/login` con ambos usuarios y guardar sus tokens.
4. `POST /api/pymes` con el token PyME.
5. `POST /api/transportistas` con el token transportista.
6. `POST /api/vehiculos` con el token transportista.
7. Login como admin.
8. `PATCH /api/transportistas/{id}/verificar` como admin.
9. `PATCH /api/vehiculos/{id}/estado` con `{ "estado": "ACTIVO" }` como admin.
10. `POST /api/cargas` con el token PyME.
11. `GET /api/cargas/disponibles` con el token transportista.
12. `POST /api/cargas/{carga_id}/ofertas` con el token transportista.
13. `PATCH /api/ofertas/{id}/aceptar` con el token PyME.
14. `GET /api/viajes/mis-viajes` para obtener el viaje creado.
15. `PATCH /api/viajes/{id}/estado` con estados: `EN_CAMINO_RETIRO`, `CARGA_RETIRADA`, `EN_TRANSITO`.
16. `POST /api/viajes/{id}/tracking` con lat/lng.
17. `GET /api/viajes/{id}/tracking` con el token PyME.
18. `PATCH /api/viajes/{id}/finalizar`.
19. `POST /api/viajes/{id}/pago/simular`.
20. `POST /api/viajes/{id}/calificaciones` desde PyME y transportista.

## Endpoints principales

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Usuarios:

- `GET /api/users/me`
- `PUT /api/users/me`

PyMEs:

- `POST /api/pymes`
- `GET /api/pymes/me`
- `PUT /api/pymes/me`
- `PATCH /api/pymes/{id}/verificar`

Transportistas:

- `POST /api/transportistas`
- `GET /api/transportistas/me`
- `PUT /api/transportistas/me`
- `GET /api/transportistas/{id}/reputacion`
- `PATCH /api/transportistas/{id}/verificar`

Vehiculos:

- `POST /api/vehiculos`
- `GET /api/vehiculos/mis-vehiculos`
- `GET /api/vehiculos/{id}`
- `PUT /api/vehiculos/{id}`
- `PATCH /api/vehiculos/{id}/estado`

Documentos:

- `POST /api/documentos`
- `GET /api/documentos/mis-documentos`
- `GET /api/documentos/owner/{owner_tipo}/{owner_id}`
- `PATCH /api/documentos/{id}/aprobar`
- `PATCH /api/documentos/{id}/rechazar`

Cargas, ofertas y viajes:

- `POST /api/cargas`
- `GET /api/cargas/mis-cargas`
- `GET /api/cargas/disponibles`
- `GET /api/cargas/{id}`
- `PUT /api/cargas/{id}`
- `PATCH /api/cargas/{id}/cancelar`
- `POST /api/cargas/{carga_id}/ofertas`
- `GET /api/cargas/{carga_id}/ofertas`
- `PATCH /api/ofertas/{id}/aceptar`
- `PATCH /api/ofertas/{id}/rechazar`
- `DELETE /api/ofertas/{id}`
- `GET /api/viajes/mis-viajes`
- `GET /api/viajes/{id}`
- `PATCH /api/viajes/{id}/estado`
- `PATCH /api/viajes/{id}/cancelar`
- `PATCH /api/viajes/{id}/finalizar`

Tracking, pagos, calificaciones y notificaciones:

- `POST /api/viajes/{viaje_id}/tracking`
- `GET /api/viajes/{viaje_id}/tracking`
- `GET /api/viajes/{viaje_id}/tracking/last`
- `POST /api/viajes/{viaje_id}/pago/simular`
- `GET /api/viajes/{viaje_id}/pago`
- `PATCH /api/pagos/{id}/liberar`
- `POST /api/viajes/{viaje_id}/calificaciones`
- `GET /api/usuarios/{id}/calificaciones`
- `GET /api/notificaciones`
- `PATCH /api/notificaciones/{id}/leer`

## Pendiente para version productiva

- Storage real para documentos (S3, GCS o similar).
- Pagos reales y conciliacion.
- Auditoria de cambios sensibles.
- Refresh tokens y rotacion de claves JWT.
- Permisos mas finos para backoffice.
- Observabilidad: logs estructurados, metricas y tracing.
- Rate limiting.
- Endurecimiento CORS y secretos por entorno.
- Tracking en tiempo real con WebSockets o broker.
- Algoritmos de matching, precio dinamico y ruteo inteligente.
