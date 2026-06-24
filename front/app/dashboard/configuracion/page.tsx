"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button, Card, FormInput, SectionTitle, SuccessMessage } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { UserRound, Bell, Shield, CreditCard, Save } from "lucide-react";

type Section = "perfil" | "notificaciones" | "seguridad" | "facturacion";

export default function ConfigPage() {
  const { user } = useAuth();
  const role = user?.rol || "PYME";

  const [activeSection, setActiveSection] = useState<Section>("perfil");
  const [success, setSuccess] = useState<string | null>(null);

  // Profile fields state
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [telefono, setTelefono] = useState(user?.telefono || "");

  // Notification fields state
  const [promoEmails, setPromoEmails] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [inAppPush, setInAppPush] = useState(true);

  // Security fields state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Billing fields state
  const [razonSocial, setRazonSocial] = useState("");
  const [cuit, setCuit] = useState("");
  const [direccionFacturacion, setDireccionFacturacion] = useState("");
  const [metodoPago, setMetodoPago] = useState("SIMULADO");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("Ajustes guardados correctamente.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const sections = [
    { id: "perfil", label: "Ajustes de Perfil", icon: UserRound },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "seguridad", label: "Seguridad", icon: Shield },
    { id: "facturacion", label: "Preferencias de Facturación", icon: CreditCard }
  ] as const;

  return (
    <AppLayout role={role}>
      <SectionTitle title="Configuración del Sistema" />
      
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="grid gap-6 md:grid-cols-[240px,1fr]">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-navy text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration Panel Content */}
        <Card className="p-6 bg-white">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeSection === "perfil" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950 mb-1">Ajustes de Perfil</h3>
                  <p className="text-xs text-slate-500 mb-4">Actualiza tu información personal de contacto.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="Nombre Completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                  <FormInput
                    label="Email (No editable)"
                    value={user?.email || ""}
                    disabled
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: +54 9 11 5555-5555"
                  />
                </div>
              </div>
            )}

            {activeSection === "notificaciones" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950 mb-1">Preferencias de Notificación</h3>
                  <p className="text-xs text-slate-500 mb-4">Selecciona los canales a través de los cuales deseas recibir novedades.</p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-lg border border-line p-3 hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={promoEmails}
                      onChange={(e) => setPromoEmails(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Notificaciones por Correo Electrónico</p>
                      <p className="text-xs text-slate-500">Recibe ofertas de fletes, actualizaciones de viajes y resúmenes diarios.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 rounded-lg border border-line p-3 hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Alertas por Mensaje de Texto (SMS)</p>
                      <p className="text-xs text-slate-500">Alertas urgentes de seguridad de carga y confirmaciones de entrega en tiempo real.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-line p-3 hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={inAppPush}
                      onChange={(e) => setInAppPush(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Notificaciones en la Aplicación (Push)</p>
                      <p className="text-xs text-slate-500">Mensajes emergentes en la campana de notificaciones de la plataforma.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeSection === "seguridad" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950 mb-1">Seguridad de la Cuenta</h3>
                  <p className="text-xs text-slate-500 mb-4">Actualiza tu contraseña para mantener la cuenta segura.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormInput
                    label="Contraseña Actual"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <FormInput
                    label="Nueva Contraseña"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <FormInput
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
            )}

            {activeSection === "facturacion" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-950 mb-1">Información de Facturación</h3>
                  <p className="text-xs text-slate-500 mb-4">Define los datos comerciales para la generación de comprobantes.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="Razón Social Facturación"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="Ej: Distribuidora Sur S.A."
                  />
                  <FormInput
                    label="CUIT Comercial"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    placeholder="Ej: 30-12345678-9"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="Dirección Comercial / Fiscal"
                    value={direccionFacturacion}
                    onChange={(e) => setDireccionFacturacion(e.target.value)}
                    placeholder="Ej: Av. Rivadavia 4500, CABA"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Método de Pago Preferido</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="min-h-[42px] w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                    >
                      <option value="SIMULADO">Pago Simulado LogExpress</option>
                      <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                      <option value="EFECTIVO">Efectivo / Contra-entrega</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-line mt-6">
              <Button type="submit">
                <Save className="h-4 w-4" /> Guardar Ajustes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
