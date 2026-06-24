"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarClock, ClipboardCheck, FilePlus2, MapPin, Package, Route, Star, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppLayout } from "@/components/app-layout";
import { CargaCard, MapPreview, OfertaCard, TrackingPanel, ViajeCard } from "@/components/domain";
import {
  Button,
  Card,
  CheckboxField,
  EmptyState,
  ErrorState,
  FormInput,
  FormSelect,
  FormTextarea,
  LoadingState,
  SectionTitle,
  StatCard,
  StatusBadge,
  SuccessMessage
} from "@/components/ui";
import { api } from "@/lib/api";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { useResource } from "@/lib/hooks";
import type { Carga, Documento, Oferta, Transportista, Vehiculo, Viaje, ViajeEstado } from "@/lib/types";
import { formatDate, labelize, money, numberValue } from "@/lib/utils";

const transportistaSchema = z.object({
  nombre_completo: z.string().min(2, "Ingresa nombre completo"),
  dni: z.string().min(6, "DNI invalido"),
  cuit_cuil: z.string().min(7, "CUIT/CUIL invalido"),
  tipo: z.enum(["AUTONOMO", "EMPRESA_FAMILIAR", "FLOTA_MEDIANA"]),
  ciudad_base: z.string().min(2, "Ingresa ciudad base"),
  provincia_base: z.string().min(2, "Ingresa provincia base")
});

const vehiculoSchema = z.object({
  patente: z.string().min(5, "Patente invalida"),
  tipo: z.enum(["FURGON", "SIDER", "SEMIRREMOLQUE", "CHASIS", "TERMICO", "TOLVA", "UTILITARIO"]),
  capacidad_kg: z.coerce.number().positive("Debe ser mayor a cero"),
  capacidad_m3: z.coerce.number().positive("Debe ser mayor a cero"),
  refrigerado: z.boolean().default(false),
  tiene_rampa: z.boolean().default(false)
});

const ofertaSchema = z.object({
  vehiculo_id: z.coerce.number().positive("Selecciona un vehiculo"),
  monto: z.coerce.number().min(0, "No puede ser negativo"),
  mensaje: z.string().optional()
});

const trackingSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  velocidad: z.coerce.number().min(0).optional()
});

const documentoSchema = z.object({
  owner_key: z.string().min(1, "Selecciona titular"),
  tipo: z.enum([
    "DNI",
    "CUIT",
    "LICENCIA",
    "SEGURO_CARGA",
    "SEGURO_VEHICULO",
    "POLIZA_CAUCION",
    "CARTA_PORTE",
    "REMITO",
    "FACTURA",
    "COMPROBANTE_ENTREGA"
  ]),
  nombre_archivo: z.string().min(1, "Ingresa nombre de archivo"),
  fecha_vencimiento: z.string().optional()
});

const ratingSchema = z.object({
  puntaje: z.coerce.number().min(1).max(5),
  comentario: z.string().optional()
});

type TransportistaForm = z.infer<typeof transportistaSchema>;
type VehiculoForm = z.infer<typeof vehiculoSchema>;
type OfertaForm = z.infer<typeof ofertaSchema>;
type TrackingForm = z.infer<typeof trackingSchema>;
type DocumentoForm = z.infer<typeof documentoSchema>;
type RatingForm = z.infer<typeof ratingSchema>;

export function TransportistaDashboardPage() {
  const resource = useResource(async () => {
    const profile = await loadOptionalTransportista();
    if (!profile) {
      return { profile, vehiculos: [] as Vehiculo[], cargas: [] as Carga[], ofertas: [] as Oferta[], viajes: [] as Viaje[] };
    }
    const [vehiculos, cargas, ofertas, viajes] = await Promise.all([
      api.vehiculos.mine(),
      api.cargas.disponibles(),
      api.ofertas.mine(),
      api.viajes.mine()
    ]);
    return { profile, vehiculos, cargas, ofertas, viajes };
  }, []);

  return (
    <AppLayout role="TRANSPORTISTA">
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {!resource.loading && resource.data ? (
        resource.data.profile ? (
          <div>
            <SectionTitle title="Dashboard transportista" />
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Cargas disponibles" value={resource.data.cargas.length} icon={Package} />
              <StatCard label="Ofertas enviadas" value={resource.data.ofertas.length} icon={ClipboardCheck} />
              <StatCard label="Viajes asignados" value={resource.data.viajes.length} icon={Route} />
              <StatCard label="Vehiculos activos" value={resource.data.vehiculos.filter((item) => item.estado === "ACTIVO").length} icon={Truck} />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,420px]">
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-black text-slate-950">Cargas disponibles</h2>
                  <Link href="/transportista/cargas-disponibles" className="text-sm font-bold text-navy">
                    Ver todas
                  </Link>
                </div>
                <div className="space-y-3">
                  {resource.data.cargas.slice(0, 3).map((carga) => (
                    <CargaCard key={carga.id} carga={carga} href={`/transportista/cargas/${carga.id}`} />
                  ))}
                  {resource.data.cargas.length === 0 ? <EmptyState title="Sin cargas disponibles" /> : null}
                </div>
              </Card>
              <div className="space-y-4">
                <MapPreview
                  title="Rutas abiertas"
                  subtitle={resource.data.cargas[0]?.titulo ?? "Sin cargas"}
                  points={[
                    { label: "Origen" },
                    { label: "Unidad", active: true },
                    { label: "Destino" }
                  ]}
                />
                <ProfileCard profile={resource.data.profile} vehiculos={resource.data.vehiculos} />
              </div>
            </div>
          </div>
        ) : (
          <TransportistaProfileSetup onDone={resource.reload} />
        )
      ) : null}
    </AppLayout>
  );
}

export function CargasDisponiblesPage() {
  const resource = useResource(() => api.cargas.disponibles(), []);
  return (
    <AppLayout role="TRANSPORTISTA">
      <SectionTitle title="Cargas disponibles" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.length === 0 ? <EmptyState title="No hay cargas disponibles" text="Las cargas publicadas por PyMEs apareceran aca." /> : null}
      <div className="grid gap-4">
        {resource.data?.map((carga) => (
          <CargaCard key={carga.id} carga={carga} href={`/transportista/cargas/${carga.id}`} />
        ))}
      </div>
    </AppLayout>
  );
}

export function TransportistaCargaDetailPage({ id }: { id: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<OfertaForm>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: { vehiculo_id: 0, monto: 0, mensaje: "" }
  });
  const resource = useResource(async () => {
    const [carga, vehiculos, profile] = await Promise.all([api.cargas.get(id), api.vehiculos.mine(), loadOptionalTransportista()]);
    return { carga, vehiculos, profile };
  }, [id]);

  async function onSubmit(values: OfertaForm) {
    setError(null);
    setMessage(null);
    try {
      await api.ofertas.create(id, { ...values, mensaje: values.mensaje || null });
      setMessage("Oferta enviada correctamente.");
      form.reset({ vehiculo_id: 0, monto: 0, mensaje: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const activeVehicles = resource.data?.vehiculos.filter((item) => item.estado === "ACTIVO") ?? [];

  return (
    <AppLayout role="TRANSPORTISTA">
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {resource.data ? (
        <div>
          <SectionTitle title={`Carga disponible #${resource.data.carga.id}`} />
          <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
            <div className="space-y-4">
              <CargaDetailCard carga={resource.data.carga} />
              <MapPreview
                title="Recorrido"
                subtitle={resource.data.carga.titulo}
                points={[
                  { label: resource.data.carga.origen_ciudad },
                  { label: "Oferta", active: true },
                  { label: resource.data.carga.destino_ciudad }
                ]}
              />
            </div>
            <Card className="p-4">
              <h2 className="font-black text-slate-950">Crear oferta</h2>
              {!resource.data.profile?.verificado ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                  Tu perfil debe estar verificado por admin para ofertar con backend real.
                </div>
              ) : null}
              {activeVehicles.length === 0 ? (
                <EmptyState title="Sin vehiculos activos" text="Crea un vehiculo y espera verificacion para ofertar." />
              ) : (
                <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormSelect
                    label="Vehiculo"
                    options={[{ label: "Seleccionar", value: 0 }, ...activeVehicles.map((item) => ({ label: `${item.patente} - ${labelize(item.tipo)}`, value: item.id }))]}
                    error={form.formState.errors.vehiculo_id?.message}
                    {...form.register("vehiculo_id")}
                  />
                  <FormInput label="Monto" type="number" error={form.formState.errors.monto?.message} {...form.register("monto")} />
                  <FormTextarea label="Mensaje" error={form.formState.errors.mensaje?.message} {...form.register("mensaje")} />
                  <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                    Enviar oferta <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}

export function TransportistaOfertasPage() {
  const resource = useResource(async () => {
    const ofertas = await api.ofertas.mine();
    const pairs = await Promise.all(
      ofertas.map(async (oferta) => {
        try {
          return [oferta.carga_id, await api.cargas.get(oferta.carga_id)] as const;
        } catch {
          return [oferta.carga_id, undefined] as const;
        }
      })
    );
    return { ofertas, cargas: Object.fromEntries(pairs.filter(([, carga]) => Boolean(carga))) as Record<number, Carga> };
  }, []);
  return (
    <AppLayout role="TRANSPORTISTA">
      <SectionTitle title="Mis ofertas" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.ofertas.length === 0 ? <EmptyState title="Sin ofertas enviadas" text="Ofertar sobre una carga disponible la agregara a esta vista." /> : null}
      <div className="grid gap-4">
        {resource.data?.ofertas.map((oferta) => (
          <Card key={oferta.id} className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-950">{resource.data?.cargas[oferta.carga_id]?.titulo ?? `Carga #${oferta.carga_id}`}</h2>
                <p className="text-sm text-slate-500">Oferta enviada {formatDate(oferta.created_at)}</p>
              </div>
              <StatusBadge value={oferta.estado} />
            </div>
            <OfertaCard oferta={oferta} />
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}

export function TransportistaViajesPage() {
  const resource = useResource(loadViajesWithCargas, []);
  return (
    <AppLayout role="TRANSPORTISTA">
      <SectionTitle title="Viajes asignados" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.viajes.length === 0 ? <EmptyState title="Sin viajes asignados" text="Cuando una PyME acepte tu oferta, el viaje aparecera aca." /> : null}
      <div className="grid gap-4">
        {resource.data?.viajes.map((viaje) => (
          <ViajeCard key={viaje.id} viaje={viaje} carga={resource.data?.cargas[viaje.carga_id]} href={`/transportista/viajes/${viaje.id}`} />
        ))}
      </div>
    </AppLayout>
  );
}

export function TransportistaViajeDetailPage({ id }: { id: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const trackingForm = useForm<TrackingForm>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { lat: -34.6037, lng: -58.3816, velocidad: 60 }
  });
  const ratingForm = useForm<RatingForm>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { puntaje: 5, comentario: "" }
  });
  const resource = useResource(async () => {
    const viaje = await api.viajes.get(id);
    const [carga, tracking] = await Promise.all([api.cargas.get(viaje.carga_id), api.tracking.list(id)]);
    return { viaje, carga, tracking };
  }, [id]);

  async function run(callback: () => Promise<unknown>, success: string) {
    setError(null);
    setMessage(null);
    try {
      await callback();
      setMessage(success);
      await resource.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function updateState(estado: ViajeEstado) {
    await run(() => api.viajes.estado(id, estado), "Estado actualizado.");
  }

  return (
    <AppLayout role="TRANSPORTISTA">
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {resource.data ? (
        <div>
          <SectionTitle title={`Viaje #${resource.data.viaje.id}`} />
          <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              <CargaDetailCard carga={resource.data.carga} />
              <TrackingPanel positions={resource.data.tracking} carga={resource.data.carga} />
            </div>
            <div className="space-y-4">
              {resource.data.carga.contrato && (
                <Card className="p-4 border-l-4 border-emerald-500 bg-emerald-50/10">
                  <div className="flex items-start gap-3">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Contrato Digital de Granos</p>
                      <h3 className="mt-1 font-bold text-slate-950">
                        {resource.data.carga.contrato.numero_contrato}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {resource.data.carga.contrato.tipo_grano} ({resource.data.carga.contrato.calidad_grano})
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/transportista/contratos/${resource.data.carga.contrato.id}`}>
                      <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider">
                        Ver Documento
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-black text-slate-950">Actualizar estado</h2>
                  <StatusBadge value={resource.data.viaje.estado} />
                </div>
                <div className="grid gap-2">
                  {(["EN_CAMINO_RETIRO", "CARGA_RETIRADA", "EN_TRANSITO", "ENTREGADO"] as ViajeEstado[]).map((estado) => (
                    <Button key={estado} variant="secondary" onClick={() => updateState(estado)}>
                      {labelize(estado)}
                    </Button>
                  ))}
                  <Button variant="dark" onClick={() => run(() => api.viajes.finalizar(id, "Finalizado por transportista"), "Viaje finalizado.")}>
                    Finalizar viaje
                  </Button>
                </div>
              </Card>
              <Card className="p-4">
                <h2 className="mb-3 font-black text-slate-950">Registrar ubicacion</h2>
                <form
                  className="space-y-3"
                  onSubmit={trackingForm.handleSubmit((values) => run(() => api.tracking.create(id, values), "Ubicacion registrada."))}
                >
                  <FormInput label="Latitud" type="number" step="0.0001" error={trackingForm.formState.errors.lat?.message} {...trackingForm.register("lat")} />
                  <FormInput label="Longitud" type="number" step="0.0001" error={trackingForm.formState.errors.lng?.message} {...trackingForm.register("lng")} />
                  <FormInput label="Velocidad" type="number" error={trackingForm.formState.errors.velocidad?.message} {...trackingForm.register("velocidad")} />
                  <Button type="submit" loading={trackingForm.formState.isSubmitting}>
                    Registrar <MapPin className="h-4 w-4" />
                  </Button>
                </form>
              </Card>
              <Card className="p-4">
                <h2 className="mb-3 font-black text-slate-950">Calificar PyME</h2>
                <form
                  className="space-y-3"
                  onSubmit={ratingForm.handleSubmit((values) => run(() => api.calificaciones.create(id, values), "Calificacion registrada."))}
                >
                  <FormInput label="Puntaje" type="number" min={1} max={5} error={ratingForm.formState.errors.puntaje?.message} {...ratingForm.register("puntaje")} />
                  <FormTextarea label="Comentario" error={ratingForm.formState.errors.comentario?.message} {...ratingForm.register("comentario")} />
                  <Button type="submit" loading={ratingForm.formState.isSubmitting}>
                    Calificar <Star className="h-4 w-4" />
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}

export function TransportistaVehiculosPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resource = useResource(() => api.vehiculos.mine(), []);
  const form = useForm<VehiculoForm>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      patente: "",
      tipo: "SEMIRREMOLQUE",
      capacidad_kg: 10000,
      capacidad_m3: 40,
      refrigerado: false,
      tiene_rampa: false
    }
  });

  async function onSubmit(values: VehiculoForm) {
    setError(null);
    setMessage(null);
    try {
      await api.vehiculos.create(values);
      setMessage("Vehiculo cargado.");
      form.reset();
      await resource.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppLayout role="TRANSPORTISTA">
      <SectionTitle title="Vehiculos" />
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
        <div className="space-y-3">
          {resource.loading ? <LoadingState /> : null}
          {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
          {resource.data?.length === 0 ? <EmptyState title="Sin vehiculos" /> : null}
          {resource.data?.map((vehiculo) => (
            <Card key={vehiculo.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{vehiculo.patente}</h2>
                  <p className="text-sm text-slate-500">
                    {labelize(vehiculo.tipo)} - {numberValue(vehiculo.capacidad_kg)} kg - {numberValue(vehiculo.capacidad_m3)} m3
                  </p>
                </div>
                <StatusBadge value={vehiculo.estado} />
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <h2 className="mb-3 font-black text-slate-950">Cargar vehiculo</h2>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormInput label="Patente" error={form.formState.errors.patente?.message} {...form.register("patente")} />
            <FormSelect
              label="Tipo"
              options={["FURGON", "SIDER", "SEMIRREMOLQUE", "CHASIS", "TERMICO", "TOLVA", "UTILITARIO"].map((value) => ({ label: labelize(value), value }))}
              error={form.formState.errors.tipo?.message}
              {...form.register("tipo")}
            />
            <FormInput label="Capacidad kg" type="number" error={form.formState.errors.capacidad_kg?.message} {...form.register("capacidad_kg")} />
            <FormInput label="Capacidad m3" type="number" error={form.formState.errors.capacidad_m3?.message} {...form.register("capacidad_m3")} />
            <CheckboxField label="Refrigerado" {...form.register("refrigerado")} />
            <CheckboxField label="Tiene rampa" {...form.register("tiene_rampa")} />
            <Button type="submit" loading={form.formState.isSubmitting}>
              Guardar vehiculo
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

export function TransportistaDocumentosPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resource = useResource(async () => {
    const [docs, profile, vehiculos] = await Promise.all([api.documentos.mine(), loadOptionalTransportista(), api.vehiculos.mine().catch(() => [])]);
    return { docs, profile, vehiculos };
  }, []);
  const form = useForm<DocumentoForm>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      owner_key: "",
      tipo: "LICENCIA",
      nombre_archivo: "",
      fecha_vencimiento: ""
    }
  });

  async function onSubmit(values: DocumentoForm) {
    const [owner_tipo, owner_id] = values.owner_key.split(":");
    setError(null);
    setMessage(null);
    try {
      await api.documentos.create({
        owner_tipo: owner_tipo as Documento["owner_tipo"],
        owner_id: Number(owner_id),
        tipo: values.tipo,
        nombre_archivo: values.nombre_archivo,
        url_archivo: null,
        path_archivo: null,
        fecha_vencimiento: values.fecha_vencimiento || null,
        observaciones: null
      });
      setMessage("Documento cargado.");
      form.reset();
      await resource.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const ownerOptions = [
    ...(resource.data?.profile ? [{ label: `Transportista #${resource.data.profile.id}`, value: `TRANSPORTISTA:${resource.data.profile.id}` }] : []),
    ...(resource.data?.vehiculos.map((item) => ({ label: `Vehiculo ${item.patente}`, value: `VEHICULO:${item.id}` })) ?? [])
  ];

  return (
    <AppLayout role="TRANSPORTISTA">
      <SectionTitle title="Documentacion" />
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
        <div className="space-y-3">
          {resource.loading ? <LoadingState /> : null}
          {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
          {resource.data?.docs.length === 0 ? <EmptyState title="Sin documentos" /> : null}
          {resource.data?.docs.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-slate-950">{doc.nombre_archivo}</h2>
                  <p className="text-sm text-slate-500">
                    {labelize(doc.tipo)} - {doc.fecha_vencimiento ? `Vence ${doc.fecha_vencimiento}` : "Sin vencimiento"}
                  </p>
                </div>
                <StatusBadge value={doc.estado} />
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <h2 className="mb-3 font-black text-slate-950">Cargar documento</h2>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormSelect
              label="Titular"
              options={[{ label: "Seleccionar", value: "" }, ...ownerOptions]}
              error={form.formState.errors.owner_key?.message}
              {...form.register("owner_key")}
            />
            <FormSelect
              label="Tipo"
              options={[
                "DNI",
                "CUIT",
                "LICENCIA",
                "SEGURO_CARGA",
                "SEGURO_VEHICULO",
                "POLIZA_CAUCION",
                "CARTA_PORTE",
                "REMITO",
                "FACTURA",
                "COMPROBANTE_ENTREGA"
              ].map((value) => ({ label: labelize(value), value }))}
              error={form.formState.errors.tipo?.message}
              {...form.register("tipo")}
            />
            <FormInput label="Nombre archivo" error={form.formState.errors.nombre_archivo?.message} {...form.register("nombre_archivo")} />
            <FormInput label="Vencimiento" type="date" error={form.formState.errors.fecha_vencimiento?.message} {...form.register("fecha_vencimiento")} />
            <Button type="submit" loading={form.formState.isSubmitting}>
              Cargar <FilePlus2 className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

function TransportistaProfileSetup({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<TransportistaForm>({
    resolver: zodResolver(transportistaSchema),
    defaultValues: {
      nombre_completo: "",
      dni: "",
      cuit_cuil: "",
      tipo: "AUTONOMO",
      ciudad_base: "",
      provincia_base: ""
    }
  });

  async function onSubmit(values: TransportistaForm) {
    setError(null);
    try {
      await api.transportistas.create(values);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <SectionTitle title="Crear perfil transportista" />
      {error ? <ErrorState message={error} /> : null}
      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput label="Nombre completo" error={form.formState.errors.nombre_completo?.message} {...form.register("nombre_completo")} />
          <FormInput label="DNI" error={form.formState.errors.dni?.message} {...form.register("dni")} />
          <FormInput label="CUIT/CUIL" error={form.formState.errors.cuit_cuil?.message} {...form.register("cuit_cuil")} />
          <FormSelect
            label="Tipo"
            options={["AUTONOMO", "EMPRESA_FAMILIAR", "FLOTA_MEDIANA"].map((value) => ({ label: labelize(value), value }))}
            error={form.formState.errors.tipo?.message}
            {...form.register("tipo")}
          />
          <FormInput label="Ciudad base" error={form.formState.errors.ciudad_base?.message} {...form.register("ciudad_base")} />
          <FormInput label="Provincia base" error={form.formState.errors.provincia_base?.message} {...form.register("provincia_base")} />
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Guardar perfil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ProfileCard({ profile, vehiculos }: { profile: Transportista; vehiculos: Vehiculo[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">Perfil</p>
          <h2 className="mt-1 font-black text-slate-950">{profile.nombre_completo}</h2>
          <p className="text-sm text-slate-500">
            {labelize(profile.tipo)} - {profile.ciudad_base}, {profile.provincia_base}
          </p>
        </div>
        <StatusBadge value={profile.verificado ? "ACTIVO" : "PENDIENTE_VERIFICACION"} />
      </div>
      <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600">
        {vehiculos.length} vehiculos cargados - {vehiculos.filter((item) => item.estado === "ACTIVO").length} activos
      </div>
    </Card>
  );
}

function CargaDetailCard({ carga }: { carga: Carga }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge value={carga.estado} />
            <span className="text-xs font-bold text-slate-400">ID #{carga.id}</span>
          </div>
          <h2 className="text-xl font-black text-slate-950">{carga.titulo}</h2>
          <p className="mt-1 text-sm text-slate-500">{carga.descripcion ?? "Sin descripcion"}</p>
        </div>
        <p className="text-xl font-black text-navy">{money(carga.precio_referencia)}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Info label="Origen" value={`${carga.origen_ciudad}, ${carga.origen_provincia}`} />
        <Info label="Destino" value={`${carga.destino_ciudad}, ${carga.destino_provincia}`} />
        <Info label="Peso" value={`${numberValue(carga.peso_kg)} kg / ${numberValue(carga.volumen_m3)} m3`} />
      </div>
      {/* Ventanas horarias y balanza */}
      {(carga.hora_inicio_carga || carga.hora_fin_carga || carga.hora_inicio_descarga || carga.hora_fin_descarga || carga.requiere_balanza) && (
        <div className="mt-4 grid gap-3 border-t border-line pt-4">
          {(carga.hora_inicio_carga || carga.hora_fin_carga || carga.hora_inicio_descarga || carga.hora_fin_descarga) && (
            <>
              <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" /> Logística operativa
              </p>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {carga.hora_inicio_carga && <Info label="Inicio carga" value={formatDate(carga.hora_inicio_carga)} />}
                {carga.hora_fin_carga && <Info label="Fin carga" value={formatDate(carga.hora_fin_carga)} />}
                {carga.hora_inicio_descarga && <Info label="Inicio descarga" value={formatDate(carga.hora_inicio_descarga)} />}
                {carga.hora_fin_descarga && <Info label="Fin descarga" value={formatDate(carga.hora_fin_descarga)} />}
              </div>
            </>
          )}
          {carga.requiere_balanza && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-bold text-amber-800">⚖️ Requiere pesaje en balanza</p>
              {carga.ubicacion_balanza && (
                <p className="text-amber-700 mt-1">Ubicación: {carga.ubicacion_balanza}</p>
              )}
              {carga.hora_inicio_balanza && carga.hora_fin_balanza && (
                <p className="text-amber-700 mt-0.5">
                  Horario: {formatDate(carga.hora_inicio_balanza)} – {formatDate(carga.hora_fin_balanza)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

async function loadOptionalTransportista(): Promise<Transportista | null> {
  try {
    return await api.transportistas.me();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function loadViajesWithCargas() {
  const viajes = await api.viajes.mine();
  const pairs = await Promise.all(
    viajes.map(async (viaje) => {
      try {
        return [viaje.carga_id, await api.cargas.get(viaje.carga_id)] as const;
      } catch {
        return [viaje.carga_id, undefined] as const;
      }
    })
  );
  return {
    viajes,
    cargas: Object.fromEntries(pairs.filter(([, carga]) => Boolean(carga))) as Record<number, Carga>
  };
}
