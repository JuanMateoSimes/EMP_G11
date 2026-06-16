from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.models import Notificacion, User
from app.schemas.schemas import NotificacionResponse

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones"])


@router.get("", response_model=list[NotificacionResponse])
def get_notificaciones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Notificacion]:
    return list(
        db.scalars(
            select(Notificacion)
            .where(Notificacion.usuario_id == current_user.id)
            .order_by(Notificacion.created_at.desc())
        )
    )


@router.patch("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_notificacion_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Notificacion:
    notificacion = db.get(Notificacion, notificacion_id)
    if notificacion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificacion inexistente")
    if notificacion.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La notificacion no es tuya")
    notificacion.leida = True
    db.commit()
    db.refresh(notificacion)
    return notificacion
