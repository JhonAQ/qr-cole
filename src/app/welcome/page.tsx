"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  QrCode,
  Users,
  Camera,
  Smartphone,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function WelcomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">

            <Image
              src="/LOGO-FC.png"
              alt="Colegio Fe y Ciencia"
              width={75}
              height={80}
              className="rounded"
            />
            <h1 className="text-4xl ml-3 font-bold text-primary-dark">
              Educheck - Fe y Ciencia
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Sistema de Control de Asistencia con Códigos QR
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Camera className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Escanear QR</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Registra la entrada o salida de los alumnos escaneando su código
              QR
            </p>
            <button
              onClick={() => window.open("/scan", "_blank")}
              className="w-full fc-btn-primary flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Abrir Escáner
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Registrar Alumno
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Añade nuevos estudiantes al sistema y genera sus códigos QR únicos
            </p>
            <button
              onClick={() => window.open("/register", "_blank")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Nuevo Alumno
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Access */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Panel de Control
            </h2>
            <p className="text-gray-600 mb-6">
              Accede al dashboard completo para gestionar alumnos, ver
              estadísticas y más
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="fc-btn-primary px-8 py-3"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. Uso Móvil</h3>
              <p className="text-sm text-gray-600">
                Optimizado para teléfonos. Instálalo como PWA para mejor
                experiencia
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. Códigos QR</h3>
              <p className="text-sm text-gray-600">
                Cada alumno tiene un código único que se escanea para registrar
                asistencia
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                3. Auto-detección
              </h3>
              <p className="text-sm text-gray-600">
                El sistema detecta automáticamente si es entrada o salida
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Escáner QR con cámara móvil
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Registro automático entrada/salida
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Dashboard con estadísticas en tiempo real
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Gestión completa de alumnos
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Generación automática de códigos QR
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Filtros y búsqueda avanzada
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">Exportación de reportes</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">
                  Interfaz optimizada para móviles
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-gray-600">
            <span className="font-semibold">Colegio Fe y Ciencia</span> -
            Sistema de Control de Acceso
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Desarrollado con ❤️ para mejorar la gestión escolar
          </p>
        </div>
      </div>
    </div>
  );
}
