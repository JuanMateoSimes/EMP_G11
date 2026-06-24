"use client";

import { AppLayout } from "@/components/app-layout";
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
  RoleBadge,
  SectionTitle,
  StatusBadge,
} from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/hooks";
import type { EmpresaPyme, Role, Transportista, Vehiculo } from "@/lib/types";
import { labelize, numberValue } from "@/lib/utils";
import {
  Building2,
  CheckCircle,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Trophy,
  Truck,
  UserRound,
} from "lucide-react";

type ProfileData = {
  pyme?: EmpresaPyme | null;
  transportista?: Transportista | null;
  cargasEstesMes?: number;
  viagesEnTransito?: number;
  calificacionPyme?: number;
  vehiculos?: Vehiculo[];
  calificaciones?: {
    total: number;
    promedio: number;
    distribucion: Record<number, number>;
  };
  vialesCompletados?: number;
  cancelacionesEste?: number;
  estrellas?: number;
};

export function ProfilePage({ role }: { role: Role }) {
  const { user, logout } = useAuth();
  const resource = useResource<ProfileData>(async () => {
    if (role === "PYME") {
      const pyme = await api.pymes.me().catch(() => null);
      return {
        pyme,
        cargasEstesMes: 18,
        viagesEnTransito: 2,
        calificacionPyme: 4.7,
      };
    }
    if (role === "TRANSPORTISTA") {
      const transportista = await api.transportistas.me().catch(() => null);
      const vehiculos = await api.vehiculos.mine().catch(() => []);
      // TODO: Implementar endpoints en el backend para obtener calificaciones
      return {
        transportista,
        vehiculos: vehiculos.slice(0, 3),
        calificaciones: {
          total: 340,
          promedio: 4.8,
          distribucion: { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 },
        },
        vialesCompletados: 100,
        cancelacionesEste: 0,
        estrellas: 5,
        gananciasEsteMes: 400000,
      };
    }
    return {};
  }, [role]);

  return (
    <AppLayout role={role}>
      <SectionTitle title="Perfil" />
      {resource.loading ? <LoadingState /> : null}
      {resource.error ? (
        <ErrorState message={resource.error} onRetry={resource.reload} />
      ) : null}
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
                    <h2 className="text-xl font-black text-slate-950">
                      {user.nombre}
                    </h2>
                    <RoleBadge value={user.rol} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Cuenta operativa LogExpress
                  </p>
                </div>
              </div>
              <StatusBadge value={user.estado} />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Info icon={Mail} label="Email" value={user.email} />
              <Info
                icon={Phone}
                label="Telefono"
                value={user.telefono || "Sin telefono"}
              />
              <Info
                icon={ShieldCheck}
                label="Estado"
                value={labelize(user.estado)}
              />
              <Info icon={UserRound} label="Rol" value={labelize(user.rol)} />
            </div>
          </Card>

          {role === "PYME" ? (
            <PymeStatsCard
              cargasEstesMes={resource.data?.cargasEstesMes ?? 0}
              viagesEnTransito={resource.data?.viagesEnTransito ?? 0}
              calificacion={resource.data?.calificacionPyme ?? 0}
            />
          ) : (
            <Card className="p-5">
              <h2 className="font-black text-slate-950">Sesion</h2>
              <p className="mt-2 text-sm text-slate-500">
                Cierra la sesion actual y vuelve al login.
              </p>
              <Button className="mt-4 w-full" variant="dark" onClick={logout}>
                <LogOut className="h-4 w-4" /> Cerrar sesion
              </Button>
            </Card>
          )}

          {role === "PYME" ? (
            <Card className="p-5 lg:col-span-2">
              <h2 className="font-black text-slate-950">Sesion</h2>
              <p className="mt-2 text-sm text-slate-500">
                Cierra la sesion actual y vuelve al login.
              </p>
              <Button className="mt-4 w-full" variant="dark" onClick={logout}>
                <LogOut className="h-4 w-4" /> Cerrar sesion
              </Button>
            </Card>
          ) : null}

          {role === "PYME" ? (
            <PymeProfile profile={resource.data?.pyme} />
          ) : null}
          {role === "TRANSPORTISTA" ? (
            <TransportistaProfile
              profile={resource.data?.transportista}
              resource={resource}
            />
          ) : null}
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
          <Info
            icon={Building2}
            label="Razon social"
            value={profile.razon_social}
          />
          <Info icon={ShieldCheck} label="CUIT" value={profile.cuit} />
          <Info icon={Building2} label="Rubro" value={profile.rubro} />
          <Info icon={Building2} label="Direccion" value={profile.direccion} />
          <Info
            icon={Building2}
            label="Ciudad"
            value={`${profile.ciudad}, ${profile.provincia}`}
          />
          <Info
            icon={ShieldCheck}
            label="Verificación"
            value={profile.verificada ? "Verificada" : "Pendiente"}
            verified={profile.verificada}
          />
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          Todavia no hay perfil PyME cargado.
        </p>
      )}
    </Card>
  );
}

function TransportistaProfile({
  profile,
  resource,
}: {
  profile?: Transportista | null;
  resource: any;
}) {
  return (
    <>
      <Card className="p-5 lg:col-span-2">
        <h2 className="font-black text-slate-950">Datos de transportista</h2>
        {profile ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Info icon={Truck} label="Nombre" value={profile.nombre_completo} />
            <Info icon={ShieldCheck} label="DNI" value={profile.dni} />
            <Info
              icon={ShieldCheck}
              label="CUIT/CUIL"
              value={profile.cuit_cuil}
            />
            <Info icon={Truck} label="Tipo" value={labelize(profile.tipo)} />
            <Info
              icon={Building2}
              label="Base"
              value={`${profile.ciudad_base}, ${profile.provincia_base}`}
            />
            <Info
              icon={ShieldCheck}
              label="Reputacion"
              value={`${numberValue(profile.reputacion_promedio).toFixed(1)} / 5`}
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Todavia no hay perfil transportista cargado.
          </p>
        )}
      </Card>

      <TransportistaStatsCard
        vialesCompletados={resource.data?.vialesCompletados ?? 0}
        gananciasEsteMes={resource.data?.gananciasEsteMes ?? 0}
        kmRecorridos={1840}
      />

      <TransportistaCalificacionesCard
        promedio={resource.data?.calificaciones?.promedio ?? 0}
        total={resource.data?.calificaciones?.total ?? 0}
        distribucion={resource.data?.calificaciones?.distribucion ?? {}}
      />

      <TransportistaVehiculosCard vehiculos={resource.data?.vehiculos ?? []} />

      <TransportistaLogrosCard
        vialesCompletados={resource.data?.vialesCompletados ?? 0}
        cancelaciones={resource.data?.cancelacionesEste ?? 0}
        estrellas={resource.data?.estrellas ?? 0}
      />
    </>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  verified = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        verified ? "border-green-200 bg-green-50" : "border-line bg-slate-50"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-xs font-bold uppercase ${
          verified ? "text-green-600" : "text-slate-400"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <p
        className={`mt-2 break-words text-sm font-bold ${
          verified ? "text-green-900" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PymeStatsCard({
  cargasEstesMes,
  viagesEnTransito,
  calificacion,
}: {
  cargasEstesMes: number;
  viagesEnTransito: number;
  calificacion: number;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-black text-slate-950">Estadisticas</h2>
      <div className="mt-4 space-y-4">
        <StatItem label="Envios este mes" value={cargasEstesMes.toString()} />
        <StatItem label="En transito" value={viagesEnTransito.toString()} />
        <StatItem
          label="Calificacion"
          value={`${calificacion.toFixed(1)} / 5`}
          highlight
        />
      </div>
    </Card>
  );
}

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "border-yellow-300 bg-yellow-50" : "border-line bg-slate-50"
      }`}
    >
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p
        className={`mt-2 text-2xl font-black ${
          highlight ? "text-yellow-600" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TransportistaStatsCard({
  vialesCompletados,
  gananciasEsteMes,
  kmRecorridos,
}: {
  vialesCompletados: number;
  gananciasEsteMes: number;
  kmRecorridos: number;
}) {
  return (
    <Card className="p-5 lg:col-span-2">
      <h2 className="font-black text-slate-950">Estadisticas</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatItem
          label="Viajes completados"
          value={vialesCompletados.toString()}
        />
        <StatItem
          label="Ganancias este mes"
          value={`$${gananciasEsteMes.toLocaleString()}`}
        />
        <StatItem label="KM recorridos" value={`${kmRecorridos}k`} />
      </div>
    </Card>
  );
}

function TransportistaCalificacionesCard({
  promedio,
  total,
  distribucion,
}: {
  promedio: number;
  total: number;
  distribucion: Record<number, number>;
}) {
  const getPercentage = (stars: number) => {
    return total > 0 ? ((distribucion[stars] || 0) / total) * 100 : 0;
  };

  return (
    <Card className="p-5 lg:col-span-2">
      <h2 className="font-black text-slate-950">Calificaciones</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center">
          <p className="text-5xl font-black text-slate-950">
            {promedio.toFixed(1)}
          </p>
          <div className="mt-2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(promedio)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500">{total} reseñas</p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600 w-4">
                {stars}
              </span>
              <div className="h-2 flex-1 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${getPercentage(stars)}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 w-8 text-right">
                {getPercentage(stars).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TransportistaVehiculosCard({ vehiculos }: { vehiculos: Vehiculo[] }) {
  return (
    <Card className="p-5 lg:col-span-2">
      <h2 className="font-black text-slate-950">Vehiculos</h2>
      {vehiculos && vehiculos.length > 0 ? (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {vehiculos.map((vehiculo) => (
            <div
              key={vehiculo.id}
              className="flex-shrink-0 w-64 rounded-lg border border-line bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-signal p-2 text-ink">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-950">{vehiculo.patente}</p>
                  <p className="text-xs text-slate-500">
                    {labelize(vehiculo.tipo)}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    Cap. max. {numberValue(vehiculo.capacidad_kg).toFixed(0)} kg
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          No hay vehiculos registrados.
        </p>
      )}
    </Card>
  );
}

function TransportistaLogrosCard({
  vialesCompletados,
  cancelaciones,
  estrellas,
}: {
  vialesCompletados: number;
  cancelaciones: number;
  estrellas: number;
}) {
  const logros = [
    {
      icon: Trophy,
      label: "Top 10%",
      description: "Este mes",
      active: true,
    },
    {
      icon: CheckCircle,
      label: "Sin cancelaciones",
      description: "60 dias",
      active: cancelaciones === 0,
    },
    {
      icon: Star,
      label: "5 estrellas",
      description: `${vialesCompletados} reseñas`,
      active: estrellas >= 5,
    },
  ];

  return (
    <Card className="p-5 lg:col-span-2">
      <h2 className="font-black text-slate-950">Logros</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {logros.map((logro, index) => {
          const Icon = logro.icon;
          return (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                logro.active
                  ? "border-orange-200 bg-orange-50"
                  : "border-line bg-slate-50"
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  logro.active ? "text-orange-500" : "text-slate-300"
                }`}
              />
              <p
                className={`mt-2 font-bold ${
                  logro.active ? "text-orange-900" : "text-slate-500"
                }`}
              >
                {logro.label}
              </p>
              <p
                className={`text-xs ${
                  logro.active ? "text-orange-600" : "text-slate-400"
                }`}
              >
                {logro.description}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
