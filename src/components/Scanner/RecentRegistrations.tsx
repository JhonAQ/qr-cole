"use client";

import React from 'react';
import { 
  Clock, 
  RefreshCw, 
  User, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { RecentRegistrationsProps } from './types';
import { formatTime } from './utils';

export default function RecentRegistrations({
  registrations,
  loading,
  onRefresh,
}: RecentRegistrationsProps) {
  
  if (registrations.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Sin registros hoy</h3>
        <p className="text-sm text-gray-500">
          Los registros de asistencia aparecerán aquí
        </p>
      </div>
    );
  }

  // Agrupar registros por tipo para mostrar estadísticas rápidas
  const entradas = registrations.filter(r => r.tipo === 'entrada').length;
  const salidas = registrations.filter(r => r.tipo === 'salida').length;

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Registros de Hoy
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {registrations.length}
            </div>
            <div className="text-xs text-blue-700 font-medium">Total</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {entradas}
            </div>
            <div className="text-xs text-green-700 font-medium">Entradas</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {salidas}
            </div>
            <div className="text-xs text-orange-700 font-medium">Salidas</div>
          </div>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Últimos registros
          </h4>
        </div>
        
        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {registrations.map((registro, index) => {
            const isRecent = index < 3; // Marcar los 3 más recientes
            
            return (
              <div 
                key={registro.id} 
                className={`p-4 hover:bg-gray-25 transition-colors ${
                  isRecent ? 'bg-blue-25' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar del estudiante */}
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {registro.alumno.nombres.charAt(0)}{registro.alumno.apellidos.charAt(0)}
                  </div>
                  
                  {/* Información del estudiante */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {registro.alumno.nombres} {registro.alumno.apellidos}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{registro.alumno.grado}° - {registro.alumno.seccion}</span>
                    </div>
                  </div>

                  {/* Información del registro */}
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                        registro.tipo === "entrada"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></div>
                      {registro.tipo === "entrada" ? "Entrada" : "Salida"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {formatTime(registro.hora)}
                    </div>
                  </div>

                  {/* Indicador de registro reciente */}
                  {isRecent && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer con información adicional */}
        {registrations.length > 8 && (
          <div className="p-3 bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              Mostrando los últimos 10 registros
            </p>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Actualizando registros...</p>
        </div>
      )}
    </div>
  );
}