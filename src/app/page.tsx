"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  QrCode,
  BarChart3,
  Info,
  Phone,
  User,
  X,
} from "lucide-react";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) router.push("/dashboard");
    });

    // Recuperar email guardado si existe
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) router.push("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError("El correo electrónico es obligatorio");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingrese un correo electrónico válido");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Email o contraseña invalidos");
      } else {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        toast.success("Inicio de sesión exitoso");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00a3dc] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            color: "#374151",
            border: "1px solid #e5e7eb",
          },
          success: {
            iconTheme: { primary: "#00a3dc", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/LOGO-FC.png"
              alt="Colegio Fe y Ciencia"
              width={75}
              height={80}
              className="rounded"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Fe y Ciencia Check
              </h1>
              <p className="text-sm text-gray-500">
                Sistema de Control de Acceso
              </p>
            </div>
          </div>

          <nav className="flex space-x-4">
            <button
              onClick={() => setShowAboutModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-[#00a3dc] transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm">Acerca de</span>
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-[#00a3dc] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">Contacto</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {!session ? (
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 bg-[#00a3dc]/10 text-[#00a3dc] text-sm font-medium rounded-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Sistema Inteligente de Acceso
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Control de Acceso{" "}
                  <span className="text-[#00a3dc]">Moderno y Seguro</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Gestiona el acceso a tus instalaciones con códigos QR
                  dinámicos, estadísticas en tiempo real y máxima seguridad.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#00a3dc]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-[#00a3dc]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Seguro</h3>
                  <p className="text-sm text-gray-600">Máxima protección</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#00a3dc]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-6 h-6 text-[#00a3dc]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    QR Dinámico
                  </h3>
                  <p className="text-sm text-gray-600">Códigos inteligentes</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-[#00a3dc]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-[#00a3dc]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-600">Datos en tiempo real</p>
                </div>
              </div>
            </motion.div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#00a3dc]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-[#00a3dc]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Iniciar Sesión
                  </h2>
                  <p className="text-gray-600">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        placeholder="tu@email.com"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          emailError ? "border-red-300" : "border-gray-300"
                        } text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3dc] focus:border-transparent`}
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-3 border ${
                          passwordError ? "border-red-300" : "border-gray-300"
                        } text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a3dc] focus:border-transparent`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="w-4 h-4 text-[#00a3dc] border-gray-300 rounded focus:ring-[#00a3dc]"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Recordarme
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-[#00a3dc] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#00a3dc] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0090c4] focus:outline-none focus:ring-2 focus:ring-[#00a3dc] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {authLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Iniciando...
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00a3dc] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Redirigiendo al dashboard...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Colegio Fe y Ciencia. Todos los derechos
          reservados.
        </div>
      </footer>

      {/* Modales */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Acerca del Proyecto
              </h3>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Fe y Ciencia Check</strong> es un prototipo de sistema
                de control de acceso desarrollado para la feria de ciencias del
                Colegio Fe y Ciencia.
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm">
                  <strong>Tecnologías:</strong> Next.js, React, Tailwind CSS,
                  Supabase
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contacto</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-gray-600">dev.dczel@gmail.com</p>
              </div>
              {/* <div className="bg-cyan-50 rounded-lg p-3">

                <h4 className="font-medium text-gray-900 mb-1">
                  Desarrollador
                </h4>
                <p className="text-gray-600">
                  dev.dczel@gmail.com
                </p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
