export type Role = "ADMIN" | "PYME" | "TRANSPORTISTA";
export type UserStatus = "ACTIVO" | "PENDIENTE_VERIFICACION" | "SUSPENDIDO";
export type TransportistaTipo = "AUTONOMO" | "EMPRESA_FAMILIAR" | "FLOTA_MEDIANA";
export type VehiculoTipo = "FURGON" | "SIDER" | "SEMIRREMOLQUE" | "CHASIS" | "TERMICO" | "TOLVA" | "UTILITARIO";
export type VehiculoEstado = "ACTIVO" | "PENDIENTE_VERIFICACION" | "INACTIVO";
export type OwnerTipo = "EMPRESA" | "TRANSPORTISTA" | "VEHICULO" | "VIAJE";
export type DocumentoTipo =
  | "DNI"
  | "CUIT"
  | "LICENCIA"
  | "SEGURO_CARGA"
  | "SEGURO_VEHICULO"
  | "POLIZA_CAUCION"
  | "CARTA_PORTE"
  | "REMITO"
  | "FACTURA"
  | "COMPROBANTE_ENTREGA";
export type DocumentoEstado = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "VENCIDO";
export type CargaEstado = "PUBLICADA" | "CON_OFERTAS" | "ASIGNADA" | "EN_CURSO" | "ENTREGADA" | "CANCELADA";
export type OfertaEstado = "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA";
export type ViajeEstado =
  | "ASIGNADO"
  | "EN_CAMINO_RETIRO"
  | "CARGA_RETIRADA"
  | "EN_TRANSITO"
  | "ENTREGADO"
  | "CANCELADO";
export type PagoEstado = "PENDIENTE" | "RETENIDO" | "LIBERADO" | "CANCELADO";
export type PagoMetodo = "SIMULADO" | "TRANSFERENCIA" | "EFECTIVO";
export type NotificacionTipo =
  | "NUEVA_OFERTA"
  | "CARGA_ASIGNADA"
  | "CAMBIO_ESTADO_VIAJE"
  | "DOCUMENTO_RECHAZADO"
  | "PAGO_ACTUALIZADO";

export type DecimalValue = number | string;

export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: Role;
  estado: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface EmpresaPyme {
  id: number;
  user_id: number;
  razon_social: string;
  cuit: string;
  rubro: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  verificada: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transportista {
  id: number;
  user_id: number;
  nombre_completo: string;
  dni: string;
  cuit_cuil: string;
  tipo: TransportistaTipo;
  ciudad_base: string;
  provincia_base: string;
  verificado: boolean;
  reputacion_promedio: DecimalValue;
  created_at: string;
  updated_at: string;
}

export interface Vehiculo {
  id: number;
  transportista_id: number;
  patente: string;
  tipo: VehiculoTipo;
  capacidad_kg: DecimalValue;
  capacidad_m3: DecimalValue;
  refrigerado: boolean;
  tiene_rampa: boolean;
  estado: VehiculoEstado;
  created_at: string;
  updated_at: string;
}

export interface Documento {
  id: number;
  owner_tipo: OwnerTipo;
  owner_id: number;
  tipo: DocumentoTipo;
  nombre_archivo: string;
  url_archivo?: string | null;
  path_archivo?: string | null;
  estado: DocumentoEstado;
  fecha_vencimiento?: string | null;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Carga {
  id: number;
  empresa_id: number;
  titulo: string;
  descripcion?: string | null;
  tipo_mercaderia: string;
  peso_kg: DecimalValue;
  volumen_m3: DecimalValue;
  requiere_refrigeracion: boolean;
  requiere_rampa: boolean;
  requiere_mantas: boolean;
  origen_direccion: string;
  origen_ciudad: string;
  origen_provincia: string;
  origen_lat?: DecimalValue | null;
  origen_lng?: DecimalValue | null;
  destino_direccion: string;
  destino_ciudad: string;
  destino_provincia: string;
  destino_lat?: DecimalValue | null;
  destino_lng?: DecimalValue | null;
  fecha_retiro_deseada: string;
  fecha_entrega_deseada: string;
  precio_referencia: DecimalValue;
  estado: CargaEstado;
  created_at: string;
  updated_at: string;
}

export interface Oferta {
  id: number;
  carga_id: number;
  transportista_id: number;
  vehiculo_id: number;
  monto: DecimalValue;
  mensaje?: string | null;
  estado: OfertaEstado;
  created_at: string;
  updated_at: string;
}

export interface Viaje {
  id: number;
  carga_id: number;
  oferta_id: number;
  empresa_id: number;
  transportista_id: number;
  vehiculo_id: number;
  estado: ViajeEstado;
  fecha_asignacion: string;
  fecha_inicio?: string | null;
  fecha_entrega?: string | null;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingPosition {
  id: number;
  viaje_id: number;
  transportista_id: number;
  lat: DecimalValue;
  lng: DecimalValue;
  velocidad?: DecimalValue | null;
  timestamp: string;
  created_at: string;
}

export interface Pago {
  id: number;
  viaje_id: number;
  empresa_id: number;
  transportista_id: number;
  monto_total: DecimalValue;
  comision_plataforma: DecimalValue;
  monto_transportista: DecimalValue;
  estado: PagoEstado;
  metodo: PagoMetodo;
  fecha_pago?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Calificacion {
  id: number;
  viaje_id: number;
  autor_usuario_id: number;
  receptor_usuario_id: number;
  puntaje: number;
  comentario?: string | null;
  created_at: string;
}

export interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: NotificacionTipo;
  leida: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  telefono?: string | null;
  rol: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}
