import type { Role } from "@/lib/types";
import {
  Bell,
  ClipboardCheck,
  FileCheck2,
  Files,
  LayoutDashboard,
  Package,
  PackagePlus,
  Route,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

export const navByRole: Record<
  Role,
  Array<{ href: string; label: string; icon: typeof LayoutDashboard }>
> = {
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/documentos", label: "Documentos", icon: FileCheck2 },
    { href: "/admin/transportistas", label: "Verificacion", icon: ShieldCheck },
    { href: "/admin/viajes", label: "Viajes", icon: Route },
    { href: "/admin/perfil", label: "Perfil", icon: UserRound },
  ],
  PYME: [
    { href: "/pyme/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pyme/cargas", label: "Mis cargas", icon: Package },
    { href: "/pyme/cargas/nueva", label: "Publicar carga", icon: PackagePlus },
    { href: "/pyme/viajes", label: "Viajes", icon: Route },
    { href: "/pyme/viajes?tab=pagos", label: "Pagos", icon: WalletCards },
    { href: "/pyme/viajes?tab=tracking", label: "Tracking", icon: Bell },
    { href: "/pyme/perfil", label: "Perfil", icon: UserRound },
  ],
  TRANSPORTISTA: [
    {
      href: "/transportista/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/transportista/cargas-disponibles",
      label: "Cargas",
      icon: Package,
    },
    { href: "/transportista/ofertas", label: "Ofertas", icon: ClipboardCheck },
    { href: "/transportista/viajes", label: "Viajes", icon: Route },
    { href: "/transportista/vehiculos", label: "Vehiculos", icon: Truck },
    { href: "/transportista/documentos", label: "Documentos", icon: Files },
    { href: "/transportista/billetera", label: "Billetera", icon: WalletCards },
    { href: "/transportista/perfil", label: "Perfil", icon: UserRound },
  ],
};
