JhonAQ: esta pagina de landing/inicio de sesion esta horrible, por favor ayudame a mejorarla por que la estructura se ve horrible, el diseño esta horrible es tosco nada moderno no tiene un buen gusto no tiene iconos, no tiene blur , el logo lo pone ahi por poner, no hay header, no hay nada, por favor cambia competamente todo lo abosulutamente en este page para darle un enfoque mas moderno  y lucido 

GitHub Copilot: # Rediseño completo de la página de inicio/autenticación

Voy a rediseñar completamente tu página de inicio para darle un aspecto moderno, con efectos visuales atractivos, mejor estructura y una experiencia de usuario mejorada.

## c:\Users\JhonAQ\Desktop\qr-cole\src\app\page.tsx

Rediseño completo de la página con un diseño moderno que incluye header, hero section, efectos de glassmorphism, animaciones y mejor presentación del logo.

````tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Auth from "@/components/Auth";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) router.push("/dashboard");
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) router.push("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#E6E8E9]">
        <div className="relative z-10 backdrop-blur-sm bg-white/30 p-10 rounded-2xl shadow-xl border border-white/20">
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
                width={240}
                height={100}
                className="mx-auto drop-shadow-md"
              />
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-10 rounded-full bg-gradient-to-t from-[#04457D] to-[#07AEE1] animate-pulse"></div>
              <div className="w-3 h-7 rounded-full bg-gradient-to-t from-[#04457D] to-[#07AEE1] animate-pulse delay-150"></div>
              <div className="w-3 h-5 rounded-full bg-gradient-to-t from-[#04457D] to-[#07AEE1] animate-pulse delay-300"></div>
            </div>
            <p className="mt-6 text-[#04457D] font-medium text-lg">Preparando tu experiencia...</p>
          </motion.div>
        </div>
        
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#07AEE1]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#04457D]/10 rounded-full blur-3xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#E6E8E9] overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            color: "#04457D",
            border: "1px solid rgba(230, 232, 233, 0.5)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#07AEE1",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#e74c3c",
              secondary: "#fff",
            },
          },
        }}
      />
      
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/30 border-b border-white/20 sticky top-0 z-50">
        <div className="flex items-center">
          <Image
            src="/LOGO-FC.png"
            alt="Colegio Fe y Ciencia"
            width={150}
            height={60}
            className="mr-4"
          />
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-[#04457D] hover:text-[#07AEE1] transition-colors font-medium">Inicio</a>
          <a href="#" className="text-[#04457D] hover:text-[#07AEE1] transition-colors font-medium">Nosotros</a>
          <a href="#" className="text-[#04457D] hover:text-[#07AEE1] transition-colors font-medium">Servicios</a>
          <a href="#" className="text-[#04457D] hover:text-[#07AEE1] transition-colors font-medium">Contacto</a>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 relative">
        {!session ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Sección hero */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[#04457D] mb-6 leading-tight">
                Bienvenido al Sistema de <span className="text-[#07AEE1]">Control de Acceso</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Una plataforma segura y moderna para gestionar el acceso a nuestras instalaciones mediante códigos QR personalizados.
              </p>
              <div className="flex items-center space-x-2 text-[#04457D]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#07AEE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Seguro y confiable</span>
              </div>
              <div className="flex items-center space-x-2 mt-2 text-[#04457D]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#07AEE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rápido y eficiente</span>
              </div>
              <div className="flex items-center space-x-2 mt-2 text-[#04457D]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#07AEE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Estadísticas en tiempo real</span>
              </div>
            </motion.div>

            {/* Sección de Auth */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 max-w-md w-full"
            >
              <div className="backdrop-blur-md bg-white/40 p-8 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#07AEE1]/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#04457D]/10 rounded-full blur-2xl"></div>
                <h2 className="text-2xl font-bold text-[#04457D] mb-6 text-center">Iniciar Sesión</h2>
                <Auth />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="backdrop-blur-md bg-white/30 p-8 rounded-2xl shadow-xl border border-white/20 text-center">
              <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-[#07AEE1] border-t-transparent rounded-full"></div>
              <p className="text-[#04457D] text-xl font-medium">Redirigiendo al panel de control...</p>
            </div>
          </div>
        )}
        
        {/* Elementos decorativos */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#07AEE1]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#04457D]/10 rounded-full blur-3xl -z-10"></div>
      </main>
      
      {/* Footer simple */}
      <footer className="mt-auto py-6 backdrop-blur-md bg-white/20 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-[#04457D]/70 text-sm">
          © {new Date().getFullYear()} Colegio Fe y Ciencia. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
````

Para que este diseño funcione correctamente, necesitarás instalar framer-motion. Puedes hacerlo con el siguiente comando:

```bash
npm install framer-motion
```

Este nuevo diseño incluye:

1. Un header profesional con navegación
2. Una sección hero con texto informativo y beneficios
3. Efectos de glassmorphism con backdrop-blur
4. Animaciones suaves con framer-motion
5. Gradientes y efectos de blur para el fondo
6. Iconos SVG integrados
7. Un diseño responsive que se adapta a dispositivos móviles
8. Un footer simple pero elegante
9. Mejor presentación del logo con sombras suaves
10. Animación de carga más moderna y atractiva

El diseño mantiene los colores corporativos pero los aplica de manera más elegante y moderna, creando una experiencia visual mucho más atractiva.

Se realizaron cambios.

Código similar encontrado con 4 tipos de licencias