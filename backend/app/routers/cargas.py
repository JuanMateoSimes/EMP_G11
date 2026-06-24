from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import CargaEstado, UserRole
from app.models.models import Carga, EmpresaPyme, TipoTarifa, User, TipoAcoplado
from app.schemas.schemas import CargaCreate, CargaResponse, CargaUpdate, TipoTarifaResponse, PresupuestoRequest, PresupuestoResponse
from app.services.business import ensure_pyme_owner_or_admin, get_pyme_for_user

router = APIRouter(prefix="/api/cargas", tags=["Cargas"])


@router.post("", response_model=CargaResponse, status_code=status.HTTP_201_CREATED)
def create_carga(
    payload: CargaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PYME)),
) -> Carga:
    pyme = get_pyme_for_user(db, current_user)
    data = payload.model_dump()
    ids_acoplados = data.pop("idsTiposAcoplados", [])
    if not ids_acoplados:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe seleccionar al menos un tipo de acoplado",
        )
    acoplados = db.scalars(select(TipoAcoplado).where(TipoAcoplado.id.in_(ids_acoplados))).all()
    if len(acoplados) != len(set(ids_acoplados)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uno o más tipos de acoplados seleccionados no son válidos",
        )
    if data.get("distancia_km") is None:
        data["distancia_km"] = data.get("cantidadKm") or 0.0
    if data.get("tarifa_base_ton_km") is None:
        tipo = db.get(TipoTarifa, data["idTipoTarifa"])
        data["tarifa_base_ton_km"] = tipo.tarifa_base_ton_km if tipo else 0.0
    carga = Carga(empresa_id=pyme.id, **data)
    carga.tipos_acoplados = acoplados
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


@router.get("/tipostarifas", response_model=list[TipoTarifaResponse])
def get_tipos_tarifas(db: Session = Depends(get_db)) -> list[TipoTarifa]:
    return list(db.scalars(select(TipoTarifa).order_by(TipoTarifa.id.asc())).all())


@router.post("/calcular-presupuesto", response_model=PresupuestoResponse)
def calcular_presupuesto(
    payload: PresupuestoRequest,
    db: Session = Depends(get_db),
) -> dict:
    tipo_tarifa = db.get(TipoTarifa, payload.id_tipo_tarifa)
    if tipo_tarifa is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de tarifa no encontrado",
        )
    
    FACTOR_VOLUMEN = 300.0
    peso_volumetrico = payload.volumen_m3 * FACTOR_VOLUMEN
    peso_tasable_kg = max(payload.peso_kg, peso_volumetrico)
    toneladas_tasables = peso_tasable_kg / 1000.0
    presupuesto_sugerido = toneladas_tasables * payload.distancia_km * tipo_tarifa.tarifa_base_ton_km
    motivo_tasacion = "volumen_excedente" if peso_volumetrico > payload.peso_kg else "peso_real"
    
    return {
        "peso_tasable_kg": peso_tasable_kg,
        "motivo_tasacion": motivo_tasacion,
        "presupuesto_sugerido": round(presupuesto_sugerido, 2),
    }


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
    if "idsTiposAcoplados" in data:
        ids_acoplados = data.pop("idsTiposAcoplados")
        if ids_acoplados is not None:
            if not ids_acoplados:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Debe seleccionar al menos un tipo de acoplado",
                )
            acoplados = db.scalars(select(TipoAcoplado).where(TipoAcoplado.id.in_(ids_acoplados))).all()
            if len(acoplados) != len(set(ids_acoplados)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uno o más tipos de acoplados seleccionados no son válidos",
                )
            carga.tipos_acoplados = acoplados
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
