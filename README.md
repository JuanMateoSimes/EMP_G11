# LogExpress MVP

MVP de una plataforma logistica para conectar PyMEs con transportistas y administrar cargas, ofertas, viajes, documentos y tracking.

El repo esta dividido en:

- `backend/`: API REST en FastAPI + SQLAlchemy + Alembic.
- `front/`: interfaz web en Next.js.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT.
- Frontend: Next.js 13, React 18, Tailwind CSS.
- Infra local: Docker Compose para PostgreSQL.

## Requisitos

- Python 3.11+ recomendado
- Node.js 18+
- Docker Desktop
- PowerShell

## Estructura

```text
EMP_MVP/
  backend/
  front/
```

## Levantar el proyecto

### 1. Backend

Desde `backend/`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
docker compose up -d
alembic upgrade head
python -m app.seed.seed_data
uvicorn app.main:app --reload
```

Backend disponible en:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

Notas:

- La base local usa PostgreSQL en `localhost:5432`.
- Si ya tenes algo ocupando el `5432`, hay que liberarlo o cambiar el puerto en `backend/docker-compose.yml`.

### 2. Frontend

Desde otra terminal, en `front/`:

```powershell
npm install
npm run dev
```

Frontend disponible en:

- App: `http://localhost:3000`

El frontend apunta por defecto a `http://localhost:8000`, asi que no hace falta configurar nada extra para desarrollo local.

## Variables de entorno

### Backend

Archivo: `backend/.env`

Ejemplo:

```env
APP_NAME=LogExpress API
ENVIRONMENT=dev
DATABASE_URL=postgresql+psycopg://logexpress:logexpress@localhost:5432/logexpress
SECRET_KEY=change-me-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://127.0.0.1:5173"]
```

### Frontend

No necesita `.env` para levantar en local si el backend corre en `http://localhost:8000`.

Si queres apuntarlo a otra API, podes crear `front/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Credenciales seed

Se cargan al ejecutar:

```powershell
python -m app.seed.seed_data
```

Usuarios disponibles:

- Admin: `admin@logexpress.com` / `Admin123!`
- PyME: `pyme1@logexpress.com` / `Pyme123!`
- PyME: `pyme2@logexpress.com` / `Pyme123!`
- Transportista: `transportista1@logexpress.com` / `Trans123!`
- Transportista: `transportista2@logexpress.com` / `Trans123!`
- Transportista: `transportista3@logexpress.com` / `Trans123!`

## Tests

Desde `backend/`:

```powershell
.\.venv\Scripts\Activate.ps1
pytest
```

Los tests usan SQLite en memoria, asi que no dependen de PostgreSQL.

## Modo mock del frontend

Si la API no responde, varias pantallas del front pueden caer en datos mock locales para seguir navegando y probando la interfaz.

Eso sirve para desarrollo visual, pero para probar el flujo completo conviene levantar backend + base y usar las credenciales seed.

## Problemas comunes

### El puerto 3000 o 8000 ya esta ocupado

Podes ver y cerrar procesos desde PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 8000
Stop-Process -Id <PID> -Force
```

### La base no conecta

Revisar:

- que Docker Desktop este encendido;
- que `docker compose up -d` haya levantado `logexpress-postgres`;
- que el puerto `5432` no lo este usando otro servicio.

### Falta ejecutar migraciones o seed

Si el backend levanta pero faltan datos o tablas:

```powershell
alembic upgrade head
python -m app.seed.seed_data
```

## Build del frontend

Desde `front/`:

```powershell
npm run lint
npm run build
```
