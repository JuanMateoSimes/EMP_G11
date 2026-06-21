"use client";

import { useState } from "react";
import {
  Truck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Coins,
  Menu,
  X,
  Building2,
  AlertTriangle,
  Star,
  MapPin,
  Shield,
  FileCheck,
  BarChart3,
  PhoneCall,
  ChevronDown
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function cx(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function Button({
  className,
  variant = "primary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "signal";
}) {
  const styles = {
    primary: "bg-navy text-white hover:bg-[#0d2949]",
    secondary: "border border-line bg-white text-navy hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    signal: "bg-signal text-ink hover:bg-amber-400 font-bold"
  };
  return (
    <button
      className={cx(
        "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-semibold transition disabled:opacity-60",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const faqs = [
  {
    q: "¿Cuánto cuesta usar LogExpress?",
    a: "El registro es gratuito. LogExpress cobra una comisión sobre cada viaje completado exitosamente. No hay costos fijos ni suscripciones mensuales."
  },
  {
    q: "¿Cómo se garantiza el pago al transportista?",
    a: "Una vez confirmada la entrega con el remito digital, el pago se procesa en hasta 15 días hábiles, directamente a la cuenta del transportista. Sin gestiones adicionales."
  },
  {
    q: "¿Qué documentación necesita un transportista para registrarse?",
    a: "Licencia de conducir, VTV vigente, seguro del vehículo y título/cédula del rodado. El proceso de validación demora menos de 24 horas hábiles."
  },
  {
    q: "¿Qué pasa si hay un problema durante el viaje?",
    a: "La plataforma registra trazabilidad GPS completa, remitos digitales y el sistema de calificación bidireccional permite resolver disputas con evidencia concreta."
  }
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-white overflow-hidden">
      {faqs.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
          >
            {item.q}
            <ChevronDown
              className={cx("h-5 w-5 shrink-0 text-slate-400 transition-transform", open === i && "rotate-180")}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal text-ink shadow-sm">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.12em] text-navy">LOGEXPRESS</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Democratizando la Logística</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#propuesta" className="transition hover:text-navy">Propuesta de Valor</a>
            <a href="#como-funciona" className="transition hover:text-navy">Cómo Funciona</a>
            <a href="#validacion" className="transition hover:text-navy">Validación</a>
            <a href="#equipo" className="transition hover:text-navy">El Equipo</a>
            <a href="#faq" className="transition hover:text-navy">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href={`${APP_URL}/login`}>
              <Button variant="secondary">Iniciar Sesión</Button>
            </a>
            <a href={`${APP_URL}/register`}>
              <Button variant="primary" className="bg-navy text-white">
                Crear Cuenta <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-line bg-white px-4 pb-6 pt-2">
            <nav className="flex flex-col gap-4 text-base font-semibold text-slate-600">
              <a href="#propuesta" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy transition">Propuesta de Valor</a>
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy transition">Cómo Funciona</a>
              <a href="#validacion" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy transition">Validación</a>
              <a href="#equipo" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy transition">El Equipo</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy transition">FAQ</a>
              <hr className="border-line my-1" />
              <div className="flex flex-col gap-2">
                <a href={`${APP_URL}/login`} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Iniciar Sesión</Button>
                </a>
                <a href={`${APP_URL}/register`} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Crear Cuenta</Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy">
              <Star className="h-3.5 w-3.5 fill-signal text-navy" /> MVP en Lanzamiento — Córdoba, Argentina
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight text-navy sm:text-5xl lg:text-6xl leading-[1.12]">
              La logística eficiente, ahora al alcance de{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative underline decoration-signal decoration-wavy decoration-4">cualquier PyME</span>
              </span>{" "}
              y transportista.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
              Conectamos empresas locales con choferes independientes eliminando intermediarios abusivos.
              Publicá cargas en minutos, trazabilidad GPS en vivo y cobro garantizado a 15 días.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a href={`${APP_URL}/register`}>
                <Button variant="primary" className="h-12 px-8 text-base bg-navy shadow-lg shadow-navy/20 hover:bg-[#0d2949] w-full sm:w-auto">
                  Soy PyME — Publicar Carga <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <a href={`${APP_URL}/register`}>
                <Button variant="secondary" className="h-12 px-8 text-base border-line bg-white text-navy hover:bg-slate-50 w-full sm:w-auto">
                  Soy Transportista — Buscar Viajes
                </Button>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-400 font-medium">
              Registro gratuito · Sin tarjeta de crédito · Validación en 24 hs
            </p>

            {/* Métricas */}
            <div className="mx-auto mt-16 max-w-4xl border-t border-line pt-12">
              <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 text-center">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Viajes Exitosos</dt>
                  <dd className="mt-2 text-3xl font-black text-navy">1.240+</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Kilómetros en Ruta</dt>
                  <dd className="mt-2 text-3xl font-black text-navy">18.4K+</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Transportistas</dt>
                  <dd className="mt-2 text-3xl font-black text-navy">50+</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Garantía de Cobro</dt>
                  <dd className="mt-2 text-3xl font-black text-emerald-600">15 Días</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* PROPUESTA DE VALOR DUAL */}
      <section id="propuesta" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy">Modelo de Valor Bidireccional</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Un puente justo entre Oferta y Demanda</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Diseñamos soluciones enfocadas directamente en los dolores que complican el transporte pesado todos los días.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* PyME */}
            <div className="rounded-2xl border border-line bg-slate-50 p-8 hover:border-navy hover:shadow-panel transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-navy">Para Empresas y PyMEs</h3>
              <p className="mt-2 text-slate-600">
                Publicá envíos rápido, controlá costos de flete, evitá el caos de WhatsApp y coordiná con choferes verificados.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: Clock, label: "Publicación en 5 minutos", desc: "Completá origen, destino y requisitos especiales en simples pasos." },
                  { icon: Coins, label: "Cotizaciones transparentes", desc: "Elegí la mejor oferta directo del transportista, sin comisionistas." },
                  { icon: MapPin, label: "Trazabilidad GPS en vivo", desc: "Alertas en tiempo real. Cero llamados de seguimiento." },
                  { icon: FileCheck, label: "Remitos digitales", desc: "Descarga inmediata. Facturación centralizada mensual." }
                ].map(({ icon: Icon, label, desc }) => (
                  <li key={label} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <span><strong>{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
              <a href={`${APP_URL}/register`} className="mt-8 inline-flex">
                <Button variant="primary">Registrarme como PyME <ArrowRight className="h-4 w-4" /></Button>
              </a>
            </div>

            {/* Transportista */}
            <div className="rounded-2xl border border-line bg-slate-50 p-8 hover:border-signal hover:shadow-panel transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal text-ink shadow-sm">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-navy">Para Transportistas Independientes</h3>
              <p className="mt-2 text-slate-600">
                Aumentá tu rentabilidad, organizá tus cobros y conseguí cargas de retorno de forma transparente.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: MapPin, label: "Cargas de retorno geolocalizadas", desc: "Reducí kilómetros vacíos sabiendo qué cargas hay cerca de tu destino." },
                  { icon: Coins, label: "Pago Garantizado a 15 días", desc: "Cobro asegurado y centralizado, sin vueltas administrativas." },
                  { icon: Shield, label: "Onboarding y validación ágil", desc: "Subí seguro, VTV y licencia. Trabajá de forma validada y segura." },
                  { icon: TrendingUp, label: "Calificación bidireccional", desc: "Tu buena conducta operativa se traduce en prioridad para mejores viajes." }
                ].map(({ icon: Icon, label, desc }) => (
                  <li key={label} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <span><strong>{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
              <a href={`${APP_URL}/register`} className="mt-8 inline-flex">
                <Button variant="secondary">Registrarme como Transportista <ArrowRight className="h-4 w-4" /></Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 bg-mist">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy">Paso a Paso</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Cómo funciona LogExpress</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Automatizamos todo el ciclo operativo: desde la publicación hasta el cobro final.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {[
              {
                n: 1,
                title: "PyME Publica la Carga",
                desc: "Completá origen, destino, tipo de carga y requisitos especiales. Disponible en el mercado en menos de 5 minutos."
              },
              {
                n: 2,
                title: "Transportista Oferta",
                desc: "Los choferes disponibles en la zona ven el viaje geolocalizado y ofertán su precio o aceptan la tarifa de referencia."
              },
              {
                n: 3,
                title: "Ejecución y Tracking",
                desc: "Validación de patentes y seguros, asignación del viaje y seguimiento GPS en tiempo real hasta el destino."
              },
              {
                n: 4,
                title: "Cierre y Cobro",
                desc: "Se sube el remito conformado digital. El chofer recibe su pago garantizado. Ambos usuarios se califican."
              }
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative bg-white rounded-xl border border-line p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white text-sm font-black shadow mb-4">
                  {n}
                </div>
                <h4 className="text-base font-bold text-navy">{title}</h4>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES HIGHLIGHT */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy">Tecnología que marca la diferencia</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Construido para operaciones reales</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                color: "bg-blue-50 text-blue-700",
                title: "GPS Optimizado para el Campo",
                desc: "Tracking en tiempo real diseñado para consumir el mínimo de batería y datos móviles. Funciona incluso con señal limitada en rutas rurales."
              },
              {
                icon: Shield,
                color: "bg-emerald-50 text-emerald-700",
                title: "Semáforo de Patentes",
                desc: "Validación automática de documentación del transportista: seguro, VTV, licencia y habilitación. Verde para operar, rojo para bloquear."
              },
              {
                icon: BarChart3,
                color: "bg-signal/20 text-navy",
                title: "Cargas Triangulares",
                desc: "Sistema inteligente de matching que conecta cargas de retorno con la posición actual del camión, reduciendo viajes vacíos y aumentando la rentabilidad."
              }
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="rounded-xl border border-line p-6 hover:shadow-panel transition">
                <div className={cx("w-12 h-12 rounded-xl flex items-center justify-center mb-4", color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALIDACIÓN DE CAMPO */}
      <section id="validacion" className="py-20 bg-navy">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-signal">Datos e Investigación de Campo</h2>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">Validamos con clientes reales en Córdoba</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Entrevistamos cara a cara a fleteros y dadores de carga en la Provincia de Córdoba. Cada feature nació de un dolor comprobado.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                stat: "78%",
                title: "Cuellos de Botella Operativos",
                desc: "Los transportistas pierden más de 1:30 hs por carga coordinando por WhatsApp, llamadas informales y planillas manuales.",
                solution: "Solución: Publicación y asignación en minutos"
              },
              {
                stat: "20%",
                title: "Viajes con Retorno Vacío",
                desc: "Los camiones regresan vacíos o con carga parcial por falta de red. Representa un golpe directo a la rentabilidad del fletero.",
                solution: "Solución: Matching de cargas triangulares"
              },
              {
                stat: "100%",
                title: "Demanda de Formalización",
                desc: "Tanto dadores como fleteros exigen seguridad jurídica, validación documental y reputación verificada para evitar fraudes.",
                solution: "Solución: Semáforo de patentes y calificación"
              }
            ].map(({ stat, title, desc, solution }) => (
              <div key={title} className="rounded-xl bg-white/10 border border-white/10 p-6">
                <div className="text-4xl font-black text-signal">{stat}</div>
                <h4 className="mt-3 text-lg font-bold text-white">{title}</h4>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{desc}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/40 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {solution}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl bg-white/5 border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-signal p-3 text-ink shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  &ldquo;¿La mayoría de los transportistas se preocupa por el consumo de batería y datos?&rdquo;
                </h4>
                <p className="text-sm text-slate-300 max-w-xl mt-1">
                  Detectamos este dolor en nuestras entrevistas. Por eso, el tracking GPS de LogExpress consume el mínimo posible de batería y datos móviles del chofer.
                </p>
              </div>
            </div>
            <a href={`${APP_URL}/register`} className="shrink-0 w-full md:w-auto">
              <Button variant="signal" className="w-full">
                Comenzá Gratis Ahora
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* MODELO DE NEGOCIO */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy">Modelo de Negocio</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Simple, justo y alineado con tu éxito</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              LogExpress solo gana cuando vos ganás. Sin costos fijos, sin sorpresas.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                label: "Para PyMEs",
                price: "Gratis",
                note: "para publicar cargas",
                features: ["Publicación ilimitada de cargas", "Acceso al pool de transportistas verificados", "Trazabilidad GPS incluida", "Remitos digitales"],
                cta: "Empezar gratis",
                href: `${APP_URL}/register`,
                highlight: false
              },
              {
                label: "Comisión por Viaje",
                price: "~5%",
                note: "por viaje completado",
                features: ["Solo pagás cuando el viaje termina exitosamente", "Cobro automático al cierre del viaje", "Sin contratos anuales ni mínimos", "Facturación mensual consolidada"],
                cta: "Ver cómo funciona",
                href: "#como-funciona",
                highlight: true
              },
              {
                label: "Para Transportistas",
                price: "Gratis",
                note: "registro y validación",
                features: ["Acceso a todas las cargas publicadas", "Perfil verificado (genera confianza)", "Gestión de documentos incluida", "Pago garantizado a 15 días"],
                cta: "Registrarme",
                href: `${APP_URL}/register`,
                highlight: false
              }
            ].map(({ label, price, note, features, cta, href, highlight }) => (
              <div
                key={label}
                className={cx(
                  "rounded-2xl border p-8 flex flex-col",
                  highlight
                    ? "border-navy bg-navy text-white shadow-panel"
                    : "border-line bg-slate-50"
                )}
              >
                <p className={cx("text-xs font-bold uppercase tracking-widest", highlight ? "text-signal" : "text-navy")}>{label}</p>
                <div className="mt-4">
                  <span className={cx("text-4xl font-black", highlight ? "text-white" : "text-slate-950")}>{price}</span>
                  <span className={cx("ml-2 text-sm", highlight ? "text-slate-300" : "text-slate-500")}>{note}</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={cx("h-4 w-4 mt-0.5 shrink-0", highlight ? "text-signal" : "text-emerald-500")} />
                      <span className={highlight ? "text-slate-200" : "text-slate-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={href} className="mt-8">
                  <Button
                    variant={highlight ? "signal" : "secondary"}
                    className="w-full"
                  >
                    {cta}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="py-20 bg-slate-50 border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy">Equipo de Ingeniería</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Creadores de LogExpress</p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Estudiantes de Ingeniería en Sistemas de Información (UTN-FRC) apasionados por resolver problemas logísticos con software robusto.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              { name: "Piero", role: "Desarrollo" },
              { name: "Octavio", role: "DevOps" },
              { name: "Federico", role: "Desarrollo" },
              { name: "Eliseo", role: "Diseño y Arquitectura" },
              { name: "Bruno", role: "Administrador de Datos" },
              { name: "Ignacio", role: "Desarrollo Frontend" },
              { name: "Jonatan", role: "Desarrollo" },
              { name: "Juan Mateo", role: "Desarrollo" },
              { name: "Maxi", role: "UX/UI & Desarrollo" },
              { name: "Juan Cruz", role: "Métricas e Inteligencia" },
              { name: "Agostina", role: "Testing y QA" }
            ].map(({ name, role }) => (
              <div
                key={name}
                className="bg-white border border-line rounded-xl px-5 py-3 text-center shadow-sm"
              >
                <p className="text-sm font-black text-navy">{name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{role}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Trabajo Práctico Emprendimientos Tecnológicos · UTN-FRC · Grupo 11
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy">Preguntas Frecuentes</h2>
            <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Dudas que ya nos hicieron</p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-navy to-[#0d2949]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            ¿Listo para operar como una gran empresa?
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto">
            Creá tu cuenta gratis en minutos y comenzá a publicar cargas o conseguir viajes hoy mismo.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a href={`${APP_URL}/register`}>
              <Button variant="signal" className="h-12 px-8 text-base w-full sm:w-auto">
                Crear Cuenta Gratis <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
            <a href={`${APP_URL}/login`}>
              <Button variant="ghost" className="h-12 px-8 text-base text-white hover:bg-white/10 w-full sm:w-auto">
                Ya tengo cuenta → Ingresar
              </Button>
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <PhoneCall className="h-4 w-4" />
            <span>¿Tenés dudas? Escribinos y te respondemos en el día.</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink py-12 text-slate-400 border-t border-slate-800">
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
              <a href="#como-funciona" className="hover:text-white transition">Cómo Funciona</a>
              <a href="#validacion" className="hover:text-white transition">Validación</a>
              <a href="#equipo" className="hover:text-white transition">Equipo</a>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <a href={`${APP_URL}/login`} className="hover:text-white transition">Ingresar</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} LogExpress. Proyecto Académico UTN-FRC · Grupo 11.</p>
            <p>Emprendimientos Tecnológicos · 5.º año · Ingeniería en Sistemas de Información.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
