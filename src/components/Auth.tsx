import { useState } from "react";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";
import Image from "next/image";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inicio de sesión exitoso");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#04457D] to-[#00A3DC]">
      <div className="relative flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full mx-4">
        {/* Imagen lateral - solo visible en pantallas md y superiores */}
        <div className="hidden md:block md:w-1/2 bg-[#E6E8E9] relative">
          {/* Aquí se colocaría una imagen de dimensiones 600x800px que muestre estudiantes o el edificio del colegio */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-[#04457D] text-3xl font-bold mb-4">
                Sistema de Asistencia Escolar
              </h2>
              <p className="text-[#587D95] mb-6">
                Control de asistencia eficiente y seguro para nuestros
                estudiantes
              </p>
              <div className="p-4 bg-white/80 rounded-xl shadow-md">
                <Image
                  src="/LOGO-FC.png"
                  alt="Colegio Fe y Ciencia"
                  width={250}
                  height={100}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de inicio de sesión */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          {/* Logo visible solo en móvil */}
          <div className="md:hidden flex justify-center mb-8">
            <Image
              src="/LOGO-FC.png"
              alt="Colegio Fe y Ciencia"
              width={200}
              height={80}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#04457D] mb-2">
            Fe y Ciencia Check
          </h1>
          <p className="text-[#587D95] mb-8">
            Ingrese sus credenciales para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#04457D] mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#07AEE1] focus:border-transparent transition"
                placeholder="nombre@colegio.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#04457D] mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#07AEE1] focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#07AEE1] hover:bg-[#00A3DC] text-[#FFFFFF] font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A3DC] disabled:opacity-70 transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#FFFFFF]"
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
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-[#587D95]">
            <p>Colegio Fe y Ciencia © {new Date().getFullYear()}</p>
            <p className="mt-1">Sistema de Control de Asistencia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
