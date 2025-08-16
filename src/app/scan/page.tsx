'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';
import { Toaster } from 'react-hot-toast';

export default function ScanPage() {
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

  if (loading) return <div>Cargando...</div>;

  if (!session) return null;

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Escanear Asistencia</h1>
      <QRScanner />
      <div className="mt-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}