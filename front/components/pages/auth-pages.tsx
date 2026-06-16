"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, Truck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPreview } from "@/components/domain";
import { Button, Card, FormInput, FormSelect } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { roleHome } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Minimo 6 caracteres")
});

const registerSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Email invalido"),
  telefono: z.string().optional(),
  password: z.string().min(6, "Minimo 6 caracteres"),
  rol: z.enum(["PYME", "TRANSPORTISTA"])
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    if (!loading && user) router.replace(roleHome(user.rol));
  }, [loading, user, router]);

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    setError(null);
    try {
      const loggedUser = await login(values);
      router.replace(roleHome(loggedUser.rol));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function demo(email: string, password: string) {
    form.setValue("email", email);
    form.setValue("password", password);
    await onSubmit({ email, password });
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md p-6 shadow-panel">
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-signal text-ink">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Ingresar a LogExpress</h1>
          <p className="mt-1 text-sm text-slate-500">Operaciones, ofertas y tracking en un solo panel.</p>
        </div>
        {error ? <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput
            label="Email"
            type="email"
            placeholder="pyme1@logexpress.com"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="******"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Entrar <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="secondary" onClick={() => demo("pyme1@logexpress.com", "Pyme123!")}>
            PyME
          </Button>
          <Button type="button" variant="secondary" onClick={() => demo("transportista1@logexpress.com", "Trans123!")}>
            Chofer
          </Button>
          <Button type="button" variant="secondary" onClick={() => demo("admin@logexpress.com", "Admin123!")}>
            Admin
          </Button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          No tenes cuenta?{" "}
          <Link href="/register" className="font-bold text-navy">
            Registrate
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: "", email: "", telefono: "", password: "", rol: "PYME" }
  });

  useEffect(() => {
    if (!loading && user) router.replace(roleHome(user.rol));
  }, [loading, user, router]);

  async function onSubmit(values: RegisterForm) {
    setSubmitting(true);
    setError(null);
    try {
      const created = await registerUser(values);
      router.replace(roleHome(created.rol));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md p-6 shadow-panel">
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-signal text-ink">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">Elegis rol y luego completas el perfil operativo.</p>
        </div>
        {error ? <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput label="Nombre" error={form.formState.errors.nombre?.message} {...form.register("nombre")} />
          <FormInput label="Email" type="email" error={form.formState.errors.email?.message} {...form.register("email")} />
          <FormInput label="Telefono" error={form.formState.errors.telefono?.message} {...form.register("telefono")} />
          <FormSelect
            label="Rol"
            options={[
              { label: "PyME", value: "PYME" },
              { label: "Transportista", value: "TRANSPORTISTA" }
            ]}
            error={form.formState.errors.rol?.message}
            {...form.register("rol")}
          />
          <FormInput
            label="Password"
            type="password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Crear cuenta <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Ya tenes cuenta?{" "}
          <Link href="/login" className="font-bold text-navy">
            Ingresar
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen gap-6 p-4 lg:grid-cols-[minmax(360px,480px),1fr] lg:p-8">
      <section className="flex items-center justify-center">{children}</section>
      <section className="hidden min-h-[calc(100vh-64px)] overflow-hidden rounded-[22px] border-[7px] border-ink bg-white lg:block">
        <div className="flex h-full">
          <div className="w-[300px] border-r border-line bg-white p-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal text-ink">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black tracking-[0.18em] text-slate-950">LOGEXPRESS</p>
                <p className="text-xs text-slate-500">MVP logistico</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                ["#3568129", "Rosario", "Cordoba", "En transito"],
                ["#4123910", "La Plata", "Mar del Plata", "Publicada"],
                ["#3568490", "Santa Fe", "Mendoza", "Con ofertas"]
              ].map(([id, from, to, state]) => (
                <div key={id} className="rounded-lg border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-black text-slate-950">{id}</p>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <MapPinIcon />
                    {from}
                    <span className="h-px flex-1 bg-line" />
                    {to}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 p-5">
            <MapPreview
              title="Tracking loads"
              subtitle="Ruta #3568129"
              points={[
                { label: "Pick up" },
                { label: "Unidad activa", active: true },
                { label: "Entrega" }
              ]}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                  <Lock className="h-4 w-4 text-navy" />
                  Ofertas seguras
                </div>
                <p className="text-sm text-slate-500">Presupuestos, aceptacion y viaje generado automaticamente.</p>
              </Card>
              <Card className="p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                  <Mail className="h-4 w-4 text-navy" />
                  Trazabilidad
                </div>
                <p className="text-sm text-slate-500">Estados, tracking basico y pago simulado para cerrar el flujo.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MapPinIcon() {
  return <span className="h-2 w-2 rounded-full bg-slate-950" />;
}
