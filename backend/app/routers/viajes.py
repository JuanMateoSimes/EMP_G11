from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import CargaEstado, NotificacionTipo, UserRole, ViajeEstado
from app.models.models import EmpresaPyme, Transportista, User, Viaje
from app.schemas.schemas import ViajeEstadoUpdate, ViajeFinalizar, ViajeResponse
from app.services.business import (
    create_notification,
    ensure_viaje_party_or_admin,
    get_transportista_for_user,
    validate_next_trip_state,
)

router = APIRouter(prefix="/api/viajes", tags=["Viajes"])


@router.get("/mis-viajes", response_model=list[ViajeResponse])
def get_my_viajes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Viaje]:
    if current_user.rol == UserRole.ADMIN:
        return list(db.scalars(select(Viaje).order_by(Viaje.created_at.desc())))
    if current_user.rol == UserRole.PYME:
        pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == current_user.id))
        if pyme is None:
            return []
        return list(
            db.scalars(select(Viaje).where(Viaje.empresa_id == pyme.id).order_by(Viaje.created_at.desc()))
        )
    transportista = db.scalar(select(Transportista).where(Transportista.user_id == current_user.id))
    if transportista is None:
        return []
    return list(
        db.scalars(
            select(Viaje)
            .where(Viaje.transportista_id == transportista.id)
            .order_by(Viaje.created_at.desc())
        )
    )


@router.get("/{viaje_id}", response_model=ViajeResponse)
def get_viaje(
    viaje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Viaje:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    ensure_viaje_party_or_admin(current_user, viaje)
    return viaje


@router.patch("/{viaje_id}/estado", response_model=ViajeResponse)
def update_viaje_estado(
    viaje_id: int,
    payload: ViajeEstadoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA, UserRole.ADMIN)),
) -> Viaje:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    if current_user.rol == UserRole.TRANSPORTISTA:
        transportista = get_transportista_for_user(db, current_user)
        if viaje.transportista_id != transportista.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El viaje no es tuyo")
    validate_next_trip_state(viaje.estado, payload.estado)

    viaje.estado = payload.estado
    if payload.estado == ViajeEstado.EN_TRANSITO:
        viaje.fecha_inicio = viaje.fecha_inicio or datetime.now(timezone.utc)
        viaje.carga.estado = CargaEstado.EN_CURSO
    if payload.estado == ViajeEstado.ENTREGADO:
        _finalize_trip(db, viaje, None)
    else:
        _notify_status_change(db, viaje)
    db.commit()
    db.refresh(viaje)
    return viaje


@router.patch("/{viaje_id}/cancelar", response_model=ViajeResponse)
def cancelar_viaje(
    viaje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Viaje:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    ensure_viaje_party_or_admin(current_user, viaje)
    if viaje.estado == ViajeEstado.ENTREGADO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El viaje ya fue entregado")
    viaje.estado = ViajeEstado.CANCELADO
    viaje.carga.estado = CargaEstado.CANCELADA
    _notify_status_change(db, viaje)
    db.commit()
    db.refresh(viaje)
    return viaje


@router.patch("/{viaje_id}/finalizar", response_model=ViajeResponse)
def finalizar_viaje(
    viaje_id: int,
    payload: ViajeFinalizar | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA, UserRole.ADMIN)),
) -> Viaje:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    if current_user.rol == UserRole.TRANSPORTISTA:
        transportista = get_transportista_for_user(db, current_user)
        if viaje.transportista_id != transportista.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El viaje no es tuyo")
    _finalize_trip(db, viaje, payload.observaciones if payload else None)
    db.commit()
    db.refresh(viaje)
    return viaje


def _finalize_trip(db: Session, viaje: Viaje, observaciones: str | None) -> None:
    if viaje.estado not in {ViajeEstado.CARGA_RETIRADA, ViajeEstado.EN_TRANSITO, ViajeEstado.ENTREGADO}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede finalizar sin retirar la carga o estar en transito",
        )
    if viaje.estado == ViajeEstado.ENTREGADO and viaje.fecha_entrega is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El viaje ya esta entregado")
    viaje.estado = ViajeEstado.ENTREGADO
    viaje.fecha_entrega = datetime.now(timezone.utc)
    viaje.observaciones = observaciones or viaje.observaciones
    viaje.carga.estado = CargaEstado.ENTREGADA
    _notify_status_change(db, viaje)


def _notify_status_change(db: Session, viaje: Viaje) -> None:
    create_notification(
        db,
        viaje.empresa.user_id,
        "Cambio de estado del viaje",
        f"El viaje {viaje.id} ahora esta en estado {viaje.estado}.",
        NotificacionTipo.CAMBIO_ESTADO_VIAJE,
    )
    create_notification(
        db,
        viaje.transportista.user_id,
        "Cambio de estado del viaje",
        f"El viaje {viaje.id} ahora esta en estado {viaje.estado}.",
        NotificacionTipo.CAMBIO_ESTADO_VIAJE,
    )
