"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, Navigation, Package, Star, Truck } from "lucide-react";
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui";
import type { Carga, Oferta, TrackingPosition, Vehiculo, Viaje } from "@/lib/types";
import { formatDate, labelize, money, numberValue } from "@/lib/utils";

export function MapPreview({
  title,
  subtitle,
  points = []
}: {
  title?: string;
  subtitle?: string;
  points?: Array<{ label: string; active?: boolean }>;
}) {
  return (
    <div className="map-surface min-h-[280px] rounded-lg">
      <div className="map-park" />
      <svg viewBox="0 0 600 320" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <path d="M70 255 C 150 220, 120 165, 220 150 S 335 112, 390 86 S 500 72, 545 46" fill="none" stroke="#2f80ed" strokeWidth="5" />
        <path className="route-line" d="M70 255 C 150 220, 120 165, 220 150 S 335 112, 390 86 S 500 72, 545 46" fill="none" stroke="#111827" strokeWidth="3" />
        <circle cx="70" cy="255" r="8" fill="#111827" />
        <circle cx="545" cy="46" r="8" fill="#111827" />
        <circle cx="306" cy="122" r="18" fill="#2f80ed" />
      </svg>
      <div className="absolute left-4 top-4 rounded-lg border border-line bg-white/95 p-3 shadow-sm">
        <p className="text-xs font-bold uppercase text-slate-400">{title ?? "Tracking"}</p>
        <p className="mt-1 text-sm font-black text-slate-950">{subtitle ?? "Ruta activa"}</p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {points.slice(0, 3).map((point) => (
          <span
            key={point.label}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
          >
            <span className={point.active ? "h-2 w-2 rounded-full bg-blue-500" : "h-2 w-2 rounded-full bg-slate-950"} />
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CargaCard({ carga, href }: { carga: Carga; href: string }) {
  return (
    <Card className="p-4 transition hover:border-navy/40 hover:shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge value={carga.estado} />
            <span className="text-xs font-bold text-slate-400">ID #{carga.id}</span>
          </div>
          <h2 className="text-lg font-black text-slate-950">{carga.titulo}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{carga.descripcion ?? "Sin descripcion"}</p>
        </div>
        <Link
          href={href}
          className="hidden min-h-[38px] items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50 sm:inline-flex"
        >
          Ver <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <RouteMini from={`${carga.origen_ciudad}, ${carga.origen_provincia}`} to={`${carga.destino_ciudad}, ${carga.destino_provincia}`} />
        <InfoMini icon={Package} label="Mercaderia" value={`${carga.tipo_mercaderia} - ${numberValue(carga.peso_kg)} kg`} />
        <InfoMini icon={CalendarClock} label="Retiro" value={formatDate(carga.fecha_retiro_deseada)} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-sm font-black text-navy">{money(carga.precio_referencia)}</span>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-navy sm:hidden">
          Ver detalle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

export function OfertaCard({
  oferta,
  vehiculo,
  onAccept,
  onReject,
  canManage
}: {
  oferta: Oferta;
  vehiculo?: Vehiculo;
  onAccept?: () => void;
  onReject?: () => void;
  canManage?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={oferta.estado} />
            <span className="text-xs font-bold text-slate-400">Oferta #{oferta.id}</span>
          </div>
          <p className="text-2xl font-black text-slate-950">{money(oferta.monto)}</p>
          <p className="mt-1 text-sm text-slate-500">{oferta.mensaje ?? "Sin mensaje del transportista."}</p>
        </div>
        <div className="rounded-md bg-slate-50 px-3 py-2 text-sm">
          <p className="font-bold text-slate-950">{vehiculo?.patente ?? `Vehiculo #${oferta.vehiculo_id}`}</p>
          <p className="text-slate-500">{vehiculo ? labelize(vehiculo.tipo) : "Unidad ofertada"}</p>
        </div>
      </div>
      {canManage && oferta.estado === "PENDIENTE" ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
          <Button variant="secondary" onClick={onReject}>
            Rechazar
          </Button>
          <Button onClick={onAccept}>
            Aceptar <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function ViajeCard({ viaje, carga, href }: { viaje: Viaje; carga?: Carga; href: string }) {
  return (
    <Card className="p-4 transition hover:border-navy/40 hover:shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={viaje.estado} />
            <span className="text-xs font-bold text-slate-400">Viaje #{viaje.id}</span>
          </div>
          <h2 className="text-lg font-black text-slate-950">{carga?.titulo ?? `Carga #${viaje.carga_id}`}</h2>
          <p className="mt-1 text-sm text-slate-500">Asignado {formatDate(viaje.fecha_asignacion)}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
        >
          Ver viaje <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <RouteMini
          from={carga ? `${carga.origen_ciudad}, ${carga.origen_provincia}` : "Origen"}
          to={carga ? `${carga.destino_ciudad}, ${carga.destino_provincia}` : "Destino"}
        />
        <InfoMini icon={Truck} label="Vehiculo" value={`Unidad #${viaje.vehiculo_id}`} />
      </div>
    </Card>
  );
}

export function TrackingPanel({
  positions,
  carga
}: {
  positions: TrackingPosition[];
  carga?: Carga;
}) {
  const last = positions[positions.length - 1];
  return (
    <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <Card className="p-4">
        <h2 className="font-black text-slate-950">Tracking basico</h2>
        {positions.length === 0 ? (
          <EmptyState title="Sin posiciones" text="El transportista todavia no registro ubicaciones para este viaje." />
        ) : (
          <div className="mt-4 space-y-3">
            {positions.map((position, index) => (
              <div key={position.id} className="flex gap-3 rounded-md border border-line p-3">
                <div className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-white">
                  {index === positions.length - 1 ? <Navigation className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-bold text-slate-950">
                    {Number(position.lat).toFixed(4)}, {Number(position.lng).toFixed(4)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(position.timestamp)} - {position.velocidad ?? "-"} km/h
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <MapPreview
        title={last ? "Ultima posicion" : "Ruta"}
        subtitle={last ? `${Number(last.lat).toFixed(3)}, ${Number(last.lng).toFixed(3)}` : carga?.titulo}
        points={[
          { label: carga ? carga.origen_ciudad : "Origen" },
          { label: last ? "Unidad en ruta" : "Sin senal", active: true },
          { label: carga ? carga.destino_ciudad : "Destino" }
        ]}
      />
    </div>
  );
}

export function RatingStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={index < value ? "h-4 w-4 fill-signal text-signal" : "h-4 w-4 text-slate-300"} />
      ))}
    </span>
  );
}

function RouteMini({ from, to }: { from: string; to: string }) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-400">Recorrido</p>
      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-950">
        <span className="h-2 w-2 rounded-full bg-slate-950" />
        <span className="truncate">{from}</span>
      </div>
      <div className="ml-1 h-5 border-l border-dashed border-slate-300" />
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
        <span className="h-2 w-2 rounded-full border border-navy bg-white" />
        <span className="truncate">{to}</span>
      </div>
    </div>
  );
}

function InfoMini({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
