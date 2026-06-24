from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import UserRole
from app.models.models import EmpresaPyme, User
from app.schemas.schemas import EmpresaPymeCreate, EmpresaPymeResponse, EmpresaPymeUpdate, PymeDashboardResponse

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


@router.get("/dashboard", response_model=PymeDashboardResponse)
def get_pyme_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> dict:
    from app.models.models import Viaje, Pago, Carga
    
    pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == current_user.id))
    if pyme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La PyME no existe")
        
    viajes_totales = db.scalar(
        select(func.count(Viaje.id)).where(Viaje.empresa_id == pyme.id)
    ) or 0
    
    gastos_totales = db.scalar(
        select(func.sum(Pago.monto_total)).where(Pago.empresa_id == pyme.id)
    ) or 0.0
    
    cuenta_verificada = pyme.verificada
    
    cargas_recientes = db.scalars(
        select(Carga)
        .where(Carga.empresa_id == pyme.id)
        .order_by(Carga.updated_at.desc())
        .limit(5)
    ).all()
    
    actividad_reciente = []
    for c in cargas_recientes:
        actividad_reciente.append({
            "fecha": c.updated_at,
            "tipo_carga": c.tipo_mercaderia,
            "estado": c.estado
        })
        
    return {
        "viajes_totales": viajes_totales,
        "gastos_totales": float(gastos_totales),
        "cuenta_verificada": cuenta_verificada,
        "actividad_reciente": actividad_reciente
    }


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
