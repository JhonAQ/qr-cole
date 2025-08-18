"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  Home,
  UserPlus,
  Scan,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/contexts/DashboardContext";
import GradeNavigation from "./GradeNavigation";

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  selectedGrade?: number | null;
  selectedSection?: string | null;
  onGradeSelect?: (grado: number, seccion?: string) => void;
}

export default function EnhancedDashboardLayout({
  children,
  activeTab,
  onTabChange,
  tabs,
  selectedGrade,
  selectedSection,
  onGradeSelect,
}: EnhancedDashboardLayoutProps) {
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
    <div className="min-h-screen bg-gray-50 dashboard-layout">
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
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
            <Image
              src="/LOGO-FC.png"
              alt="Colegio Fe y Ciencia"
              width={75}
              height={80}
              className="rounded"
            />

                  <h2 className="text-lg ml-3 font-semibold text-gray-800">
                    Educheck - Fe y Ciencia
                  </h2>
                </div>
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
                selectedGrade={selectedGrade}
                selectedSection={selectedSection}
                onGradeSelect={onGradeSelect}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar para desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 lg:bg-white lg:shadow-sm lg:flex lg:flex-col sidebar-container">
        <div className="flex items-center px-6 py-4 border-b">
                      <Image
              src="/LOGO-FC.png"
              alt="Colegio Fe y Ciencia"
              width={60}
              height={60}
              className="rounded"
            />
          <h2 className="text-xl ml-3 font-bold text-gray-800">
            Educheck - Fe y Ciencia
          </h2>
        </div>
        <SidebarContent
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          onGradeSelect={onGradeSelect}
        />
      </aside>

      {/* Contenido principal */}
      <div className="lg:pl-80">
        {/* Header superior */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Título dinámico */}
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
                  {getPageTitle(activeTab, selectedGrade, selectedSection)}
                </h1>
                {!loading && (
                  <p className="text-sm text-gray-500 mt-1">
                    {getPageSubtitle(estadisticas)}
                  </p>
                )}
              </div>

              {/* Acciones del header */}
              <div className="hidden lg:flex lg:items-center lg:space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                </button>

                {/* Menú de usuario */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">A</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Cerrar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Acciones móviles */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                >
                  <span className="text-sm font-medium text-white">A</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 dashboard-container">
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                Error al cargar los datos: {error}
              </p>
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
  selectedGrade,
  selectedSection,
  onGradeSelect,
  onClose,
}: {
  tabs: Array<{ id: string; label: string; icon: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedGrade?: number | null;
  selectedSection?: string | null;
  onGradeSelect?: (grado: number, seccion?: string) => void;
  onClose?: () => void;
}) {
  const { estadisticas } = useDashboard();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    onClose?.();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Estadísticas rápidas */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {estadisticas.totalAlumnos}
            </div>
            <div className="text-xs text-gray-500">Total Alumnos</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.presentesHoy}
            </div>
            <div className="text-xs text-gray-500">Presentes Hoy</div>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <div className="p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Navegación Principal
        </div>

        {/* Tabs principales excepto alumnos */}
        {tabs
          .filter(
            (tab) => !["alumnos", "registrar", "escanear"].includes(tab.id)
          )
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
      </div>

      {/* Navegación por grados */}
      <div className="flex-1 p-4 border-t">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Gestión de Alumnos
        </div>

        <GradeNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onGradeSelect={onGradeSelect || (() => {})}
          selectedGrade={selectedGrade || null}
          selectedSection={selectedSection || null}
        />
      </div>

      {/* Enlaces rápidos - ahora usando tabs internos */}
      <div className="p-4 border-t mt-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Acciones Rápidas
        </div>
        <div className="space-y-2">
          <button
            onClick={() => {
              handleTabClick("registrar");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Alumno</span>
          </button>
          <button
            onClick={() => {
              handleTabClick("escanear");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Scan className="w-4 h-4" />
            <span>Escanear QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Funciones auxiliares para títulos
function getPageTitle(
  activeTab: string,
  selectedGrade?: number | null,
  selectedSection?: string | null
): string {
  switch (activeTab) {
    case "overview":
      return "Panel de Control";
    case "alumnos":
      if (selectedGrade && selectedSection) {
        return `${selectedGrade}° Grado - Sección ${selectedSection}`;
      } else if (selectedGrade && selectedGrade > 0) {
        return `${selectedGrade}° Grado`;
      }
      return "Gestión de Alumnos";
    case "registrar":
      return "Registrar Nuevo Alumno";
    case "escanear":
      return "Escanear Código QR";
    case "asistencia":
      return "Registros de Asistencia";
    case "estadisticas":
      return "Estadísticas y Reportes";
    default:
      return "Dashboard";
  }
}

function getPageSubtitle(estadisticas: any): string {
  const porcentaje = estadisticas.porcentajeAsistencia || 0;
  return `${estadisticas.presentesHoy} de ${estadisticas.totalAlumnos} estudiantes presentes (${porcentaje}% asistencia)`;
}
