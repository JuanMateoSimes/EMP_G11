"use client";

import { Building2, LogOut, Mail, Phone, ShieldCheck, Truck, UserRound } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, ErrorState, LoadingState, RoleBadge, SectionTitle, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/hooks";
import type { EmpresaPyme, Role, Transportista } from "@/lib/types";
import { labelize, numberValue } from "@/lib/utils";

type ProfileData = {
  pyme?: EmpresaPyme | null;
  transportista?: Transportista | null;
};

export function ProfilePage({ role }: { role: Role }) {
  const { user, logout } = useAuth();
  const resource = useResource<ProfileData>(async () => {
    if (role === "PYME") return { pyme: await api.pymes.me().catch(() => null) };
    if (role === "TRANSPORTISTA") return { transportista: await api.transportistas.me().catch(() => null) };
    return {};
  }, [role]);

  return (
    <AppLayout role={role}>
      <SectionTitle title="Perfil" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? <ErrorState message={resource.error} onRetry={resource.reload} /> : null}
      {user ? (
        <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-signal text-ink">
                  <UserRound className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">{user.nombre}</h2>
                    <RoleBadge value={user.rol} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Cuenta operativa LogExpress</p>
                </div>
              </div>
              <StatusBadge value={user.estado} />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Info icon={Mail} label="Email" value={user.email} />
              <Info icon={Phone} label="Telefono" value={user.telefono || "Sin telefono"} />
              <Info icon={ShieldCheck} label="Estado" value={labelize(user.estado)} />
              <Info icon={UserRound} label="Rol" value={labelize(user.rol)} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-black text-slate-950">Sesion</h2>
            <p className="mt-2 text-sm text-slate-500">Cierra la sesion actual y vuelve al login.</p>
            <Button className="mt-4 w-full" variant="dark" onClick={logout}>
              <LogOut className="h-4 w-4" /> Cerrar sesion
            </Button>
          </Card>

          {role === "PYME" ? <PymeProfile profile={resource.data?.pyme} /> : null}
          {role === "TRANSPORTISTA" ? <TransportistaProfile profile={resource.data?.transportista} /> : null}
        </div>
      ) : null}
    </AppLayout>
  );
}

function PymeProfile({ profile }: { profile?: EmpresaPyme | null }) {
  return (
    <Card className="p-5 lg:col-span-2">
      <h2 className="font-black text-slate-950">Datos de empresa</h2>
      {profile ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Info icon={Building2} label="Razon social" value={profile.razon_social} />
          <Info icon={ShieldCheck} label="CUIT" value={profile.cuit} />
          <Info icon={Building2} label="Rubro" value={profile.rubro} />
          <Info icon={Building2} label="Direccion" value={profile.direccion} />
          <Info icon={Building2} label="Ciudad" value={`${profile.ciudad}, ${profile.provincia}`} />
          <Info icon={ShieldCheck} label="Verificacion" value={profile.verificada ? "Verificada" : "Pendiente"} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Todavia no hay perfil PyME cargado.</p>
      )}
    </Card>
  );
}

function TransportistaProfile({ profile }: { profile?: Transportista | null }) {
  return (
    <Card className="p-5 lg:col-span-2">
      <h2 className="font-black text-slate-950">Datos de transportista</h2>
      {profile ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Info icon={Truck} label="Nombre" value={profile.nombre_completo} />
          <Info icon={ShieldCheck} label="DNI" value={profile.dni} />
          <Info icon={ShieldCheck} label="CUIT/CUIL" value={profile.cuit_cuil} />
          <Info icon={Truck} label="Tipo" value={labelize(profile.tipo)} />
          <Info icon={Building2} label="Base" value={`${profile.ciudad_base}, ${profile.provincia_base}`} />
          <Info icon={ShieldCheck} label="Reputacion" value={`${numberValue(profile.reputacion_promedio).toFixed(1)} / 5`} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Todavia no hay perfil transportista cargado.</p>
      )}
    </Card>
  );
}

function Info({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
