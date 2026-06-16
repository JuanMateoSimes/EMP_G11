from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.exceptions.handlers import register_exception_handlers
from app.routers import (
    auth,
    calificaciones,
    cargas,
    documentos,
    notificaciones,
    ofertas,
    pagos,
    pymes,
    tracking,
    transportistas,
    users,
    vehiculos,
    viajes,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend MVP para LogExpress: PyMEs, transportistas, cargas, viajes y pagos simulados.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pymes.router)
app.include_router(transportistas.router)
app.include_router(vehiculos.router)
app.include_router(documentos.router)
app.include_router(cargas.router)
app.include_router(ofertas.router)
app.include_router(viajes.router)
app.include_router(tracking.router)
app.include_router(pagos.router)
app.include_router(calificaciones.router)
app.include_router(notificaciones.router)


@app.get("/health", tags=["Health"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "logexpress-api"}
