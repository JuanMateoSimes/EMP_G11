from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import CargaEstado, UserRole
from app.models.models import Carga, EmpresaPyme, User
from app.schemas.schemas import CargaCreate, CargaResponse, CargaUpdate
from app.services.business import ensure_pyme_owner_or_admin, get_pyme_for_user

router = APIRouter(prefix="/api/cargas", tags=["Cargas"])


@router.post("", response_model=CargaResponse, status_code=status.HTTP_201_CREATED)
def create_carga(
    payload: CargaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> Carga:
    pyme = get_pyme_for_user(db, current_user)
    carga = Carga(empresa_id=pyme.id, **payload.model_dump())
    db.add(carga)
    db.commit()
    db.refresh(carga)
    return carga


@router.get("/mis-cargas", response_model=list[CargaResponse])
def get_my_cargas(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> list[Carga]:
    pyme = get_pyme_for_user(db, current_user)
    return list(db.scalars(select(Carga).where(Carga.empresa_id == pyme.id).order_by(Carga.created_at.desc())))


@router.get("/disponibles", response_model=list[CargaResponse])
def get_cargas_disponibles(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.TRANSPORTISTA)),
) -> list[Carga]:
    return list(
        db.scalars(
            select(Carga)
            .where(Carga.estado.in_([CargaEstado.PUBLICADA, CargaEstado.CON_OFERTAS]))
            .order_by(Carga.created_at.desc())
        )
    )


@router.get("/{carga_id}", response_model=CargaResponse)
def get_carga(
    carga_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Carga:
    carga = db.get(Carga, carga_id)
    if carga is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carga inexistente")
    return carga


@router.put("/{carga_id}", response_model=CargaResponse)
def update_carga(
    carga_id: int,
    payload: CargaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> Carga:
    carga = db.get(Carga, carga_id)
    if carga is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carga inexistente")
    ensure_pyme_owner_or_admin(current_user, carga)
    if carga.estado not in {CargaEstado.PUBLICADA, CargaEstado.CON_OFERTAS}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden editar cargas no asignadas",
        )

    data = payload.model_dump(exclude_unset=True)
    retiro = data.get("fecha_retiro_deseada", carga.fecha_retiro_deseada)
    entrega = data.get("fecha_entrega_deseada", carga.fecha_entrega_deseada)
    if entrega < retiro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de entrega no puede ser anterior a la fecha de retiro",
        )
    for field, value in data.items():
        setattr(carga, field, value)
    db.commit()
    db.refresh(carga)
    return carga


@router.patch("/{carga_id}/cancelar", response_model=CargaResponse)
def cancel_carga(
    carga_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Carga:
    carga = db.get(Carga, carga_id)
    if carga is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carga inexistente")
    ensure_pyme_owner_or_admin(current_user, carga)
    if carga.estado == CargaEstado.ENTREGADA:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La carga ya fue entregada")
    carga.estado = CargaEstado.CANCELADA
    if carga.viaje:
        from app.models.enums import ViajeEstado

        carga.viaje.estado = ViajeEstado.CANCELADO
    db.commit()
    db.refresh(carga)
    return carga
