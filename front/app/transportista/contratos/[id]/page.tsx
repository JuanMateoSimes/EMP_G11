"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShieldCheck, Calendar, Scale, Coins, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, ErrorState, LoadingState } from "@/components/ui";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { formatDate, money } from "@/lib/utils";

export default function TransportistaContratoDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const contractId = Number(id);

  const { data: contrato, error, loading, reload } = useResource(() => api.contratos.get(contractId));

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <AppLayout role="TRANSPORTISTA">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Controls (Omitted during print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 transition flex items-center gap-1">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-semibold">Volver</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900">Previsualización de Contrato</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Cargando documento de contrato..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !contrato ? (
          <ErrorState message="No se encontró el contrato especificado." />
        ) : (
          <div className="space-y-6">
            {/* Simulated Paper Document Sheet */}
            <div className="bg-white border border-slate-300 shadow-xl rounded-none p-8 md:p-12 relative overflow-hidden font-serif text-slate-800 print:border-none print:shadow-none print:p-0">
              
              {/* Badge RUCA Validado */}
              <div className="absolute top-8 right-8 flex items-center gap-2 bg-emerald-50 border-2 border-emerald-500 rounded px-3 py-1.5 text-emerald-700 font-sans font-bold text-xs uppercase tracking-wider rotate-3 shadow-sm select-none">
                <ShieldCheck className="h-5 w-5 text-emerald-600 animate-pulse" />
                <div className="text-left leading-none">
                  <div>Documento Validado</div>
                  <div className="text-[9px] text-emerald-600 font-medium">Registro RUCA Activo</div>
                </div>
              </div>

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
                <ShieldCheck className="h-[400px] w-[400px]" />
              </div>

              <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="border-b-2 border-slate-950 pb-6 text-center md:text-left">
                  <h2 className="text-xs font-sans font-bold tracking-widest text-slate-500 uppercase">
                    República Argentina - Ministerio de Agricultura
                  </h2>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950 mt-1 uppercase">
                    Contrato de Compraventa de Granos
                  </h1>
                  <p className="text-sm font-sans font-semibold text-slate-600 mt-2">
                    Validación Electrónica RUCA - Matrícula Oficial de Comercio de Granos
                  </p>
                </div>

                {/* Contract Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm bg-slate-50 p-4 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-700">NRO. CONTRATO REGISTRO:</span>{" "}
                    <span className="font-mono text-slate-950 font-semibold">{contrato.numero_contrato}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">ESTADO REGULATORIO:</span>{" "}
                    <span className="text-emerald-700 font-bold">APROBADO & VALIDADO</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">FECHA EMISIÓN:</span>{" "}
                    <span>{formatDate(contrato.created_at || new Date().toISOString())}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">ASOCIACIÓN LOGEXPRESS:</span>{" "}
                    <span className="font-mono">{contrato.carga_id ? `#CARGA-${contrato.carga_id}` : "Independiente"}</span>
                  </div>
                </div>

                {/* Section: Partes Contratantes */}
                <div>
                  <h3 className="text-md font-sans font-bold border-b border-slate-400 pb-1 uppercase tracking-wide text-slate-950">
                    I. Partes Contratantes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3 text-sm">
                    {/* Producer */}
                    <div className="space-y-1">
                      <div className="font-sans font-semibold uppercase text-slate-500 text-xs">Vendedor / Productor</div>
                      <div className="font-bold text-slate-900 text-base">{contrato.productor_nombre}</div>
                      <div>
                        <span className="font-sans font-medium text-slate-600">ID / CUIT:</span>{" "}
                        <span className="font-mono">{contrato.productor_id}</span>
                      </div>
                      <div>
                        <span className="font-sans font-medium text-slate-600">Establecimiento RUCA:</span>{" "}
                        <span className="font-mono">{contrato.planta_procedencia_ruca}</span>
                      </div>
                    </div>

                    {/* Exporter */}
                    <div className="space-y-1">
                      <div className="font-sans font-semibold uppercase text-slate-500 text-xs">Comprador / Exportador</div>
                      <div className="font-bold text-slate-900 text-base">{contrato.exportador_nombre}</div>
                      <div>
                        <span className="font-sans font-medium text-slate-600">ID / CUIT:</span>{" "}
                        <span className="font-mono">{contrato.exportador_id}</span>
                      </div>
                      <div>
                        <span className="font-sans font-medium text-slate-600">Establecimiento RUCA:</span>{" "}
                        <span className="font-mono">{contrato.planta_destino_ruca}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Especificaciones de Mercadería */}
                <div>
                  <h3 className="text-md font-sans font-bold border-b border-slate-400 pb-1 uppercase tracking-wide text-slate-950">
                    II. Especificaciones del Grano y Calidad
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="text-slate-600 font-sans flex items-center gap-1.5">
                          <Scale className="h-4 w-4 text-slate-400" />
                          Tipo de Grano:
                        </span>
                        <span className="font-bold text-slate-900">{contrato.tipo_grano}</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="text-slate-600 font-sans">Condición / Calidad:</span>
                        <span className="font-bold text-slate-900">{contrato.calidad_grano}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="text-slate-600 font-sans">Humedad Máxima Permitida:</span>
                        <span className="font-bold text-slate-900">{contrato.humedad_maxima_permitida.toFixed(1)} %</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="text-slate-600 font-sans">Impurezas Máximas Permitidas:</span>
                        <span className="font-bold text-slate-900">{contrato.impurezas_maximas_permitidas.toFixed(1)} %</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Condiciones Comerciales */}
                <div>
                  <h3 className="text-md font-sans font-bold border-b border-slate-400 pb-1 uppercase tracking-wide text-slate-950">
                    III. Condiciones Comerciales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="text-slate-600 font-sans flex items-center gap-1.5">
                          <Coins className="h-4 w-4 text-slate-400" />
                          Cantidad Comprometida:
                        </span>
                        <span className="font-bold text-slate-900">{contrato.cantidad_total_kg.toLocaleString("es-AR")} kg</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="text-slate-600 font-sans">Precio Acordado por kg:</span>
                        <span className="font-bold text-slate-900">{money(contrato.precio_por_kg)}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 flex flex-col justify-center rounded">
                      <span className="text-xs font-sans font-semibold uppercase text-slate-500">Valor Comercial Estimado</span>
                      <span className="text-2xl font-bold font-sans text-slate-950 mt-1">
                        {money(contrato.cantidad_total_kg * contrato.precio_por_kg)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans mt-0.5">Sujeto a liquidación final de descarga.</span>
                    </div>
                  </div>
                </div>

                {/* Section: Vigencia */}
                <div>
                  <h3 className="text-md font-sans font-bold border-b border-slate-400 pb-1 uppercase tracking-wide text-slate-950">
                    IV. Plazos y Ejecución
                  </h3>
                  <div className="mt-3 text-sm space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 font-sans">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        El presente contrato entra en vigencia a partir del{" "}
                        <strong className="text-slate-900">{formatDate(contrato.fecha_inicio_contrato)}</strong> hasta su vencimiento establecido el{" "}
                        <strong className="text-slate-900">{formatDate(contrato.fecha_fin_contrato)}</strong>.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Declaración Legal */}
                <div className="border-t border-slate-300 pt-6 text-[10px] text-slate-500 space-y-2 leading-relaxed">
                  <p>
                    * DECLARACIÓN JURADA: Las partes firmantes declaran bajo juramento la autenticidad de los datos ingresados y su habilitación en los registros correspondientes del RUCA (Registro Único de la Cadena Agroalimentaria).
                  </p>
                  <p>
                    * Firma digitalizada registrada electrónicamente mediante LogExpress en colaboración con las entidades regulatorias agrícolas nacionales. El código de transacción digital de este documento garantiza la inalterabilidad de los términos establecidos.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Alert of informational/validated status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3 font-sans print:hidden">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold">Información Regulatoria para Choferes</p>
                <p className="mt-0.5 text-blue-700 leading-normal">
                  Este contrato digital está validado con la base de datos nacional de control de granos. Puede presentar esta pantalla o el PDF impreso en las balanzas de origen/destino y controles viales como respaldo oficial del cargamento en tránsito.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
