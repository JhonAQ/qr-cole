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
  CheckCircle,
  BarChart3,
  Shield,
  User,
  Info,
  Phone,
  Sparkles,
  QrCode,
} from "lucide-react";

export default function Home() {
  const [session, setSession] = useState(null);
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

    // Validar email
    if (!email) {
      setEmailError("El correo electrónico es obligatorio");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingrese un correo electrónico válido");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validar contraseña
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Guardar email en localStorage si rememberMe está activado
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        toast.success("¡Bienvenido! Inicio de sesión exitoso");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6">
              <Image
                src="/LOGO-FC.png"
                alt="Colegio Fe y Ciencia"
                width={160}
                height={70}
                className="mx-auto drop-shadow-lg"
              />
            </div>
            <div className="flex items-center justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
            </div>
            <p className="text-slate-600 font-medium">
              Preparando tu experiencia...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
            duration: 4000,
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            duration: 5000,
          },
        }}
      />

      {/* Header moderno */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <Image
                src="/LOGO-FC.png"
                alt="Colegio Fe y Ciencia"
                width={50}
                height={50}
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Fe y Ciencia Check
              </h1>
              <p className="text-xs text-slate-500">
                Sistema de Control de Acceso
              </p>
            </div>
          </motion.div>

          <nav className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAboutModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 transition-all duration-300"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">Nosotros</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContactModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Contacto</span>
            </motion.button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 flex-grow flex items-center">
        {!session ? (
          <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Sección hero */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">
                    Innovación Educativa
                  </span>
                </motion.div>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Control de Acceso
                  </span>
                  <br />
                  <span className="text-slate-800">Inteligente</span>
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed">
                  Plataforma moderna y segura para gestionar el acceso mediante
                  códigos QR personalizados
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Seguro</h3>
                    <p className="text-sm text-slate-600">
                      Protección avanzada
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">QR Códigos</h3>
                    <p className="text-sm text-slate-600">Acceso instantáneo</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Analytics</h3>
                    <p className="text-sm text-slate-600">
                      Datos en tiempo real
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Formulario moderno */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8"></div>

                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <User className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Bienvenido
                  </h2>
                  <p className="text-slate-600">
                    Ingrese sus credenciales para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        placeholder="tu@email.com"
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 ${
                          emailError
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                            : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-300 text-slate-800 placeholder-slate-400`}
                      />
                    </div>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 ml-1"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 ${
                          passwordError
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                            : "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-300 text-slate-800 placeholder-slate-400`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 ml-1"
                      >
                        {passwordError}
                      </motion.p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="w-5 h-5 text-indigo-600 border-2 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <span className="text-sm text-slate-600 font-medium">
                        Recordarme
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {authLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <span>Iniciar Sesión</span>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-slate-600 font-medium">
                Redirigiendo al dashboard...
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer elegante */}
      <footer className="backdrop-blur-xl bg-white/70 border-t border-white/20 mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-slate-600 text-sm">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold">Colegio Fe y Ciencia</span>. Todos
              los derechos reservados.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Desarrollado con ❤️ para la innovación educativa
            </p>
          </div>
        </div>
      </footer>

      {/* Modal Nosotros mejorado */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-cyan-100 rounded-full -translate-y-16 translate-x-16"></div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Sobre Fe y Ciencia Check
                </h3>
              </div>

              <div className="space-y-4 text-slate-600">
                <p>
                  <strong className="text-slate-800">Fe y Ciencia Check</strong>{" "}
                  es un proyecto innovador desarrollado para demostrar el
                  potencial de la tecnología en el ámbito educativo.
                </p>

                <p>
                  Este sistema permite gestionar el control de acceso mediante
                  códigos QR personalizados, proporcionando una solución
                  moderna, segura y eficiente para instituciones educativas.
                </p>

                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 rounded-2xl border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-2">
                    Tecnologías utilizadas:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Next.js",
                      "React",
                      "Tailwind CSS",
                      "Supabase",
                      "Framer Motion",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="bg-white px-3 py-1 rounded-full text-sm text-indigo-700 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Contacto mejorado */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16"></div>

            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Información de Contacto
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">
                      Correo Institucional
                    </h4>
                    <p className="text-slate-600">
                      contacto@colegiofeciencia.edu
                    </p>
                    <p className="text-slate-500 text-sm">
                      Respuesta en 24-48 horas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">
                      Teléfono
                    </h4>
                    <p className="text-slate-600">+51 999 888 777</p>
                    <p className="text-slate-500 text-sm">
                      Lunes a Viernes, 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl">
                  <h4 className="font-semibold text-slate-800 mb-3">
                    Desarrollado por
                  </h4>
                  <div className="space-y-2">
                    <p className="text-slate-700 font-medium">Jhon Quispe</p>
                    <p className="text-slate-600 text-sm">
                      Estudiante de Ingeniería de Sistemas
                    </p>
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm0 22c-5.373 0-10-4.627-10-10S6.627 2 12 2s10 4.627 10 10-4.627 10-10 10z" />
                          <path d="M15.293 8.293a1 1 0 00-1.414 0L12 10.586 10.121 8.707a1 1 0 00-1.415 1.415l2 2a1 1 0 001.415 0l2-2a1 1 0 000-1.415z" />
                        </svg>
                      </div>
                      <span className="text-slate-600 text-sm">
                        github.com/jhonquispe
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
