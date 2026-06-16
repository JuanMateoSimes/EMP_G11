from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.enums import DocumentoEstado, NotificacionTipo, OwnerTipo, UserRole
from app.models.models import Documento, EmpresaPyme, Transportista, User, Vehiculo, Viaje
from app.schemas.schemas import DocumentoCreate, DocumentoRechazo, DocumentoResponse
from app.services.business import create_notification, ensure_viaje_party_or_admin

router = APIRouter(prefix="/api/documentos", tags=["Documentos"])


def _assert_owner_access(db: Session, user: User, owner_tipo: OwnerTipo, owner_id: int) -> None:
    if user.rol == UserRole.ADMIN:
        return
    if owner_tipo == OwnerTipo.EMPRESA and user.rol == UserRole.PYME:
        pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == user.id))
        if pyme and pyme.id == owner_id:
            return
    if owner_tipo == OwnerTipo.TRANSPORTISTA and user.rol == UserRole.TRANSPORTISTA:
        transportista = db.scalar(select(Transportista).where(Transportista.user_id == user.id))
        if transportista and transportista.id == owner_id:
            return
    if owner_tipo == OwnerTipo.VEHICULO and user.rol == UserRole.TRANSPORTISTA:
        transportista = db.scalar(select(Transportista).where(Transportista.user_id == user.id))
        vehiculo = db.get(Vehiculo, owner_id)
        if transportista and vehiculo and vehiculo.transportista_id == transportista.id:
            return
    if owner_tipo == OwnerTipo.VIAJE:
        viaje = db.get(Viaje, owner_id)
        if viaje:
            ensure_viaje_party_or_admin(user, viaje)
            return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tenes permisos sobre el dueño del documento",
    )


def _owner_refs_for_user(db: Session, user: User) -> list[tuple[OwnerTipo, int]]:
    if user.rol == UserRole.ADMIN:
        return []
    refs: list[tuple[OwnerTipo, int]] = []
    if user.rol == UserRole.PYME:
        pyme = db.scalar(select(EmpresaPyme).where(EmpresaPyme.user_id == user.id))
        if pyme:
            refs.append((OwnerTipo.EMPRESA, pyme.id))
            viajes = db.scalars(select(Viaje.id).where(Viaje.empresa_id == pyme.id))
            refs.extend((OwnerTipo.VIAJE, viaje_id) for viaje_id in viajes)
    if user.rol == UserRole.TRANSPORTISTA:
        transportista = db.scalar(select(Transportista).where(Transportista.user_id == user.id))
        if transportista:
            refs.append((OwnerTipo.TRANSPORTISTA, transportista.id))
            vehiculos = db.scalars(select(Vehiculo.id).where(Vehiculo.transportista_id == transportista.id))
            refs.extend((OwnerTipo.VEHICULO, vehiculo_id) for vehiculo_id in vehiculos)
            viajes = db.scalars(select(Viaje.id).where(Viaje.transportista_id == transportista.id))
            refs.extend((OwnerTipo.VIAJE, viaje_id) for viaje_id in viajes)
    return refs


def _notify_document_owner(db: Session, documento: Documento) -> None:
    usuario_id: int | None = None
    if documento.owner_tipo == OwnerTipo.EMPRESA:
        pyme = db.get(EmpresaPyme, documento.owner_id)
        usuario_id = pyme.user_id if pyme else None
    elif documento.owner_tipo == OwnerTipo.TRANSPORTISTA:
        transportista = db.get(Transportista, documento.owner_id)
        usuario_id = transportista.user_id if transportista else None
    elif documento.owner_tipo == OwnerTipo.VEHICULO:
        vehiculo = db.get(Vehiculo, documento.owner_id)
        if vehiculo:
            transportista = db.get(Transportista, vehiculo.transportista_id)
            usuario_id = transportista.user_id if transportista else None
    elif documento.owner_tipo == OwnerTipo.VIAJE:
        viaje = db.get(Viaje, documento.owner_id)
        if viaje:
            transportista = db.get(Transportista, viaje.transportista_id)
            usuario_id = transportista.user_id if transportista else None
    if usuario_id:
        create_notification(
            db,
            usuario_id,
            "Documento rechazado",
            f"El documento {documento.nombre_archivo} fue rechazado.",
            NotificacionTipo.DOCUMENTO_RECHAZADO,
        )


@router.post("", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
def create_documento(
    payload: DocumentoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Documento:
    _assert_owner_access(db, current_user, payload.owner_tipo, payload.owner_id)
    documento = Documento(**payload.model_dump())
    db.add(documento)
    db.commit()
    db.refresh(documento)
    return documento


@router.get("/mis-documentos", response_model=list[DocumentoResponse])
def get_my_documentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Documento]:
    if current_user.rol == UserRole.ADMIN:
        return list(db.scalars(select(Documento).order_by(Documento.created_at.desc())))
    refs = _owner_refs_for_user(db, current_user)
    if not refs:
        return []
    filters = [
        (Documento.owner_tipo == owner_tipo) & (Documento.owner_id == owner_id)
        for owner_tipo, owner_id in refs
    ]
    return list(db.scalars(select(Documento).where(or_(*filters)).order_by(Documento.created_at.desc())))


@router.get("/owner/{owner_tipo}/{owner_id}", response_model=list[DocumentoResponse])
def get_documentos_by_owner(
    owner_tipo: OwnerTipo,
    owner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Documento]:
    _assert_owner_access(db, current_user, owner_tipo, owner_id)
    return list(
        db.scalars(
            select(Documento)
            .where(Documento.owner_tipo == owner_tipo, Documento.owner_id == owner_id)
            .order_by(Documento.created_at.desc())
        )
    )


@router.patch("/{documento_id}/aprobar", response_model=DocumentoResponse)
def aprobar_documento(
    documento_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> Documento:
    documento = db.get(Documento, documento_id)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento inexistente")
    documento.estado = DocumentoEstado.APROBADO
    documento.observaciones = None
    db.commit()
    db.refresh(documento)
    return documento


@router.patch("/{documento_id}/rechazar", response_model=DocumentoResponse)
def rechazar_documento(
    documento_id: int,
    payload: DocumentoRechazo,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> Documento:
    documento = db.get(Documento, documento_id)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento inexistente")
    documento.estado = DocumentoEstado.RECHAZADO
    documento.observaciones = payload.observaciones
    _notify_document_owner(db, documento)
    db.commit()
    db.refresh(documento)
    return documento
