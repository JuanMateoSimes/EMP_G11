"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, FormInput, FormSelect, SectionTitle, SuccessMessage } from "@/components/ui";
import { api } from "@/lib/api";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { useResource } from "@/lib/hooks";
import { isoFromInput, dateInputValue } from "@/lib/utils";

const contratoSchema = z
  .object({
    carga_id: z.string().optional(),
    numero_contrato: z.string().min(2, "El número de contrato es obligatorio"),
    fecha_inicio_contrato: z.string().min(1, "La fecha de inicio es obligatoria"),
    fecha_fin_contrato: z.string().min(1, "La fecha de fin es obligatoria"),
    productor_id: z.string().min(2, "Identificación del productor obligatoria"),
    productor_nombre: z.string().min(2, "Nombre del productor obligatorio"),
    exportador_id: z.string().min(2, "Identificación del exportador obligatoria"),
    exportador_nombre: z.string().min(2, "Nombre del exportador obligatorio"),
    tipo_grano: z.string().min(2, "Tipo de grano obligatorio"),
    calidad_grano: z.string().min(2, "Calidad del grano obligatoria"),
    humedad_maxima_permitida: z.coerce
      .number()
      .min(0, "La humedad no puede ser menor a 0%")
      .max(100, "La humedad no puede superar el 100%"),
    impurezas_maximas_permitidas: z.coerce
      .number()
      .min(0, "Las impurezas no pueden ser menor a 0%")
      .max(100, "Las impurezas no pueden superar el 100%"),
    planta_procedencia_ruca: z.string().min(2, "Planta procedencia RUCA obligatoria"),
    planta_destino_ruca: z.string().min(2, "Planta destino RUCA obligatoria"),
    cantidad_total_kg: z.coerce.number().positive("La cantidad debe ser mayor a cero"),
    precio_por_kg: z.coerce.number().positive("El precio por kg debe ser mayor a cero")
  })
  .refine(
    (data) => new Date(data.fecha_fin_contrato) >= new Date(data.fecha_inicio_contrato),
    {
      message: "La fecha de fin no puede ser anterior a la de inicio",
      path: ["fecha_fin_contrato"]
    }
  );

type ContratoFormData = z.infer<typeof contratoSchema>;

export default function NuevoContratoPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load loads of the PyME to link if desired
  const { data: cargas } = useResource(() => api.cargas.mine());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      fecha_inicio_contrato: dateInputValue(new Date()),
      fecha_fin_contrato: dateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      humedad_maxima_permitida: 14.0,
      impurezas_maximas_permitidas: 2.0,
      calidad_grano: "Cámara",
      tipo_grano: "Soja"
    }
  });

  const onSubmit = async (data: ContratoFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        carga_id: data.carga_id ? Number(data.carga_id) : null,
        fecha_inicio_contrato: isoFromInput(data.fecha_inicio_contrato),
        fecha_fin_contrato: isoFromInput(data.fecha_fin_contrato)
      };

      const result = await api.contratos.create(payload);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/pyme/contratos/${result.id}`);
      }, 1500);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onCargaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      const selected = cargas?.find((c) => c.id === Number(val));
      if (selected) {
        // Autopopulate fields from linked load if relevant
        setValue("tipo_grano", selected.tipo_mercaderia);
        setValue("cantidad_total_kg", Number(selected.peso_kg));
        setValue("productor_nombre", selected.origen_direccion);
      }
    }
  };

  const cargaOptions = [
    { label: "-- Ninguna (Contrato Independiente) --", value: "" },
    ...(cargas?.map((c) => ({
      label: `#${c.id} - ${c.titulo} (${c.tipo_mercaderia})`,
      value: c.id
    })) || [])
  ];

  return (
    <AppLayout role="PYME">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link href="/pyme/contratos" className="text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <SectionTitle title="Registrar Contrato Digital de Granos" />
        </div>

        {success && (
          <SuccessMessage message="¡Contrato creado y validado exitosamente en RUCA! Redirigiendo..." />
        )}

        {submitError && (
          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-800">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Carga Asociada */}
          <Card className="p-6">
            <h2 className="text-md font-bold text-slate-900 mb-4 border-b border-line pb-2">
              Asociación con Operación de LogExpress
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <FormSelect
                label="Carga Asociada (Opcional)"
                options={cargaOptions}
                error={errors.carga_id?.message}
                {...register("carga_id", { onChange: onCargaChange })}
              />
              <p className="text-xs text-slate-500">
                Si asocia este contrato a una carga publicada, algunos campos se pre-completarán y el transportista asignado podrá visualizar la habilitación de granos.
              </p>
            </div>
          </Card>

          {/* Datos Generales del Contrato */}
          <Card className="p-6">
            <h2 className="text-md font-bold text-slate-900 mb-4 border-b border-line pb-2">
              Información General del Contrato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Número de Contrato"
                placeholder="Ej: CONTRATO-SOJA-998"
                error={errors.numero_contrato?.message}
                {...register("numero_contrato")}
              />
              <FormInput
                label="Fecha de Inicio"
                type="date"
                error={errors.fecha_inicio_contrato?.message}
                {...register("fecha_inicio_contrato")}
              />
              <FormInput
                label="Fecha de Vencimiento"
                type="date"
                error={errors.fecha_fin_contrato?.message}
                {...register("fecha_fin_contrato")}
              />
            </div>
          </Card>

          {/* Intervinientes */}
          <Card className="p-6">
            <h2 className="text-md font-bold text-slate-900 mb-4 border-b border-line pb-2">
              Partes Intervinientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Productor */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                  Productor / Vendedor
                </h3>
                <FormInput
                  label="CUIT / Identificación Productor"
                  placeholder="Ej: 30-11111111-1"
                  error={errors.productor_id?.message}
                  {...register("productor_id")}
                />
                <FormInput
                  label="Razón Social / Nombre Productor"
                  placeholder="Ej: Juan Pérez"
                  error={errors.productor_nombre?.message}
                  {...register("productor_nombre")}
                />
              </div>

              {/* Exportador */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                  Comprador / Exportador
                </h3>
                <FormInput
                  label="CUIT / Identificación Comprador"
                  placeholder="Ej: 30-99999999-9"
                  error={errors.exportador_id?.message}
                  {...register("exportador_id")}
                />
                <FormInput
                  label="Razón Social / Nombre Comprador"
                  placeholder="Ej: Cargill S.A."
                  error={errors.exportador_nombre?.message}
                  {...register("exportador_nombre")}
                />
              </div>
            </div>
          </Card>

          {/* Calidad y Grano */}
          <Card className="p-6">
            <h2 className="text-md font-bold text-slate-900 mb-4 border-b border-line pb-2">
              Especificaciones de Calidad y Grano
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormInput
                label="Tipo de Grano"
                placeholder="Ej: Soja, Maíz, Trigo"
                error={errors.tipo_grano?.message}
                {...register("tipo_grano")}
              />
              <FormInput
                label="Calidad del Grano"
                placeholder="Ej: Cámara, Conforme"
                error={errors.calidad_grano?.message}
                {...register("calidad_grano")}
              />
              <FormInput
                label="Humedad Máx. Permitida (%)"
                type="number"
                step="0.1"
                placeholder="Ej: 14"
                error={errors.humedad_maxima_permitida?.message}
                {...register("humedad_maxima_permitida")}
              />
              <FormInput
                label="Impurezas Máx. Permitidas (%)"
                type="number"
                step="0.1"
                placeholder="Ej: 2"
                error={errors.impurezas_maximas_permitidas?.message}
                {...register("impurezas_maximas_permitidas")}
              />
            </div>
          </Card>

          {/* Logística y RUCA */}
          <Card className="p-6">
            <h2 className="text-md font-bold text-slate-900 mb-4 border-b border-line pb-2">
              Logística y Establecimientos Oficiales (RUCA)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Matrícula Planta Procedencia RUCA"
                placeholder="Ej: Planta A-12345"
                error={errors.planta_procedencia_ruca?.message}
                {...register("planta_procedencia_ruca")}
              />
              <FormInput
                label="Matrícula Planta Destino RUCA"
                placeholder="Ej: Terminal B-67890"
                error={errors.planta_destino_ruca?.message}
                {...register("planta_destino_ruca")}
              />
            </div>
          </Card>

          {/* Comercial */}
          <Card className="p-6">
            <h2 className="text-md font-bold text-slate-900 mb-4 border-b border-line pb-2">
              Condiciones Comerciales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Cantidad Total (kg)"
                type="number"
                placeholder="Ej: 30000"
                error={errors.cantidad_total_kg?.message}
                {...register("cantidad_total_kg")}
              />
              <FormInput
                label="Precio por Kilogramo ($ ARS)"
                type="number"
                step="0.01"
                placeholder="Ej: 15.50"
                error={errors.precio_por_kg?.message}
                {...register("precio_por_kg")}
              />
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/pyme/contratos">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" loading={submitting} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Validar y Guardar Contrato
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
