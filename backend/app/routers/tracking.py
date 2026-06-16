from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import UserRole, ViajeEstado
from app.models.models import TrackingPosition, User, Viaje
from app.schemas.schemas import TrackingPositionCreate, TrackingPositionResponse
from app.services.business import ensure_viaje_party_or_admin, get_transportista_for_user

router = APIRouter(tags=["Tracking"])


@router.post(
    "/api/viajes/{viaje_id}/tracking",
    response_model=TrackingPositionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_tracking_position(
    viaje_id: int,
    payload: TrackingPositionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> TrackingPosition:
    transportista = get_transportista_for_user(db, current_user)
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    if viaje.transportista_id != transportista.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El viaje no es tuyo")
    if viaje.estado in {ViajeEstado.CANCELADO, ViajeEstado.ENTREGADO}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede registrar tracking en viajes cancelados o entregados",
        )
    position = TrackingPosition(
        viaje_id=viaje.id,
        transportista_id=transportista.id,
        lat=payload.lat,
        lng=payload.lng,
        velocidad=payload.velocidad,
        timestamp=payload.timestamp or datetime.now(timezone.utc),
    )
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


@router.get("/api/viajes/{viaje_id}/tracking", response_model=list[TrackingPositionResponse])
def get_tracking_history(
    viaje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TrackingPosition]:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    ensure_viaje_party_or_admin(current_user, viaje)
    return list(
        db.scalars(
            select(TrackingPosition)
            .where(TrackingPosition.viaje_id == viaje.id)
            .order_by(TrackingPosition.timestamp.asc())
        )
    )


@router.get("/api/viajes/{viaje_id}/tracking/last", response_model=TrackingPositionResponse | None)
def get_last_tracking_position(
    viaje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TrackingPosition | None:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    ensure_viaje_party_or_admin(current_user, viaje)
    return db.scalar(
        select(TrackingPosition)
        .where(TrackingPosition.viaje_id == viaje.id)
        .order_by(TrackingPosition.timestamp.desc())
        .limit(1)
    )
