import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "LogExpress MVP",
  description: "Frontend MVP para operaciones logisticas PyME y transportistas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
