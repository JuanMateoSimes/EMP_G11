"use client";

import Link from "next/link";
import { Check, ClipboardCheck, FileCheck2, Route, ShieldCheck, Truck, Users, X } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { CargaCard, ViajeCard } from "@/components/domain";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  RoleBadge,
  SectionTitle,
  StatCard,
  StatusBadge,
  SuccessMessage
} from "@/components/ui";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useResource } from "@/lib/hooks";
import type { Carga, Documento, Transportista, User, Vehiculo, Viaje } from "@/lib/types";
import { formatDate, labelize, money, numberValue } from "@/lib/utils";

export function AdminDashboardPage() {
  const resource = useResource(async () => {
    const [users, transportistas, documentos, viajes, cargas] = await Promise.all([
      api.users.list(),
      api.transportistas.list(),
      api.documentos.list(),
      api.viajes.mine(),
      api.cargas.list()
    ]);
    return { users, transportistas, documentos, viajes, cargas };
  }, []);

  return (
    <AppLayout role="ADMIN">
      <SectionTitle title="Dashboard admin" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data ? (
        <div>
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard label="Usuarios" value={resource.data.users.length} icon={Users} />
            <StatCard label="Transportistas" value={resource.data.transportistas.length} icon={Truck} />
            <StatCard label="Docs pendientes" value={resource.data.documentos.filter((item) => item.estado === "PENDIENTE").length} icon={FileCheck2} />
            <StatCard label="Viajes" value={resource.data.viajes.length} icon={Route} />
            <StatCard label="Cargas" value={resource.data.cargas.length} icon={ClipboardCheck} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black text-slate-950">Documentos pendientes</h2>
                <Link href="/admin/documentos" className="text-sm font-bold text-navy">
                  Revisar
                </Link>
              </div>
              <div className="space-y-3">
                {resource.data.documentos
                  .filter((item) => item.estado === "PENDIENTE")
                  .slice(0, 4)
                  .map((doc) => (
                    <MiniDoc key={doc.id} doc={doc} />
                  ))}
                {resource.data.documentos.filter((item) => item.estado === "PENDIENTE").length === 0 ? <EmptyState title="Sin pendientes" /> : null}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black text-slate-950">Cargas recientes</h2>
                <Link href="/admin/viajes" className="text-sm font-bold text-navy">
                  Ver viajes
                </Link>
              </div>
              <div className="space-y-3">
                {resource.data.cargas.slice(0, 3).map((carga) => (
                  <CargaCard key={carga.id} carga={carga} href="/admin/viajes" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}

export function AdminUsuariosPage() {
  const resource = useResource(() => api.users.list(), []);
  return (
    <AppLayout role="ADMIN">
      <SectionTitle title="Usuarios" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data ? (
        <DataTable<User>
          rows={resource.data}
          columns={[
            { key: "nombre", header: "Nombre", render: (row) => <strong>{row.nombre}</strong> },
            { key: "email", header: "Email", render: (row) => row.email },
            { key: "rol", header: "Rol", render: (row) => <RoleBadge value={row.rol} /> },
            { key: "estado", header: "Estado", render: (row) => <StatusBadge value={row.estado} /> },
            { key: "created", header: "Alta", render: (row) => formatDate(row.created_at) }
          ]}
        />
      ) : null}
    </AppLayout>
  );
}

export function AdminDocumentosPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resource = useResource(() => api.documentos.list(), []);

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

  return (
    <AppLayout role="ADMIN">
      <SectionTitle title="Documentos" />
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.length === 0 ? <EmptyState title="Sin documentos" /> : null}
      <div className="grid gap-3">
        {resource.data?.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <MiniDoc doc={doc} />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => run(() => api.documentos.reject(doc.id, "Rechazado desde backoffice"), "Documento rechazado.")}>
                  <X className="h-4 w-4" /> Rechazar
                </Button>
                <Button onClick={() => run(() => api.documentos.approve(doc.id), "Documento aprobado.")}>
                  <Check className="h-4 w-4" /> Aprobar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}

export function AdminTransportistasPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resource = useResource(async () => {
    const [transportistas, vehiculos] = await Promise.all([api.transportistas.list(), api.vehiculos.list()]);
    return { transportistas, vehiculos };
  }, []);

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

  return (
    <AppLayout role="ADMIN">
      <SectionTitle title="Verificacion" />
      {message ? <SuccessMessage message={message} onClose={() => setMessage(null)} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 font-black text-slate-950">Transportistas</h2>
          <div className="space-y-3">
            {resource.data?.transportistas.map((transportista) => (
              <TransportistaRow
                key={transportista.id}
                transportista={transportista}
                onVerify={() => run(() => api.transportistas.verify(transportista.id), "Transportista verificado.")}
              />
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 font-black text-slate-950">Vehiculos</h2>
          <div className="space-y-3">
            {resource.data?.vehiculos.map((vehiculo) => (
              <VehiculoRow
                key={vehiculo.id}
                vehiculo={vehiculo}
                onActive={() => run(() => api.vehiculos.updateEstado(vehiculo.id, "ACTIVO"), "Vehiculo activado.")}
                onInactive={() => run(() => api.vehiculos.updateEstado(vehiculo.id, "INACTIVO"), "Vehiculo desactivado.")}
              />
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export function AdminViajesPage() {
  const resource = useResource(async () => {
    const [viajes, cargas] = await Promise.all([api.viajes.mine(), api.cargas.list()]);
    return {
      viajes,
      cargas: Object.fromEntries(cargas.map((carga) => [carga.id, carga])) as Record<number, Carga>
    };
  }, []);
  return (
    <AppLayout role="ADMIN">
      <SectionTitle title="Viajes generales" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {resource.data?.viajes.length === 0 ? <EmptyState title="Sin viajes" /> : null}
      <div className="grid gap-4">
        {resource.data?.viajes.map((viaje) => (
          <ViajeCard key={viaje.id} viaje={viaje} carga={resource.data?.cargas[viaje.carga_id]} href={`/admin/viajes`} />
        ))}
      </div>
    </AppLayout>
  );
}

function MiniDoc({ doc }: { doc: Documento }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <StatusBadge value={doc.estado} />
        <span className="text-xs font-bold text-slate-400">{doc.owner_tipo} #{doc.owner_id}</span>
      </div>
      <h3 className="truncate font-black text-slate-950">{doc.nombre_archivo}</h3>
      <p className="text-sm text-slate-500">
        {labelize(doc.tipo)} - {doc.fecha_vencimiento ? `Vence ${doc.fecha_vencimiento}` : "Sin vencimiento"}
      </p>
    </div>
  );
}

function TransportistaRow({ transportista, onVerify }: { transportista: Transportista; onVerify: () => void }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{transportista.nombre_completo}</h3>
          <p className="text-sm text-slate-500">
            {labelize(transportista.tipo)} - {transportista.ciudad_base}
          </p>
        </div>
        <StatusBadge value={transportista.verificado ? "ACTIVO" : "PENDIENTE_VERIFICACION"} />
      </div>
      {!transportista.verificado ? (
        <div className="mt-3 flex justify-end">
          <Button onClick={onVerify}>
            <ShieldCheck className="h-4 w-4" /> Verificar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function VehiculoRow({
  vehiculo,
  onActive,
  onInactive
}: {
  vehiculo: Vehiculo;
  onActive: () => void;
  onInactive: () => void;
}) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{vehiculo.patente}</h3>
          <p className="text-sm text-slate-500">
            {labelize(vehiculo.tipo)} - {numberValue(vehiculo.capacidad_kg)} kg
          </p>
        </div>
        <StatusBadge value={vehiculo.estado} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="secondary" onClick={onInactive}>
          Inactivar
        </Button>
        <Button onClick={onActive}>Activar</Button>
      </div>
    </div>
  );
}
