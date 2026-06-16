from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.enums import UserRole
from app.models.models import Transportista, User
from app.schemas.schemas import (
    ReputacionResponse,
    TransportistaCreate,
    TransportistaResponse,
    TransportistaUpdate,
)

router = APIRouter(prefix="/api/transportistas", tags=["Transportistas"])


@router.post("", response_model=TransportistaResponse, status_code=status.HTTP_201_CREATED)
def create_transportista(
    payload: TransportistaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> Transportista:
    existing_profile = db.scalar(select(Transportista).where(Transportista.user_id == current_user.id))
    if existing_profile:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El transportista ya existe")
    if db.scalar(select(Transportista).where(Transportista.dni == payload.dni)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El DNI ya esta registrado")
    if db.scalar(select(Transportista).where(Transportista.cuit_cuil == payload.cuit_cuil)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="El CUIT/CUIL ya esta registrado"
        )

    transportista = Transportista(user_id=current_user.id, **payload.model_dump())
    db.add(transportista)
    db.commit()
    db.refresh(transportista)
    return transportista


@router.get("/me", response_model=TransportistaResponse)
def get_my_transportista(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> Transportista:
    transportista = db.scalar(select(Transportista).where(Transportista.user_id == current_user.id))
    if transportista is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="El perfil de transportista no existe"
        )
    return transportista


@router.put("/me", response_model=TransportistaResponse)
def update_my_transportista(
    payload: TransportistaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> Transportista:
    transportista = db.scalar(select(Transportista).where(Transportista.user_id == current_user.id))
    if transportista is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="El perfil de transportista no existe"
        )
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(transportista, field, value)
    db.commit()
    db.refresh(transportista)
    return transportista


@router.get("/{transportista_id}/reputacion", response_model=ReputacionResponse)
def get_reputacion(transportista_id: int, db: Session = Depends(get_db)) -> ReputacionResponse:
    transportista = db.get(Transportista, transportista_id)
    if transportista is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transportista inexistente")
    return ReputacionResponse(
        transportista_id=transportista.id,
        reputacion_promedio=transportista.reputacion_promedio,
    )


@router.patch("/{transportista_id}/verificar", response_model=TransportistaResponse)
def verify_transportista(
    transportista_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> Transportista:
    transportista = db.get(Transportista, transportista_id)
    if transportista is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transportista inexistente")
    transportista.verificado = True
    db.commit()
    db.refresh(transportista)
    return transportista
