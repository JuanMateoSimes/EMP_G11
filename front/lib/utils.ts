import type { DecimalValue, Role } from "@/lib/types";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function money(value: DecimalValue | null | undefined) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number.isFinite(number) ? number : 0);
}

export function numberValue(value: DecimalValue | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function dateInputValue(date = new Date()) {
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isoFromInput(value: string) {
  return new Date(value).toISOString();
}

export function labelize(value: string | undefined | null) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function roleHome(role: Role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "TRANSPORTISTA") return "/transportista/dashboard";
  return "/pyme/dashboard";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
