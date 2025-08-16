'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  ClipboardList, 
  Home,
  QrCode
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Context y Layout
import { DashboardProvider } from '@/contexts/DashboardContext';
import NewDashboardLayout from '@/components/Dashboard/NewDashboardLayout';

// Componentes de tabs
import OverviewTab from '@/components/Dashboard/OverviewTab';
import AlumnosTab from '@/components/Dashboard/AlumnosTab';
import AsistenciaTab from '@/components/Dashboard/AsistenciaTab';
import EstadisticasTab from '@/components/Dashboard/EstadisticasTab';

const tabs = [
  {
    id: 'overview',
    label: 'Resumen',
    icon: <Home className="w-5 h-5" />,
    content: <OverviewTab />
  },
  {
    id: 'alumnos',
    label: 'Alumnos',
    icon: <Users className="w-5 h-5" />,
    content: <AlumnosTab />
  },
  {
    id: 'asistencia',
    label: 'Asistencia',
    icon: <ClipboardList className="w-5 h-5" />,
    content: <AsistenciaTab />
  },
  {
    id: 'estadisticas',
    label: 'Estadísticas',
    icon: <BarChart3 className="w-5 h-5" />,
    content: <EstadisticasTab />
  }
];

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) router.push('/');
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) router.push('/');
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4 mx-auto"
          />
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
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
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <NewDashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      >
        <div className="min-h-screen">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {tabs.find(tab => tab.id === activeTab)?.content}
          </motion.div>
        </div>
      </NewDashboardLayout>
    </DashboardProvider>
  );
}