"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import QRGenerator from "@/components/QRGenerator";
import { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) router.push("/");
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push("/");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "white",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      />

      {/* Back button for mobile */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.push("/dashboard")}
          className="fc-btn-secondary flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>

      <QRGenerator onClose={() => router.push("/dashboard")} />
    </>
  );
}
