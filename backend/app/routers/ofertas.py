from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.enums import (
    CargaEstado,
    NotificacionTipo,
    OfertaEstado,
    UserRole,
    VehiculoEstado,
    ViajeEstado,
)
from app.models.models import Carga, Oferta, Transportista, User, Vehiculo, Viaje
from app.schemas.schemas import OfertaCreate, OfertaResponse
from app.services.business import create_notification, ensure_pyme_owner_or_admin, get_transportista_for_user

router = APIRouter(tags=["Ofertas"])


@router.post("/api/cargas/{carga_id}/ofertas", response_model=OfertaResponse, status_code=status.HTTP_201_CREATED)
def create_oferta(
    carga_id: int,
    payload: OfertaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> Oferta:
    transportista = get_transportista_for_user(db, current_user)
    if not transportista.verificado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El transportista debe estar verificado para ofertar",
        )

    carga = db.get(Carga, carga_id)
    if carga is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carga inexistente")
    if carga.estado not in {CargaEstado.PUBLICADA, CargaEstado.CON_OFERTAS}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La carga no acepta nuevas ofertas",
        )

    active_vehicle_exists = db.scalar(
        select(Vehiculo.id).where(
            Vehiculo.transportista_id == transportista.id,
            Vehiculo.estado == VehiculoEstado.ACTIVO,
        )
    )
    if active_vehicle_exists is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El transportista necesita al menos un vehiculo ACTIVO",
        )

    vehiculo = db.get(Vehiculo, payload.vehiculo_id)
    if vehiculo is None or vehiculo.transportista_id != transportista.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El vehiculo no pertenece al transportista",
        )
    if vehiculo.estado != VehiculoEstado.ACTIVO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El vehiculo no esta activo")

    oferta = Oferta(
        carga_id=carga.id,
        transportista_id=transportista.id,
        vehiculo_id=vehiculo.id,
        monto=payload.monto,
        mensaje=payload.mensaje,
    )
    carga.estado = CargaEstado.CON_OFERTAS
    db.add(oferta)
    create_notification(
        db,
        carga.empresa.user_id,
        "Nueva oferta recibida",
        f"Recibiste una oferta para la carga {carga.titulo}.",
        NotificacionTipo.NUEVA_OFERTA,
    )
    db.commit()
    db.refresh(oferta)
    return oferta


@router.get("/api/cargas/{carga_id}/ofertas", response_model=list[OfertaResponse])
def get_ofertas_carga(
    carga_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME, UserRole.ADMIN)),
) -> list[Oferta]:
    carga = db.get(Carga, carga_id)
    if carga is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carga inexistente")
    ensure_pyme_owner_or_admin(current_user, carga)
    return list(db.scalars(select(Oferta).where(Oferta.carga_id == carga.id).order_by(Oferta.created_at.desc())))


@router.patch("/api/ofertas/{oferta_id}/aceptar", response_model=OfertaResponse)
def aceptar_oferta(
    oferta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME, UserRole.ADMIN)),
) -> Oferta:
    oferta = db.get(Oferta, oferta_id)
    if oferta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta inexistente")
    carga = oferta.carga
    ensure_pyme_owner_or_admin(current_user, carga)
    if oferta.estado != OfertaEstado.PENDIENTE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La oferta no esta pendiente")
    if carga.estado not in {CargaEstado.PUBLICADA, CargaEstado.CON_OFERTAS}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La carga ya fue asignada")

    oferta.estado = OfertaEstado.ACEPTADA
    for other in db.scalars(
        select(Oferta).where(
            Oferta.carga_id == carga.id,
            Oferta.id != oferta.id,
            Oferta.estado == OfertaEstado.PENDIENTE,
        )
    ):
        other.estado = OfertaEstado.RECHAZADA

    viaje = Viaje(
        carga_id=carga.id,
        oferta_id=oferta.id,
        empresa_id=carga.empresa_id,
        transportista_id=oferta.transportista_id,
        vehiculo_id=oferta.vehiculo_id,
        estado=ViajeEstado.ASIGNADO,
        fecha_asignacion=datetime.now(timezone.utc),
    )
    carga.estado = CargaEstado.ASIGNADA
    db.add(viaje)
    transportista = db.get(Transportista, oferta.transportista_id)
    if transportista:
        create_notification(
            db,
            transportista.user_id,
            "Carga asignada",
            f"Tu oferta para la carga {carga.titulo} fue aceptada.",
            NotificacionTipo.CARGA_ASIGNADA,
        )
    db.commit()
    db.refresh(oferta)
    return oferta


@router.patch("/api/ofertas/{oferta_id}/rechazar", response_model=OfertaResponse)
def rechazar_oferta(
    oferta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME, UserRole.ADMIN)),
) -> Oferta:
    oferta = db.get(Oferta, oferta_id)
    if oferta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta inexistente")
    ensure_pyme_owner_or_admin(current_user, oferta.carga)
    if oferta.estado != OfertaEstado.PENDIENTE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La oferta no esta pendiente")
    oferta.estado = OfertaEstado.RECHAZADA
    db.commit()
    db.refresh(oferta)
    return oferta


@router.delete("/api/ofertas/{oferta_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_oferta(
    oferta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> None:
    transportista = get_transportista_for_user(db, current_user)
    oferta = db.get(Oferta, oferta_id)
    if oferta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta inexistente")
    if oferta.transportista_id != transportista.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La oferta no es tuya")
    if oferta.estado != OfertaEstado.PENDIENTE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se pueden eliminar ofertas pendientes")
    db.delete(oferta)
    db.commit()
