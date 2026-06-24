import { ApiError } from "@/lib/errors";
import type {
  Calificacion,
  Carga,
  Documento,
  DocumentoEstado,
  EmpresaPyme,
  LoginPayload,
  Notificacion,
  Oferta,
  Pago,
  RegisterPayload,
  Role,
  TokenResponse,
  TrackingPosition,
  Transportista,
  User,
  Vehiculo,
  VehiculoEstado,
  Viaje,
  ViajeEstado,
  ContratoGranos,
  ContratoGranosCreatePayload
} from "@/lib/types";

const STATE_KEY = "logexpress_mock_state_v1";
const TOKEN_KEY = "logexpress_token";
const TOKEN_PREFIX = "mock-logexpress:";

type MockUser = User & { password: string };

interface MockState {
  users: MockUser[];
  pymes: EmpresaPyme[];
  transportistas: Transportista[];
  vehiculos: Vehiculo[];
  documentos: Documento[];
  cargas: Carga[];
  ofertas: Oferta[];
  viajes: Viaje[];
  tracking: TrackingPosition[];
  pagos: Pago[];
  calificaciones: Calificacion[];
  notificaciones: Notificacion[];
  contratos: ContratoGranos[];
  counters: Record<string, number>;
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

function nowIso() {
  return new Date().toISOString();
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function publicUser(user: MockUser): User {
  const safeUser: Partial<MockUser> = { ...user };
  delete safeUser.password;
  return safeUser as User;
}

function seedUser(id: number, rol: Role, nombre: string, email: string, password: string): MockUser {
  const stamp = nowIso();
  return {
    id,
    nombre,
    email,
    password,
    telefono: "11 5555 0000",
    rol,
    estado: "ACTIVO",
    created_at: stamp,
    updated_at: stamp
  };
}

function seedState(): MockState {
  const stamp = nowIso();
  return {
    users: [
      seedUser(1, "ADMIN", "Admin LogExpress", "admin@logexpress.com", "Admin123!"),
      seedUser(2, "PYME", "Marina Campos", "pyme1@logexpress.com", "Pyme123!"),
      seedUser(3, "TRANSPORTISTA", "Tomas Rios", "transportista1@logexpress.com", "Trans123!"),
      seedUser(4, "PYME", "Ismael Miles", "pyme2@logexpress.com", "Pyme123!"),
      seedUser(5, "TRANSPORTISTA", "Jose Mora", "transportista2@logexpress.com", "Trans123!")
    ],
    pymes: [
      {
        id: 1,
        user_id: 2,
        razon_social: "Alimentos Norte SRL",
        cuit: "30-71234567-8",
        rubro: "Alimentos secos",
        direccion: "Av. San Martin 1450",
        ciudad: "Rosario",
        provincia: "Santa Fe",
        verificada: true,
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 2,
        user_id: 4,
        razon_social: "Textiles Rio Sur",
        cuit: "30-70999888-1",
        rubro: "Indumentaria",
        direccion: "Calle 47 880",
        ciudad: "La Plata",
        provincia: "Buenos Aires",
        verificada: true,
        created_at: stamp,
        updated_at: stamp
      }
    ],
    transportistas: [
      {
        id: 1,
        user_id: 3,
        nombre_completo: "Tomas Rios",
        dni: "30111222",
        cuit_cuil: "20-30111222-7",
        tipo: "AUTONOMO",
        ciudad_base: "Cordoba",
        provincia_base: "Cordoba",
        verificado: true,
        reputacion_promedio: 4.8,
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 2,
        user_id: 5,
        nombre_completo: "Jose Mora",
        dni: "32888777",
        cuit_cuil: "20-32888777-4",
        tipo: "EMPRESA_FAMILIAR",
        ciudad_base: "Mendoza",
        provincia_base: "Mendoza",
        verificado: false,
        reputacion_promedio: 4.2,
        created_at: stamp,
        updated_at: stamp
      }
    ],
    vehiculos: [
      {
        id: 1,
        transportista_id: 1,
        patente: "AE123TR",
        tipo: "SEMIRREMOLQUE",
        capacidad_kg: 26000,
        capacidad_m3: 86,
        refrigerado: false,
        tiene_rampa: true,
        estado: "ACTIVO",
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 2,
        transportista_id: 2,
        patente: "AF456JM",
        tipo: "TERMICO",
        capacidad_kg: 9500,
        capacidad_m3: 42,
        refrigerado: true,
        tiene_rampa: false,
        estado: "PENDIENTE_VERIFICACION",
        created_at: stamp,
        updated_at: stamp
      }
    ],
    documentos: [
      {
        id: 1,
        owner_tipo: "TRANSPORTISTA",
        owner_id: 2,
        tipo: "LICENCIA",
        nombre_archivo: "licencia-jose-mora.pdf",
        url_archivo: null,
        path_archivo: null,
        estado: "PENDIENTE",
        fecha_vencimiento: daysFromNow(120).slice(0, 10),
        observaciones: null,
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 2,
        owner_tipo: "VEHICULO",
        owner_id: 2,
        tipo: "SEGURO_VEHICULO",
        nombre_archivo: "seguro-af456jm.pdf",
        url_archivo: null,
        path_archivo: null,
        estado: "PENDIENTE",
        fecha_vencimiento: daysFromNow(60).slice(0, 10),
        observaciones: null,
        created_at: stamp,
        updated_at: stamp
      }
    ],
    cargas: [
      {
        id: 1,
        empresa_id: 1,
        idsTiposAcoplados: [1, 2],
        titulo: "Pallets de alimentos secos",
        descripcion: "Mercaderia palletizada para supermercado regional.",
        tipo_mercaderia: "Alimentos",
        peso_kg: 7200,
        volumen_m3: 34,
        origen_direccion: "Av. Pellegrini 2010",
        origen_ciudad: "Rosario",
        origen_provincia: "Santa Fe",
        origen_lat: -32.95,
        origen_lng: -60.66,
        destino_direccion: "Ruta 9 km 510",
        destino_ciudad: "Cordoba",
        destino_provincia: "Cordoba",
        destino_lat: -31.42,
        destino_lng: -64.18,
        fecha_retiro_deseada: daysFromNow(1),
        fecha_entrega_deseada: daysFromNow(2),
        precio_referencia: 420000,
        cantidadKm: 400,
        distancia_km: 400,
        idTipoTarifa: 1,
        nombreTipoTarifa: "Por Kilómetro",
        tarifa: 420000,
        tarifa_base_ton_km: 150,
        incluyeIVA: false,
        hora_inicio_carga: daysFromNow(1),
        hora_fin_carga: daysFromNow(1),
        hora_inicio_descarga: daysFromNow(2),
        hora_fin_descarga: daysFromNow(2),
        requiere_balanza: true,
        ubicacion_balanza: "Balanza Ruta 9 km 25",
        hora_inicio_balanza: daysFromNow(1),
        hora_fin_balanza: daysFromNow(1),
        estado: "CON_OFERTAS",
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 2,
        empresa_id: 2,
        idsTiposAcoplados: [2, 3],
        titulo: "Cajas de indumentaria",
        descripcion: "Bultos livianos, requiere cuidado de embalaje.",
        tipo_mercaderia: "Textil",
        peso_kg: 1800,
        volumen_m3: 22,
        origen_direccion: "Calle 47 880",
        origen_ciudad: "La Plata",
        origen_provincia: "Buenos Aires",
        origen_lat: -34.92,
        origen_lng: -57.95,
        destino_direccion: "Av. Colon 550",
        destino_ciudad: "Mar del Plata",
        destino_provincia: "Buenos Aires",
        destino_lat: -38,
        destino_lng: -57.55,
        fecha_retiro_deseada: daysFromNow(3),
        fecha_entrega_deseada: daysFromNow(4),
        precio_referencia: 210000,
        cantidadKm: 360,
        distancia_km: 360,
        idTipoTarifa: 1,
        nombreTipoTarifa: "Por Kilómetro",
        tarifa: 210000,
        tarifa_base_ton_km: 150,
        incluyeIVA: false,
        hora_inicio_carga: daysFromNow(3),
        hora_fin_carga: daysFromNow(3),
        hora_inicio_descarga: daysFromNow(4),
        hora_fin_descarga: daysFromNow(4),
        requiere_balanza: false,
        ubicacion_balanza: null,
        hora_inicio_balanza: null,
        hora_fin_balanza: null,
        estado: "PUBLICADA",
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 3,
        empresa_id: 1,
        idsTiposAcoplados: [1, 4],
        titulo: "Insumos para deposito sur",
        descripcion: "Carga general, entrega coordinada en planta.",
        tipo_mercaderia: "Insumos",
        peso_kg: 5400,
        volumen_m3: 28,
        origen_direccion: "Parque Industrial Alvear",
        origen_ciudad: "Rosario",
        origen_provincia: "Santa Fe",
        origen_lat: -33.06,
        origen_lng: -60.62,
        destino_direccion: "Av. Circunvalacion 1200",
        destino_ciudad: "Santa Fe",
        destino_provincia: "Santa Fe",
        destino_lat: -31.63,
        destino_lng: -60.7,
        fecha_retiro_deseada: daysFromNow(-1),
        fecha_entrega_deseada: daysFromNow(1),
        precio_referencia: 315000,
        cantidadKm: 170,
        distancia_km: 170,
        idTipoTarifa: 3,
        nombreTipoTarifa: "Tarifa Plana",
        tarifa: 315000,
        tarifa_base_ton_km: 100,
        incluyeIVA: false,
        hora_inicio_carga: daysFromNow(-1),
        hora_fin_carga: daysFromNow(-1),
        hora_inicio_descarga: daysFromNow(1),
        hora_fin_descarga: daysFromNow(1),
        requiere_balanza: false,
        ubicacion_balanza: null,
        hora_inicio_balanza: null,
        hora_fin_balanza: null,
        estado: "EN_CURSO",
        created_at: stamp,
        updated_at: stamp
      }
    ],
    ofertas: [
      {
        id: 1,
        carga_id: 1,
        transportista_id: 1,
        vehiculo_id: 1,
        monto: 398000,
        mensaje: "Puedo retirar por la manana y entregar al dia siguiente.",
        estado: "PENDIENTE",
        created_at: stamp,
        updated_at: stamp
      },
      {
        id: 2,
        carga_id: 3,
        transportista_id: 1,
        vehiculo_id: 1,
        monto: 300000,
        mensaje: "Unidad disponible.",
        estado: "ACEPTADA",
        created_at: stamp,
        updated_at: stamp
      }
    ],
    viajes: [
      {
        id: 1,
        carga_id: 3,
        oferta_id: 2,
        empresa_id: 1,
        transportista_id: 1,
        vehiculo_id: 1,
        estado: "EN_TRANSITO",
        fecha_asignacion: daysFromNow(-1),
        fecha_inicio: daysFromNow(-1),
        fecha_entrega: null,
        observaciones: null,
        created_at: daysFromNow(-1),
        updated_at: stamp
      }
    ],
    tracking: [
      {
        id: 1,
        viaje_id: 1,
        transportista_id: 1,
        lat: -32.54,
        lng: -60.92,
        velocidad: 74,
        timestamp: daysFromNow(-1),
        alerta_seguridad: "Desvío de ruta detectado",
        created_at: daysFromNow(-1)
      },
      {
        id: 2,
        viaje_id: 1,
        transportista_id: 1,
        lat: -32.1,
        lng: -60.82,
        velocidad: 69,
        timestamp: stamp,
        created_at: stamp
      }
    ],
    pagos: [],
    calificaciones: [],
    notificaciones: [
      {
        id: 1,
        usuario_id: 2,
        titulo: "Nueva oferta recibida",
        mensaje: "Tomas Rios oferto por Pallets de alimentos secos.",
        tipo: "NUEVA_OFERTA",
        leida: false,
        created_at: stamp
      }
    ],
    contratos: [],
    counters: {
      users: 5,
      pymes: 2,
      transportistas: 2,
      vehiculos: 2,
      documentos: 2,
      cargas: 3,
      ofertas: 2,
      viajes: 1,
      tracking: 2,
      pagos: 0,
      calificaciones: 0,
      notificaciones: 1,
      contratos: 0
    }
  };
}

function hasWindow() {
  return typeof window !== "undefined";
}

function readState(): MockState {
  if (!hasWindow()) return seedState();
  const raw = window.localStorage.getItem(STATE_KEY);
  if (!raw) {
    const seeded = seedState();
    window.localStorage.setItem(STATE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as MockState;
  } catch {
    const seeded = seedState();
    window.localStorage.setItem(STATE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeState(state: MockState) {
  if (hasWindow()) {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }
}

function mutate<T>(updater: (state: Mutable<MockState>) => T): T {
  const state = readState();
  const result = updater(state);
  writeState(state);
  return result;
}

function nextId(state: MockState, key: keyof MockState["counters"]) {
  state.counters[key] += 1;
  return state.counters[key];
}

function mockToken(userId: number) {
  return `${TOKEN_PREFIX}${userId}`;
}

function storedToken() {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function currentUserId() {
  const token = storedToken();
  if (!token?.startsWith(TOKEN_PREFIX)) {
    throw new ApiError("No hay una sesion mock activa.", { status: 401 });
  }
  const userId = Number(token.replace(TOKEN_PREFIX, ""));
  if (!Number.isFinite(userId)) throw new ApiError("Token mock invalido.", { status: 401 });
  return userId;
}

function requireUser(state: MockState): MockUser {
  const user = state.users.find((item) => item.id === currentUserId());
  if (!user) throw new ApiError("Usuario no encontrado en el mock local.", { status: 401 });
  return user;
}

function requireRole(state: MockState, roles: Role[]) {
  const user = requireUser(state);
  if (!roles.includes(user.rol)) throw new ApiError("No tenes permisos para esta accion.", { status: 403 });
  return user;
}

function requirePyme(state: MockState) {
  const user = requireRole(state, ["PYME"]);
  const pyme = state.pymes.find((item) => item.user_id === user.id);
  if (!pyme) throw new ApiError("Crea tu perfil PyME para continuar.", { status: 404 });
  return pyme;
}

function requireTransportista(state: MockState) {
  const user = requireRole(state, ["TRANSPORTISTA"]);
  const transportista = state.transportistas.find((item) => item.user_id === user.id);
  if (!transportista) throw new ApiError("Crea tu perfil de transportista para continuar.", { status: 404 });
  return transportista;
}

function findCarga(state: MockState, id: number) {
  const carga = state.cargas.find((item) => item.id === id);
  if (!carga) throw new ApiError("Carga inexistente.", { status: 404 });
  return carga;
}

function findViaje(state: MockState, id: number) {
  const viaje = state.viajes.find((item) => item.id === id);
  if (!viaje) throw new ApiError("Viaje inexistente.", { status: 404 });
  return viaje;
}

function canAccessViaje(state: MockState, viaje: Viaje, user: User) {
  if (user.rol === "ADMIN") return true;
  if (user.rol === "PYME") {
    const pyme = state.pymes.find((item) => item.user_id === user.id);
    return pyme?.id === viaje.empresa_id;
  }
  const transportista = state.transportistas.find((item) => item.user_id === user.id);
  return transportista?.id === viaje.transportista_id;
}

function createNotification(state: MockState, usuarioId: number, titulo: string, mensaje: string) {
  const stamp = nowIso();
  state.notificaciones.unshift({
    id: nextId(state, "notificaciones"),
    usuario_id: usuarioId,
    titulo,
    mensaje,
    tipo: "CAMBIO_ESTADO_VIAJE",
    leida: false,
    created_at: stamp
  });
}

export function isMockSession() {
  return Boolean(storedToken()?.startsWith(TOKEN_PREFIX));
}

export const mockApi = {
  auth: {
    register(payload: RegisterPayload): User {
      return mutate((state) => {
        if (payload.rol === "ADMIN") {
          throw new ApiError("No se puede registrar un admin desde el registro publico.", { status: 400 });
        }
        const email = payload.email.toLowerCase();
        if (state.users.some((user) => user.email === email)) {
          throw new ApiError("El email ya esta registrado.", { status: 409 });
        }
        const stamp = nowIso();
        const user: MockUser = {
          id: nextId(state, "users"),
          nombre: payload.nombre,
          email,
          password: payload.password,
          telefono: payload.telefono ?? null,
          rol: payload.rol,
          estado: "ACTIVO",
          created_at: stamp,
          updated_at: stamp
        };
        state.users.push(user);
        return publicUser(user);
      });
    },
    login(payload: LoginPayload): TokenResponse {
      const state = readState();
      const user = state.users.find(
        (item) => item.email === payload.email.toLowerCase() && item.password === payload.password
      );
      if (!user) throw new ApiError("Email o contrasena incorrectos.", { status: 401 });
      return {
        access_token: mockToken(user.id),
        token_type: "bearer",
        user: publicUser(user)
      };
    },
    me(): User {
      const state = readState();
      return publicUser(requireUser(state));
    }
  },
  users: {
    me(): User {
      const state = readState();
      return publicUser(requireUser(state));
    },
    list(): User[] {
      const state = readState();
      return state.users.map(publicUser);
    }
  },
  pymes: {
    me(): EmpresaPyme {
      const state = readState();
      return requirePyme(state);
    },
    create(payload: Omit<EmpresaPyme, "id" | "user_id" | "verificada" | "created_at" | "updated_at">): EmpresaPyme {
      return mutate((state) => {
        const user = requireRole(state, ["PYME"]);
        if (state.pymes.some((item) => item.user_id === user.id)) {
          throw new ApiError("La PyME ya existe.", { status: 409 });
        }
        const stamp = nowIso();
        const pyme: EmpresaPyme = {
          id: nextId(state, "pymes"),
          user_id: user.id,
          ...payload,
          verificada: true,
          created_at: stamp,
          updated_at: stamp
        };
        state.pymes.push(pyme);
        return pyme;
      });
    },
    update(payload: Partial<EmpresaPyme>): EmpresaPyme {
      return mutate((state) => {
        const pyme = requirePyme(state);
        Object.assign(pyme, payload, { updated_at: nowIso() });
        return pyme;
      });
    },
    dashboard() {
      const state = readState();
      const pyme = requirePyme(state);
      const viajes = state.viajes.filter((v) => v.empresa_id === pyme.id);
      const pagos = state.pagos.filter((p) => p.empresa_id === pyme.id);
      const cargas = state.cargas.filter((c) => c.empresa_id === pyme.id);

      const viajes_totales = viajes.length;
      const gastos_totales = pagos.reduce((sum, p) => sum + Number(p.monto_total), 0);
      const cuenta_verificada = pyme.verificada;

      // Recent activities: last 5 cargas sorted by updated_at or created_at desc
      const sortedCargas = [...cargas].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      const actividad_reciente = sortedCargas.slice(0, 5).map((c) => ({
        fecha: c.updated_at,
        tipo_carga: c.tipo_mercaderia,
        estado: c.estado
      }));

      return {
        viajes_totales,
        gastos_totales,
        cuenta_verificada,
        actividad_reciente
      };
    }
  },
  transportistas: {
    me(): Transportista {
      const state = readState();
      return requireTransportista(state);
    },
    list(): Transportista[] {
      return readState().transportistas;
    },
    create(
      payload: Omit<
        Transportista,
        "id" | "user_id" | "verificado" | "reputacion_promedio" | "created_at" | "updated_at"
      >
    ): Transportista {
      return mutate((state) => {
        const user = requireRole(state, ["TRANSPORTISTA"]);
        if (state.transportistas.some((item) => item.user_id === user.id)) {
          throw new ApiError("El transportista ya existe.", { status: 409 });
        }
        const stamp = nowIso();
        const transportista: Transportista = {
          id: nextId(state, "transportistas"),
          user_id: user.id,
          ...payload,
          // TODO: el fallback local auto-verifica para permitir probar el flujo MVP sin backoffice.
          verificado: true,
          reputacion_promedio: 0,
          created_at: stamp,
          updated_at: stamp
        };
        state.transportistas.push(transportista);
        return transportista;
      });
    },
    update(payload: Partial<Transportista>): Transportista {
      return mutate((state) => {
        const transportista = requireTransportista(state);
        Object.assign(transportista, payload, { updated_at: nowIso() });
        return transportista;
      });
    },
    verify(id: number): Transportista {
      return mutate((state) => {
        requireRole(state, ["ADMIN"]);
        const transportista = state.transportistas.find((item) => item.id === id);
        if (!transportista) throw new ApiError("Transportista inexistente.", { status: 404 });
        transportista.verificado = true;
        transportista.updated_at = nowIso();
        return transportista;
      });
    },
    reputacion(id: number) {
      const transportista = readState().transportistas.find((item) => item.id === id);
      if (!transportista) throw new ApiError("Transportista inexistente.", { status: 404 });
      return { transportista_id: id, reputacion_promedio: transportista.reputacion_promedio };
    }
  },
  vehiculos: {
    mine(): Vehiculo[] {
      const state = readState();
      const transportista = requireTransportista(state);
      return state.vehiculos.filter((item) => item.transportista_id === transportista.id);
    },
    list(): Vehiculo[] {
      return readState().vehiculos;
    },
    create(
      payload: Omit<Vehiculo, "id" | "transportista_id" | "estado" | "created_at" | "updated_at">
    ): Vehiculo {
      return mutate((state) => {
        const transportista = requireTransportista(state);
        const stamp = nowIso();
        const vehiculo: Vehiculo = {
          id: nextId(state, "vehiculos"),
          transportista_id: transportista.id,
          ...payload,
          patente: payload.patente.toUpperCase().replace(/\s/g, ""),
          // TODO: el fallback local activa el vehiculo para que el flujo de oferta sea testeable sin admin.
          estado: "ACTIVO",
          created_at: stamp,
          updated_at: stamp
        };
        state.vehiculos.push(vehiculo);
        return vehiculo;
      });
    },
    updateEstado(id: number, estado: VehiculoEstado): Vehiculo {
      return mutate((state) => {
        requireRole(state, ["ADMIN"]);
        const vehiculo = state.vehiculos.find((item) => item.id === id);
        if (!vehiculo) throw new ApiError("Vehiculo inexistente.", { status: 404 });
        vehiculo.estado = estado;
        vehiculo.updated_at = nowIso();
        return vehiculo;
      });
    }
  },
  documentos: {
    mine(): Documento[] {
      const state = readState();
      const user = requireUser(state);
      if (user.rol === "ADMIN") return state.documentos;
      if (user.rol === "PYME") {
        const pyme = state.pymes.find((item) => item.user_id === user.id);
        if (!pyme) return [];
        const viajeIds = state.viajes.filter((item) => item.empresa_id === pyme.id).map((item) => item.id);
        return state.documentos.filter(
          (item) =>
            (item.owner_tipo === "EMPRESA" && item.owner_id === pyme.id) ||
            (item.owner_tipo === "VIAJE" && viajeIds.includes(item.owner_id))
        );
      }
      const transportista = state.transportistas.find((item) => item.user_id === user.id);
      if (!transportista) return [];
      const vehiculoIds = state.vehiculos
        .filter((item) => item.transportista_id === transportista.id)
        .map((item) => item.id);
      const viajeIds = state.viajes
        .filter((item) => item.transportista_id === transportista.id)
        .map((item) => item.id);
      return state.documentos.filter(
        (item) =>
          (item.owner_tipo === "TRANSPORTISTA" && item.owner_id === transportista.id) ||
          (item.owner_tipo === "VEHICULO" && vehiculoIds.includes(item.owner_id)) ||
          (item.owner_tipo === "VIAJE" && viajeIds.includes(item.owner_id))
      );
    },
    list(): Documento[] {
      return readState().documentos;
    },
    create(payload: Omit<Documento, "id" | "estado" | "created_at" | "updated_at">): Documento {
      return mutate((state) => {
        requireUser(state);
        const stamp = nowIso();
        const documento: Documento = {
          id: nextId(state, "documentos"),
          ...payload,
          estado: "PENDIENTE",
          created_at: stamp,
          updated_at: stamp
        };
        state.documentos.unshift(documento);
        return documento;
      });
    },
    setEstado(id: number, estado: DocumentoEstado, observaciones?: string): Documento {
      return mutate((state) => {
        requireRole(state, ["ADMIN"]);
        const documento = state.documentos.find((item) => item.id === id);
        if (!documento) throw new ApiError("Documento inexistente.", { status: 404 });
        documento.estado = estado;
        documento.observaciones = observaciones ?? null;
        documento.updated_at = nowIso();
        return documento;
      });
    }
  },
  cargas: {
    mine(): Carga[] {
      const state = readState();
      const pyme = requirePyme(state);
      return state.cargas.filter((item) => item.empresa_id === pyme.id);
    },
    disponibles(): Carga[] {
      const state = readState();
      requireRole(state, ["TRANSPORTISTA"]);
      return state.cargas.filter((item) => item.estado === "PUBLICADA" || item.estado === "CON_OFERTAS");
    },
    list(): Carga[] {
      return readState().cargas;
    },
    get(id: number): Carga {
      return findCarga(readState(), id);
    },
    create(payload: Omit<Carga, "id" | "empresa_id" | "estado" | "created_at" | "updated_at">): Carga {
      return mutate((state) => {
        const pyme = requirePyme(state);
        const stamp = nowIso();
        const carga: Carga = {
          id: nextId(state, "cargas"),
          empresa_id: pyme.id,
          ...payload,
          estado: "PUBLICADA",
          created_at: stamp,
          updated_at: stamp
        };
        state.cargas.unshift(carga);
        return carga;
      });
    },
    cancelar(id: number): Carga {
      return mutate((state) => {
        const user = requireUser(state);
        const carga = findCarga(state, id);
        const pyme = state.pymes.find((item) => item.user_id === user.id);
        if (user.rol !== "ADMIN" && pyme?.id !== carga.empresa_id) {
          throw new ApiError("No tenes permisos sobre esta carga.", { status: 403 });
        }
        carga.estado = "CANCELADA";
        carga.updated_at = nowIso();
        return carga;
      });
    },
    calcularPresupuesto(data: {
      distancia_km: number;
      peso_kg: number;
      volumen_m3: number;
      id_tipo_tarifa: number;
    }) {
      const FACTOR_VOLUMEN = 300;
      const peso_volumetrico = data.volumen_m3 * FACTOR_VOLUMEN;
      const peso_tasable_kg = Math.max(data.peso_kg, peso_volumetrico);
      const toneladas_tasables = peso_tasable_kg / 1000;
      let tarifa_base_ton_km = 150.0;
      if (data.id_tipo_tarifa === 2) tarifa_base_ton_km = 120.0;
      else if (data.id_tipo_tarifa === 3) tarifa_base_ton_km = 100.0;
      const presupuesto_sugerido = toneladas_tasables * data.distancia_km * tarifa_base_ton_km;
      const motivo_tasacion = peso_volumetrico > data.peso_kg ? "volumen_excedente" : "peso_real";
      return {
        peso_tasable_kg,
        motivo_tasacion: motivo_tasacion as "peso_real" | "volumen_excedente",
        presupuesto_sugerido: Math.round(presupuesto_sugerido * 100) / 100
      };
    }
  },
  ofertas: {
    mine(): Oferta[] {
      const state = readState();
      const transportista = requireTransportista(state);
      return state.ofertas.filter((item) => item.transportista_id === transportista.id);
    },
    byCarga(cargaId: number): Oferta[] {
      const state = readState();
      const user = requireRole(state, ["PYME", "ADMIN"]);
      const carga = findCarga(state, cargaId);
      if (user.rol === "PYME") {
        const pyme = requirePyme(state);
        if (pyme.id !== carga.empresa_id) throw new ApiError("No tenes permisos sobre esta carga.", { status: 403 });
      }
      return state.ofertas.filter((item) => item.carga_id === cargaId);
    },
    create(cargaId: number, payload: { vehiculo_id: number; monto: number; mensaje?: string | null }): Oferta {
      return mutate((state) => {
        const transportista = requireTransportista(state);
        if (!transportista.verificado) {
          throw new ApiError("El transportista debe estar verificado para ofertar.", { status: 403 });
        }
        const vehiculo = state.vehiculos.find(
          (item) => item.id === Number(payload.vehiculo_id) && item.transportista_id === transportista.id
        );
        if (!vehiculo || vehiculo.estado !== "ACTIVO") {
          throw new ApiError("Necesitas un vehiculo activo para ofertar.", { status: 400 });
        }
        const carga = findCarga(state, cargaId);
        if (!["PUBLICADA", "CON_OFERTAS"].includes(carga.estado)) {
          throw new ApiError("La carga no acepta nuevas ofertas.", { status: 400 });
        }
        const stamp = nowIso();
        const oferta: Oferta = {
          id: nextId(state, "ofertas"),
          carga_id: cargaId,
          transportista_id: transportista.id,
          vehiculo_id: vehiculo.id,
          monto: payload.monto,
          mensaje: payload.mensaje ?? null,
          estado: "PENDIENTE",
          created_at: stamp,
          updated_at: stamp
        };
        state.ofertas.unshift(oferta);
        carga.estado = "CON_OFERTAS";
        carga.updated_at = stamp;
        const pyme = state.pymes.find((item) => item.id === carga.empresa_id);
        if (pyme) {
          createNotification(state, pyme.user_id, "Nueva oferta recibida", `Recibiste una oferta para ${carga.titulo}.`);
        }
        return oferta;
      });
    },
    aceptar(id: number): Oferta {
      return mutate((state) => {
        const user = requireRole(state, ["PYME", "ADMIN"]);
        const oferta = state.ofertas.find((item) => item.id === id);
        if (!oferta) throw new ApiError("Oferta inexistente.", { status: 404 });
        const carga = findCarga(state, oferta.carga_id);
        if (user.rol === "PYME") {
          const pyme = requirePyme(state);
          if (pyme.id !== carga.empresa_id) throw new ApiError("No tenes permisos sobre esta oferta.", { status: 403 });
        }
        if (oferta.estado !== "PENDIENTE") throw new ApiError("La oferta no esta pendiente.", { status: 400 });
        const stamp = nowIso();
        oferta.estado = "ACEPTADA";
        oferta.updated_at = stamp;
        state.ofertas
          .filter((item) => item.carga_id === carga.id && item.id !== oferta.id && item.estado === "PENDIENTE")
          .forEach((item) => {
            item.estado = "RECHAZADA";
            item.updated_at = stamp;
          });
        carga.estado = "ASIGNADA";
        carga.updated_at = stamp;
        const viaje: Viaje = {
          id: nextId(state, "viajes"),
          carga_id: carga.id,
          oferta_id: oferta.id,
          empresa_id: carga.empresa_id,
          transportista_id: oferta.transportista_id,
          vehiculo_id: oferta.vehiculo_id,
          estado: "ASIGNADO",
          fecha_asignacion: stamp,
          fecha_inicio: null,
          fecha_entrega: null,
          observaciones: null,
          created_at: stamp,
          updated_at: stamp
        };
        state.viajes.unshift(viaje);
        const transportista = state.transportistas.find((item) => item.id === oferta.transportista_id);
        if (transportista) {
          createNotification(state, transportista.user_id, "Carga asignada", `Tu oferta para ${carga.titulo} fue aceptada.`);
        }
        return oferta;
      });
    },
    rechazar(id: number): Oferta {
      return mutate((state) => {
        requireRole(state, ["PYME", "ADMIN"]);
        const oferta = state.ofertas.find((item) => item.id === id);
        if (!oferta) throw new ApiError("Oferta inexistente.", { status: 404 });
        oferta.estado = "RECHAZADA";
        oferta.updated_at = nowIso();
        return oferta;
      });
    },
    cancelar(id: number): void {
      mutate((state) => {
        const transportista = requireTransportista(state);
        const index = state.ofertas.findIndex((item) => item.id === id && item.transportista_id === transportista.id);
        if (index < 0) throw new ApiError("Oferta inexistente.", { status: 404 });
        state.ofertas.splice(index, 1);
      });
    }
  },
  viajes: {
    mine(): Viaje[] {
      const state = readState();
      const user = requireUser(state);
      if (user.rol === "ADMIN") return state.viajes;
      if (user.rol === "PYME") {
        const pyme = requirePyme(state);
        return state.viajes.filter((item) => item.empresa_id === pyme.id);
      }
      const transportista = requireTransportista(state);
      return state.viajes.filter((item) => item.transportista_id === transportista.id);
    },
    get(id: number): Viaje {
      const state = readState();
      const user = requireUser(state);
      const viaje = findViaje(state, id);
      if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
      return viaje;
    },
    estado(id: number, estado: ViajeEstado): Viaje {
      return mutate((state) => {
        const user = requireRole(state, ["TRANSPORTISTA", "ADMIN"]);
        const viaje = findViaje(state, id);
        if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
        viaje.estado = estado;
        viaje.updated_at = nowIso();
        if (estado === "EN_TRANSITO") {
          viaje.fecha_inicio = viaje.fecha_inicio ?? nowIso();
          findCarga(state, viaje.carga_id).estado = "EN_CURSO";
        }
        if (estado === "ENTREGADO") {
          viaje.fecha_entrega = nowIso();
          findCarga(state, viaje.carga_id).estado = "ENTREGADA";
        }
        return viaje;
      });
    },
    finalizar(id: number, observaciones?: string | null): Viaje {
      return mutate((state) => {
        const user = requireUser(state);
        const viaje = findViaje(state, id);
        if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
        viaje.estado = "ENTREGADO";
        viaje.fecha_entrega = nowIso();
        viaje.observaciones = observaciones ?? viaje.observaciones;
        viaje.updated_at = nowIso();
        findCarga(state, viaje.carga_id).estado = "ENTREGADA";
        return viaje;
      });
    },
    cancelar(id: number): Viaje {
      return mutate((state) => {
        const user = requireUser(state);
        const viaje = findViaje(state, id);
        if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
        viaje.estado = "CANCELADO";
        viaje.updated_at = nowIso();
        findCarga(state, viaje.carga_id).estado = "CANCELADA";
        return viaje;
      });
    }
  },
  tracking: {
    list(viajeId: number): TrackingPosition[] {
      const state = readState();
      const user = requireUser(state);
      const viaje = findViaje(state, viajeId);
      if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
      return state.tracking.filter((item) => item.viaje_id === viajeId);
    },
    last(viajeId: number): TrackingPosition | null {
      const state = readState();
      const user = requireUser(state);
      const viaje = findViaje(state, viajeId);
      if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
      const positions = state.tracking.filter((item) => item.viaje_id === viajeId);
      return positions[positions.length - 1] ?? null;
    },
    create(viajeId: number, payload: { lat: number; lng: number; velocidad?: number | null }): TrackingPosition {
      return mutate((state) => {
        const transportista = requireTransportista(state);
        const viaje = findViaje(state, viajeId);
        if (viaje.transportista_id !== transportista.id) {
          throw new ApiError("El viaje no es tuyo.", { status: 403 });
        }
        if (["CANCELADO", "ENTREGADO"].includes(viaje.estado)) {
          throw new ApiError("No se puede registrar tracking en viajes cerrados.", { status: 400 });
        }
        const stamp = nowIso();
        const position: TrackingPosition = {
          id: nextId(state, "tracking"),
          viaje_id: viajeId,
          transportista_id: transportista.id,
          lat: payload.lat,
          lng: payload.lng,
          velocidad: payload.velocidad ?? null,
          timestamp: stamp,
          created_at: stamp
        };
        state.tracking.push(position);
        return position;
      });
    }
  },
  pagos: {
    get(viajeId: number): Pago {
      const pago = readState().pagos.find((item) => item.viaje_id === viajeId);
      if (!pago) throw new ApiError("Pago inexistente.", { status: 404 });
      return pago;
    },
    simular(viajeId: number, payload: { monto_total?: number | null; comision_porcentaje?: number }): Pago {
      return mutate((state) => {
        const user = requireRole(state, ["PYME", "ADMIN"]);
        const viaje = findViaje(state, viajeId);
        if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
        if (viaje.estado !== "ENTREGADO") {
          throw new ApiError("El viaje debe estar entregado para simular el pago.", { status: 400 });
        }
        const existing = state.pagos.find((item) => item.viaje_id === viajeId);
        if (existing) return existing;
        const oferta = state.ofertas.find((item) => item.id === viaje.oferta_id);
        const carga = findCarga(state, viaje.carga_id);
        const total = Number(payload.monto_total ?? oferta?.monto ?? carga.precio_referencia);
        const pct = Number(payload.comision_porcentaje ?? 10);
        const stamp = nowIso();
        const pago: Pago = {
          id: nextId(state, "pagos"),
          viaje_id: viajeId,
          empresa_id: viaje.empresa_id,
          transportista_id: viaje.transportista_id,
          monto_total: total,
          comision_plataforma: Math.round(total * pct) / 100,
          monto_transportista: Math.round(total * (100 - pct)) / 100,
          estado: "RETENIDO",
          metodo: "SIMULADO",
          fecha_pago: stamp,
          created_at: stamp,
          updated_at: stamp
        };
        state.pagos.unshift(pago);
        return pago;
      });
    },
    liberar(id: number): Pago {
      return mutate((state) => {
        requireRole(state, ["ADMIN"]);
        const pago = state.pagos.find((item) => item.id === id);
        if (!pago) throw new ApiError("Pago inexistente.", { status: 404 });
        pago.estado = "LIBERADO";
        pago.updated_at = nowIso();
        return pago;
      });
    }
  },
  calificaciones: {
    create(viajeId: number, payload: { receptor_usuario_id?: number | null; puntaje: number; comentario?: string | null }) {
      return mutate((state) => {
        const user = requireUser(state);
        const viaje = findViaje(state, viajeId);
        if (!canAccessViaje(state, viaje, user)) throw new ApiError("No tenes permisos sobre este viaje.", { status: 403 });
        if (viaje.estado !== "ENTREGADO") {
          throw new ApiError("Solo se puede calificar un viaje entregado.", { status: 400 });
        }
        const pyme = state.pymes.find((item) => item.id === viaje.empresa_id);
        const transportista = state.transportistas.find((item) => item.id === viaje.transportista_id);
        const receptor =
          payload.receptor_usuario_id ?? (user.rol === "PYME" ? transportista?.user_id : pyme?.user_id) ?? user.id;
        const calificacion: Calificacion = {
          id: nextId(state, "calificaciones"),
          viaje_id: viajeId,
          autor_usuario_id: user.id,
          receptor_usuario_id: receptor,
          puntaje: payload.puntaje,
          comentario: payload.comentario ?? null,
          created_at: nowIso()
        };
        state.calificaciones.unshift(calificacion);
        return calificacion;
      });
    },
    byUser(usuarioId: number): Calificacion[] {
      return readState().calificaciones.filter((item) => item.receptor_usuario_id === usuarioId);
    }
  },
  notificaciones: {
    mine(): Notificacion[] {
      const state = readState();
      const user = requireUser(state);
      return state.notificaciones.filter((item) => item.usuario_id === user.id);
    },
    read(id: number): Notificacion {
      return mutate((state) => {
        const notification = state.notificaciones.find((item) => item.id === id);
        if (!notification) throw new ApiError("Notificacion inexistente.", { status: 404 });
        notification.leida = true;
        return notification;
      });
    }
  },
  contratos: {
    list(): ContratoGranos[] {
      const state = readState();
      const user = requireUser(state);
      if (user.rol === "ADMIN") {
        return state.contratos;
      }
      const pyme = state.pymes.find((item) => item.user_id === user.id);
      if (!pyme) return [];
      return state.contratos.filter((item) => {
        if (!item.carga_id) return true;
        const carga = state.cargas.find((c) => c.id === item.carga_id);
        return carga?.empresa_id === pyme.id;
      });
    },
    get(id: number): ContratoGranos {
      const state = readState();
      const contrato = state.contratos.find((item) => item.id === id);
      if (!contrato) throw new ApiError("Contrato no encontrado.", { status: 404 });
      return contrato;
    },
    create(payload: ContratoGranosCreatePayload): ContratoGranos {
      return mutate((state) => {
        const user = requireUser(state);
        if (user.rol !== "PYME") {
          throw new ApiError("Accion restringida a PyMEs.", { status: 403 });
        }
        const pyme = state.pymes.find((item) => item.user_id === user.id);
        if (!pyme) throw new ApiError("Perfil PyME no configurado.", { status: 400 });

        const duplicate = state.contratos.some((item) => item.numero_contrato === payload.numero_contrato);
        if (duplicate) {
          throw new ApiError("El número de contrato ya está registrado.", { status: 409 });
        }

        if (payload.carga_id) {
          const carga = state.cargas.find((c) => c.id === payload.carga_id);
          if (!carga) throw new ApiError("La carga asociada no existe.", { status: 404 });
          if (carga.empresa_id !== pyme.id) {
            throw new ApiError("No tienes permisos sobre la carga asociada.", { status: 403 });
          }
        }

        const contrato: ContratoGranos = {
          id: nextId(state, "contratos"),
          ...payload,
          created_at: nowIso(),
          updated_at: nowIso()
        };
        state.contratos.unshift(contrato);
        return contrato;
      });
    }
  }
};
