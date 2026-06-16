from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import UserRole
from app.models.models import Transportista, User, Vehiculo
from app.schemas.schemas import (
    VehiculoCreate,
    VehiculoEstadoUpdate,
    VehiculoResponse,
    VehiculoUpdate,
)
from app.services.business import ensure_transportista_vehicle, get_transportista_for_user

router = APIRouter(prefix="/api/vehiculos", tags=["Vehiculos"])


@router.post("", response_model=VehiculoResponse, status_code=status.HTTP_201_CREATED)
def create_vehiculo(
    payload: VehiculoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> Vehiculo:
    transportista = get_transportista_for_user(db, current_user)
    patente = payload.patente.upper().replace(" ", "")
    if db.scalar(select(Vehiculo).where(Vehiculo.patente == patente)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La patente ya esta registrada")
    data = payload.model_dump()
    data["patente"] = patente
    vehiculo = Vehiculo(transportista_id=transportista.id, **data)
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get("/mis-vehiculos", response_model=list[VehiculoResponse])
def get_my_vehiculos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> list[Vehiculo]:
    transportista = get_transportista_for_user(db, current_user)
    return list(db.scalars(select(Vehiculo).where(Vehiculo.transportista_id == transportista.id)))


@router.get("/{vehiculo_id}", response_model=VehiculoResponse)
def get_vehiculo(
    vehiculo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Vehiculo:
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if vehiculo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehiculo inexistente")
    if current_user.rol == UserRole.ADMIN:
        return vehiculo
    if current_user.rol == UserRole.TRANSPORTISTA:
        transportista = db.scalar(select(Transportista).where(Transportista.user_id == current_user.id))
        if transportista and transportista.id == vehiculo.transportista_id:
            return vehiculo
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No podes ver este vehiculo")


@router.put("/{vehiculo_id}", response_model=VehiculoResponse)
def update_vehiculo(
    vehiculo_id: int,
    payload: VehiculoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> Vehiculo:
    transportista = get_transportista_for_user(db, current_user)
    vehiculo = ensure_transportista_vehicle(db, transportista, vehiculo_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehiculo, field, value)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.patch("/{vehiculo_id}/estado", response_model=VehiculoResponse)
def update_vehiculo_estado(
    vehiculo_id: int,
    payload: VehiculoEstadoUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> Vehiculo:
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if vehiculo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehiculo inexistente")
    vehiculo.estado = payload.estado
    db.commit()
    db.refresh(vehiculo)
    return vehiculo
