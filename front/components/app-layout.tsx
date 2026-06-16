"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { navByRole } from "@/lib/routes";
import type { Role } from "@/lib/types";
import { cx, initials, roleHome } from "@/lib/utils";
import { LoadingState, RoleBadge } from "@/components/ui";

export function AppLayout({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.rol !== role) router.replace(roleHome(user.rol));
  }, [loading, user, role, router]);

  useEffect(() => {
    if (!user || user.rol !== role) return;
    api.notificaciones
      .mine()
      .then((items) => setUnread(items.filter((item) => !item.leida).length))
      .catch(() => setUnread(0));
  }, [user, role]);

  if (loading || !user || user.rol !== role) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <LoadingState label="Preparando sesion" />
      </main>
    );
  }

  const nav = navByRole[role];

  return (
    <main className="min-h-screen p-0 md:p-6">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col overflow-hidden bg-white shadow-panel md:min-h-[calc(100vh-48px)] md:rounded-[22px] md:border-[7px] md:border-ink lg:flex-row">
        <aside
          className={cx(
            "bg-ink text-white lg:flex lg:w-[220px] lg:flex-col",
            mobileOpen ? "block" : "hidden lg:flex"
          )}
        >
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal text-ink">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.18em]">LOGEXPRESS</p>
              <p className="text-xs text-white/55">Logistica</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== roleHome(role) && pathname?.startsWith(item.href));
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cx(
                    "flex min-h-[42px] items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white",
                    active && "bg-white/10 text-signal"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-white/8 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-sm font-black text-ink">
                {initials(user.nombre)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.nombre}</p>
                <p className="truncate text-xs text-white/50">{user.email}</p>
              </div>
              <button
                className="rounded-md p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                onClick={logout}
                aria-label="Salir"
                title="Salir"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-mist">
          <header className="flex min-h-[72px] items-center justify-between gap-3 border-b border-line bg-white px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border border-line p-2 text-navy lg:hidden"
                onClick={() => setMobileOpen((value) => !value)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-slate-400">Operacion</p>
                <p className="text-lg font-black text-slate-950">Panel LogExpress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative rounded-md border border-line bg-white p-2 text-slate-600">
                <Bell className="h-5 w-5" />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 text-[10px] font-black text-ink">
                    {unread}
                  </span>
                ) : null}
              </div>
              <RoleBadge value={user.rol} />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-[1180px]">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
