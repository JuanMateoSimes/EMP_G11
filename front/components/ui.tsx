"use client";

import { forwardRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { cx, labelize } from "@/lib/utils";
import type { CargaEstado, DocumentoEstado, Role, VehiculoEstado, ViajeEstado } from "@/lib/types";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";

export function Button({
  className,
  variant = "primary",
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-navy text-white hover:bg-[#0d2949]",
    secondary: "border border-line bg-white text-navy hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    dark: "bg-ink text-white hover:bg-black"
  };
  return (
    <button
      className={cx(
        "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-lg border border-line bg-white shadow-sm", className)} {...props} />;
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold tracking-normal text-slate-950">{title}</h1>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
          {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-md bg-signal/30 p-2 text-navy">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

const statusStyles: Record<string, string> = {
  PUBLICADA: "bg-blue-50 text-blue-700 border-blue-200",
  CON_OFERTAS: "bg-amber-50 text-amber-700 border-amber-200",
  ASIGNADA: "bg-indigo-50 text-indigo-700 border-indigo-200",
  EN_CURSO: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ENTREGADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELADA: "bg-rose-50 text-rose-700 border-rose-200",
  ASIGNADO: "bg-indigo-50 text-indigo-700 border-indigo-200",
  EN_CAMINO_RETIRO: "bg-blue-50 text-blue-700 border-blue-200",
  CARGA_RETIRADA: "bg-violet-50 text-violet-700 border-violet-200",
  EN_TRANSITO: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ENTREGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  APROBADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RECHAZADO: "bg-rose-50 text-rose-700 border-rose-200",
  VENCIDO: "bg-slate-100 text-slate-600 border-slate-200",
  ACTIVO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDIENTE_VERIFICACION: "bg-amber-50 text-amber-700 border-amber-200",
  INACTIVO: "bg-slate-100 text-slate-600 border-slate-200",
  ACEPTADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RECHAZADA: "bg-rose-50 text-rose-700 border-rose-200"
};

export function StatusBadge({ value }: { value: CargaEstado | ViajeEstado | VehiculoEstado | DocumentoEstado | string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        statusStyles[value] ?? "border-slate-200 bg-slate-100 text-slate-600"
      )}
    >
      {labelize(value)}
    </span>
  );
}

export function DocumentStatusBadge({ value }: { value: DocumentoEstado }) {
  return <StatusBadge value={value} />;
}

export function RoleBadge({ value }: { value: Role }) {
  const styles: Record<Role, string> = {
    ADMIN: "bg-slate-950 text-white",
    PYME: "bg-blue-50 text-blue-700",
    TRANSPORTISTA: "bg-signal text-slate-950"
  };
  return <span className={cx("rounded-full px-2.5 py-1 text-xs font-bold", styles[value])}>{labelize(value)}</span>;
}

export function EmptyState({
  title,
  text,
  action
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-3 rounded-md bg-slate-100 p-3 text-slate-500">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="font-bold text-slate-950">{title}</h2>
      {text ? <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

export function LoadingState({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-line bg-white">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-navy" />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-rose-200 bg-rose-50 p-4 text-rose-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <p className="text-sm font-semibold">{message}</p>
        </div>
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export function SuccessMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
      <span className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
      {onClose ? (
        <button onClick={onClose} className="rounded-md p-1 hover:bg-emerald-100" aria-label="Cerrar">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export const FormInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function FormInput({ label, error, className, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        ref={ref}
        className={cx(
          "min-h-[42px] w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/10",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
});

export const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }
>(function FormTextarea({ label, error, className, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        ref={ref}
        className={cx(
          "min-h-[104px] w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/10",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
});

export const FormSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    error?: string;
    options: Array<{ label: string; value: string | number }>;
  }
>(function FormSelect({ label, error, options, className, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        ref={ref}
        className={cx(
          "min-h-[42px] w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
});

export const CheckboxField = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(
  function CheckboxField({ label, ...props }, ref) {
  return (
    <label className="flex min-h-[42px] items-center gap-3 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-700">
      <input ref={ref} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-navy" {...props} />
      {label}
    </label>
  );
  }
);

export function DataTable<T>({
  rows,
  columns
}: {
  rows: T[];
  columns: Array<{ key: string; header: string; render: (row: T) => React.ReactNode }>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-bold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ConfirmDialog({
  title,
  confirmLabel,
  onConfirm,
  children,
  danger
}: {
  title: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <Card className="w-full max-w-md p-5 shadow-panel">
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">La accion se enviara a la API y actualizara la pantalla.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant={danger ? "danger" : "primary"} loading={loading} onClick={confirm}>
                {confirmLabel}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
