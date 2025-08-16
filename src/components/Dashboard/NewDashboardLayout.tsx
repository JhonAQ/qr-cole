"use client";

import React, { useState } from "react";
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
  const router = useRouter();
  const { estadisticas, loading, error, refreshData } = useDashboard();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-70 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">QR Cole</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
                onClose={() => setSidebarOpen(false)}
              />
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
      <div className="lg:ml-70">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Botón de menú móvil y título */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
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
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        A
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 z-50"
                      >
                        <div className="p-3 border-b">
                          <p className="text-sm font-medium text-gray-700">
                            Administrador
                          </p>
                          <p className="text-xs text-gray-500">
                            Sistema QR Cole
                          </p>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => {}}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Configuración
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Cerrar Sesión
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
        <main className="flex-1 overflow-hidden">
          {error && (
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}
          {children}
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
            onClick={() => window.open("/alumnos/create", "_blank")}
            className="w-full flex items-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-4 h-4 mr-3" />
            Nuevo Alumno
          </button>
        </div>
      </div>
    </div>
  );
}
