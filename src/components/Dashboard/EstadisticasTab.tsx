'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BookOpen,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useDashboard } from '@/contexts/DashboardContext';
import { Alumno, Asistencia } from '@/types';
import { 
  obtenerFechaHoy,
  formatearFecha,
  obtenerGradosUnicos,
  obtenerSeccionesUnicas
} from '@/utils/helpers';

// Componente para gráfico de barras simple
function SimpleBarChart({ 
  data, 
  title, 
  color = 'blue' 
}: { 
  data: Array<{ label: string; value: number; total?: number }>;
  title: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}) {
  const maxValue = Math.max(...data.map(d => d.total || d.value));
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const attendanceRate = item.total ? (item.value / item.total) * 100 : 0;
          
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-500">
                  {item.total ? `${item.value}/${item.total} (${attendanceRate.toFixed(1)}%)` : item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${colorClasses[color]}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente para métricas clave
function MetricCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string | number;
  trend?: { value: number; isUp: boolean };
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-600' }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-lg p-6 border`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`ml-2 flex items-center text-sm ${
                trend.isUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isUp ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EstadisticasTab() {
  const { alumnos, asistencias: asistenciasHoy, estadisticas: estadisticasGenerales } = useDashboard();
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return inicioMes.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(obtenerFechaHoy());
  const [asistenciasRango, setAsistenciasRango] = useState<(Asistencia & { alumno: Alumno })[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar asistencias del rango seleccionado
  const cargarAsistenciasRango = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asistencias')
        .select(`
          *,
          alumno:alumnos(*)
        `)
        .gte('hora', `${fechaInicio}T00:00:00`)
        .lte('hora', `${fechaFin}T23:59:59`)
        .order('hora', { ascending: false });

      if (error) throw error;
      setAsistenciasRango(data || []);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsistenciasRango();
  }, [fechaInicio, fechaFin]);

  // Estadísticas del rango seleccionado
  const estadisticasRango = useMemo(() => {
    const totalRegistros = asistenciasRango.length;
    const entradas = asistenciasRango.filter(a => a.tipo === 'entrada').length;
    const salidas = asistenciasRango.filter(a => a.tipo === 'salida').length;
    const alumnosConAsistencia = new Set(asistenciasRango.map(a => a.id_alumno)).size;
    const porcentajeAsistencia = alumnos.length > 0 
      ? Math.round((alumnosConAsistencia / alumnos.length) * 100) 
      : 0;

    return {
      totalRegistros,
      entradas,
      salidas,
      alumnosConAsistencia,
      porcentajeAsistencia,
      alumnosSinAsistencia: alumnos.length - alumnosConAsistencia
    };
  }, [asistenciasRango, alumnos]);

  // Estadísticas por grado
  const estadisticasPorGrado = useMemo(() => {
    const gradosUnicos = obtenerGradosUnicos(alumnos);
    
    return gradosUnicos.map(grado => {
      const alumnosDelGrado = alumnos.filter(a => a.grado === grado);
      const asistenciasDelGrado = asistenciasRango.filter(a => a.alumno?.grado === grado);
      const alumnosConAsistencia = new Set(asistenciasDelGrado.map(a => a.id_alumno)).size;
      
      return {
        label: `${grado}° Grado`,
        value: alumnosConAsistencia,
        total: alumnosDelGrado.length,
        porcentaje: alumnosDelGrado.length > 0 
          ? Math.round((alumnosConAsistencia / alumnosDelGrado.length) * 100) 
          : 0
      };
    }).sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [alumnos, asistenciasRango]);

  // Estadísticas por día (últimos 7 días)
  const estadisticasPorDia = useMemo(() => {
    const dias = [];
    const hoy = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const asistenciasDia = asistenciasRango.filter(a => 
        a.hora.split('T')[0] === fechaStr
      );
      
      const alumnosUnicos = new Set(asistenciasDia.map(a => a.id_alumno)).size;
      
      dias.push({
        label: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        value: alumnosUnicos,
        total: alumnos.length
      });
    }
    
    return dias;
  }, [asistenciasRango, alumnos]);

  // Horarios pico
  const horariosPico = useMemo(() => {
    const horasPorHora: Record<number, number> = {};
    
    asistenciasRango.forEach(asistencia => {
      const hora = new Date(asistencia.hora).getHours();
      horasPorHora[hora] = (horasPorHora[hora] || 0) + 1;
    });
    
    return Object.entries(horasPorHora)
      .map(([hora, cantidad]) => ({
        label: `${hora}:00`,
        value: cantidad as number
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [asistenciasRango]);

  // Top alumnos más puntuales
  const alumnosPuntuales = useMemo(() => {
    const asistenciasPorAlumno: Record<string, { alumno: Alumno; entradas: number; salidas: number }> = {};
    
    asistenciasRango.forEach(asistencia => {
      if (!asistenciasPorAlumno[asistencia.id_alumno]) {
        asistenciasPorAlumno[asistencia.id_alumno] = {
          alumno: asistencia.alumno,
          entradas: 0,
          salidas: 0
        };
      }
      
      if (asistencia.tipo === 'entrada') {
        asistenciasPorAlumno[asistencia.id_alumno].entradas++;
      } else {
        asistenciasPorAlumno[asistencia.id_alumno].salidas++;
      }
    });
    
    return Object.values(asistenciasPorAlumno)
      .map((data) => ({
        label: `${data.alumno?.nombres} ${data.alumno?.apellidos}`,
        value: data.entradas + data.salidas,
        grado: `${data.alumno?.grado}°-${data.alumno?.seccion}`
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [asistenciasRango]);

  const exportarReporte = () => {
    const datos = {
      periodo: `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`,
      estadisticasGenerales: estadisticasRango,
      estadisticasPorGrado,
      horariosPico,
      alumnosPuntuales
    };
    
    const jsonContent = JSON.stringify(datos, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_asistencia_${fechaInicio}_${fechaFin}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas y Reportes</h2>
          <p className="text-gray-600">
            Análisis detallado de asistencia del {formatearFecha(fechaInicio)} al {formatearFecha(fechaFin)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={cargarAsistenciasRango}
            disabled={loading}
            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={exportarReporte}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const hoy = obtenerFechaHoy();
                setFechaInicio(hoy);
                setFechaFin(hoy);
              }}
              className="px-3 py-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Solo hoy
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Registros"
          value={estadisticasRango.totalRegistros}
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Alumnos con Asistencia"
          value={`${estadisticasRango.alumnosConAsistencia}/${alumnos.length}`}
          trend={{ 
            value: estadisticasRango.porcentajeAsistencia, 
            isUp: estadisticasRango.porcentajeAsistencia >= 80 
          }}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="% Asistencia"
          value={`${estadisticasRango.porcentajeAsistencia}%`}
          icon={Target}
          color={estadisticasRango.porcentajeAsistencia >= 80 ? 'green' : 'red'}
        />
        <MetricCard
          title="Entradas/Salidas"
          value={`${estadisticasRango.entradas}/${estadisticasRango.salidas}`}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={estadisticasPorGrado}
          title="Asistencia por Grado"
          color="blue"
        />
        
        <SimpleBarChart
          data={estadisticasPorDia}
          title="Tendencia Semanal"
          color="green"
        />
        
        <SimpleBarChart
          data={horariosPico}
          title="Horarios con Más Actividad"
          color="purple"
        />
        
        <SimpleBarChart
          data={alumnosPuntuales}
          title="Alumnos Más Puntuales"
          color="yellow"
        />
      </div>

      {/* Resumen detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por estado */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Asistencia
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3" />
                <span className="font-medium text-green-800">Con Asistencia</span>
              </div>
              <span className="text-green-900 font-bold">
                {estadisticasRango.alumnosConAsistencia} ({estadisticasRango.porcentajeAsistencia}%)
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3" />
                <span className="font-medium text-red-800">Sin Asistencia</span>
              </div>
              <span className="text-red-900 font-bold">
                {estadisticasRango.alumnosSinAsistencia} ({100 - estadisticasRango.porcentajeAsistencia}%)
              </span>
            </div>
          </div>
        </div>

        {/* Información del período */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Período
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Período analizado:</span>
              <span className="font-medium">
                {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total de alumnos:</span>
              <span className="font-medium">{alumnos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Grados activos:</span>
              <span className="font-medium">{obtenerGradosUnicos(alumnos).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Secciones activas:</span>
              <span className="font-medium">{obtenerSeccionesUnicas(alumnos).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      {estadisticasRango.porcentajeAsistencia < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                Recomendaciones para Mejorar la Asistencia
              </h4>
              <ul className="space-y-2 text-yellow-700">
                <li>• La asistencia está por debajo del 80% recomendado</li>
                <li>• Considere implementar un sistema de seguimiento más estricto</li>
                <li>• Revise los grados con menor asistencia para intervenciones específicas</li>
                <li>• Establezca comunicación directa con padres de familia</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
