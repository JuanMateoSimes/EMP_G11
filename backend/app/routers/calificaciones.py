from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.enums import UserRole, ViajeEstado
from app.models.models import Calificacion, EmpresaPyme, Transportista, User, Viaje
from app.schemas.schemas import CalificacionCreate, CalificacionResponse
from app.services.business import update_transportista_reputation

router = APIRouter(tags=["Calificaciones"])


@router.post(
    "/api/viajes/{viaje_id}/calificaciones",
    response_model=CalificacionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_calificacion(
    viaje_id: int,
    payload: CalificacionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Calificacion:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    if viaje.estado != ViajeEstado.ENTREGADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se puede calificar un viaje entregado",
        )
    receptor_usuario_id = _expected_receptor_id(db, current_user, viaje)
    if payload.receptor_usuario_id and payload.receptor_usuario_id != receptor_usuario_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Receptor invalido")
    if db.scalar(
        select(Calificacion).where(
            Calificacion.viaje_id == viaje.id,
            Calificacion.autor_usuario_id == current_user.id,
        )
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya calificaste este viaje")

    calificacion = Calificacion(
        viaje_id=viaje.id,
        autor_usuario_id=current_user.id,
        receptor_usuario_id=receptor_usuario_id,
        puntaje=payload.puntaje,
        comentario=payload.comentario,
    )
    db.add(calificacion)
    if receptor_usuario_id == viaje.transportista.user_id:
        db.flush()
        update_transportista_reputation(db, viaje.transportista)
    db.commit()
    db.refresh(calificacion)
    return calificacion


@router.get("/api/usuarios/{usuario_id}/calificaciones", response_model=list[CalificacionResponse])
def get_calificaciones_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Calificacion]:
    return list(
        db.scalars(
            select(Calificacion)
            .where(Calificacion.receptor_usuario_id == usuario_id)
            .order_by(Calificacion.created_at.desc())
        )
    )


def _expected_receptor_id(db: Session, current_user: User, viaje: Viaje) -> int:
    if current_user.rol == UserRole.PYME:
        pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == current_user.id))
        if pyme and pyme.id == viaje.empresa_id:
            return viaje.transportista.user_id
    if current_user.rol == UserRole.TRANSPORTISTA:
        transportista = db.scalar(select(Transportista).where(Transportista.user_id == current_user.id))
        if transportista and transportista.id == viaje.transportista_id:
            return viaje.empresa.user_id
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Solo las partes del viaje pueden calificar",
    )
