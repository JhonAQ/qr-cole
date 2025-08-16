'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
  Target,
  ArrowUp,
  ArrowDown,
  BarChart3,
  QrCode
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { formatearHora } from '@/utils/helpers';

export default function OverviewTab() {
  const { estadisticas, asistencias, alumnos, loading } = useDashboard();

  const tarjetasEstadisticas = [
    {
      title: 'Total Alumnos',
      value: estadisticas.totalAlumnos,
      icon: Users,
      color: 'blue' as const,
      trend: { value: 0, isUp: true },
      description: 'Registrados en el sistema'
    },
    {
      title: 'Presentes Hoy',
      value: estadisticas.presentesHoy,
      icon: UserCheck,
      color: 'green' as const,
      trend: { value: estadisticas.porcentajeAsistencia, isUp: estadisticas.porcentajeAsistencia >= 80 },
      description: `${estadisticas.porcentajeAsistencia}% de asistencia`
    },
    {
      title: 'Ausentes Hoy',
      value: estadisticas.ausentesHoy,
      icon: UserX,
      color: 'red' as const,
      trend: { value: Math.round((estadisticas.ausentesHoy / estadisticas.totalAlumnos) * 100) || 0, isUp: false },
      description: 'Sin registro de entrada'
    },
    {
      title: 'Registros Hoy',
      value: estadisticas.registrosHoy,
      icon: Clock,
      color: 'purple' as const,
      trend: { value: asistencias.length, isUp: true },
      description: 'Entradas y salidas'
    }
  ];

  const coloresCard = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-500',
      text: 'text-red-600',
      border: 'border-red-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-200'
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">¡Bienvenido al Dashboard!</h2>
            <p className="text-blue-100">
              Aquí tienes un resumen completo de la asistencia escolar de hoy
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{estadisticas.totalGrados}</div>
              <div className="text-sm text-blue-100">Grados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{estadisticas.porcentajeAsistencia}%</div>
              <div className="text-sm text-blue-100">Asistencia</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetasEstadisticas.map((tarjeta, index) => {
          const colores = coloresCard[tarjeta.color];
          const IconComponent = tarjeta.icon;

          return (
            <motion.div
              key={tarjeta.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg p-6 shadow-sm border ${colores.border} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {tarjeta.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {tarjeta.value.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-1">
                    {tarjeta.trend.isUp ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${tarjeta.trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                      {tarjeta.trend.value}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {tarjeta.description}
                  </p>
                </div>
                <div className={`w-12 h-12 ${colores.icon} rounded-full flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sección de actividad reciente y estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Actividad Reciente
              </h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {asistencias.length > 0 ? (
              <div className="space-y-4">
                {asistencias.slice(0, 5).map((asistencia, index) => (
                  <div key={asistencia.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      asistencia.tipo === 'entrada' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {asistencia.alumno?.nombres} {asistencia.alumno?.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">
                        {asistencia.tipo === 'entrada' ? 'Entrada' : 'Salida'} • {formatearHora(asistencia.hora)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Grado {asistencia.alumno?.grado}-{asistencia.alumno?.seccion}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  No hay actividad registrada hoy
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Estadísticas por Grado */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Estadísticas por Grado
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <EstadisticasPorGrado alumnos={alumnos} asistencias={asistencias} />
          </div>
        </motion.div>
      </div>

      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.open('/scan', '_blank')}
            className="flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Escanear QR
          </button>
          <button
            onClick={() => window.open('/alumnos/create', '_blank')}
            className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            Nuevo Alumno
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
            <BookOpen className="w-5 h-5 mr-2" />
            Ver Reportes
          </button>
          <button className="flex items-center justify-center p-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
            <Target className="w-5 h-5 mr-2" />
            Configurar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Componente para estadísticas por grado
function EstadisticasPorGrado({ 
  alumnos, 
  asistencias 
}: { 
  alumnos: any[], 
  asistencias: any[] 
}) {
  // Calcular estadísticas por grado
  const estadisticasPorGrado = alumnos.reduce((acc, alumno) => {
    const grado = alumno.grado;
    if (!acc[grado]) {
      acc[grado] = { total: 0, presentes: 0 };
    }
    acc[grado].total++;
    
    // Verificar si el alumno tiene asistencia hoy
    const tieneAsistencia = asistencias.some(a => a.id_alumno === alumno.id);
    if (tieneAsistencia) {
      acc[grado].presentes++;
    }
    
    return acc;
  }, {});

  const grados = Object.keys(estadisticasPorGrado).sort((a, b) => Number(a) - Number(b));

  if (grados.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grados.map((grado) => {
        const datos = estadisticasPorGrado[grado];
        const porcentaje = datos.total > 0 ? Math.round((datos.presentes / datos.total) * 100) : 0;
        
        return (
          <div key={grado} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Grado {grado}°
              </span>
              <span className="text-sm text-gray-500">
                {datos.presentes}/{datos.total} ({porcentaje}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  porcentaje >= 80 
                    ? 'bg-green-500' 
                    : porcentaje >= 60 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
