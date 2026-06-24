"use client";

import Link from "next/link";
import { Plus, Files, ArrowRight, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, DataTable, EmptyState, ErrorState, LoadingState, SectionTitle } from "@/components/ui";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import type { ContratoGranos } from "@/lib/types";
import { formatDate, money } from "@/lib/utils";

export default function ContratosPage() {
  const { data: contratos, error, loading, reload } = useResource(() => api.contratos.list());

  return (
    <AppLayout role="PYME">
      <div className="space-y-6">
        <SectionTitle
          title="Contratos Digitales de Granos"
          action={
            <Link href="/pyme/contratos/nuevo">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Contrato
              </Button>
            </Link>
          }
        />

        <p className="text-sm text-slate-500 max-w-2xl">
          Gestione, valide y visualice la documentación legal de entrega de mercadería para transportes agrícolas asociados con registros oficiales del RUCA.
        </p>

        {loading ? (
          <LoadingState label="Cargando contratos..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !contratos || contratos.length === 0 ? (
          <EmptyState
            title="No se encontraron contratos"
            text="Aún no has registrado ningún contrato digital de granos. Haz clic en el botón para crear tu primer contrato."
            action={
              <Link href="/pyme/contratos/nuevo">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Contrato
                </Button>
              </Link>
            }
          />
        ) : (
          <DataTable<ContratoGranos>
            rows={contratos}
            columns={[
              {
                key: "numero_contrato",
                header: "Nro. Contrato",
                render: (row) => (
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Files className="h-4 w-4 text-slate-400" />
                    <span>{row.numero_contrato}</span>
                  </div>
                )
              },
              {
                key: "tipo_grano",
                header: "Detalle Grano",
                render: (row) => (
                  <div>
                    <div className="font-medium text-slate-900">{row.tipo_grano}</div>
                    <div className="text-xs text-slate-500">Calidad: {row.calidad_grano}</div>
                  </div>
                )
              },
              {
                key: "intervinientes",
                header: "Productor / Exportador",
                render: (row) => (
                  <div className="text-xs space-y-0.5">
                    <div>
                      <span className="font-medium text-slate-700">Prod:</span> {row.productor_nombre}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Exp:</span> {row.exportador_nombre}
                    </div>
                  </div>
                )
              },
              {
                key: "cantidad_total_kg",
                header: "Volumen",
                render: (row) => (
                  <div>
                    <div className="font-medium text-slate-900">{row.cantidad_total_kg.toLocaleString("es-AR")} kg</div>
                    <div className="text-xs text-slate-500">Precio/kg: {money(row.precio_por_kg)}</div>
                  </div>
                )
              },
              {
                key: "validacion",
                header: "Validación",
                render: () => (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    RUCA Validado
                  </span>
                )
              },
              {
                key: "fecha",
                header: "Inicio / Fin",
                render: (row) => (
                  <div className="text-xs text-slate-500">
                    <div>Desde: {formatDate(row.fecha_inicio_contrato)}</div>
                    <div>Hasta: {formatDate(row.fecha_fin_contrato)}</div>
                  </div>
                )
              },
              {
                key: "acciones",
                header: "",
                render: (row) => (
                  <Link href={`/pyme/contratos/${row.id}`} className="text-navy hover:text-[#0d2949] font-semibold text-sm flex items-center gap-1 justify-end">
                    Ver Documento
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )
              }
            ]}
          />
        )}
      </div>
    </AppLayout>
  );
}
