'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import StudentList from '@/components/Dashboard/StudentList';
import AttendanceHistory from '@/components/Dashboard/AttendanceHistory';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function DashboardPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) router.push('/');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) router.push('/');
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div>Cargando...</div>;

  if (!session) return null;

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sistema de Asistencia Escolar</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Acciones Rápidas</h2>
          <div className="space-y-2">
            <Link href="/scan" className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Escanear QR
            </Link>
            <Link href="/alumnos/create" className="block w-full px-4 py-2 text-center text-white bg-green-600 rounded-md hover:bg-green-700">
              Registrar Alumno
            </Link>
            <Link href="/alumnos" className="block w-full px-4 py-2 text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
              Ver Alumnos
            </Link>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Resumen del Día</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-blue-800">Presentes</h3>
              <p className="text-2xl font-bold text-blue-900">-</p>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Ausentes</h3>
              <p className="text-2xl font-bold text-red-900">-</p>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-green-800">Registros Hoy</h3>
              <p className="text-2xl font-bold text-green-900">-</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <StudentList />
        <AttendanceHistory />
      </div>
    </div>
  );
}