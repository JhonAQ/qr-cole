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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#E6E8E9]">
        <div className="relative z-10 backdrop-blur-sm bg-white/40 p-8 rounded-xl shadow-lg border border-white/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-5">
              <Image
                src="/LOGO-FC.png"
                alt="Colegio Fe y Ciencia"
                width={180}
                height={80}
                className="mx-auto drop-shadow-md"
              />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-8 rounded-full bg-gradient-to-t from-[#3b82f6] to-[#60a5fa] animate-pulse"></div>
              <div className="w-2 h-6 rounded-full bg-gradient-to-t from-[#3b82f6] to-[#60a5fa] animate-pulse delay-150"></div>
              <div className="w-2 h-4 rounded-full bg-gradient-to-t from-[#3b82f6] to-[#60a5fa] animate-pulse delay-300"></div>
            </div>
            <p className="mt-4 text-[#2563eb] font-medium">
              Preparando tu experiencia...
            </p>
          </motion.div>
        </div>

        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#E6E8E9] overflow-hidden">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            color: "#2563eb",
            border: "1px solid rgba(219, 234, 254, 0.7)",
            borderRadius: "10px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#2563eb",
              secondary: "#fff",
            },
            duration: 4000,
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            duration: 5000,
          },
        }}
      />

      {/* Header rediseñado */}
      <header className="w-full px-5 py-3 flex justify-between items-center bg-blue-600/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex items-center">
          <Image
            src="/LOGO-FC.png"
            alt="Colegio Fe y Ciencia"
            width={90}
            height={36}
            className="mr-3"
          />
          <h1 className="text-white font-semibold text-xl">
            Fe y Ciencia Check
          </h1>
        </div>
        <nav className="flex space-x-5">
          <button
            onClick={() => setShowAboutModal(true)}
            className="text-white/90 hover:text-white transition-colors font-medium text-sm flex items-center"
          >
            <Info className="w-4 h-4 mr-1" /> Nosotros
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="text-white/90 hover:text-white transition-colors font-medium text-sm flex items-center"
          >
            <Phone className="w-4 h-4 mr-1" /> Contacto
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-10 md:py-12 flex-grow relative">
        {!session ? (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Sección hero */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:flex-1 max-w-xl"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-5 leading-tight">
                Bienvenido al Sistema de{" "}
                <span className="text-blue-500">Control de Acceso</span>
              </h1>
              <p className="text-gray-700 text-lg mb-6 max-w-lg">
                Una plataforma segura y moderna para gestionar el acceso a
                nuestras instalaciones mediante códigos QR personalizados.
              </p>
              <div className="flex items-center space-x-3 text-blue-700 mb-3">
                <Shield className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>Seguro y confiable</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-700 mb-3">
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>Rápido y eficiente</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-700">
                <BarChart3 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span>Estadísticas en tiempo real</span>
              </div>
            </motion.div>

            {/* Formulario de inicio de sesión rediseñado */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:flex-1 w-full max-w-md mx-auto lg:mx-0"
            >
              <div className="backdrop-blur-md bg-white/60 p-7 rounded-xl shadow-xl border border-white/50 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-700/10 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-center mb-6">
                  <User className="text-blue-600 mr-2" size={24} />
                  <h2 className="text-xl font-bold text-blue-800">
                    Iniciar Sesión
                  </h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-blue-800"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateForm();
                        }}
                        placeholder="tucorreo@ejemplo.com"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          emailError ? "border-red-500" : "border-blue-200"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 ${
                          emailError
                            ? "focus:ring-red-500"
                            : "focus:ring-blue-500"
                        } text-blue-800 placeholder-blue-300`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-blue-800"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-600" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) validateForm();
                        }}
                        placeholder="Contraseña"
                        className={`block w-full pl-10 pr-10 py-2.5 border ${
                          passwordError ? "border-red-500" : "border-blue-200"
                        } rounded-lg bg-white focus:outline-none focus:ring-2 ${
                          passwordError
                            ? "focus:ring-red-500"
                            : "focus:ring-blue-500"
                        } text-blue-800 placeholder-blue-300`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-blue-600" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-200 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-blue-800"
                      >
                        Recordarme
                      </label>
                    </div>
                    <a
                      href="#"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      ¿Olvidó su contraseña?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {authLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="backdrop-blur-md bg-white/40 p-7 rounded-xl shadow-xl border border-white/30 text-center">
              <div className="animate-spin mb-4 mx-auto w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-blue-700 text-lg font-medium">
                Redirigiendo al panel de control...
              </p>
            </div>
          </div>
        )}

        {/* Elementos decorativos */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl -z-10"></div>
      </main>

      {/* Footer simple */}
      <footer className="py-4 bg-blue-600/90 backdrop-blur-md border-t border-white/20 mt-auto">
        <div className="container mx-auto px-4 text-center text-white/90 text-sm">
          © {new Date().getFullYear()} Colegio Fe y Ciencia. Todos los derechos
          reservados.
        </div>
      </footer>

      {/* Modal Nosotros */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-blue-800">
                Sobre Nosotros
              </h3>
              <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>Fe y Ciencia Check</strong> es un prototipo desarrollado
                para la feria de ciencias del Colegio Fe y Ciencia como una
                solución innovadora de control de acceso.
              </p>

              <p className="text-gray-700">
                Esta aplicación permite gestionar el ingreso y salida de
                estudiantes, personal y visitantes mediante códigos QR
                personalizados, brindando mayor seguridad y eficiencia en el
                control de acceso.
              </p>

              <p className="text-gray-700">
                El proyecto fue desarrollado utilizando tecnologías modernas
                como Next.js, React, Tailwind CSS y Supabase para crear una
                experiencia fluida y segura.
              </p>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-blue-700 text-sm">
                  Este proyecto forma parte de la iniciativa educativa para
                  fomentar la innovación tecnológica en los estudiantes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Contacto */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-blue-800">Contacto</h3>
              <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">
                    Correo Electrónico
                  </h4>
                  <p className="text-gray-700">contacto@colegiofeciencia.edu</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Teléfono</h4>
                  <p className="text-gray-700">+51 999 888 777</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Desarrollador
                </h4>
                <p className="text-gray-700 mb-1">Jhon Quispe</p>
                <p className="text-gray-700 text-sm">
                  Estudiante de Ingeniería de Sistemas
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  github.com/jhonquispe
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
