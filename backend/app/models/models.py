from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    Column,
    Table,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
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


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rol: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    estado: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), default=UserStatus.ACTIVO, nullable=False
    )

    pyme: Mapped["EmpresaPyme | None"] = relationship(back_populates="user")
    transportista: Mapped["Transportista | None"] = relationship(back_populates="user")


class EmpresaPyme(TimestampMixin, Base):
    __tablename__ = "empresas_pyme"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    razon_social: Mapped[str] = mapped_column(String(255), nullable=False)
    cuit: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    rubro: Mapped[str] = mapped_column(String(120), nullable=False)
    direccion: Mapped[str] = mapped_column(String(255), nullable=False)
    ciudad: Mapped[str] = mapped_column(String(120), nullable=False)
    provincia: Mapped[str] = mapped_column(String(120), nullable=False)
    verificada: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship(back_populates="pyme")
    cargas: Mapped[list["Carga"]] = relationship(back_populates="empresa")


class Transportista(TimestampMixin, Base):
    __tablename__ = "transportistas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    nombre_completo: Mapped[str] = mapped_column(String(180), nullable=False)
    dni: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    cuit_cuil: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    tipo: Mapped[TransportistaTipo] = mapped_column(Enum(TransportistaTipo), nullable=False)
    ciudad_base: Mapped[str] = mapped_column(String(120), nullable=False)
    provincia_base: Mapped[str] = mapped_column(String(120), nullable=False)
    verificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reputacion_promedio: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), default=Decimal("0.00"), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="transportista")
    vehiculos: Mapped[list["Vehiculo"]] = relationship(back_populates="transportista")
    ofertas: Mapped[list["Oferta"]] = relationship(back_populates="transportista")


class Vehiculo(TimestampMixin, Base):
    __tablename__ = "vehiculos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    transportista_id: Mapped[int] = mapped_column(
        ForeignKey("transportistas.id"), nullable=False, index=True
    )
    patente: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    tipo: Mapped[VehiculoTipo] = mapped_column(Enum(VehiculoTipo), nullable=False)
    capacidad_kg: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    capacidad_m3: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    refrigerado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    tiene_rampa: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    estado: Mapped[VehiculoEstado] = mapped_column(
        Enum(VehiculoEstado), default=VehiculoEstado.PENDIENTE_VERIFICACION, nullable=False
    )

    transportista: Mapped[Transportista] = relationship(back_populates="vehiculos")


class Documento(TimestampMixin, Base):
    __tablename__ = "documentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_tipo: Mapped[OwnerTipo] = mapped_column(Enum(OwnerTipo), nullable=False, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    tipo: Mapped[DocumentoTipo] = mapped_column(Enum(DocumentoTipo), nullable=False)
    nombre_archivo: Mapped[str] = mapped_column(String(255), nullable=False)
    url_archivo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    path_archivo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    estado: Mapped[DocumentoEstado] = mapped_column(
        Enum(DocumentoEstado), default=DocumentoEstado.PENDIENTE, nullable=False
    )
    fecha_vencimiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)


class TipoTarifa(Base):
    __tablename__ = "tipos_tarifas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    tarifa_base_ton_km: Mapped[float] = mapped_column(Float, nullable=False, default=150.0)


carga_tipo_acoplado = Table(
    "carga_tipo_acoplado",
    Base.metadata,
    Column("carga_id", ForeignKey("cargas.id", ondelete="CASCADE"), primary_key=True),
    Column("tipo_acoplado_id", ForeignKey("tipos_acoplados.id", ondelete="CASCADE"), primary_key=True),
)


class TipoAcoplado(Base):
    __tablename__ = "tipos_acoplados"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    cargas: Mapped[list["Carga"]] = relationship(
        secondary=carga_tipo_acoplado, back_populates="tipos_acoplados"
    )


class Carga(TimestampMixin, Base):
    __tablename__ = "cargas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresas_pyme.id"), nullable=False)
    titulo: Mapped[str] = mapped_column(String(180), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    tipo_mercaderia: Mapped[str] = mapped_column(String(150), nullable=False)
    peso_kg: Mapped[float] = mapped_column(Float, nullable=False)
    volumen_m3: Mapped[float] = mapped_column(Float, nullable=False)
    origen_direccion: Mapped[str] = mapped_column(String(255), nullable=False)
    origen_ciudad: Mapped[str] = mapped_column(String(120), nullable=False)
    origen_provincia: Mapped[str] = mapped_column(String(120), nullable=False)
    origen_lat: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    origen_lng: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    destino_direccion: Mapped[str] = mapped_column(String(255), nullable=False)
    destino_ciudad: Mapped[str] = mapped_column(String(120), nullable=False)
    destino_provincia: Mapped[str] = mapped_column(String(120), nullable=False)
    destino_lat: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    destino_lng: Mapped[Decimal | None] = mapped_column(Numeric(9, 6), nullable=True)
    fecha_retiro_deseada: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fecha_entrega_deseada: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    precio_referencia: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cantidadKm: Mapped[float] = mapped_column(Float, nullable=False)
    distancia_km: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    idTipoTarifa: Mapped[int] = mapped_column(ForeignKey("tipos_tarifas.id"), nullable=False)
    nombreTipoTarifa: Mapped[str] = mapped_column(String(100), nullable=False)
    tarifa: Mapped[float] = mapped_column(Float, nullable=False)
    tarifa_base_ton_km: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    incluyeIVA: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hora_inicio_carga: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hora_fin_carga: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hora_inicio_descarga: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hora_fin_descarga: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    requiere_balanza: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ubicacion_balanza: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hora_inicio_balanza: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hora_fin_balanza: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    estado: Mapped[CargaEstado] = mapped_column(
        Enum(CargaEstado), default=CargaEstado.PUBLICADA, nullable=False, index=True
    )

    tipos_acoplados: Mapped[list["TipoAcoplado"]] = relationship(
        secondary=carga_tipo_acoplado, back_populates="cargas"
    )

    @property
    def idsTiposAcoplados(self) -> list[int]:
        return [t.id for t in self.tipos_acoplados]

    empresa: Mapped[EmpresaPyme] = relationship(back_populates="cargas")
    ofertas: Mapped[list["Oferta"]] = relationship(back_populates="carga")
    viaje: Mapped["Viaje | None"] = relationship(back_populates="carga")


class Oferta(TimestampMixin, Base):
    __tablename__ = "ofertas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    carga_id: Mapped[int] = mapped_column(ForeignKey("cargas.id"), nullable=False, index=True)
    transportista_id: Mapped[int] = mapped_column(
        ForeignKey("transportistas.id"), nullable=False, index=True
    )
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id"), nullable=False)
    monto: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    mensaje: Mapped[str | None] = mapped_column(Text, nullable=True)
    estado: Mapped[OfertaEstado] = mapped_column(
        Enum(OfertaEstado), default=OfertaEstado.PENDIENTE, nullable=False, index=True
    )

    carga: Mapped[Carga] = relationship(back_populates="ofertas")
    transportista: Mapped[Transportista] = relationship(back_populates="ofertas")
    vehiculo: Mapped[Vehiculo] = relationship()
    viaje: Mapped["Viaje | None"] = relationship(back_populates="oferta")


class Viaje(TimestampMixin, Base):
    __tablename__ = "viajes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    carga_id: Mapped[int] = mapped_column(ForeignKey("cargas.id"), unique=True, nullable=False)
    oferta_id: Mapped[int] = mapped_column(ForeignKey("ofertas.id"), unique=True, nullable=False)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresas_pyme.id"), nullable=False)
    transportista_id: Mapped[int] = mapped_column(ForeignKey("transportistas.id"), nullable=False)
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id"), nullable=False)
    estado: Mapped[ViajeEstado] = mapped_column(
        Enum(ViajeEstado), default=ViajeEstado.ASIGNADO, nullable=False, index=True
    )
    fecha_asignacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fecha_inicio: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    fecha_entrega: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    carga: Mapped[Carga] = relationship(back_populates="viaje")
    oferta: Mapped[Oferta] = relationship(back_populates="viaje")
    empresa: Mapped[EmpresaPyme] = relationship()
    transportista: Mapped[Transportista] = relationship()
    vehiculo: Mapped[Vehiculo] = relationship()
    tracking_positions: Mapped[list["TrackingPosition"]] = relationship(back_populates="viaje")
    pago: Mapped["Pago | None"] = relationship(back_populates="viaje")


class TrackingPosition(Base):
    __tablename__ = "tracking_positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    viaje_id: Mapped[int] = mapped_column(ForeignKey("viajes.id"), nullable=False, index=True)
    transportista_id: Mapped[int] = mapped_column(
        ForeignKey("transportistas.id"), nullable=False, index=True
    )
    lat: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    lng: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    velocidad: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    alerta_seguridad: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    viaje: Mapped[Viaje] = relationship(back_populates="tracking_positions")
    transportista: Mapped[Transportista] = relationship()


class Pago(TimestampMixin, Base):
    __tablename__ = "pagos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    viaje_id: Mapped[int] = mapped_column(ForeignKey("viajes.id"), unique=True, nullable=False)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresas_pyme.id"), nullable=False)
    transportista_id: Mapped[int] = mapped_column(ForeignKey("transportistas.id"), nullable=False)
    monto_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    comision_plataforma: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    monto_transportista: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    estado: Mapped[PagoEstado] = mapped_column(
        Enum(PagoEstado), default=PagoEstado.RETENIDO, nullable=False
    )
    metodo: Mapped[PagoMetodo] = mapped_column(
        Enum(PagoMetodo), default=PagoMetodo.SIMULADO, nullable=False
    )
    fecha_pago: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    viaje: Mapped[Viaje] = relationship(back_populates="pago")
    empresa: Mapped[EmpresaPyme] = relationship()
    transportista: Mapped[Transportista] = relationship()


class Calificacion(Base):
    __tablename__ = "calificaciones"
    __table_args__ = (
        UniqueConstraint("viaje_id", "autor_usuario_id", name="uq_calificacion_viaje_autor"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    viaje_id: Mapped[int] = mapped_column(ForeignKey("viajes.id"), nullable=False, index=True)
    autor_usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    receptor_usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    puntaje: Mapped[int] = mapped_column(Integer, nullable=False)
    comentario: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    viaje: Mapped[Viaje] = relationship()
    autor: Mapped[User] = relationship(foreign_keys=[autor_usuario_id])
    receptor: Mapped[User] = relationship(foreign_keys=[receptor_usuario_id])


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    titulo: Mapped[str] = mapped_column(String(180), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[NotificacionTipo] = mapped_column(Enum(NotificacionTipo), nullable=False)
    leida: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    usuario: Mapped[User] = relationship()


class ContratoGranos(TimestampMixin, Base):
    __tablename__ = "contratos_granos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    carga_id: Mapped[int | None] = mapped_column(ForeignKey("cargas.id"), nullable=True)
    numero_contrato: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    fecha_inicio_contrato: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fecha_fin_contrato: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    productor_id: Mapped[str] = mapped_column(String(50), nullable=False)
    productor_nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    exportador_id: Mapped[str] = mapped_column(String(50), nullable=False)
    exportador_nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_grano: Mapped[str] = mapped_column(String(100), nullable=False)
    calidad_grano: Mapped[str] = mapped_column(String(100), nullable=False)
    humedad_maxima_permitida: Mapped[float] = mapped_column(Float, nullable=False)
    impurezas_maximas_permitidas: Mapped[float] = mapped_column(Float, nullable=False)
    planta_procedencia_ruca: Mapped[str] = mapped_column(String(100), nullable=False)
    planta_destino_ruca: Mapped[str] = mapped_column(String(100), nullable=False)
    cantidad_total_kg: Mapped[float] = mapped_column(Float, nullable=False)
    precio_por_kg: Mapped[float] = mapped_column(Float, nullable=False)

    carga: Mapped["Carga | None"] = relationship()
