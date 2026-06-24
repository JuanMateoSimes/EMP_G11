import http
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


def _payload(request: Request, status_code: int, message: str) -> dict[str, object]:
    try:
        error_phrase = http.HTTPStatus(status_code).phrase
    except ValueError:
        error_phrase = "Error"
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status_code,
        "error": error_phrase,
        "message": message,
        "path": request.url.path,
    }


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "Error de la solicitud"
        return JSONResponse(status_code=exc.status_code, content=_payload(request, exc.status_code, message))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        first_error = exc.errors()[0] if exc.errors() else {}
        location = ".".join(str(part) for part in first_error.get("loc", []))
        message = first_error.get("msg", "Datos invalidos")
        if location:
            message = f"{location}: {message}"
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_payload(request, status.HTTP_422_UNPROCESSABLE_ENTITY, message),
        )

    @app.exception_handler(IntegrityError)
    async def integrity_exception_handler(request: Request, exc: IntegrityError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=_payload(request, status.HTTP_409_CONFLICT, "Conflicto de datos unicos"),
        )
