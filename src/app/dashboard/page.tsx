"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  ClipboardList,
  Home,
  UserCheck,
  Loader2,
  UserPlus,
  Scan,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

// Context y Layout
import { DashboardProvider } from "@/contexts/DashboardContext";
import EnhancedDashboardLayout from "@/components/Dashboard/EnhancedDashboardLayout";

// Componentes de tabs
import OverviewTab from "@/components/Dashboard/OverviewTab";
import AlumnosTab from "@/components/Dashboard/AlumnosTab";
import AsistenciaTab from "@/components/Dashboard/AsistenciaTab";
import EstadisticasTab from "@/components/Dashboard/EstadisticasTab";
import RegistrarTab from "@/components/Dashboard/RegistrarTab";
import EscanearTab from "@/components/Dashboard/EscanearTab";
import ControlAsistenciaTab from "@/components/Dashboard/ControlAsistenciaTab";

const tabs = [
  {
    id: "overview",
    label: "Resumen",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "alumnos",
    label: "Alumnos",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "registrar",
    label: "Registrar",
    icon: <UserPlus className="w-5 h-5" />,
  },
  {
    id: "escanear",
    label: "Escanear QR",
    icon: <Scan className="w-5 h-5" />,
  },
  {
    id: "registros",
    label: "Registros",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    id: "control-asistencia",
    label: "Control Asistencia",
    icon: <UserCheck className="w-5 h-5" />,
  },
  {
    id: "estadisticas",
    label: "Estadísticas",
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) router.push("/");
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push("/");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Manejar parámetros de URL para abrir el tab correcto
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleGradeSelect = (grado: number, seccion?: string) => {
    setSelectedGrade(grado === 0 ? null : grado);
    setSelectedSection(seccion || null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onTabChange={setActiveTab} />;
      case "alumnos":
        return (
          <AlumnosTab
            selectedGrade={selectedGrade}
            selectedSection={selectedSection}
          />
        );
      case "registrar":
        return (
          <RegistrarTab
            onBackToDashboard={() => setActiveTab("alumnos")}
            onStudentRegistered={() => {
              // Refrescar datos y cambiar a alumnos
              setActiveTab("alumnos");
            }}
          />
        );
      case "escanear":
        return (
          <EscanearTab onBackToDashboard={() => setActiveTab("registros")} />
        );
      case "registros":
        return <AsistenciaTab />;
      case "control-asistencia":
        return (
          <ControlAsistenciaTab
            selectedGrade={selectedGrade}
            selectedSection={selectedSection}
          />
        );
      case "estadisticas":
        return <EstadisticasTab />;
      default:
        return <OverviewTab onTabChange={setActiveTab} />;
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg text-gray-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  // Redirigir si no hay sesión
  if (!session) return null;

  return (
    <DashboardProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <EnhancedDashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        selectedGrade={selectedGrade}
        selectedSection={selectedSection}
        onGradeSelect={handleGradeSelect}
      >
        <motion.div
          key={`${activeTab}-${selectedGrade}-${selectedSection}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </EnhancedDashboardLayout>
    </DashboardProvider>
  );
}
