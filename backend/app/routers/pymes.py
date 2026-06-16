from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import UserRole
from app.models.models import EmpresaPyme, User
from app.schemas.schemas import EmpresaPymeCreate, EmpresaPymeResponse, EmpresaPymeUpdate

router = APIRouter(prefix="/api/pymes", tags=["PyMEs"])


@router.post("", response_model=EmpresaPymeResponse, status_code=status.HTTP_201_CREATED)
def create_pyme(
    payload: EmpresaPymeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> EmpresaPyme:
    existing_profile = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == current_user.id))
    if existing_profile:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La PyME ya existe")
    existing_cuit = db.scalar(select(EmpresaPyme).where(EmpresaPyme.cuit == payload.cuit))
    if existing_cuit:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El CUIT ya esta registrado")

    pyme = EmpresaPyme(user_id=current_user.id, **payload.model_dump())
    db.add(pyme)
    db.commit()
    db.refresh(pyme)
    return pyme


@router.get("/me", response_model=EmpresaPymeResponse)
def get_my_pyme(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> EmpresaPyme:
    pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == current_user.id))
    if pyme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La PyME no existe")
    return pyme


@router.put("/me", response_model=EmpresaPymeResponse)
def update_my_pyme(
    payload: EmpresaPymeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> EmpresaPyme:
    pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == current_user.id))
    if pyme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La PyME no existe")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pyme, field, value)
    db.commit()
    db.refresh(pyme)
    return pyme


@router.patch("/{pyme_id}/verificar", response_model=EmpresaPymeResponse)
def verify_pyme(
    pyme_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> EmpresaPyme:
    pyme = db.get(EmpresaPyme, pyme_id)
    if pyme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La PyME no existe")
    pyme.verificada = True
    db.commit()
    db.refresh(pyme)
    return pyme
