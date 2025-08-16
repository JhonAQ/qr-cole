"use client";

import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  BarChart2,
  QrCode,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        const email = session.user.email;
        setUserName(email.split("@")[0]);
      }
      setLoading(false);
      if (!session) router.push("/");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push("/");
    });

    // Responsive sidebar handling
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00a3dc] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const navigationItems = [
    { name: "Inicio", href: "/dashboard", icon: Home },
    { name: "Alumnos", href: "/alumnos", icon: Users },
    { name: "Asistencias", href: "/asistencias", icon: Calendar },
    { name: "Estadísticas", href: "/estadisticas", icon: BarChart2 },
    { name: "Escanear QR", href: "/scan", icon: QrCode },
    { name: "Configuración", href: "/configuracion", icon: Settings },
  ];

  return (
    <div
      className={`h-screen flex overflow-hidden ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                   fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out 
                   lg:translate-x-0 lg:static lg:inset-0 ${
                     isDarkMode ? "bg-gray-800" : "bg-white"
                   } shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/LOGO-FC.png"
                alt="Fe y Ciencia"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="text-lg font-bold">Fe y Ciencia</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                            ${
                              item.href === `/dashboard`
                                ? isDarkMode
                                  ? "bg-[#00a3dc] text-white"
                                  : "bg-[#00a3dc]/10 text-[#00a3dc]"
                                : isDarkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                >
                  <item.icon className="mr-3 flex-shrink-0 w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User profile */}
          <div
            className={`p-4 m-3 rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-gray-600" : "bg-white"
                }`}
              >
                <span className="text-[#00a3dc] font-semibold">
                  {userName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {userName}
                </p>
                <p
                  className={`text-xs truncate ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Administrador
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className={`p-1.5 rounded-lg ${
                  isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                }`}
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b px-4 py-3 sm:px-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1.5 rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                }`}
                title={
                  isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                className={`p-1.5 rounded-md relative ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                }`}
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
