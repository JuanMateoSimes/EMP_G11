"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, LogOut, Menu, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { navByRole } from "@/lib/routes";
import type { Notificacion, Role } from "@/lib/types";
import { cx, formatDate, initials, roleHome } from "@/lib/utils";
import { LoadingState, RoleBadge } from "@/components/ui";

export function AppLayout({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.rol !== role) router.replace(roleHome(user.rol));
  }, [loading, user, role, router]);

  useEffect(() => {
    if (!user || user.rol !== role) return;
    api.notificaciones
      .mine()
      .then((items) => {
        setNotifications(items);
        setUnread(items.filter((item) => !item.leida).length);
      })
      .catch(() => {
        setNotifications([]);
        setUnread(0);
      });
  }, [user, role]);

  useEffect(() => {
    if (!notificationsOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [notificationsOpen]);

  if (loading || !user || user.rol !== role) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <LoadingState label="Preparando sesion" />
      </main>
    );
  }

  const nav = navByRole[role];
  const activeIndex = getActiveNavIndex(nav, pathname, searchParams?.toString() ?? "", role);

  return (
    <main className="min-h-screen p-0 md:p-3 2xl:p-4">
      <div className="mx-auto flex min-h-screen w-full max-w-[1880px] flex-col overflow-hidden bg-white shadow-panel md:min-h-[calc(100vh-24px)] md:rounded-[18px] md:border-[5px] md:border-ink 2xl:min-h-[calc(100vh-32px)] lg:flex-row">
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
            {nav.map((item, index) => {
              const Icon = item.icon;
              const active = index === activeIndex;
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
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  className="relative rounded-md border border-line bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  onClick={() => setNotificationsOpen((value) => !value)}
                  aria-label="Notificaciones"
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="h-5 w-5" />
                  {unread > 0 ? (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 text-[10px] font-black text-ink">
                      {unread}
                    </span>
                  ) : null}
                </button>
                {notificationsOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[320px] overflow-hidden rounded-xl border border-line bg-white shadow-panel">
                    <div className="border-b border-line px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-950">Notificaciones</p>
                          <p className="text-xs text-slate-500">
                            {unread > 0 ? `${unread} sin leer` : "Todo al dia"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => void handleNotificationClick(item)}
                            className={cx(
                              "flex w-full flex-col gap-1 border-b border-line px-4 py-3 text-left transition hover:bg-slate-50",
                              !item.leida && "bg-signal/10"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-bold text-slate-950">{item.titulo}</p>
                              {!item.leida ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-signal" /> : null}
                            </div>
                            <p className="text-sm text-slate-600">{item.mensaje}</p>
                            <p className="text-xs text-slate-400">{formatDate(item.created_at)}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm font-semibold text-slate-700">Sin notificaciones</p>
                          <p className="mt-1 text-xs text-slate-500">Cuando haya novedades van a aparecer aca.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <RoleBadge value={user.rol} />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
            <div className="w-full">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );

  async function handleNotificationClick(item: Notificacion) {
    if (!item.leida) {
      try {
        await api.notificaciones.read(item.id);
        setNotifications((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, leida: true } : entry))
        );
        setUnread((current) => Math.max(0, current - 1));
      } catch {
        return;
      }
    }
  }
}

function getActiveNavIndex(
  nav: Array<{ href: string }>,
  pathname: string | null,
  currentQuery: string,
  role: Role
) {
  if (!pathname) return -1;

  const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
  let bestIndex = -1;
  let bestScore = -1;

  nav.forEach((item, index) => {
    const itemUrl = new URL(item.href, "http://localhost");
    const itemPath = itemUrl.pathname;
    const itemQuery = itemUrl.search.slice(1);
    let score = -1;

    if (currentUrl === item.href) {
      score = 4000 + item.href.length;
    } else if (pathname === itemPath && itemQuery.length === 0) {
      score = 3000 + itemPath.length;
    } else if (
      item.href !== roleHome(role) &&
      itemQuery.length === 0 &&
      pathname.startsWith(`${itemPath}/`)
    ) {
      score = 2000 + itemPath.length;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}
