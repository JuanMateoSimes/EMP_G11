from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import NotificacionTipo, PagoEstado, PagoMetodo, UserRole, ViajeEstado
from app.models.models import Pago, User, Viaje
from app.schemas.schemas import PagoResponse, PagoSimular
from app.services.business import create_notification, ensure_viaje_party_or_admin

router = APIRouter(tags=["Pagos"])


@router.post("/api/viajes/{viaje_id}/pago/simular", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def simular_pago(
    viaje_id: int,
    payload: PagoSimular,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME, UserRole.ADMIN)),
) -> Pago:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    ensure_viaje_party_or_admin(current_user, viaje)
    if viaje.estado != ViajeEstado.ENTREGADO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El viaje debe estar entregado")
    if db.scalar(select(Pago).where(Pago.viaje_id == viaje.id)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El viaje ya tiene pago registrado")

    monto_total = payload.monto_total or viaje.oferta.monto or viaje.carga.precio_referencia
    comision = (monto_total * payload.comision_porcentaje / Decimal("100")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    monto_transportista = (monto_total - comision).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    pago = Pago(
        viaje_id=viaje.id,
        empresa_id=viaje.empresa_id,
        transportista_id=viaje.transportista_id,
        monto_total=monto_total,
        comision_plataforma=comision,
        monto_transportista=monto_transportista,
        estado=PagoEstado.RETENIDO,
        metodo=PagoMetodo.SIMULADO,
        fecha_pago=datetime.now(timezone.utc),
    )
    db.add(pago)
    create_notification(
        db,
        viaje.transportista.user_id,
        "Pago simulado registrado",
        f"Se registro un pago simulado para el viaje {viaje.id}.",
        NotificacionTipo.PAGO_ACTUALIZADO,
    )
    db.commit()
    db.refresh(pago)
    return pago


@router.get("/api/viajes/{viaje_id}/pago", response_model=PagoResponse)
def get_pago_viaje(
    viaje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Pago:
    viaje = db.get(Viaje, viaje_id)
    if viaje is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Viaje inexistente")
    ensure_viaje_party_or_admin(current_user, viaje)
    pago = db.scalar(select(Pago).where(Pago.viaje_id == viaje.id))
    if pago is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago inexistente")
    return pago


@router.patch("/api/pagos/{pago_id}/liberar", response_model=PagoResponse)
def liberar_pago(
    pago_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> Pago:
    pago = db.get(Pago, pago_id)
    if pago is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago inexistente")
    pago.estado = PagoEstado.LIBERADO
    create_notification(
        db,
        pago.transportista.user_id,
        "Pago liberado",
        f"Se libero el pago del viaje {pago.viaje_id}.",
        NotificacionTipo.PAGO_ACTUALIZADO,
    )
    db.commit()
    db.refresh(pago)
    return pago
