from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models.enums import (
    CargaEstado,
    DocumentoEstado,
    DocumentoTipo,
    NotificacionTipo,
    OfertaEstado,
    OwnerTipo,
    PagoEstado,
    PagoMetodo,
    TransportistaTipo,
    UserRole,
    UserStatus,
    VehiculoEstado,
    VehiculoTipo,
    ViajeEstado,
)


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def _validate_lat(value: Decimal | None) -> Decimal | None:
    if value is not None and not Decimal("-90") <= value <= Decimal("90"):
        raise ValueError("La latitud debe estar entre -90 y 90")
    return value


def _validate_lng(value: Decimal | None) -> Decimal | None:
    if value is not None and not Decimal("-180") <= value <= Decimal("180"):
        raise ValueError("La longitud debe estar entre -180 y 180")
    return value


class UserRegister(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    telefono: str | None = Field(default=None, max_length=50)
    rol: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    telefono: str | None = Field(default=None, max_length=50)


class UserResponse(ORMModel):
    id: int
    nombre: str
    email: EmailStr
    telefono: str | None
    rol: UserRole
    estado: UserStatus
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class EmpresaPymeCreate(BaseModel):
    razon_social: str = Field(min_length=2, max_length=255)
    cuit: str = Field(min_length=7, max_length=30)
    rubro: str = Field(min_length=2, max_length=120)
    direccion: str = Field(min_length=2, max_length=255)
    ciudad: str = Field(min_length=2, max_length=120)
    provincia: str = Field(min_length=2, max_length=120)


class EmpresaPymeUpdate(BaseModel):
    razon_social: str | None = Field(default=None, min_length=2, max_length=255)
    rubro: str | None = Field(default=None, min_length=2, max_length=120)
    direccion: str | None = Field(default=None, min_length=2, max_length=255)
    ciudad: str | None = Field(default=None, min_length=2, max_length=120)
    provincia: str | None = Field(default=None, min_length=2, max_length=120)


class EmpresaPymeResponse(ORMModel):
    id: int
    user_id: int
    razon_social: str
    cuit: str
    rubro: str
    direccion: str
    ciudad: str
    provincia: str
    verificada: bool
    created_at: datetime
    updated_at: datetime


class TransportistaCreate(BaseModel):
    nombre_completo: str = Field(min_length=2, max_length=180)
    dni: str = Field(min_length=6, max_length=30)
    cuit_cuil: str = Field(min_length=7, max_length=30)
    tipo: TransportistaTipo
    ciudad_base: str = Field(min_length=2, max_length=120)
    provincia_base: str = Field(min_length=2, max_length=120)


class TransportistaUpdate(BaseModel):
    nombre_completo: str | None = Field(default=None, min_length=2, max_length=180)
    tipo: TransportistaTipo | None = None
    ciudad_base: str | None = Field(default=None, min_length=2, max_length=120)
    provincia_base: str | None = Field(default=None, min_length=2, max_length=120)


class TransportistaResponse(ORMModel):
    id: int
    user_id: int
    nombre_completo: str
    dni: str
    cuit_cuil: str
    tipo: TransportistaTipo
    ciudad_base: str
    provincia_base: str
    verificado: bool
    reputacion_promedio: Decimal
    created_at: datetime
    updated_at: datetime


class ReputacionResponse(BaseModel):
    transportista_id: int
    reputacion_promedio: Decimal


class VehiculoCreate(BaseModel):
    patente: str = Field(min_length=5, max_length=20)
    tipo: VehiculoTipo
    capacidad_kg: Decimal = Field(gt=0)
    capacidad_m3: Decimal = Field(gt=0)
    refrigerado: bool = False
    tiene_rampa: bool = False


class VehiculoUpdate(BaseModel):
    tipo: VehiculoTipo | None = None
    capacidad_kg: Decimal | None = Field(default=None, gt=0)
    capacidad_m3: Decimal | None = Field(default=None, gt=0)
    refrigerado: bool | None = None
    tiene_rampa: bool | None = None


class VehiculoEstadoUpdate(BaseModel):
    estado: VehiculoEstado


class VehiculoResponse(ORMModel):
    id: int
    transportista_id: int
    patente: str
    tipo: VehiculoTipo
    capacidad_kg: Decimal
    capacidad_m3: Decimal
    refrigerado: bool
    tiene_rampa: bool
    estado: VehiculoEstado
    created_at: datetime
    updated_at: datetime


class DocumentoCreate(BaseModel):
    owner_tipo: OwnerTipo
    owner_id: int
    tipo: DocumentoTipo
    nombre_archivo: str = Field(min_length=1, max_length=255)
    url_archivo: str | None = Field(default=None, max_length=500)
    path_archivo: str | None = Field(default=None, max_length=500)
    fecha_vencimiento: date | None = None
    observaciones: str | None = None


class DocumentoRechazo(BaseModel):
    observaciones: str | None = None


class DocumentoResponse(ORMModel):
    id: int
    owner_tipo: OwnerTipo
    owner_id: int
    tipo: DocumentoTipo
    nombre_archivo: str
    url_archivo: str | None
    path_archivo: str | None
    estado: DocumentoEstado
    fecha_vencimiento: date | None
    observaciones: str | None
    created_at: datetime
    updated_at: datetime


class TipoTarifaResponse(ORMModel):
    id: int
    nombre: str
    tarifa_base_ton_km: float


class PresupuestoRequest(BaseModel):
    distancia_km: float = Field(gt=0)
    peso_kg: float = Field(gt=0)
    volumen_m3: float = Field(gt=0)
    id_tipo_tarifa: int


class PresupuestoResponse(BaseModel):
    peso_tasable_kg: float
    motivo_tasacion: str
    presupuesto_sugerido: float


class CargaCreate(BaseModel):
    titulo: str = Field(min_length=2, max_length=180)
    descripcion: str | None = None
    tipo_mercaderia: str = Field(min_length=2, max_length=150)
    peso_kg: float = Field(gt=0)
    volumen_m3: float = Field(gt=0)
    requiere_refrigeracion: bool = False
    requiere_rampa: bool = False
    requiere_mantas: bool = False
    origen_direccion: str = Field(min_length=2, max_length=255)
    origen_ciudad: str = Field(min_length=2, max_length=120)
    origen_provincia: str = Field(min_length=2, max_length=120)
    origen_lat: Decimal | None = None
    origen_lng: Decimal | None = None
    destino_direccion: str = Field(min_length=2, max_length=255)
    destino_ciudad: str = Field(min_length=2, max_length=120)
    destino_provincia: str = Field(min_length=2, max_length=120)
    destino_lat: Decimal | None = None
    destino_lng: Decimal | None = None
    fecha_retiro_deseada: datetime
    fecha_entrega_deseada: datetime
    precio_referencia: Decimal = Field(default=Decimal("0.00"), ge=0)
    cantidadKm: float = Field(gt=0)
    distancia_km: float | None = None
    idTipoTarifa: int
    nombreTipoTarifa: str
    tarifa: float = Field(gt=0)
    tarifa_base_ton_km: float | None = None
    incluyeIVA: bool = False
    hora_inicio_carga: datetime
    hora_fin_carga: datetime
    hora_inicio_descarga: datetime
    hora_fin_descarga: datetime
    requiere_balanza: bool = False
    ubicacion_balanza: str | None = None
    hora_inicio_balanza: datetime | None = None
    hora_fin_balanza: datetime | None = None

    @field_validator("origen_lat", "destino_lat")
    @classmethod
    def validate_lat(cls, value: Decimal | None) -> Decimal | None:
        return _validate_lat(value)

    @field_validator("origen_lng", "destino_lng")
    @classmethod
    def validate_lng(cls, value: Decimal | None) -> Decimal | None:
        return _validate_lng(value)

    @model_validator(mode="after")
    def validate_dates(self) -> "CargaCreate":
        if self.fecha_entrega_deseada < self.fecha_retiro_deseada:
            raise ValueError("La fecha de entrega no puede ser anterior a la fecha de retiro")
        
        # Validar tiempos de carga
        if self.hora_fin_carga <= self.hora_inicio_carga:
            raise ValueError("La hora de fin de carga debe ser posterior a la de inicio")
            
        # Validar tiempos de descarga
        if self.hora_fin_descarga <= self.hora_inicio_descarga:
            raise ValueError("La hora de fin de descarga debe ser posterior a la de inicio")
            
        # Validar balanza
        if self.requiere_balanza:
            if not self.ubicacion_balanza or not self.ubicacion_balanza.strip():
                raise ValueError("La ubicación de la balanza es obligatoria si requiere balanza")
            if self.hora_inicio_balanza is None or self.hora_fin_balanza is None:
                raise ValueError("Los horarios de balanza son obligatorios si requiere balanza")
            if self.hora_fin_balanza <= self.hora_inicio_balanza:
                raise ValueError("La hora de fin de balanza debe ser posterior a la de inicio")
                
        return self


class CargaUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=2, max_length=180)
    descripcion: str | None = None
    tipo_mercaderia: str | None = Field(default=None, min_length=2, max_length=150)
    peso_kg: float | None = Field(default=None, gt=0)
    volumen_m3: float | None = Field(default=None, gt=0)
    distancia_km: float | None = Field(default=None, gt=0)
    tarifa_base_ton_km: float | None = Field(default=None, gt=0)
    requiere_refrigeracion: bool | None = None
    requiere_rampa: bool | None = None
    requiere_mantas: bool | None = None
    origen_direccion: str | None = Field(default=None, min_length=2, max_length=255)
    origen_ciudad: str | None = Field(default=None, min_length=2, max_length=120)
    origen_provincia: str | None = Field(default=None, min_length=2, max_length=120)
    origen_lat: Decimal | None = None
    origen_lng: Decimal | None = None
    destino_direccion: str | None = Field(default=None, min_length=2, max_length=255)
    destino_ciudad: str | None = Field(default=None, min_length=2, max_length=120)
    destino_provincia: str | None = Field(default=None, min_length=2, max_length=120)
    destino_lat: Decimal | None = None
    destino_lng: Decimal | None = None
    fecha_retiro_deseada: datetime | None = None
    fecha_entrega_deseada: datetime | None = None
    precio_referencia: Decimal | None = Field(default=None, ge=0)
    hora_inicio_carga: datetime | None = None
    hora_fin_carga: datetime | None = None
    hora_inicio_descarga: datetime | None = None
    hora_fin_descarga: datetime | None = None
    requiere_balanza: bool | None = None
    ubicacion_balanza: str | None = None
    hora_inicio_balanza: datetime | None = None
    hora_fin_balanza: datetime | None = None

    @field_validator("origen_lat", "destino_lat")
    @classmethod
    def validate_lat(cls, value: Decimal | None) -> Decimal | None:
        return _validate_lat(value)

    @field_validator("origen_lng", "destino_lng")
    @classmethod
    def validate_lng(cls, value: Decimal | None) -> Decimal | None:
        return _validate_lng(value)


class CargaResponse(ORMModel):
    id: int
    empresa_id: int
    titulo: str
    descripcion: str | None
    tipo_mercaderia: str
    peso_kg: float
    volumen_m3: float
    requiere_refrigeracion: bool
    requiere_rampa: bool
    requiere_mantas: bool
    origen_direccion: str
    origen_ciudad: str
    origen_provincia: str
    origen_lat: Decimal | None
    origen_lng: Decimal | None
    destino_direccion: str
    destino_ciudad: str
    destino_provincia: str
    destino_lat: Decimal | None
    destino_lng: Decimal | None
    fecha_retiro_deseada: datetime
    fecha_entrega_deseada: datetime
    precio_referencia: Decimal
    cantidadKm: float
    distancia_km: float
    idTipoTarifa: int
    nombreTipoTarifa: str
    tarifa: float
    tarifa_base_ton_km: float
    incluyeIVA: bool
    hora_inicio_carga: datetime
    hora_fin_carga: datetime
    hora_inicio_descarga: datetime
    hora_fin_descarga: datetime
    requiere_balanza: bool
    ubicacion_balanza: str | None
    hora_inicio_balanza: datetime | None
    hora_fin_balanza: datetime | None
    estado: CargaEstado
    created_at: datetime
    updated_at: datetime


class OfertaCreate(BaseModel):
    vehiculo_id: int
    monto: Decimal = Field(ge=0)
    mensaje: str | None = None


class OfertaResponse(ORMModel):
    id: int
    carga_id: int
    transportista_id: int
    vehiculo_id: int
    monto: Decimal
    mensaje: str | None
    estado: OfertaEstado
    created_at: datetime
    updated_at: datetime


class ViajeEstadoUpdate(BaseModel):
    estado: ViajeEstado


class ViajeFinalizar(BaseModel):
    observaciones: str | None = None


class ViajeResponse(ORMModel):
    id: int
    carga_id: int
    oferta_id: int
    empresa_id: int
    transportista_id: int
    vehiculo_id: int
    estado: ViajeEstado
    fecha_asignacion: datetime
    fecha_inicio: datetime | None
    fecha_entrega: datetime | None
    observaciones: str | None
    created_at: datetime
    updated_at: datetime


class TrackingPositionCreate(BaseModel):
    lat: Decimal
    lng: Decimal
    velocidad: Decimal | None = Field(default=None, ge=0)
    timestamp: datetime | None = None

    @field_validator("lat")
    @classmethod
    def validate_latitude(cls, value: Decimal) -> Decimal:
        return _validate_lat(value)  # type: ignore[return-value]

    @field_validator("lng")
    @classmethod
    def validate_longitude(cls, value: Decimal) -> Decimal:
        return _validate_lng(value)  # type: ignore[return-value]


class TrackingPositionResponse(ORMModel):
    id: int
    viaje_id: int
    transportista_id: int
    lat: Decimal
    lng: Decimal
    velocidad: Decimal | None
    timestamp: datetime
    alerta_seguridad: str | None = None
    created_at: datetime


class PagoSimular(BaseModel):
    monto_total: Decimal | None = Field(default=None, ge=0)
    comision_porcentaje: Decimal = Field(default=Decimal("10.00"), ge=0, le=100)


class PagoResponse(ORMModel):
    id: int
    viaje_id: int
    empresa_id: int
    transportista_id: int
    monto_total: Decimal
    comision_plataforma: Decimal
    monto_transportista: Decimal
    estado: PagoEstado
    metodo: PagoMetodo
    fecha_pago: datetime | None
    created_at: datetime
    updated_at: datetime


class CalificacionCreate(BaseModel):
    receptor_usuario_id: int | None = None
    puntaje: int = Field(ge=1, le=5)
    comentario: str | None = None


class CalificacionResponse(ORMModel):
    id: int
    viaje_id: int
    autor_usuario_id: int
    receptor_usuario_id: int
    puntaje: int
    comentario: str | None
    created_at: datetime


class NotificacionResponse(ORMModel):
    id: int
    usuario_id: int
    titulo: str
    mensaje: str
    tipo: NotificacionTipo
    leida: bool
    created_at: datetime
