"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ClipboardCheck, CreditCard, Package, PackagePlus, Route, Star } from "lucide-react";
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
import type { Carga, EmpresaPyme, Oferta, Pago, TrackingPosition, Viaje } from "@/lib/types";
import { dateInputValue, formatDate, isoFromInput, money, numberValue } from "@/lib/utils";

const pymeSchema = z.object({
  razon_social: z.string().min(2, "Ingresa la razon social"),
  cuit: z.string().min(7, "CUIT invalido"),
  rubro: z.string().min(2, "Ingresa el rubro"),
  direccion: z.string().min(2, "Ingresa direccion"),
  ciudad: z.string().min(2, "Ingresa ciudad"),
  provincia: z.string().min(2, "Ingresa provincia")
});

const cargaSchema = z
  .object({
    titulo: z.string().min(2, "Ingresa un titulo"),
    descripcion: z.string().optional(),
    tipo_mercaderia: z.string().min(2, "Ingresa el tipo de mercaderia"),
    peso_kg: z.coerce.number().positive("Debe ser mayor a cero"),
    volumen_m3: z.coerce.number().positive("Debe ser mayor a cero"),
    requiere_refrigeracion: z.boolean().default(false),
    requiere_rampa: z.boolean().default(false),
    requiere_mantas: z.boolean().default(false),
    origen_direccion: z.string().min(2, "Ingresa origen"),
    origen_ciudad: z.string().min(2, "Ingresa ciudad"),
    origen_provincia: z.string().min(2, "Ingresa provincia"),
    destino_direccion: z.string().min(2, "Ingresa destino"),
    destino_ciudad: z.string().min(2, "Ingresa ciudad"),
    destino_provincia: z.string().min(2, "Ingresa provincia"),
    fecha_retiro_deseada: z.string().min(1, "Ingresa fecha de retiro"),
    fecha_entrega_deseada: z.string().min(1, "Ingresa fecha de entrega"),
    precio_referencia: z.coerce.number().min(0, "No puede ser negativo")
  })
  .refine((data) => new Date(data.fecha_entrega_deseada) >= new Date(data.fecha_retiro_deseada), {
    message: "La entrega no puede ser anterior al retiro",
    path: ["fecha_entrega_deseada"]
  });

const ratingSchema = z.object({
  puntaje: z.coerce.number().min(1).max(5),
  comentario: z.string().optional()
});

type PymeForm = z.infer<typeof pymeSchema>;
type CargaForm = z.infer<typeof cargaSchema>;
type RatingForm = z.infer<typeof ratingSchema>;

export function PymeDashboardPage() {
  const resource = useResource(async () => {
    const profile = await loadOptionalProfile();
    if (!profile) return { profile, cargas: [] as Carga[], viajes: [] as Viaje[] };
    const [cargas, viajes] = await Promise.all([api.cargas.mine(), api.viajes.mine()]);
    return { profile, cargas, viajes };
  }, []);

  return (
    <AppLayout role="PYME">
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {!resource.loading && resource.data ? (
        resource.data.profile ? (
          <div>
            <SectionTitle
              title="Dashboard PyME"
              action={
                <Link
                  href="/pyme/cargas/nueva"
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white"
                >
                  <PackagePlus className="h-4 w-4" /> Publicar carga
                </Link>
              }
            />
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Cargas publicadas" value={resource.data.cargas.length} icon={Package} />
              <StatCard
                label="Con ofertas"
                value={resource.data.cargas.filter((item) => item.estado === "CON_OFERTAS").length}
                icon={ClipboardCheck}
              />
              <StatCard label="Viajes activos" value={resource.data.viajes.filter((item) => item.estado !== "ENTREGADO").length} icon={Route} />
              <StatCard
                label="Total referencia"
                value={money(resource.data.cargas.reduce((sum, item) => sum + numberValue(item.precio_referencia), 0))}
                icon={CreditCard}
              />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,420px]">
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-black text-slate-950">Ultimas cargas</h2>
                  <Link href="/pyme/cargas" className="text-sm font-bold text-navy">
                    Ver todas
                  </Link>
                </div>
                <div className="space-y-3">
                  {resource.data.cargas.slice(0, 3).map((carga) => (
                    <CargaCard key={carga.id} carga={carga} href={`/pyme/cargas/${carga.id}`} />
                  ))}
                  {resource.data.cargas.length === 0 ? (
                    <EmptyState title="Sin cargas" text="Publica tu primera carga para recibir ofertas." />
                  ) : null}
                </div>
              </Card>
              <div className="space-y-4">
                <MapPreview
                  title="Cargas y tracking"
                  subtitle={resource.data.viajes[0] ? `Viaje #${resource.data.viajes[0].id}` : "Sin viajes activos"}
                  points={[
                    { label: "Origen" },
                    { label: "Unidad", active: true },
                    { label: "Destino" }
                  ]}
                />
                <Card className="p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">Perfil</p>
                  <h2 className="mt-1 font-black text-slate-950">{resource.data.profile.razon_social}</h2>
                  <p className="text-sm text-slate-500">
                    {resource.data.profile.rubro} - {resource.data.profile.ciudad}, {resource.data.profile.provincia}
                  </p>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <ProfileSetup onDone={resource.reload} />
        )
      ) : null}
    </AppLayout>
  );
}

export function PymeCargasPage() {
  const resource = useResource(() => api.cargas.mine(), []);
  return (
    <AppLayout role="PYME">
      <SectionTitle
        title="Mis cargas"
        action={
          <Link href="/pyme/cargas/nueva" className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
            <PackagePlus className="h-4 w-4" /> Nueva carga
          </Link>
        }
      />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.length === 0 ? (
        <EmptyState title="Todavia no publicaste cargas" text="Crea una carga para que transportistas verificados puedan ofertar." />
      ) : null}
      <div className="grid gap-4">
        {resource.data?.map((carga) => (
          <CargaCard key={carga.id} carga={carga} href={`/pyme/cargas/${carga.id}`} />
        ))}
      </div>
    </AppLayout>
  );
}

export function NuevaCargaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 2);
  const form = useForm<CargaForm>({
    resolver: zodResolver(cargaSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      tipo_mercaderia: "",
      peso_kg: 1000,
      volumen_m3: 10,
      requiere_refrigeracion: false,
      requiere_rampa: false,
      requiere_mantas: false,
      origen_direccion: "",
      origen_ciudad: "",
      origen_provincia: "",
      destino_direccion: "",
      destino_ciudad: "",
      destino_provincia: "",
      fecha_retiro_deseada: dateInputValue(tomorrow),
      fecha_entrega_deseada: dateInputValue(nextDay),
      precio_referencia: 0
    }
  });

  async function onSubmit(values: CargaForm) {
    setError(null);
    setSuccess(null);
    try {
      const carga = await api.cargas.create({
        ...values,
        descripcion: values.descripcion || null,
        fecha_retiro_deseada: isoFromInput(values.fecha_retiro_deseada),
        fecha_entrega_deseada: isoFromInput(values.fecha_entrega_deseada),
        origen_lat: null,
        origen_lng: null,
        destino_lat: null,
        destino_lng: null
      });
      setSuccess("Carga publicada correctamente.");
      router.push(`/pyme/cargas/${carga.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppLayout role="PYME">
      <SectionTitle title="Publicar carga" />
      {success ? <SuccessMessage message={success} onClose={() => setSuccess(null)} /> : null}
      {error ? <ErrorState message={error} /> : null}
      <Card className="p-5">
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Titulo" error={form.formState.errors.titulo?.message} {...form.register("titulo")} />
            <FormInput label="Tipo de mercaderia" error={form.formState.errors.tipo_mercaderia?.message} {...form.register("tipo_mercaderia")} />
          </div>
          <FormTextarea label="Descripcion" error={form.formState.errors.descripcion?.message} {...form.register("descripcion")} />
          <div className="grid gap-4 md:grid-cols-3">
            <FormInput label="Peso kg" type="number" error={form.formState.errors.peso_kg?.message} {...form.register("peso_kg")} />
            <FormInput label="Volumen m3" type="number" error={form.formState.errors.volumen_m3?.message} {...form.register("volumen_m3")} />
            <FormInput label="Precio referencia" type="number" error={form.formState.errors.precio_referencia?.message} {...form.register("precio_referencia")} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <CheckboxField label="Refrigeracion" {...form.register("requiere_refrigeracion")} />
            <CheckboxField label="Rampa" {...form.register("requiere_rampa")} />
            <CheckboxField label="Mantas" {...form.register("requiere_mantas")} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FormInput label="Origen direccion" error={form.formState.errors.origen_direccion?.message} {...form.register("origen_direccion")} />
            <FormInput label="Origen ciudad" error={form.formState.errors.origen_ciudad?.message} {...form.register("origen_ciudad")} />
            <FormInput label="Origen provincia" error={form.formState.errors.origen_provincia?.message} {...form.register("origen_provincia")} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FormInput label="Destino direccion" error={form.formState.errors.destino_direccion?.message} {...form.register("destino_direccion")} />
            <FormInput label="Destino ciudad" error={form.formState.errors.destino_ciudad?.message} {...form.register("destino_ciudad")} />
            <FormInput label="Destino provincia" error={form.formState.errors.destino_provincia?.message} {...form.register("destino_provincia")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Fecha retiro" type="datetime-local" error={form.formState.errors.fecha_retiro_deseada?.message} {...form.register("fecha_retiro_deseada")} />
            <FormInput label="Fecha entrega" type="datetime-local" error={form.formState.errors.fecha_entrega_deseada?.message} {...form.register("fecha_entrega_deseada")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Publicar <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}

export function PymeCargaDetailPage({ id }: { id: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const resource = useResource(async () => {
    const [carga, ofertas] = await Promise.all([api.cargas.get(id), api.ofertas.byCarga(id)]);
    return { carga, ofertas };
  }, [id]);

  async function action(callback: () => Promise<unknown>, success: string) {
    try {
      await callback();
      setMessage(success);
      await resource.reload();
    } catch (err) {
      setMessage(null);
      throw err;
    }
  }

  return (
    <AppLayout role="PYME">
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {resource.data ? (
        <div>
          <SectionTitle
            title={`Carga #${resource.data.carga.id}`}
            action={
              <Button variant="secondary" onClick={() => api.cargas.cancelar(id).then(resource.reload).catch((err) => setMessage(getErrorMessage(err)))}>
                Cancelar carga
              </Button>
            }
          />
          <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
            <div className="space-y-4">
              <CargaSummary carga={resource.data.carga} />
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-black text-slate-950">Ofertas recibidas</h2>
                  <span className="text-sm font-bold text-slate-400">{resource.data.ofertas.length} ofertas</span>
                </div>
                <div className="space-y-3">
                  {resource.data.ofertas.length === 0 ? (
                    <EmptyState title="Sin ofertas" text="Cuando un transportista oferte, aparecera aca." />
                  ) : (
                    resource.data.ofertas.map((oferta) => (
                      <ManagedOferta
                        key={oferta.id}
                        oferta={oferta}
                        onAccept={() => action(() => api.ofertas.aceptar(oferta.id), "Oferta aceptada. Se genero el viaje.")}
                        onReject={() => action(() => api.ofertas.rechazar(oferta.id), "Oferta rechazada.")}
                      />
                    ))
                  )}
                </div>
              </Card>
            </div>
            <MapPreview
              title={resource.data.carga.estado}
              subtitle={resource.data.carga.titulo}
              points={[
                { label: resource.data.carga.origen_ciudad },
                { label: "Carga", active: true },
                { label: resource.data.carga.destino_ciudad }
              ]}
            />
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}

export function PymeViajesPage() {
  const searchParams = useSearchParams();
  const tab = normalizePymeViajesTab(searchParams.get("tab"));
  const resource = useResource(loadViajesWithCargas, []);
  return (
    <AppLayout role="PYME">
      <SectionTitle title={tab === "pagos" ? "Mis pagos" : tab === "tracking" ? "Tracking" : "Mis viajes"} />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.viajes.length === 0 ? <EmptyState title="Sin viajes" text="Los viajes aparecen cuando aceptas una oferta." /> : null}
      {resource.data ? (
        tab === "pagos" ? (
          <div className="grid gap-4">
            {resource.data.viajes.map((viaje) => {
              const carga = resource.data.cargas[viaje.carga_id];
              const pago = resource.data.pagos[viaje.id];
              return (
                <Card key={viaje.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Viaje #{viaje.id}</p>
                      <h2 className="mt-1 font-black text-slate-950">{carga?.titulo ?? "Carga sin detalle"}</h2>
                      <p className="text-sm text-slate-500">
                        {carga ? `${carga.origen_ciudad}, ${carga.origen_provincia} -> ${carga.destino_ciudad}, ${carga.destino_provincia}` : "Detalle de ruta no disponible"}
                      </p>
                    </div>
                    <Link href={`/pyme/viajes/${viaje.id}`} className="inline-flex min-h-[38px] items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy">
                      Ver viaje <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  {pago ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-line bg-white p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">Total</p>
                        <p className="mt-1 text-lg font-black text-slate-950">{money(pago.monto_total)}</p>
                      </div>
                      <div className="rounded-xl border border-line bg-white p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">Comision</p>
                        <p className="mt-1 text-lg font-black text-slate-950">{money(pago.comision_plataforma)}</p>
                      </div>
                      <div className="rounded-xl border border-line bg-white p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
                        <div className="mt-2">
                          <StatusBadge value={pago.estado} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Todavia no hay pago registrado para este viaje.</p>
                  )}
                </Card>
              );
            })}
          </div>
        ) : tab === "tracking" ? (
          <div className="grid gap-4">
            {resource.data.viajes.map((viaje) => {
              const carga = resource.data.cargas[viaje.carga_id];
              const lastPosition = resource.data.lastTracking[viaje.id];
              return (
                <Card key={viaje.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Viaje #{viaje.id}</p>
                      <h2 className="mt-1 font-black text-slate-950">{carga?.titulo ?? "Carga sin detalle"}</h2>
                      <p className="text-sm text-slate-500">
                        {carga ? `${carga.origen_ciudad}, ${carga.origen_provincia} -> ${carga.destino_ciudad}, ${carga.destino_provincia}` : "Detalle de ruta no disponible"}
                      </p>
                    </div>
                    <Link href={`/pyme/viajes/${viaje.id}`} className="inline-flex min-h-[38px] items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy">
                      Ver tracking <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  {lastPosition ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-line bg-white p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">Ultima actualizacion</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">{formatDate(lastPosition.timestamp)}</p>
                      </div>
                      <div className="rounded-xl border border-line bg-white p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">Velocidad</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {lastPosition.velocidad != null ? `${numberValue(lastPosition.velocidad)} km/h` : "Sin dato"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-line bg-white p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
                        <div className="mt-2">
                          <StatusBadge value={viaje.estado} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Todavia no hay posiciones de tracking para este viaje.</p>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4">
            {resource.data.viajes.map((viaje) => (
              <ViajeCard key={viaje.id} viaje={viaje} carga={resource.data.cargas[viaje.carga_id]} href={`/pyme/viajes/${viaje.id}`} />
            ))}
          </div>
        )
      ) : null}
    </AppLayout>
  );
}

export function PymeViajeDetailPage({ id }: { id: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ratingForm = useForm<RatingForm>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { puntaje: 5, comentario: "" }
  });
  const resource = useResource(async () => {
    const viaje = await api.viajes.get(id);
    const [carga, tracking] = await Promise.all([api.cargas.get(viaje.carga_id), api.tracking.list(id)]);
    let pago: Pago | null = null;
    try {
      pago = await api.pagos.get(id);
    } catch {
      pago = null;
    }
    return { viaje, carga, tracking, pago };
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

  async function submitRating(values: RatingForm) {
    await run(() => api.calificaciones.create(id, values), "Calificacion registrada.");
    ratingForm.reset({ puntaje: 5, comentario: "" });
  }

  return (
    <AppLayout role="PYME">
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {resource.data ? (
        <div>
          <SectionTitle title={`Viaje #${resource.data.viaje.id}`} />
          <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              <CargaSummary carga={resource.data.carga} />
              <TrackingPanel positions={resource.data.tracking as TrackingPosition[]} carga={resource.data.carga} />
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-black text-slate-950">Estado del viaje</h2>
                  <StatusBadge value={resource.data.viaje.estado} />
                </div>
                <p className="text-sm text-slate-500">Asignado {formatDate(resource.data.viaje.fecha_asignacion)}</p>
                <div className="mt-4 grid gap-2">
                  <Button variant="secondary" onClick={() => run(() => api.viajes.finalizar(id, "Confirmado por PyME"), "Viaje finalizado.")}>
                    Confirmar entrega
                  </Button>
                  <Button onClick={() => run(() => api.pagos.simular(id, {}), "Pago simulado registrado.")}>
                    Simular pago <CreditCard className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
              <Card className="p-4">
                <h2 className="font-black text-slate-950">Pago</h2>
                {resource.data.pago ? (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total</span>
                      <strong>{money(resource.data.pago.monto_total)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Comision</span>
                      <strong>{money(resource.data.pago.comision_plataforma)}</strong>
                    </div>
                    <StatusBadge value={resource.data.pago.estado} />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Todavia no hay pago registrado.</p>
                )}
              </Card>
              <Card className="p-4">
                <h2 className="mb-3 font-black text-slate-950">Calificar transportista</h2>
                <form className="space-y-3" onSubmit={ratingForm.handleSubmit(submitRating)}>
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

function ProfileSetup({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PymeForm>({
    resolver: zodResolver(pymeSchema),
    defaultValues: {
      razon_social: "",
      cuit: "",
      rubro: "",
      direccion: "",
      ciudad: "",
      provincia: ""
    }
  });

  async function onSubmit(values: PymeForm) {
    setError(null);
    try {
      await api.pymes.create(values);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <SectionTitle title="Crear perfil PyME" />
      {error ? <ErrorState message={error} /> : null}
      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput label="Razon social" error={form.formState.errors.razon_social?.message} {...form.register("razon_social")} />
          <FormInput label="CUIT" error={form.formState.errors.cuit?.message} {...form.register("cuit")} />
          <FormInput label="Rubro" error={form.formState.errors.rubro?.message} {...form.register("rubro")} />
          <FormInput label="Direccion" error={form.formState.errors.direccion?.message} {...form.register("direccion")} />
          <FormInput label="Ciudad" error={form.formState.errors.ciudad?.message} {...form.register("ciudad")} />
          <FormInput label="Provincia" error={form.formState.errors.provincia?.message} {...form.register("provincia")} />
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Guardar perfil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function CargaSummary({ carga }: { carga: Carga }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={carga.estado} />
            <span className="text-xs font-bold text-slate-400">ID #{carga.id}</span>
          </div>
          <h2 className="text-xl font-black text-slate-950">{carga.titulo}</h2>
          <p className="mt-1 text-sm text-slate-500">{carga.descripcion ?? "Sin descripcion"}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-bold uppercase text-slate-400">Precio referencia</p>
          <p className="text-xl font-black text-navy">{money(carga.precio_referencia)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Info label="Origen" value={`${carga.origen_direccion}, ${carga.origen_ciudad}`} />
        <Info label="Destino" value={`${carga.destino_direccion}, ${carga.destino_ciudad}`} />
        <Info label="Retiro" value={formatDate(carga.fecha_retiro_deseada)} />
      </div>
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

function ManagedOferta({
  oferta,
  onAccept,
  onReject
}: {
  oferta: Oferta;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  async function safe(callback: () => Promise<void>) {
    setError(null);
    try {
      await callback();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }
  return (
    <div>
      {error ? <div className="mb-2 text-sm font-semibold text-rose-600">{error}</div> : null}
      <OfertaCard oferta={oferta} canManage onAccept={() => safe(onAccept)} onReject={() => safe(onReject)} />
    </div>
  );
}

async function loadOptionalProfile(): Promise<EmpresaPyme | null> {
  try {
    return await api.pymes.me();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function loadViajesWithCargas() {
  const viajes = await api.viajes.mine();
  const [pairs, pagos, lastTracking] = await Promise.all([
    Promise.all(
      viajes.map(async (viaje) => {
        try {
          return [viaje.carga_id, await api.cargas.get(viaje.carga_id)] as const;
        } catch {
          return [viaje.carga_id, undefined] as const;
        }
      })
    ),
    Promise.all(
      viajes.map(async (viaje) => {
        try {
          return [viaje.id, await api.pagos.get(viaje.id)] as const;
        } catch {
          return [viaje.id, null] as const;
        }
      })
    ),
    Promise.all(
      viajes.map(async (viaje) => {
        try {
          return [viaje.id, await api.tracking.last(viaje.id)] as const;
        } catch {
          return [viaje.id, null] as const;
        }
      })
    )
  ]);
  return {
    viajes,
    cargas: Object.fromEntries(pairs.filter(([, carga]) => Boolean(carga))) as Record<number, Carga>,
    pagos: Object.fromEntries(pagos) as Record<number, Pago | null>,
    lastTracking: Object.fromEntries(lastTracking) as Record<number, TrackingPosition | null>
  };
}

function normalizePymeViajesTab(tab: string | null) {
  if (tab === "pagos" || tab === "tracking") return tab;
  return "viajes";
}
