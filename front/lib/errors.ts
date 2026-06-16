import { isRecord } from "@/lib/utils";

export class ApiError extends Error {
  status?: number;
  isNetwork?: boolean;

  constructor(message: string, options: { status?: number; isNetwork?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.isNetwork = options.isNetwork;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.detail === "string") return error.detail;
  return "No pudimos completar la accion.";
}
