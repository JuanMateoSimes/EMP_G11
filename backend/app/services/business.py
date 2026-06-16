from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import NotificacionTipo, UserRole, ViajeEstado
from app.models.models import (
    Calificacion,
    Carga,
    EmpresaPyme,
    Notificacion,
    Transportista,
    User,
    Vehiculo,
    Viaje,
)


def get_pyme_for_user(db: Session, user: User) -> EmpresaPyme:
    pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == user.id))
    if pyme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La PyME no existe")
    return pyme


def get_transportista_for_user(db: Session, user: User) -> Transportista:
    transportista = db.scalar(select(Transportista).where(Transportista.user_id == user.id))
    if transportista is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="El perfil de transportista no existe"
        )
    return transportista


def ensure_pyme_owner_or_admin(user: User, carga: Carga) -> None:
    if user.rol == UserRole.ADMIN:
        return
    if user.rol != UserRole.PYME or user.pyme is None or user.pyme.id != carga.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo la PyME dueña puede acceder a este recurso",
        )


def ensure_viaje_party_or_admin(user: User, viaje: Viaje) -> None:
    if user.rol == UserRole.ADMIN:
        return
    if user.rol == UserRole.PYME and user.pyme and user.pyme.id == viaje.empresa_id:
        return
    if (
        user.rol == UserRole.TRANSPORTISTA
        and user.transportista
        and user.transportista.id == viaje.transportista_id
    ):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tenes permisos para acceder a este viaje",
    )


def ensure_transportista_vehicle(db: Session, transportista: Transportista, vehiculo_id: int) -> Vehiculo:
    vehiculo = db.scalar(select(Vehiculo).where(Vehiculo.id == vehiculo_id))
    if vehiculo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehiculo inexistente")
    if vehiculo.transportista_id != transportista.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El vehiculo no pertenece al transportista",
        )
    return vehiculo


def create_notification(
    db: Session,
    usuario_id: int,
    titulo: str,
    mensaje: str,
    tipo: NotificacionTipo,
) -> None:
    db.add(Notificacion(usuario_id=usuario_id, titulo=titulo, mensaje=mensaje, tipo=tipo))


def update_transportista_reputation(db: Session, transportista: Transportista) -> None:
    average = db.scalar(
        select(func.avg(Calificacion.puntaje)).where(
            Calificacion.receptor_usuario_id == transportista.user_id
        )
    )
    transportista.reputacion_promedio = Decimal(str(round(float(average or 0), 2)))


STATE_ORDER = [
    ViajeEstado.ASIGNADO,
    ViajeEstado.EN_CAMINO_RETIRO,
    ViajeEstado.CARGA_RETIRADA,
    ViajeEstado.EN_TRANSITO,
    ViajeEstado.ENTREGADO,
]


def validate_next_trip_state(current: ViajeEstado, new: ViajeEstado) -> None:
    if new == ViajeEstado.CANCELADO:
        return
    if current in {ViajeEstado.CANCELADO, ViajeEstado.ENTREGADO}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede modificar un viaje cancelado o entregado",
        )
    try:
        current_index = STATE_ORDER.index(current)
        new_index = STATE_ORDER.index(new)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de viaje invalido")
    if new_index != current_index + 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El viaje solo puede avanzar al siguiente estado logico",
        )
