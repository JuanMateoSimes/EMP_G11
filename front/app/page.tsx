"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { roleHome } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? roleHome(user.rol) : "/login");
  }, [loading, user, router]);

  return (
    <main className="min-h-screen p-6">
      <LoadingState label="Redirigiendo" />
    </main>
  );
}
