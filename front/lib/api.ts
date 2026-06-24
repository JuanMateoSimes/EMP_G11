import { ApiError } from "@/lib/errors";
import { isMockSession, mockApi } from "@/lib/mock-store";
import type {
  Calificacion,
  Carga,
  Documento,
  EmpresaPyme,
  LoginPayload,
  Notificacion,
  Oferta,
  Pago,
  RegisterPayload,
  TokenResponse,
  TrackingPosition,
  Transportista,
  User,
  Vehiculo,
  VehiculoEstado,
  Viaje,
  ViajeEstado,
  PresupuestoRequest,
  PresupuestoResponse,
  ContratoGranos,
  ContratoGranosCreatePayload
} from "@/lib/types";
import { isRecord } from "@/lib/utils";

const API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");
const TOKEN_KEY = "logexpress_token";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

async function parseError(response: Response) {
  try {
    const body = await response.json();
    if (isRecord(body)) {
      if (typeof body.detail === "string") return body.detail;
      if (Array.isArray(body.detail) && body.detail.length > 0) {
        const first = body.detail[0];
        if (isRecord(first) && typeof first.msg === "string") return first.msg;
      }
    }
  } catch {
    return response.statusText || "Error de API";
  }
  return response.statusText || "Error de API";
}

async function apiFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    Accept: "application/json"
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch {
    throw new ApiError("No se pudo conectar con la API. Usando datos locales si la pantalla lo permite.", {
      isNetwork: true
    });
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), { status: response.status });
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function withFallback<T>(
  realRequest: () => Promise<T>,
  fallbackRequest: () => T | Promise<T>,
  fallbackStatuses: number[] = []
): Promise<T> {
  if (isMockSession()) return fallbackRequest();
  try {
    return await realRequest();
  } catch (error) {
    if (error instanceof ApiError && (error.isNetwork || fallbackStatuses.includes(error.status ?? 0))) {
      return fallbackRequest();
    }
    throw error;
  }
}

export const tokenStorage = {
  get: getToken,
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

export const api = {
  auth: {
    register(payload: RegisterPayload) {
      return withFallback<User>(
        () => apiFetch<User>("/api/auth/register", { method: "POST", body: payload }),
        () => mockApi.auth.register(payload)
      );
    },
    login(payload: LoginPayload) {
      return withFallback<TokenResponse>(
        () => apiFetch<TokenResponse>("/api/auth/login", { method: "POST", body: payload }),
        () => mockApi.auth.login(payload)
      );
    },
    me() {
      return withFallback<User>(() => apiFetch<User>("/api/auth/me"), () => mockApi.auth.me());
    }
  },
  users: {
    me() {
      return withFallback<User>(() => apiFetch<User>("/api/users/me"), () => mockApi.users.me());
    },
    // TODO: reemplazar por endpoint real de backoffice cuando exista.
    list() {
      return withFallback<User[]>(() => apiFetch<User[]>("/api/users"), () => mockApi.users.list(), [404, 405]);
    }
  },
  pymes: {
    me() {
      return withFallback<EmpresaPyme>(() => apiFetch<EmpresaPyme>("/api/pymes/me"), () => mockApi.pymes.me());
    },
    create(payload: Omit<EmpresaPyme, "id" | "user_id" | "verificada" | "created_at" | "updated_at">) {
      return withFallback<EmpresaPyme>(
        () => apiFetch<EmpresaPyme>("/api/pymes", { method: "POST", body: payload }),
        () => mockApi.pymes.create(payload)
      );
    },
    update(payload: Partial<EmpresaPyme>) {
      return withFallback<EmpresaPyme>(
        () => apiFetch<EmpresaPyme>("/api/pymes/me", { method: "PUT", body: payload }),
        () => mockApi.pymes.update(payload)
      );
    },
    dashboard() {
      return withFallback<{
        viajes_totales: number;
        gastos_totales: number;
        cuenta_verificada: boolean;
        actividad_reciente: Array<{ fecha: string; tipo_carga: string; estado: string }>;
      }>(
        () => apiFetch("/api/pymes/dashboard"),
        () => mockApi.pymes.dashboard()
      );
    }
  },
  transportistas: {
    me() {
      return withFallback<Transportista>(
        () => apiFetch<Transportista>("/api/transportistas/me"),
        () => mockApi.transportistas.me()
      );
    },
    create(
      payload: Omit<
        Transportista,
        "id" | "user_id" | "verificado" | "reputacion_promedio" | "created_at" | "updated_at"
      >
    ) {
      return withFallback<Transportista>(
        () => apiFetch<Transportista>("/api/transportistas", { method: "POST", body: payload }),
        () => mockApi.transportistas.create(payload)
      );
    },
    update(payload: Partial<Transportista>) {
      return withFallback<Transportista>(
        () => apiFetch<Transportista>("/api/transportistas/me", { method: "PUT", body: payload }),
        () => mockApi.transportistas.update(payload)
      );
    },
    verify(id: number) {
      return withFallback<Transportista>(
        () => apiFetch<Transportista>(`/api/transportistas/${id}/verificar`, { method: "PATCH" }),
        () => mockApi.transportistas.verify(id)
      );
    },
    reputacion(id: number) {
      return withFallback<{ transportista_id: number; reputacion_promedio: string | number }>(
        () => apiFetch<{ transportista_id: number; reputacion_promedio: string | number }>(`/api/transportistas/${id}/reputacion`),
        () => mockApi.transportistas.reputacion(id)
      );
    },
    // TODO: reemplazar por endpoint real de backoffice cuando exista.
    list() {
      return withFallback<Transportista[]>(
        () => apiFetch<Transportista[]>("/api/transportistas"),
        () => mockApi.transportistas.list(),
        [404, 405]
      );
    }
  },
  vehiculos: {
    mine() {
      return withFallback<Vehiculo[]>(
        () => apiFetch<Vehiculo[]>("/api/vehiculos/mis-vehiculos"),
        () => mockApi.vehiculos.mine()
      );
    },
    create(payload: Omit<Vehiculo, "id" | "transportista_id" | "estado" | "created_at" | "updated_at">) {
      return withFallback<Vehiculo>(
        () => apiFetch<Vehiculo>("/api/vehiculos", { method: "POST", body: payload }),
        () => mockApi.vehiculos.create(payload)
      );
    },
    updateEstado(id: number, estado: VehiculoEstado) {
      return withFallback<Vehiculo>(
        () => apiFetch<Vehiculo>(`/api/vehiculos/${id}/estado`, { method: "PATCH", body: { estado } }),
        () => mockApi.vehiculos.updateEstado(id, estado)
      );
    },
    // TODO: reemplazar por endpoint real de backoffice cuando exista.
    list() {
      return withFallback<Vehiculo[]>(() => apiFetch<Vehiculo[]>("/api/vehiculos"), () => mockApi.vehiculos.list(), [404, 405]);
    }
  },
  documentos: {
    mine() {
      return withFallback<Documento[]>(
        () => apiFetch<Documento[]>("/api/documentos/mis-documentos"),
        () => mockApi.documentos.mine()
      );
    },
    create(payload: Omit<Documento, "id" | "estado" | "created_at" | "updated_at">) {
      return withFallback<Documento>(
        () => apiFetch<Documento>("/api/documentos", { method: "POST", body: payload }),
        () => mockApi.documentos.create(payload)
      );
    },
    approve(id: number) {
      return withFallback<Documento>(
        () => apiFetch<Documento>(`/api/documentos/${id}/aprobar`, { method: "PATCH" }),
        () => mockApi.documentos.setEstado(id, "APROBADO")
      );
    },
    reject(id: number, observaciones?: string) {
      return withFallback<Documento>(
        () => apiFetch<Documento>(`/api/documentos/${id}/rechazar`, { method: "PATCH", body: { observaciones } }),
        () => mockApi.documentos.setEstado(id, "RECHAZADO", observaciones)
      );
    },
    list() {
      return withFallback<Documento[]>(
        () => apiFetch<Documento[]>("/api/documentos/mis-documentos"),
        () => mockApi.documentos.list()
      );
    }
  },
  cargas: {
    mine() {
      return withFallback<Carga[]>(() => apiFetch<Carga[]>("/api/cargas/mis-cargas"), () => mockApi.cargas.mine());
    },
    disponibles() {
      return withFallback<Carga[]>(
        () => apiFetch<Carga[]>("/api/cargas/disponibles"),
        () => mockApi.cargas.disponibles()
      );
    },
    get(id: number) {
      return withFallback<Carga>(() => apiFetch<Carga>(`/api/cargas/${id}`), () => mockApi.cargas.get(id));
    },
    create(payload: Omit<Carga, "id" | "empresa_id" | "estado" | "created_at" | "updated_at">) {
      return withFallback<Carga>(
        () => apiFetch<Carga>("/api/cargas", { method: "POST", body: payload }),
        () => mockApi.cargas.create(payload)
      );
    },
    cancelar(id: number) {
      return withFallback<Carga>(
        () => apiFetch<Carga>(`/api/cargas/${id}/cancelar`, { method: "PATCH" }),
        () => mockApi.cargas.cancelar(id)
      );
    },
    tiposTarifas() {
      return withFallback<{ id: number; nombre: string }[]>(
        () => apiFetch<{ id: number; nombre: string }[]>("/api/cargas/tipostarifas"),
        () => [
          { id: 1, nombre: "Por Kilómetro" },
          { id: 2, nombre: "Por Tonelada" },
          { id: 3, nombre: "Tarifa Plana" }
        ]
      );
    },
    calcularPresupuesto(data: PresupuestoRequest) {
      return withFallback<PresupuestoResponse>(
        () => apiFetch<PresupuestoResponse>("/api/cargas/calcular-presupuesto", { method: "POST", body: data }),
        () => mockApi.cargas.calcularPresupuesto(data)
      );
    },
    // TODO: reemplazar por endpoint real de backoffice cuando exista.
    list() {
      return withFallback<Carga[]>(() => apiFetch<Carga[]>("/api/cargas"), () => mockApi.cargas.list(), [404, 405]);
    }
  },
  ofertas: {
    byCarga(cargaId: number) {
      return withFallback<Oferta[]>(
        () => apiFetch<Oferta[]>(`/api/cargas/${cargaId}/ofertas`),
        () => mockApi.ofertas.byCarga(cargaId)
      );
    },
    create(cargaId: number, payload: { vehiculo_id: number; monto: number; mensaje?: string | null }) {
      return withFallback<Oferta>(
        () => apiFetch<Oferta>(`/api/cargas/${cargaId}/ofertas`, { method: "POST", body: payload }),
        () => mockApi.ofertas.create(cargaId, payload)
      );
    },
    aceptar(id: number) {
      return withFallback<Oferta>(
        () => apiFetch<Oferta>(`/api/ofertas/${id}/aceptar`, { method: "PATCH" }),
        () => mockApi.ofertas.aceptar(id)
      );
    },
    rechazar(id: number) {
      return withFallback<Oferta>(
        () => apiFetch<Oferta>(`/api/ofertas/${id}/rechazar`, { method: "PATCH" }),
        () => mockApi.ofertas.rechazar(id)
      );
    },
    cancelar(id: number) {
      return withFallback<void>(
        () => apiFetch<void>(`/api/ofertas/${id}`, { method: "DELETE" }),
        () => mockApi.ofertas.cancelar(id)
      );
    },
    // TODO: el backend actual no expone "mis ofertas"; queda preparado para cuando exista.
    mine() {
      return withFallback<Oferta[]>(
        () => apiFetch<Oferta[]>("/api/ofertas/mis-ofertas"),
        () => (isMockSession() ? mockApi.ofertas.mine() : []),
        [404, 405]
      );
    }
  },
  viajes: {
    mine() {
      return withFallback<Viaje[]>(() => apiFetch<Viaje[]>("/api/viajes/mis-viajes"), () => mockApi.viajes.mine());
    },
    get(id: number) {
      return withFallback<Viaje>(() => apiFetch<Viaje>(`/api/viajes/${id}`), () => mockApi.viajes.get(id));
    },
    estado(id: number, estado: ViajeEstado) {
      return withFallback<Viaje>(
        () => apiFetch<Viaje>(`/api/viajes/${id}/estado`, { method: "PATCH", body: { estado } }),
        () => mockApi.viajes.estado(id, estado)
      );
    },
    finalizar(id: number, observaciones?: string | null) {
      return withFallback<Viaje>(
        () => apiFetch<Viaje>(`/api/viajes/${id}/finalizar`, { method: "PATCH", body: { observaciones } }),
        () => mockApi.viajes.finalizar(id, observaciones)
      );
    },
    cancelar(id: number) {
      return withFallback<Viaje>(
        () => apiFetch<Viaje>(`/api/viajes/${id}/cancelar`, { method: "PATCH" }),
        () => mockApi.viajes.cancelar(id)
      );
    }
  },
  tracking: {
    list(viajeId: number) {
      return withFallback<TrackingPosition[]>(
        () => apiFetch<TrackingPosition[]>(`/api/viajes/${viajeId}/tracking`),
        () => mockApi.tracking.list(viajeId)
      );
    },
    last(viajeId: number) {
      return withFallback<TrackingPosition | null>(
        () => apiFetch<TrackingPosition | null>(`/api/viajes/${viajeId}/tracking/last`),
        () => mockApi.tracking.last(viajeId)
      );
    },
    create(viajeId: number, payload: { lat: number; lng: number; velocidad?: number | null }) {
      return withFallback<TrackingPosition>(
        () => apiFetch<TrackingPosition>(`/api/viajes/${viajeId}/tracking`, { method: "POST", body: payload }),
        () => mockApi.tracking.create(viajeId, payload)
      );
    }
  },
  pagos: {
    get(viajeId: number) {
      return withFallback<Pago>(() => apiFetch<Pago>(`/api/viajes/${viajeId}/pago`), () => mockApi.pagos.get(viajeId));
    },
    simular(viajeId: number, payload: { monto_total?: number | null; comision_porcentaje?: number }) {
      return withFallback<Pago>(
        () => apiFetch<Pago>(`/api/viajes/${viajeId}/pago/simular`, { method: "POST", body: payload }),
        () => mockApi.pagos.simular(viajeId, payload)
      );
    },
    liberar(id: number) {
      return withFallback<Pago>(
        () => apiFetch<Pago>(`/api/pagos/${id}/liberar`, { method: "PATCH" }),
        () => mockApi.pagos.liberar(id)
      );
    }
  },
  calificaciones: {
    create(viajeId: number, payload: { receptor_usuario_id?: number | null; puntaje: number; comentario?: string | null }) {
      return withFallback<Calificacion>(
        () => apiFetch<Calificacion>(`/api/viajes/${viajeId}/calificaciones`, { method: "POST", body: payload }),
        () => mockApi.calificaciones.create(viajeId, payload)
      );
    },
    byUser(usuarioId: number) {
      return withFallback<Calificacion[]>(
        () => apiFetch<Calificacion[]>(`/api/usuarios/${usuarioId}/calificaciones`),
        () => mockApi.calificaciones.byUser(usuarioId)
      );
    }
  },
  notificaciones: {
    mine() {
      return withFallback<Notificacion[]>(
        () => apiFetch<Notificacion[]>("/api/notificaciones"),
        () => mockApi.notificaciones.mine()
      );
    },
    read(id: number) {
      return withFallback<Notificacion>(
        () => apiFetch<Notificacion>(`/api/notificaciones/${id}/leer`, { method: "PATCH" }),
        () => mockApi.notificaciones.read(id)
      );
    }
  },
  contratos: {
    list() {
      return withFallback<ContratoGranos[]>(
        () => apiFetch<ContratoGranos[]>("/api/contratos"),
        () => mockApi.contratos.list()
      );
    },
    get(id: number) {
      return withFallback<ContratoGranos>(
        () => apiFetch<ContratoGranos>(`/api/contratos/${id}`),
        () => mockApi.contratos.get(id)
      );
    },
    create(payload: ContratoGranosCreatePayload) {
      return withFallback<ContratoGranos>(
        () => apiFetch<ContratoGranos>("/api/contratos", { method: "POST", body: payload }),
        () => mockApi.contratos.create(payload)
      );
    }
  }
};
