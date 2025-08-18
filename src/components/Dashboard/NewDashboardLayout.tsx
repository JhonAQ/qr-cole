"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  ClipboardList,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  RefreshCw,
  User,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { formatearFecha, formatearHora } from "@/utils/helpers";
import { useDashboard } from "@/contexts/DashboardContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

export default function NewDashboardLayout({
  children,
  activeTab,
  onTabChange,
  tabs,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    fullName: string;
    role: string;
    joinDate: string;
    avatar: string;
  } | null>(null);
  const router = useRouter();
  const { estadisticas, loading, error, refreshData } = useDashboard();

  // Prevenir scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (sidebarOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
      };
    }
  }, [sidebarOpen]);

  // Cargar información del usuario
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserInfo({
            email: user.email || "admin@qrcole.edu.pe",
            fullName: "Administrador del Sistema",
            role: "Administrador",
            joinDate: user.created_at || new Date().toISOString(),
            avatar: user.email?.charAt(0).toUpperCase() || "A",
          });
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        // Información por defecto
        setUserInfo({
          email: "admin@qrcole.edu.pe",
          fullName: "Administrador del Sistema",
          role: "Administrador",
          joinDate: new Date().toISOString(),
          avatar: "A",
        });
      }
    };

    loadUserInfo();
  }, []);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element;
        if (!target.closest(".user-menu-container")) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <div className="safe-area-container bg-gray-50">
      {/* Sidebar para móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-overlay sidebar-overlay lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="mobile-sidebar lg:hidden"
              style={{ width: "17.5rem" }}
            >
              <div className="flex items-center justify-between p-4 border-b mobile-header">
                <h2 className="text-lg font-semibold text-gray-800">QR Cole</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto mobile-footer-space">
                <SidebarContent
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar para desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-70 lg:bg-white lg:shadow-sm lg:flex lg:flex-col">
        <div className="flex items-center px-6 py-4 border-b">
          <QrCode className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">QR Cole</h2>
        </div>
        <SidebarContent
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </aside>

      {/* Contenido principal */}
      <div className="lg:ml-70 mobile-content flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mobile-header flex-shrink-0 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Botón de menú móvil y título */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-800">
                    {tabs.find((tab) => tab.id === activeTab)?.label ||
                      "Dashboard"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatearFecha(new Date())} • {formatearHora(new Date())}
                  </p>
                </div>
              </div>

              {/* Acciones del header */}
              <div className="flex items-center space-x-2">
                {/* Estadísticas rápidas */}
                <div className="hidden md:flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    {estadisticas.presentesHoy} Presentes
                  </div>
                  <div className="flex items-center text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    {estadisticas.ausentesHoy} Ausentes
                  </div>
                </div>

                {/* Botones de acción */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>

                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>

                {/* Menú de usuario */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
                      <span className="text-sm font-medium text-white">
                        {userInfo?.avatar || "A"}
                      </span>
                    </div>
                    <div className="ml-3 text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {userInfo?.fullName || "Administrador"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userInfo?.role || "Sistema"}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 z-50 overflow-hidden"
                      >
                        {/* Header del perfil */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                              <span className="text-lg font-bold text-white">
                                {userInfo?.avatar || "A"}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="font-semibold text-white">
                                {userInfo?.fullName ||
                                  "Administrador del Sistema"}
                              </p>
                              <p className="text-sm text-blue-100">
                                {userInfo?.email || "admin@qrcole.edu.pe"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Información del usuario */}
                        <div className="p-4 bg-gray-50 border-b">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
                                <Users className="w-4 h-4 text-green-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {estadisticas.totalAlumnos}
                              </p>
                              <p className="text-xs text-gray-500">Alumnos</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {estadisticas.porcentajeAsistencia}%
                              </p>
                              <p className="text-xs text-gray-500">
                                Asistencia
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detalles del perfil */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center text-sm">
                            <Shield className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-600">Rol:</span>
                            <span className="ml-auto font-medium text-gray-900">
                              {userInfo?.role || "Administrador"}
                            </span>
                          </div>

                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-auto font-medium text-gray-900 truncate max-w-40">
                              {userInfo?.email || "admin@qrcole.edu.pe"}
                            </span>
                          </div>

                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-600">Desde:</span>
                            <span className="ml-auto font-medium text-gray-900">
                              {userInfo?.joinDate
                                ? new Date(
                                    userInfo.joinDate
                                  ).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "short",
                                  })
                                : "2024"}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="border-t bg-gray-50 p-2">
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                          >
                            <Settings className="w-4 h-4 mr-3 text-gray-400" />
                            <span>Configuración de Perfil</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleSignOut();
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto mobile-footer-space">
          {error && (
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}
          <div className="pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Componente del contenido del sidebar
function SidebarContent({
  tabs,
  activeTab,
  onTabChange,
  onClose,
}: {
  tabs: Array<{ id: string; label: string; icon: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose?: () => void;
}) {
  const { estadisticas } = useDashboard();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Estadísticas rápidas */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Total Alumnos</p>
            <p className="text-lg font-semibold text-gray-900">
              {estadisticas.totalAlumnos}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Asistencia Hoy</p>
            <p className="text-lg font-semibold text-green-600">
              {estadisticas.porcentajeAsistencia}%
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              onClose?.();
            }}
            className={`
              w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {tab.icon}
            <span className="ml-3">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Acciones rápidas */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2">
          <button
            onClick={() => window.open("/scan", "_blank")}
            className="w-full flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <QrCode className="w-4 h-4 mr-3" />
            Escanear QR
          </button>
          <button
            onClick={() => window.open("/register", "_blank")}
            className="w-full flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-4 h-4 mr-3" />
            Registrar Alumno
          </button>
        </div>
      </div>
    </div>
  );
}
