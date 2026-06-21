"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Coins, 
  Users, 
  Menu, 
  X, 
  Building2, 
  AlertTriangle,
  Loader2,
  Lock,
  Star
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { roleHome } from "@/lib/utils";

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal text-ink shadow-sm">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.12em] text-navy">LOGEXPRESS</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Democratizando la Logística</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#propuesta" className="transition hover:text-navy">Propuesta de Valor</a>
            <a href="#experimento" className="transition hover:text-navy">Por Qué LogExpress</a>
            <a href="#flujo" className="transition hover:text-navy">Cómo Funciona</a>
            <a href="#equipo" className="transition hover:text-navy">El Equipo</a>
          </nav>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium hidden lg:inline">
                  Conectado como <strong className="text-slate-700">{user.nombre}</strong>
                </span>
                <Link href={roleHome(user.rol)}>
                  <Button variant="primary">Ir a mi Panel</Button>
                </Link>
                <Button variant="ghost" onClick={logout} className="text-xs">
                  Salir
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="bg-navy text-white hover:bg-[#0d2949]">
                    Crear Cuenta <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-line bg-white px-4 pb-6 pt-2">
            <nav className="flex flex-col gap-4 text-base font-semibold text-slate-600">
              <a 
                href="#propuesta" 
                onClick={() => setMobileMenuOpen(false)} 
                className="transition hover:text-navy"
              >
                Propuesta de Valor
              </a>
              <a 
                href="#experimento" 
                onClick={() => setMobileMenuOpen(false)} 
                className="transition hover:text-navy"
              >
                Por Qué LogExpress
              </a>
              <a 
                href="#flujo" 
                onClick={() => setMobileMenuOpen(false)} 
                className="transition hover:text-navy"
              >
                Cómo Funciona
              </a>
              <a 
                href="#equipo" 
                onClick={() => setMobileMenuOpen(false)} 
                className="transition hover:text-navy"
              >
                El Equipo
              </a>
              <hr className="border-line my-1" />
              {loading ? (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-500 text-center">
                    Sesión iniciada como <strong className="text-slate-700">{user.nombre}</strong>
                  </p>
                  <Link href={roleHome(user.rol)} onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" className="w-full">Ir a mi Panel</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full">
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="secondary" className="w-full">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" className="w-full">Crear Cuenta</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Tagline */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy">
              <Star className="h-3.5 w-3.5 fill-signal text-navy" /> MVP Lanzamiento Exclusivo
            </span>

            {/* Massive Transformative Purpose (MTP) */}
            <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-black tracking-tight text-navy sm:text-5xl lg:text-6xl leading-[1.15]">
              DEMOCRATIZAR la logística eficiente para que cualquier transportista o negocio opere como una <span className="bg-gradient-to-r from-navy via-navy to-navy bg-clip-text text-transparent underline decoration-signal decoration-wavy decoration-3">GRAN EMPRESA</span>.
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              Coordinación transparente y directa. Conectamos a PyMEs locales con choferes independientes eliminando intermediarios abusivos. Asegurá cargas de retorno, trazabilidad GPS y cobro garantizado.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              {loading ? (
                <div className="h-12 w-48 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-navy" />
                </div>
              ) : user ? (
                <Link href={roleHome(user.rol)}>
                  <Button variant="primary" className="h-12 px-8 text-base bg-navy shadow-lg shadow-navy/20 hover:bg-[#0d2949]">
                    Ingresar al Panel Operativo <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button variant="primary" className="h-12 px-8 text-base bg-navy shadow-lg shadow-navy/20 hover:bg-[#0d2949] w-full sm:w-auto">
                      Soy PyME (Publicar Carga)
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="secondary" className="h-12 px-8 text-base border-line bg-white text-navy hover:bg-slate-50 w-full sm:w-auto">
                      Soy Transportista (Buscar Viajes)
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics of the Platform */}
            <div className="mx-auto mt-16 max-w-4xl border-t border-line pt-12">
              <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 text-center">
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500">Viajes Exitosos</dt>
                  <dd className="mt-1 text-3xl font-black text-navy">1.240+</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500">Kilómetros en Ruta</dt>
                  <dd className="mt-1 text-3xl font-black text-navy">18.4K+</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500">Transportistas</dt>
                  <dd className="mt-1 text-3xl font-black text-navy">50+</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500">Garantía de Cobro</dt>
                  <dd className="mt-1 text-3xl font-black text-emerald-600">15 Días</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPUESTA DE VALOR DUAL */}
      <section id="propuesta" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-widest text-navy">Modelo de Valor Bidireccional</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Un puente justo entre Oferta y Demanda</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Diseñamos soluciones enfocadas directamente en mitigar los dolores que complican el transporte pesado todos los días.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* PyME Proposition */}
            <div className="rounded-2xl border border-line bg-slate-50 p-8 hover:border-navy hover:shadow-panel transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-navy">Para Empresas y PyMEs</h3>
              <p className="mt-2 text-slate-600">
                Lanzá envíos rápidos, controlá costos de flete, evitá planillas manuales de WhatsApp y coordiná con choferes de confianza.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Publicación en 5 minutos:</strong> Completá origen, destino y requisitos especiales en simples pasos.</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Cotizaciones transparentes:</strong> Elegí la mejor oferta directamente del transportista independiente.</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Trazabilidad GPS en vivo:</strong> Recibí alertas en tiempo real y evitá llamados constantes de seguimiento.</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Descarga de remitos digitales:</strong> Olvidate de los remitos de papel perdidos. Facturación centralizada mensual.</span>
                </li>
              </ul>
            </div>

            {/* Transportista Proposition */}
            <div className="rounded-2xl border border-line bg-slate-50 p-8 hover:border-signal hover:shadow-panel transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal text-ink shadow-sm">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-navy">Para Transportistas Independientes</h3>
              <p className="mt-2 text-slate-600">
                Aumentá tu rentabilidad, organizá tus cobros y conseguí cargas para tus tramos de regreso de manera transparente.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Cargas de retorno geolocalizadas:</strong> Reducí los kilómetros vacíos sabiendo qué cargas hay cerca de tu destino.</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Pago Garantizado a 15 días:</strong> Garantía de cobro asegurada y centralizada sin vueltas administrativas.</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Onboarding y validación ágil:</strong> Subí tu seguro, VTV y licencia de conducir. Trabajá de forma validada y segura.</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <span><strong>Calificación bidireccional:</strong> Hacé valer tu buena conducta operativa y sumá prioridad para mejores viajes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL VALIDATED PROBLEM/SOLUTION METRICS (FROM THE PDF!) */}
      <section id="experimento" className="py-20 bg-mist">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-widest text-navy">Datos e Investigación de Campo</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Validamos con Clientes Reales</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Hablamos cara a cara con decenas de fleteros y dadores de carga en la Provincia de Córdoba. Diseñamos en base a dolores reales comprobados técnicamente:
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Metric 1 */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <div className="text-4xl font-black text-navy">78%</div>
              <h4 className="mt-3 text-lg font-bold text-slate-900">Cuellos de Botella Operativos</h4>
              <p className="mt-2 text-sm text-slate-600">
                Los transportistas reconocen cuellos de botella severos debido a la coordinación manual por WhatsApp, llamadas informales y planillas, perdiendo más de 1:30 horas por carga.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <CheckCircle2 className="h-3.5 w-3.5" /> Solución LogExpress: Publicación en minutos
              </div>
            </div>

            {/* Metric 2 */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <div className="text-4xl font-black text-navy">20%</div>
              <h4 className="mt-3 text-lg font-bold text-slate-900">Viajes con Retorno Vacío</h4>
              <p className="mt-2 text-sm text-slate-600">
                Los camiones regresan vacíos o con carga parcial significativamente baja por falta de red. Representa un golpe durísimo para la rentabilidad de las PyMEs y fleteros.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <CheckCircle2 className="h-3.5 w-3.5" /> Solución LogExpress: Cargas triangulares
              </div>
            </div>

            {/* Metric 3 */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <div className="text-4xl font-black text-navy">100%</div>
              <h4 className="mt-3 text-lg font-bold text-slate-900">Demanda de Formalización</h4>
              <p className="mt-2 text-sm text-slate-600">
                Tanto dadores de carga como fleteros exigen seguridad jurídica, seguros vigentes, validación documental de patentes y sistemas de reputación para evitar fraudes y robos.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <CheckCircle2 className="h-3.5 w-3.5" /> Solución LogExpress: Semáforo de patentes
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-xl bg-navy p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-signal p-3 text-ink hidden sm:block">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold">"¿La mayoría de los transportistas se preocupa por el consumo de batería y datos?"</h4>
                <p className="text-sm text-slate-300 max-w-xl mt-1">
                  En nuestras entrevistas detectamos este dolor. Por eso, optimizamos el seguimiento GPS para consumir el mínimo de batería posible y no ahogar el plan de datos móvil del chofer.
                </p>
              </div>
            </div>
            <Link href="/register" className="shrink-0 w-full md:w-auto">
              <Button variant="primary" className="bg-signal text-ink hover:bg-amber-400 w-full font-bold">
                Comenzá Gratis Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CÓMO FUNCIONA / FLUJO */}
      <section id="flujo" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-widest text-navy">Paso a Paso</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Cómo funciona el flujo de LogExpress</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Automatizamos todo el ciclo operativo de flete, desde la publicación del envío hasta el cobro final.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white text-lg font-black shadow">
                1
              </div>
              <h4 className="mt-4 text-lg font-bold text-navy">Empresa Publica</h4>
              <p className="mt-2 text-sm text-slate-600">
                La PyME publica los detalles de la carga, requerimientos especiales (rampa, furgón térmico, seguro extendido) y destino.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white text-lg font-black shadow">
                2
              </div>
              <h4 className="mt-4 text-lg font-bold text-navy">Chofer Oferta</h4>
              <p className="mt-2 text-sm text-slate-600">
                Los transportistas disponibles en la zona ven el viaje geolocalizado, ofertan su precio o aceptan la tarifa de referencia.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white text-lg font-black shadow">
                3
              </div>
              <h4 className="mt-4 text-lg font-bold text-navy">Ejecución del Viaje</h4>
              <p className="mt-2 text-sm text-slate-600">
                Se asigna el viaje tras validar patentes y seguros del chofer. Se realiza el tracking en tiempo real hasta el destino.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white text-lg font-black shadow">
                4
              </div>
              <h4 className="mt-4 text-lg font-bold text-navy">Cierre y Calificación</h4>
              <p className="mt-2 text-sm text-slate-600">
                Al entregar, se sube el remito conformado digital. El chofer recibe su pago asegurado y ambos usuarios se califican.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TEAM / EQUIPO */}
      <section id="equipo" className="py-20 bg-slate-50 border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-widest text-navy">Equipo de Ingeniería</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Creadores de LogExpress</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Estudiantes de Ingeniería en Sistemas de Información (UTN) apasionados por resolver problemas logísticos mediante software robusto.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4 text-center max-w-4xl mx-auto">
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Piero | Desarrollo</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Octavio | DevOps</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Federico | Desarrollo</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Eliseo | Diseño y Arquitectura</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Bruno | Administrador de Datos</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Ignacio | Desarrollo Frontend</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Jonatan | Desarrollo</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Juan Mateo | Desarrollo</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Maxi | UX/UI & Desarrollo</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Juan Cruz | Métricas e Inteligencia</span>
            <span className="bg-white border border-line rounded-lg px-4 py-2 text-sm font-bold text-navy shadow-sm">Agostina | Testing y QA</span>
          </div>

          <div className="mt-16 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Trabajo Práctico Emprendimientos Tecnológicos • Grupo 11
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-navy py-12 text-slate-400 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded bg-signal text-ink shadow-sm">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-base font-black tracking-widest text-white">LOGEXPRESS</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#propuesta" className="hover:text-white transition">Propuesta</a>
              <a href="#experimento" className="hover:text-white transition">Estudio</a>
              <a href="#flujo" className="hover:text-white transition">Flujo</a>
              <a href="#equipo" className="hover:text-white transition">Equipo</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} LogExpress. Todos los derechos reservados. Proyecto Académico UTN-FRC.</p>
            <p>Hecho con amor y arquitectura sólida por el Grupo 11.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
