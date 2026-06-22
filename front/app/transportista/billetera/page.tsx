"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, SectionTitle } from "@/components/ui";
import type { Role } from "@/lib/types";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    DollarSign,
    TrendingUp,
} from "lucide-react";

export default function BilleteraPage() {
  const role: Role = "TRANSPORTISTA";

  return (
    <AppLayout role={role}>
      <SectionTitle title="Mi Billetera" />

      <div className="space-y-6">
        {/* Balance Section */}
        <BalanceCard />

        {/* Stats Cards */}
        <StatsGrid />

        {/* Liquidaciones Section */}
        <LiquidacionesCard />

        {/* Ganancias Diarias Section */}
        <GananciasDiariasCard />

        {/* Viajes Completados Section */}
        <VialesCompletadosCard />

        {/* Próximo Pago Section */}
        <ProximoPagoCard />
      </div>
    </AppLayout>
  );
}

function BalanceCard() {
  return (
    <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 text-white lg:col-span-2">
      <p className="text-sm font-semibold text-emerald-100">Balance</p>
      <h2 className="mt-1 text-3xl font-black">Mi Billetera</h2>

      <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
        <p className="text-sm font-semibold text-emerald-100">Esta semana</p>
        <p className="mt-2 text-4xl font-black">$292.500</p>
        <div className="mt-3 flex items-center gap-1 text-sm font-bold text-emerald-200">
          <TrendingUp className="h-4 w-4" />
          +12% vs semana anterior
        </div>
      </div>
    </Card>
  );
}

function StatsGrid() {
  const stats = [
    {
      icon: CheckCircle,
      label: "Viajes",
      value: "4",
    },
    {
      icon: DollarSign,
      label: "Promedio",
      value: "$73.1k",
    },
    {
      icon: Calendar,
      label: "Activo",
      value: "24h",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-black text-slate-950">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function LiquidacionesCard() {
  const liquidaciones = [
    {
      id: "ENV-2023-ENV-2022",
      viajes: 2,
      fecha: "16 Abr",
      monto: "$12,700",
      estado: "En proceso",
      statusColor: "bg-yellow-50 border-yellow-200",
      statusText: "text-yellow-700",
      vencimiento: "Vie 10 Mayo, 2026",
      dias: "3 dias",
      diasColor: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "ENV-2021",
      viajes: 1,
      fecha: "15 Abr",
      monto: "$9,800",
      estado: "Verificado",
      statusColor: "bg-emerald-50 border-emerald-200",
      statusText: "text-emerald-700",
      vencimiento: "Lun 13 Mayo, 2026",
      dias: "6 dias",
      diasColor: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black text-slate-950">Liquidaciones</h2>
        <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
          <AlertCircle className="h-3 w-3" />2 pendientes
        </div>
      </div>

      <div className="space-y-4">
        {liquidaciones.map((liq) => (
          <div
            key={liq.id}
            className={`rounded-lg border p-4 ${liq.statusColor}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-950">{liq.id}</p>
                  <p className="text-xs text-slate-500">
                    {liq.viajes} viaje{liq.viajes > 1 ? "s" : ""} · {liq.fecha}
                  </p>
                </div>
                <div className="mt-3 rounded-lg bg-white/60 p-3">
                  <p className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{liq.vencimiento}</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-1 text-xs font-bold ${liq.diasColor}`}
                    >
                      {liq.dias}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-950">
                  {liq.monto}
                </p>
                <p className={`mt-1 text-xs font-bold ${liq.statusText}`}>
                  {liq.estado}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GananciasDiariasCard() {
  const dias = ["L", "M", "X", "J", "V", "S", "D"];
  const valores = [65, 70, 62, 68, 85, 58, 50];
  const maxValor = Math.max(...valores);

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black text-slate-950">Ganancias Diarias</h2>
        <button className="text-sm font-bold text-slate-500 hover:text-slate-700">
          📅
        </button>
      </div>

      <div
        className="mt-6 flex items-end justify-center gap-3"
        style={{ height: "120px" }}
      >
        {valores.map((valor, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className={`w-6 rounded-t-lg transition-colors ${
                index === 4 ? "bg-signal" : "bg-emerald-300"
              }`}
              style={{ height: `${(valor / maxValor) * 100}px` }}
            />
            <span className="text-xs font-bold text-slate-500">
              {dias[index]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs font-bold text-slate-500">
        Semana actual | Pico: $72,500 (Vie)
      </p>
    </Card>
  );
}

function VialesCompletadosCard() {
  const viajes = [
    {
      ruta: "CABA → Vic. López",
      fecha: "16 Abr",
      hora: "14:20",
      km: "12 km",
      monto: "$8,500",
    },
    {
      ruta: "Retiro → San Isidro",
      fecha: "16 Abr",
      hora: "10:15",
      km: "8 km",
      monto: "$4,200",
    },
    {
      ruta: "Palermo → Olivos",
      fecha: "15 Abr",
      hora: "16:45",
      km: "15 km",
      monto: "$9,800",
    },
    {
      ruta: "CABA → Belgrano",
      fecha: "15 Abr",
      hora: "11:30",
      km: "7 km",
      monto: "$6,300",
    },
  ];

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black text-slate-950">Viajes Completados</h2>
        <button className="text-sm font-bold text-signal hover:text-emerald-700">
          Ver todos
        </button>
      </div>

      <div className="space-y-3">
        {viajes.map((viaje, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-line bg-slate-50 p-4 hover:bg-slate-100 transition"
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-950">{viaje.ruta}</p>
                <p className="text-xs text-slate-500">
                  {viaje.fecha} · {viaje.hora} · {viaje.km}
                </p>
              </div>
            </div>
            <p className="font-black text-emerald-600">{viaje.monto}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProximoPagoCard() {
  return (
    <Card className="p-5 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal text-white">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Próximo Pago
            </p>
            <p className="mt-1 font-bold text-slate-950">Viernes 18 de abril</p>
          </div>
        </div>
        <button className="text-sm font-bold text-signal hover:text-emerald-700">
          Configurar →
        </button>
      </div>
    </Card>
  );
}
