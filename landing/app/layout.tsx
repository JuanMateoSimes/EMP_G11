import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LogExpress — Democratizando la logística eficiente",
  description:
    "Conectamos PyMEs con transportistas independientes. Publicá cargas en minutos, trazabilidad GPS en vivo y cobro garantizado a 15 días. Sin intermediarios abusivos."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
