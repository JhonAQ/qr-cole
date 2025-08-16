'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { Alumno, Asistencia, EstadisticasGenerales, DashboardContextType } from '@/types';

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe usarse dentro de un DashboardProvider');
  }
  return context;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalAlumnos: 0,
    presentesHoy: 0,
    ausentesHoy: 0,
    registrosHoy: 0,
    porcentajeAsistencia: 0,
    totalGrados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlumnos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('grado', { ascending: true })
        .order('seccion', { ascending: true })
        .order('apellidos', { ascending: true });

      if (error) throw error;
      setAlumnos(data || []);
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
      setError('Error al cargar los alumnos');
    }
  }, []);

  const fetchAsistenciasHoy = useCallback(async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          alumno:alumnos(*)
        `)
        .gte('hora', `${hoy}T00:00:00`)
        .lt('hora', `${hoy}T23:59:59`)
        .order('hora', { ascending: false });

      if (error) throw error;
      setAsistencias(data || []);
    } catch (err) {
      console.error('Error al cargar asistencias:', err);
      setError('Error al cargar las asistencias');
    }
  }, []);

  const calcularEstadisticas = useCallback(() => {
    const totalAlumnos = alumnos.length;
    const registrosHoy = asistencias.length;
    
    // Obtener alumnos únicos que han registrado asistencia hoy
    const alumnosConAsistencia = new Set(asistencias.map(a => a.id_alumno));
    const presentesHoy = alumnosConAsistencia.size;
    const ausentesHoy = totalAlumnos - presentesHoy;
    
    const porcentajeAsistencia = totalAlumnos > 0 
      ? Math.round((presentesHoy / totalAlumnos) * 100) 
      : 0;
    
    const gradosUnicos = new Set(alumnos.map(a => a.grado));
    const totalGrados = gradosUnicos.size;

    setEstadisticas({
      totalAlumnos,
      presentesHoy,
      ausentesHoy,
      registrosHoy,
      porcentajeAsistencia,
      totalGrados,
    });
  }, [alumnos, asistencias]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchAlumnos(), fetchAsistenciasHoy()]);
    } catch (err) {
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  }, [fetchAlumnos, fetchAsistenciasHoy]);

  // Efectos
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    calcularEstadisticas();
  }, [calcularEstadisticas]);

  // Configurar real-time subscriptions
  useEffect(() => {
    const alumnosSubscription = supabase
      .channel('alumnos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'alumnos' 
        }, 
        () => {
          fetchAlumnos();
        }
      )
      .subscribe();

    const asistenciasSubscription = supabase
      .channel('asistencias_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'asistencias' 
        }, 
        () => {
          fetchAsistenciasHoy();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alumnosSubscription);
      supabase.removeChannel(asistenciasSubscription);
    };
  }, [fetchAlumnos, fetchAsistenciasHoy]);

  const value: DashboardContextType = {
    alumnos,
    asistencias,
    estadisticas,
    loading,
    error,
    refreshData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
