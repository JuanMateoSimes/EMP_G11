from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import UserRole
from app.models.models import ContratoGranos, Carga, User
from app.schemas.schemas import ContratoGranosCreate, ContratoGranosResponse
from app.services.business import get_pyme_for_user

router = APIRouter(prefix="/api/contratos", tags=["Contratos"])


@router.post("", response_model=ContratoGranosResponse, status_code=status.HTTP_201_CREATED)
def create_contrato(
    payload: ContratoGranosCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> ContratoGranos:
    pyme = get_pyme_for_user(db, current_user)
    
    # Check if number already exists
    existing = db.scalar(
        select(ContratoGranos).where(ContratoGranos.numero_contrato == payload.numero_contrato)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El número de contrato ya está registrado"
        )
        
    # If carga_id is associated, verify ownership
    if payload.carga_id is not None:
        carga = db.get(Carga, payload.carga_id)
        if carga is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La carga asociada no existe"
            )
        if carga.empresa_id != pyme.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos sobre la carga asociada"
            )
            
    contrato = ContratoGranos(**payload.model_dump())
    db.add(contrato)
    db.commit()
    db.refresh(contrato)
    return contrato


@router.get("", response_model=list[ContratoGranosResponse])
def list_contratos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME, UserRole.ADMIN)),
) -> list[ContratoGranos]:
    if current_user.rol == UserRole.ADMIN:
        return list(db.scalars(select(ContratoGranos).order_by(ContratoGranos.created_at.desc())).all())
        
    pyme = get_pyme_for_user(db, current_user)
    # Return contracts that are either independent or associated with this PyME's loads
    # For simplicity, we filter contracts linked to loads of this PyME, or independent ones
    # (Since there's no empresa_id column, independent ones are shown to the pyme that created them, or all pymes for this MVP)
    # Let's join Carga to filter linked ones, and also fetch independent ones
    stmt = (
        select(ContratoGranos)
        .outerjoin(Carga)
        .where((Carga.empresa_id == pyme.id) | (ContratoGranos.carga_id == None))
        .order_by(ContratoGranos.created_at.desc())
    )
    return list(db.scalars(stmt).all())


@router.get("/{id}", response_model=ContratoGranosResponse)
def get_contrato(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ContratoGranos:
    contrato = db.get(ContratoGranos, id)
    if contrato is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato no encontrado"
        )
    return contrato
